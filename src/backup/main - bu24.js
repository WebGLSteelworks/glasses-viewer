import * as THREE from 'three';

import { WebGPURenderer, MeshPhysicalNodeMaterial } from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader }     from 'three/addons/loaders/HDRLoader.js';

// ── Postprocessing — WebGL only (incompatible with WebGPURenderer) ─────────────
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass }       from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass }     from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass }       from 'three/addons/postprocessing/SMAAPass.js';

import {
  uniform,
  vec3,
  float,
  mix,
  dot,
  add,
  sub,
  pow,
  transformedNormalView, // r183: normal in view space post-transform, updated every frame
  positionViewDirection,
  smoothstep,
} from 'three/tsl';

import { Timer } from 'three';

import { isWebGPUSupported } from './utils/deviceDetection.js';
import { MODELS, DEFAULT_MODEL } from './config/models.config.js';
import ContactShadow      from './renderer/ContactShadowWebGPU.js';
import ContactShadowWebGL from './renderer/ContactShadowWebGL.js';


// ─────────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────────

let scene          = new THREE.Scene();
scene.background   = new THREE.Color(0xffffff);

const timer        = new Timer(); // r183: replaces THREE.Clock
const loader       = new GLTFLoader();

let fps            = 0;
let frames         = 0;
let lastTime       = performance.now();
let renderMode     = 'auto'; // 'auto' | 'webgpu' | 'webgl'
let isRendererReady = false;
let animationId    = null;

let currentConfig  = MODELS[DEFAULT_MODEL];
let currentModel   = null;
let gltfData       = null;
let variantsExtension = null;
let activeVariantName = null;

let glassAnimationEnabled = true;
let activeCameraName      = null;
const glassAnimateCamera  = 'Cam_Lenses';
let wasAnimatingGlass     = false;

// ── Glass state ──────────────────────────────
const glassMaterials       = [];
const originalGlassColors  = [];
const originalGlassOpacities = [];
let armsTextMeshes         = [];

const glassAnim = {
  state:     'waitGreen',
  timer:     0,
  duration:  1.5,
  waitGreen: 1.0,
  waitClear: 1.0
};

// ── Camera state ─────────────────────────────
const camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight,
  0.05,   // increased: improves depth buffer precision for SSAO
  100
);

const cameraTargets = {};
let pendingFreeCamera = false;

let transition = {
  active:    false,
  startTime: 0,
  duration:  0.8,
  fromPos:   new THREE.Vector3(),
  toPos:     new THREE.Vector3(),
  fromQuat:  new THREE.Quaternion(),
  toQuat:    new THREE.Quaternion()
};

// ── Renderer ─────────────────────────────────
let renderer;
let controls;

// ── Postprocessing — WebGL only ───────────────
let composer = null;

// Tuneable — adjust according to model scale
const SSAO_CONFIG = {
  kernelRadius: 0.008,
  minDistance:  0.0001,
  maxDistance:  0.003,  // lowered: tighter and more contrasted occlusion zones
  kernelSize:   64,     // default 32 → denser and darker
};

// ── Fresnel cache (WebGPU) ───────────────────
const fresnelMatCache = new Map();

// ── Contact shadow (WebGPU only) ─────────────
let contactShadow = null;


// ─────────────────────────────────────────────
// FRESNEL — WebGPU (node material)
// ─────────────────────────────────────────────

function getOrBuildFresnelMat(originalMaterial, fresnelCfg) {
  const key = originalMaterial.name.toLowerCase();
  if (fresnelMatCache.has(key)) return fresnelMatCache.get(key);
  const nodeMat = injectFresnelNode(originalMaterial, fresnelCfg);
  fresnelMatCache.set(key, nodeMat);
  return nodeMat;
}

function updateFresnelVariant(variantKey) {
  const fresnel = currentConfig.fresnel;
  if (!fresnel) return;

  const cfg = fresnel[variantKey];
  if (!cfg) return;

  fresnelMatCache.forEach((nodeMat) => {
    const u = nodeMat.userData.fresnelUniforms;
    if (!u) return;
    u.colorFront.value.set(...cfg.colorFront);
    u.colorMid.value.set(...cfg.colorMid);
    u.colorEdge.value.set(...cfg.colorEdge);
    u.intensity.value   = cfg.intensity   ?? 2.0;
    u.chromaBoost.value = cfg.chromaBoost ?? 1.0;
  });
}

function injectFresnelNode(material, fresnelCfg) {

  const nodeMat = new MeshPhysicalNodeMaterial();

  nodeMat.color.copy(material.color);
  nodeMat.roughness          = material.roughness ?? 0.0;
  nodeMat.metalness          = material.metalness ?? 0.0;
  nodeMat.ior                = material.ior ?? 1.5;
  nodeMat.envMapIntensity    = material.envMapIntensity ?? 3.5;
  nodeMat.clearcoat          = 1.0;
  nodeMat.clearcoatRoughness = 0.05;
  nodeMat.transmission       = 0;

  const rawOpacity    = material.userData.originalOpacity ?? material.opacity;
  nodeMat.opacity     = rawOpacity < 0.999 ? rawOpacity : 0.7;
  nodeMat.transparent = true;
  nodeMat.depthWrite  = false;
  nodeMat.side        = THREE.FrontSide;

  const colorFront  = uniform(new THREE.Vector3(...fresnelCfg.colorFront));
  const colorMid    = uniform(new THREE.Vector3(...fresnelCfg.colorMid));
  const colorEdge   = uniform(new THREE.Vector3(...fresnelCfg.colorEdge));
  const intensity   = uniform(float(fresnelCfg.intensity   ?? 2.0));
  const chromaBoost = uniform(float(fresnelCfg.chromaBoost ?? 1.0));

  // transformedNormalView: normal in view space post-transform, updated when the camera moves
  // positionViewDirection: vector from fragment to camera in view space
  // Both in the same space — dot product varies correctly with the viewing angle
  const NdotV    = dot(transformedNormalView, positionViewDirection);
  const f        = pow(sub(1.0, NdotV).clamp(0.0, 1.0), float(0.5));
  const frontMix = smoothstep(float(0.05), float(0.25), f);
  const edgeMix  = smoothstep(float(0.55), float(0.85), f);

  const fresnelColor = mix(
    colorFront,
    mix(colorMid, colorEdge, edgeMix),
    frontMix
  );

  const lum = add(
    fresnelColor.x.mul(0.299),
    fresnelColor.y.mul(0.587),
    fresnelColor.z.mul(0.114)
  );
  const lumVec       = vec3(lum, lum, lum);
  const boostedColor = add(lumVec, sub(fresnelColor, lumVec).mul(chromaBoost));

  // fresnelStrength: 0 at the lens centre (front view), 1 at the edges
  const fresnelStrength = pow(f, float(1.5)).clamp(0.0, 1.0);

  // El Fresnel in emissiveNode, NOT in colorNode:
  // - colorNode replaces the full PBR output and loses angle-dependence with NoToneMapping
  // - emissiveNode adds to the PBR output, always angle-dependent via f
  // - Con NoToneMapping emissive no se satura ni distorsiona
  // Modulated by fresnelStrength * intensity so it is 0 in frontal view
  const fresnelEmissive = boostedColor.mul(fresnelStrength).mul(intensity);

  nodeMat.colorNode    = null;   // standard PBR from material.color
  nodeMat.emissiveNode = fresnelEmissive;

  nodeMat.userData.fresnelUniforms = {
    colorFront, colorMid, colorEdge, intensity, chromaBoost
  };

  return nodeMat;
}


// ─────────────────────────────────────────────
// FRESNEL — WebGL (onBeforeCompile)
// ─────────────────────────────────────────────

function injectFresnel(material, fresnelCfg) {

  material.userData.fresnel = {
    intensity:   fresnelCfg.intensity   ?? 2.0,
    chromaBoost: fresnelCfg.chromaBoost ?? 0.8,
    colorFront:  new THREE.Color(...fresnelCfg.colorFront),
    colorMid:    new THREE.Color(...fresnelCfg.colorMid),
    colorEdge:   new THREE.Color(...fresnelCfg.colorEdge)
  };

  material.onBeforeCompile = (shader) => {

    shader.uniforms.fresnelIntensity = { value: material.userData.fresnel.intensity };
    shader.uniforms.colorFront       = { value: material.userData.fresnel.colorFront };
    shader.uniforms.colorMid         = { value: material.userData.fresnel.colorMid };
    shader.uniforms.colorEdge        = { value: material.userData.fresnel.colorEdge };
    shader.uniforms.chromaBoost      = { value: material.userData.fresnel.chromaBoost };

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform float fresnelIntensity;
      uniform vec3  colorFront;
      uniform vec3  colorMid;
      uniform vec3  colorEdge;
      uniform float chromaBoost;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `
      #include <lights_fragment_end>

      float f = pow(
        clamp(1.0 - dot(normalize(geometryNormal), normalize(vViewPosition)), 0.0, 1.0),
        0.5
      );

      float frontMix = smoothstep(0.05, 0.25, f);
      float edgeMix  = smoothstep(0.55, 0.85, f);

      vec3 fresnelColor = mix(
        colorFront,
        mix(colorMid, colorEdge, edgeMix),
        frontMix
      );

      float lum    = dot(fresnelColor, vec3(0.299, 0.587, 0.114));
      vec3  chroma = fresnelColor - vec3(lum);
      fresnelColor = vec3(lum) + chroma * chromaBoost;

      // Same approach as WebGPU emissiveNode: direct addition to the output,
      // not blended with indirectSpecular. Brightness and saturation match.
      float fresnelStrength = clamp(pow(f, 1.5), 0.0, 1.0);
      totalEmissiveRadiance += fresnelColor * fresnelStrength * fresnelIntensity;
      `
    );

    material.userData.shader = shader;
  };

  material.needsUpdate = true;
}


// ─────────────────────────────────────────────
// SELECT VARIANT
// ─────────────────────────────────────────────

function selectVariant(scene, variantName) {

  activeVariantName = variantName.toLowerCase();

  scene.traverse((obj) => {

    if (!obj.isMesh) return;

    const ext = obj.userData.gltfExtensions?.KHR_materials_variants;
    if (!ext) return;

    ext.mappings.forEach((map) => {
      map.variants.forEach((variantIndex) => {

        const variant = variantsExtension.variants[variantIndex];

        if (variant.name === variantName) {
          gltfData.parser.getDependency('material', map.material)
            .then((material) => {
              obj.material = material;
              rebuildGlassMaterials();
              updateFresnelVariant(activeVariantName);
            });
        }

      });
    });

  });

  setTimeout(() => {
    rebuildGlassMaterials();
    updateFresnelVariant(activeVariantName);
  }, 0);
}


// ─────────────────────────────────────────────
// REBUILD GLASS MATERIALS
// ─────────────────────────────────────────────

function rebuildGlassMaterials() {

  glassMaterials.length        = 0;
  originalGlassColors.length   = 0;
  originalGlassOpacities.length = 0;

  const isWebGPU = renderer.isWebGPURenderer;
  const fresnel  = currentConfig.fresnel;

  currentModel.traverse(obj => {

    if (!obj.isMesh || !obj.material) return;

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

    materials.forEach((m) => {

      if (!m.name) return;

      const name       = m.name.toLowerCase();
      const isGlass    = name.includes('lenses');
      const isAnimated = name.includes('anim');

      if (isGlass) {

        if (isWebGPU) {

          if (name.includes('lenses.front.')) {

            obj.renderOrder = 2;

            const rawOpacity = m.userData.originalOpacity ?? m.opacity;
            if (m.userData.originalOpacity === undefined) {
              m.userData.originalOpacity = m.opacity;
            }
            const glbOpacity = rawOpacity < 0.999 ? rawOpacity : 0.7;

            m.transmission = 0;
            m.opacity      = glbOpacity;
            m.depthWrite   = false;
            m.transparent  = true;
            m.side         = THREE.FrontSide;
            m.needsUpdate  = true;

            // Fresnel WebGPU — only if this model has fresnel config
            if (fresnel) {
              const typeRaw = name.split('lenses.front.')[1];
              const type    = typeRaw?.split('.')[0];
              if (fresnel[type]) {
                const fresnelCfg = { enabled: true, ...fresnel[type] };
                obj.material = getOrBuildFresnelMat(m, fresnelCfg);
              }
            }

          } else if (name.includes('lenses.back.')) {

            obj.renderOrder = 1;
            m.transmission  = 0;
            m.opacity       = 1.0;
            m.depthWrite    = true;
            m.transparent   = false;
            m.side          = THREE.FrontSide;
            m.needsUpdate   = true;

          } else {

            // Closed lens (Lenses.X, Wayfarer) on WebGPU — no front/back split.
            // Some variants (e.g. Lenses_Polar_Green) come from the GLB with
            // depthWrite:true + transparent:false, which makes them opaque —
            // they write depth at renderOrder 1 and the temple (renderOrder 2)
            // gets clipped behind them → temple disappears.
            // Fix: force same values as the working variants have at first load.
            // renderOrder stays at whatever loadModel set (1) — do NOT change it.
            m.depthWrite  = false;
            m.transparent = true;
            m.needsUpdate = true;
          }

        } else {

          // WebGL — same base config as WebGPU but without replacing the material

          if (name.includes('lenses.front.')) {

            obj.renderOrder = 2;

            if (m.userData.originalOpacity === undefined) {
              m.userData.originalOpacity = m.opacity;
            }
            const rawOpacity = m.userData.originalOpacity;
            const glbOpacity = rawOpacity < 0.999 ? rawOpacity : 0.7;

            m.transmission = 0;
            m.opacity      = glbOpacity;
            m.depthWrite   = true;   // write depth so floor (renderOrder 3) clips behind lens
            m.transparent  = true;
            m.side         = THREE.FrontSide;
            m.needsUpdate  = true;

            // Fresnel WebGL — only if the model has fresnel config
            if (fresnel) {
              const typeRaw = name.split('lenses.front.')[1];
              const type    = typeRaw?.split('.')[0];
              if (fresnel[type]) {
                injectFresnel(m, { enabled: true, ...fresnel[type] });
              }
            }

          } else if (name.includes('lenses.back.')) {

            obj.renderOrder = 1;
            m.transmission  = 0;
            m.opacity       = 1.0;
            m.depthWrite    = true;   // opaque back lens must write depth
            m.transparent   = false;
            m.side          = THREE.FrontSide;
            m.needsUpdate   = true;

          } else {

            // Wayfarer or other models without front/back split — closed lens
            // renderOrder 2: renders before floor (3), writes depth so floor
            // depthTest correctly clips behind the lens
            obj.renderOrder = 2;
            m.transparent = true;
            m.depthWrite  = true;   // write depth so floor doesn't overdraw through glass
            m.needsUpdate = true;
          }
        }
      }

      if (isGlass && isAnimated) {
        if (!glassMaterials.includes(m)) {
          glassMaterials.push(m);
          originalGlassColors.push(m.color.clone());
          originalGlassOpacities.push(m.opacity ?? 1.0);
        }
      }

    });

  });
}


// ─────────────────────────────────────────────
// VARIANT BUTTONS UI
// ─────────────────────────────────────────────

function createVariantButtons(variants) {

  const old = document.getElementById('variantsUI');
  if (old) old.remove();

  const container = document.createElement('div');
  container.id = 'variantsUI';

  container.style.position      = 'fixed';
  container.style.right         = '20px';
  container.style.top           = '20px';
  container.style.display       = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap           = '8px';
  container.style.zIndex        = '20';

  document.body.appendChild(container);

  variants.forEach(v => {

    const btn = document.createElement('button');
    btn.textContent = v.name;

    btn.style.padding      = '8px 12px';
    btn.style.border       = 'none';
    btn.style.borderRadius = '6px';
    btn.style.cursor       = 'pointer';
    btn.style.background   = '#111';
    btn.style.color        = '#fff';
    btn.style.fontSize     = '12px';
    btn.style.textAlign    = 'left';

    btn.onclick = () => {
      if (!currentModel) return;
      selectVariant(currentModel, v.name);
    };

    container.appendChild(btn);
  });
}



// ─────────────────────────────────────────────
// LOAD MODEL
// ─────────────────────────────────────────────

function loadModel(config) {

  glassAnimationEnabled = config.glass?.animate === true;

  // ── clean previous model ──────────────────
  if (currentModel) {

    scene.remove(currentModel);

    const isWebGPU = renderer.isWebGPURenderer;

    currentModel.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();

      if (!isWebGPU && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    currentModel = null;
  }

  // ── dispose previous contact shadow ───────
  if (contactShadow) {
    contactShadow.dispose();
    contactShadow = null;
  }

  // ── reset state ───────────────────────────
  glassMaterials.length         = 0;
  originalGlassColors.length    = 0;
  originalGlassOpacities.length = 0;
  armsTextMeshes.length         = 0;
  glassAnim.state               = 'waitGreen';
  glassAnim.timer               = 0;
  Object.keys(cameraTargets).forEach(k => delete cameraTargets[k]);

  // ── clear WebGPU Fresnel cache ─────────────
  if (fresnelMatCache.size > 0) {
    fresnelMatCache.forEach(mat => { try { mat.dispose(); } catch (e) {} });
    fresnelMatCache.clear();
  }

  const isWebGPU  = renderer.isWebGPURenderer;
  const modelPath = config.glb;

  loader.load(modelPath, (gltf) => {

    gltfData     = gltf;
    currentModel = gltf.scene;

    scene.add(currentModel);

    // ── contact shadow ────────────────────────
    if (config.shadow?.enabled) {
      if (contactShadow) {
        contactShadow.dispose();
        contactShadow = null;
      }
      contactShadow = renderer.isWebGPURenderer
        ? new ContactShadow()
        : new ContactShadowWebGL();
      contactShadow.setScene(currentModel, config.shadow.softness ?? 1.0);
      contactShadow.setIntensity(config.shadow.intensity ?? 1.0);
      scene.add(contactShadow.group);
    }
    variantsExtension = gltf.userData.gltfExtensions?.KHR_materials_variants;

    if (variantsExtension) {
      const rawVariants = variantsExtension.variants;
      const orderMap    = config.variantOrder;

      const variants = orderMap
        ? [...rawVariants].sort((a, b) => {
            const ai = orderMap.indexOf(a.name);
            const bi = orderMap.indexOf(b.name);
            // variants not listed in variantOrder go to the end
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          })
        : rawVariants;

      createVariantButtons(variants);
      if (variants.length > 0) {
        selectVariant(currentModel, variants[0].name);
      }
    }

    // ── model pivot ───────────────────────
    const box         = new THREE.Box3().setFromObject(currentModel);
    const modelCenter = new THREE.Vector3();
    box.getCenter(modelCenter);

    // ── load cameras from model config ────
    Object.entries(config.cameras).forEach(([name, cam]) => {
      cameraTargets[name] = {
        position:   new THREE.Vector3(...cam.position),
        quaternion: cam.quaternion
          ? new THREE.Quaternion(...cam.quaternion)
          : new THREE.Quaternion(),
        target: modelCenter.clone(),
        fov:    cam.fov
      };
    });

    // ── material setup ───────────────────
    currentModel.traverse(obj => {

      if (!obj.isMesh) return;

      const mat = obj.material;
      if (!mat) return;

      const materials = Array.isArray(mat) ? mat : [mat];

      materials.forEach((m) => {

        if (!m.name) return;

        const name       = m.name.toLowerCase();
        const isGlass    = name.includes('lenses');
        const isAnimated = name.includes('anim');

        if (isGlass) {
          m.transparent = true;
          m.depthWrite  = false;  // no depth write — allows temple arms to show through the lens
          obj.renderOrder = 1;    // lens — rendered before the temple arms
        }

        // Temple arms — higher renderOrder than lenses so they show through
        if (name.includes('temple')) {
          obj.renderOrder = 2;
        }

        if (isGlass && isAnimated) {
          if (!glassMaterials.includes(m)) {
            glassMaterials.push(m);
            originalGlassColors.push(m.color.clone());
            originalGlassOpacities.push(m.opacity ?? 1.0);
          }
        }

        // reflection + roughness tweaks
        if (mat.envMapIntensity !== undefined) {
          mat.envMapIntensity *= isWebGPU ? 1.5 : 1.0;
        }
        if (mat.roughness !== undefined) {
          mat.roughness *= 0.95;
        }

      });

    });

    smoothSwitchCamera(config.startCamera);

  });
}


// ─────────────────────────────────────────────
// ENVIRONMENT
// ─────────────────────────────────────────────

let currentHdr = null;

function setupEnvironment(config) {

  // snapshot config at call time — avoids race condition if
  // currentConfig changes before the async HDRLoader callback fires
  const { hdri, hdriIntensity } = config;

  new HDRLoader().load(hdri, (hdr) => {  // r180: RGBELoader → HDRLoader

    // dispose previous HDR
    if (currentHdr) {
      currentHdr.dispose();
      currentHdr = null;
    }

    hdr.mapping = THREE.EquirectangularReflectionMapping;

    if (renderer.isWebGPURenderer) {
      scene.environment = hdr;
    } else {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const envMap = pmrem.fromEquirectangular(hdr).texture;
      scene.environment = envMap;
      pmrem.dispose();
      hdr.dispose();
    }

    scene.environmentRotation  = new THREE.Euler(0, Math.PI * 0.0, 0);
    scene.environmentIntensity = hdriIntensity ?? 1.0;

    currentHdr = renderer.isWebGPURenderer ? hdr : null;
  });
}


// ─────────────────────────────────────────────
// SWITCH MODEL  (no full restart needed)
// ─────────────────────────────────────────────

async function switchModel(modelKey) {

  if (!MODELS[modelKey]) {
    console.warn('Model not found:', modelKey);
    return;
  }

  if (currentConfig === MODELS[modelKey]) return; // already active

  currentConfig = MODELS[modelKey];

  console.log('Switching model to:', modelKey);

  setupEnvironment(currentConfig);
  loadModel(currentConfig);

  // update active state on model buttons
  document.querySelectorAll('[data-model-btn]').forEach(btn => {
    btn.style.background = btn.dataset.modelBtn === modelKey ? '#555' : '#333';
  });
}


// ─────────────────────────────────────────────
// RENDERER
// ─────────────────────────────────────────────

async function initRenderer() {

  isRendererReady = false;

  let useWebGPU;

  if (renderMode === 'webgpu')      useWebGPU = true;
  else if (renderMode === 'webgl')  useWebGPU = false;
  else                              useWebGPU = await isWebGPUSupported();

  if (useWebGPU) {
    console.log('🚀 Using WebGPU');
    rendererLabel.textContent = `Renderer: WebGPU | DPR: ${window.devicePixelRatio}`;
    renderer = new WebGPURenderer({ antialias: true });
    await renderer.init();
  } else {
    console.log('⚠ Using WebGL');
    rendererLabel.textContent = `Renderer: WebGL | ${window.innerWidth}x${window.innerHeight}`;
    renderer = new THREE.WebGLRenderer({ antialias: true });
  }

  // Cap at 2 — beyond that GPU cost outweighs the visual gain
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace      = THREE.SRGBColorSpace;
  // r183: physicallyCorrectLights removed (was default since r155)
  renderer.toneMapping           = THREE.NoToneMapping;
  renderer.toneMappingExposure   = 1.0;

  document.body.appendChild(renderer.domElement);

  // SSAO on WebGL only — WebGPURenderer is not compatible with EffectComposer
  if (!renderer.isWebGPURenderer) {
    setupSSAO();
  }

  isRendererReady = true;
}


// ─────────────────────────────────────────────
// SSAO SETUP — WebGL only
// ─────────────────────────────────────────────

function setupSSAO() {

  if (composer) { composer.dispose(); composer = null; }

  const w = window.innerWidth;
  const h = window.innerHeight;

  composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const ssaoPass = new SSAOPass(scene, camera, w, h);
  ssaoPass.kernelRadius = SSAO_CONFIG.kernelRadius;
  ssaoPass.minDistance  = SSAO_CONFIG.minDistance;
  ssaoPass.maxDistance  = SSAO_CONFIG.maxDistance;
  ssaoPass.kernelSize   = SSAO_CONFIG.kernelSize;
  ssaoPass.output       = SSAOPass.OUTPUT.Default;
  //ssaoPass.output = SSAOPass.OUTPUT.SSAO; // debug — black and white
  composer.addPass(ssaoPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // SMAA — post-process antialiasing, required because the renderer's MSAA
  // (antialias:true) does not apply to the composer's render targets
  const smaaPass = new SMAAPass(w, h);
  composer.addPass(smaaPass);
}


// ─────────────────────────────────────────────
// RESTART APP  (renderer mode change only)
// ─────────────────────────────────────────────

async function restartApp() {

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  console.log('Restarting app with mode:', renderMode);

  if (composer) { composer.dispose(); composer = null; }

  if (contactShadow) { contactShadow.dispose(); contactShadow = null; }

  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }

  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  scene = new THREE.Scene();

  await initRenderer();

  scene.background = new THREE.Color(0xffffff);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled       = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableRotate  = true;
  controls.enableZoom    = true;
  controls.enablePan     = false;
  controls.minDistance   = 0.5;
  controls.maxDistance   = 1.2;

  setupEnvironment(currentConfig);
  loadModel(currentConfig);
  animate();
}


// ─────────────────────────────────────────────
// SMOOTH CAMERA SWITCH
// ─────────────────────────────────────────────

function smoothSwitchCamera(name) {

  activeCameraName = name;

  const camData = cameraTargets[name];
  if (!camData) return;

  if (name === 'Cam_Free') {
    transition.active = false;
    camera.position.copy(camData.position);
    controls.target.copy(camData.target);
    camera.lookAt(controls.target);
    camera.updateMatrixWorld();
    controls.update();
    controls.enabled = true;
    return;
  }

  controls.enabled = false;

  if (camData.fov !== undefined) {
    camera.fov = camData.fov;
    camera.updateProjectionMatrix();
  }

  transition.fromPos.copy(camera.position);
  transition.fromQuat.copy(camera.quaternion);
  transition.toPos.copy(camData.position);
  transition.toQuat.copy(camData.quaternion);
  transition.startTime = performance.now();
  transition.active    = true;
}


// ─────────────────────────────────────────────
// ANIMATE LOOP
// ─────────────────────────────────────────────

function animate(time) {

  frames++;

  if (time > lastTime + 1000) {
    fps      = Math.round((frames * 1000) / (time - lastTime));
    lastTime = time;
    frames   = 0;
    fpsLabel.textContent = `FPS: ${fps}`;
  }

  animationId = requestAnimationFrame(animate);

  // ── camera transition ─────────────────────
  if (transition.active) {

    const elapsed = (time - transition.startTime) / 1000;
    const t       = Math.min(elapsed / transition.duration, 1);
    const ease    = t * t * (3 - 2 * t);

    camera.position.lerpVectors(transition.fromPos, transition.toPos, ease);

    if (activeCameraName !== 'Cam_Free') {
      camera.quaternion.copy(transition.fromQuat).slerp(transition.toQuat, ease);
    }

    if (t >= 1) transition.active = false;
  }

  // ── orbit controls (Cam_Free only) ────────
  if (controls.enabled) controls.update();

  // ── glass animation ───────────────────────
  const shouldAnimateGlass =
    glassAnimationEnabled &&
    glassMaterials.length > 0 &&
    activeCameraName === glassAnimateCamera;

  if (shouldAnimateGlass) {

    wasAnimatingGlass = true;

    // r183: Timer needs update() before getDelta()
    timer.update();
    const delta = timer.getDelta();
    glassAnim.timer += delta;

    glassMaterials.forEach((mat, i) => {

      const originalColor = originalGlassColors[i];

      switch (glassAnim.state) {

        case 'waitGreen':
          if (glassAnim.timer > glassAnim.waitGreen) {
            glassAnim.timer = 0;
            glassAnim.state = 'toClear';
          }
          break;

        case 'toClear': {
          const t    = Math.min(glassAnim.timer / glassAnim.duration, 1);
          const ease = t * t * (3 - 2 * t);
          mat.color.lerpColors(originalColor, new THREE.Color(1, 1, 1), ease);
          mat.opacity = THREE.MathUtils.lerp(originalGlassOpacities[i], 0.0, ease);
          if (t >= 1) { glassAnim.timer = 0; glassAnim.state = 'waitClear'; }
          break;
        }

        case 'waitClear':
          if (glassAnim.timer > glassAnim.waitClear) {
            glassAnim.timer = 0;
            glassAnim.state = 'toGreen';
          }
          break;

        case 'toGreen': {
          const t    = Math.min(glassAnim.timer / glassAnim.duration, 1);
          const ease = t * t * (3 - 2 * t);
          mat.color.lerpColors(new THREE.Color(1, 1, 1), originalColor, ease);
          mat.opacity = THREE.MathUtils.lerp(0.0, originalGlassOpacities[i], ease);
          if (t >= 1) { glassAnim.timer = 0; glassAnim.state = 'waitGreen'; }
          break;
        }
      }

    });

  } else {

    if (wasAnimatingGlass) {
      glassMaterials.forEach((mat, i) => {
        mat.color.copy(originalGlassColors[i]);
        mat.opacity = originalGlassOpacities[i];
      });
      glassAnim.state   = 'waitGreen';
      glassAnim.timer   = 0;
      wasAnimatingGlass = false;
    }
  }

  // ── render ────────────────────────────────
  if (!isRendererReady) return;

  // WebGPU: direct render (EffectComposer not compatible)
  // WebGL:  composer with SSAO
  if (composer) {
    if (contactShadow) {
      // WebGL + contact shadow: bypass composer, use direct render like WebGPU.
      // The floor is transparent inside the main scene — direct render sorts it
      // correctly. The composer's EffectComposer/RenderPass clears the buffer
      // before the floor can be drawn, making them incompatible.
      contactShadow.render(renderer, scene);
      renderer.render(scene, camera);
    } else {
      composer.render();
    }
  } else {
    // WebGPU
    if (contactShadow) contactShadow.render(renderer, scene);
    renderer.render(scene, camera);
  }

}


// ─────────────────────────────────────────────
// RESIZE
// ─────────────────────────────────────────────

window.addEventListener('resize', () => {
  if (!renderer) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  if (composer) composer.setSize(w, h);
});


// ─────────────────────────────────────────────
// UI — debug labels
// ─────────────────────────────────────────────

const rendererLabel = document.createElement('div');
rendererLabel.style.cssText = `
  position:fixed; top:20px; left:20px;
  padding:6px 10px; background:rgba(0,0,0,0.7);
  color:#fff; font-size:12px; font-family:monospace;
  border-radius:4px; z-index:100;
`;
rendererLabel.textContent = 'Renderer: detecting...';
document.body.appendChild(rendererLabel);

const fpsLabel = document.createElement('div');
fpsLabel.style.cssText = `
  position:fixed; top:50px; left:20px;
  padding:6px 10px; background:rgba(0,0,0,0.7);
  color:#0f0; font-size:12px; font-family:monospace;
  border-radius:4px; z-index:100;
`;
fpsLabel.textContent = 'FPS: --';
document.body.appendChild(fpsLabel);


// ─────────────────────────────────────────────
// UI — renderer mode buttons
// ─────────────────────────────────────────────

const modeUI = document.createElement('div');
modeUI.style.cssText = `
  position:fixed; top:90px; left:20px;
  display:flex; gap:6px; z-index:100;
`;
document.body.appendChild(modeUI);

[{ label: 'AUTO', value: 'auto' }, { label: 'WEBGPU', value: 'webgpu' }, { label: 'WEBGL', value: 'webgl' }]
  .forEach(({ label, value }) => {
    const btn = document.createElement('button');
    btn.textContent  = label;
    btn.style.cssText = `
      padding:6px 10px; border:none; border-radius:4px;
      cursor:pointer; background:#222; color:#fff; font-size:11px;
    `;
    btn.onclick = async () => { renderMode = value; await restartApp(); };
    modeUI.appendChild(btn);
  });


// ─────────────────────────────────────────────
// UI — model selector buttons
// ─────────────────────────────────────────────

const modelUI = document.createElement('div');
modelUI.style.cssText = `
  position:fixed; top:140px; left:20px;
  display:flex; flex-direction:column; gap:6px; z-index:100;
`;
document.body.appendChild(modelUI);

Object.entries(MODELS).forEach(([key, cfg]) => {
  const btn = document.createElement('button');
  btn.textContent          = cfg.label;
  btn.dataset.modelBtn     = key;
  btn.style.cssText = `
    padding:8px 14px; font-size:13px; font-weight:500;
    border-radius:6px; border:none; cursor:pointer;
    background:${key === DEFAULT_MODEL ? '#555' : '#333'};
    color:#fff; min-width:110px; text-align:center;
  `;
  btn.onclick = () => switchModel(key);
  modelUI.appendChild(btn);
});


// ─────────────────────────────────────────────
// UI — camera buttons
// ─────────────────────────────────────────────

const cameraUI = document.createElement('div');
cameraUI.style.cssText = `
  position:fixed; bottom:20px; left:50%;
  transform:translateX(-50%);
  display:flex; gap:10px; z-index:10;
`;
document.body.appendChild(cameraUI);

[
  { label: 'Front',   name: 'Cam_Front'   },
  { label: 'Side',    name: 'Cam_Side'    },
  { label: 'Camera',  name: 'Cam_Camera'  },
  { label: 'Capture', name: 'Cam_Capture' },
  { label: 'Power',   name: 'Cam_Power'   },
  { label: 'Lenses',  name: 'Cam_Lenses'  },
  { label: 'Free',    name: 'Cam_Free'    }
].forEach(({ label, name }) => {
  const btn = document.createElement('button');
  btn.textContent  = label;
  btn.style.cssText = `
    padding:8px 14px; border:none; border-radius:6px;
    cursor:pointer; background:#111; color:#fff; font-size:13px;
  `;
  btn.addEventListener('click', () => smoothSwitchCamera(name));
  cameraUI.appendChild(btn);
});


// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────

async function init() {

  await initRenderer();

  scene.background = new THREE.Color(0xffffff);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled       = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableRotate  = true;
  controls.enableZoom    = true;
  controls.enablePan     = false;
  controls.minDistance   = 0.5;
  controls.maxDistance   = 1.2;

  setupEnvironment(currentConfig);
  loadModel(currentConfig);
  animate();
  window._scene = scene; // debug
}

init();
