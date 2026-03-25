import * as THREE from 'three';

import { WebGPURenderer, MeshPhysicalNodeMaterial } from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

import { FRESNEL_VARIANTS } from './utils/fresnelVariants.js';
import { CAMERAS } from './utils/cameras.js';

import {
  uniform,
  vec3,
  float,
  mix,
  dot,
  add,
  sub,
  pow,
  normalView,
  positionViewDirection,
  smoothstep,
} from 'three/tsl';



async function isWebGPUSupported() {
  if (!navigator.gpu) return false;

  try {
    const adapter = await navigator.gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// GLOBAL VAR
// ─────────────────────────────────────────────

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const textureLoader = new THREE.TextureLoader();

const cameras = {};

const clock = new THREE.Clock();

let fps = 0;
let frames = 0;
let lastTime = performance.now();
let renderMode = 'auto'; // 'auto' | 'webgpu' | 'webgl'
let isRendererReady = false;
let animationId = null;

let currentConfig = {

  glbLow: 'models/Standard_Vanguard_low.glb',
  glbHigh: 'models/Standard_Vanguard_high.glb',

  startCamera: 'Cam_Front',

  glass: {
    animate: true
  },

};

let currentModel = null;
let gltfData = null;
let variantsExtension = null;
const loader = new GLTFLoader();

let activeVariantName = null;

let glassAnimationEnabled = true;
let activeCameraName = null;
const glassAnimateCamera = "Cam_Lenses";
let wasAnimatingGlass = false;


// ── cache Fresnel WebGPU ─────────────────────────────
const fresnelMatCache = new Map();

function getOrBuildFresnelMat(originalMaterial, fresnelCfg) {
  const key = originalMaterial.name.toLowerCase();
  if (fresnelMatCache.has(key)) return fresnelMatCache.get(key);
  const nodeMat = injectFresnelNode(originalMaterial, fresnelCfg);
  fresnelMatCache.set(key, nodeMat);
  return nodeMat;
}

function updateFresnelVariant(variantKey) {
  const cfg = FRESNEL_VARIANTS[variantKey];
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

  // ── copiar propiedades del material original ──────────
  nodeMat.color.copy(material.color);
  nodeMat.roughness          = material.roughness ?? 0.0;
  nodeMat.metalness          = material.metalness ?? 0.0;
  nodeMat.ior                = material.ior ?? 1.5;
  nodeMat.envMapIntensity    = material.envMapIntensity ?? 3.5;
  nodeMat.clearcoat          = 1.0;
  nodeMat.clearcoatRoughness = 0.05;
  nodeMat.transmission       = 0;

  // ── transparencia desde el GLB ────────────────────────
  const rawOpacity = material.userData.originalOpacity ?? material.opacity;
  nodeMat.opacity     = rawOpacity < 0.999 ? rawOpacity : 0.7;
  nodeMat.transparent = true;
  nodeMat.depthWrite  = false;
  nodeMat.side        = THREE.FrontSide;

  // ── uniforms — THREE.Vector3 para colores ─────────────
  const colorFront  = uniform(new THREE.Vector3(...fresnelCfg.colorFront));
  const colorMid    = uniform(new THREE.Vector3(...fresnelCfg.colorMid));
  const colorEdge   = uniform(new THREE.Vector3(...fresnelCfg.colorEdge));
  const intensity   = uniform(float(fresnelCfg.intensity   ?? 2.0));
  const chromaBoost = uniform(float(fresnelCfg.chromaBoost ?? 1.0));

  // ── coeficiente Fresnel en view space ─────────────────
  // Equivalente exacto a: pow(1.0 - dot(geometryNormal, vViewPosition), 0.5)
  const NdotV = dot(normalView, positionViewDirection);
  const f     = pow(sub(1.0, NdotV).clamp(0.0, 1.0), float(0.5));

  // ── 3 zonas — umbrales ampliados para más colores laterales ──
  // frontMix más estrecho → zona morada más pequeña
  // edgeMix más temprano → rojo/amarillo empieza antes
  const frontMix = smoothstep(float(0.05), float(0.25), f);
  const edgeMix  = smoothstep(float(0.55), float(0.85), f);

  const fresnelColor = mix(
    colorFront,
    mix(colorMid, colorEdge, edgeMix),
    frontMix
  );

  // ── chroma boost ──────────────────────────────────────
  const lum = add(
    fresnelColor.x.mul(0.299),
    fresnelColor.y.mul(0.587),
    fresnelColor.z.mul(0.114)
  );
  const lumVec       = vec3(lum, lum, lum);
  const boostedColor = add(lumVec, sub(fresnelColor, lumVec).mul(chromaBoost.mul(float(3.0))));

  // ── colorNode: mezcla Fresnel con color base del material ─────────────
  // Más predecible que emissiveNode con ACES — el PBR gestiona el brillo
  // y el Fresnel tinta el color base según el ángulo de visión.
  //
  // FRESNEL_MIX: cuánto del Fresnel se mezcla con el color base
  //   0.0 = solo color base (sin Fresnel)
  //   1.0 = solo Fresnel (sin color base)
  //   Empieza con 0.85 y ajusta
  //
  // FRESNEL_DARK: oscurece el Fresnel antes de mezclarlo
  //   1.0 = sin cambio, 0.5 = bastante oscuro, 0.3 = muy oscuro
  const FRESNEL_MIX  = float(1.5);
  const FRESNEL_DARK = float(0.5);

  const baseColor    = vec3(
    float(material.color.r),
    float(material.color.g),
    float(material.color.b)
  );

  const fresnelStrength = pow(f, float(1.5)).clamp(0.0, 1.0);
  const darkFresnel = mix(vec3(float(0.0), float(0.0), float(0.0)), boostedColor, FRESNEL_DARK);
  const finalColor      = mix(baseColor, darkFresnel, fresnelStrength.mul(FRESNEL_MIX));

  nodeMat.colorNode    = finalColor;
  nodeMat.emissiveNode = null;

  // ── guardar refs para updateFresnelVariant ────────────
  nodeMat.userData.fresnelUniforms = {
    colorFront, colorMid, colorEdge, intensity, chromaBoost
  };

  return nodeMat;
}

// ─────────────────────────────
// SELECT VARIANT
// ─────────────────────────────

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

// ─────────────────────────────
// REBUILD GLASS MATERIAL
// ─────────────────────────────

function rebuildGlassMaterials() {

  glassMaterials.length = 0;
  originalGlassColors.length = 0;
  originalGlassOpacities.length = 0;

  currentModel.traverse(obj => {

    if (!obj.isMesh || !obj.material) return;

    const materials = Array.isArray(obj.material)
      ? obj.material
      : [obj.material];

	materials.forEach((m) => {

	  if (!m.name) return;

	  const isGlass = m.name?.toLowerCase().includes("lenses");
	  const isAnimated = m.name?.toLowerCase().includes("anim");

		if (isGlass) {

		  const name = m.name.toLowerCase();
		  const isWebGPU = renderer.isWebGPURenderer;

		  if (isWebGPU) {

			if (name.includes("lenses.front.")) {
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

			  // ── Fresnel WebGPU ──
			  const matName = m.name?.toLowerCase();
			  const typeRaw = matName.split("lenses.front.")[1];
			  const type    = typeRaw?.split(".")[0];
			  if (FRESNEL_VARIANTS[type]) {
				const fresnelCfg = { enabled: true, ...FRESNEL_VARIANTS[type] };
				obj.material = getOrBuildFresnelMat(m, fresnelCfg);
			  }

			} else if (name.includes("lenses.back.")) {
			  obj.renderOrder = 1;
			  m.transmission  = 0;
			  m.opacity       = 1.0;
			  m.depthWrite    = false;
			  m.transparent   = false;
			  m.side          = THREE.FrontSide;
			  m.needsUpdate   = true;
			}
			// LensesEdge, Lenses, Inner_Lenses → no tocar, dejar como vienen del GLB

		  } else {
			// WebGL: dejar el material tal como viene del GLB
			m.transparent = true;
			m.depthWrite  = true;
			m.needsUpdate = true;
		  }

		  // WebGL Fresnel — solo en WebGL
		  const matName = m.name?.toLowerCase();
		  let fresnelCfg = null;

		  if (matName?.includes("lenses.front.")) {
			const typeRaw = matName.split("lenses.front.")[1];
			const type = typeRaw?.split(".")[0];
			if (FRESNEL_VARIANTS[type]) {
			  fresnelCfg = { enabled: true, ...FRESNEL_VARIANTS[type] };
			}
		  }

		  if (fresnelCfg?.enabled && !isWebGPU) {
			injectFresnel(m, fresnelCfg);
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


// ─────────────────────────────
// FRESNEL FOR VANGUARD LENS INJECT WebGL
// ─────────────────────────────

function injectFresnel(material, fresnelCfg) {
	
	
	
  material.userData.fresnel = {
    intensity: fresnelCfg.intensity ?? 2.0,
	chromaBoost: fresnelCfg.chromaBoost ?? 0.8, 
    colorFront: new THREE.Color(...fresnelCfg.colorFront),
    colorMid:   new THREE.Color(...fresnelCfg.colorMid),
    colorEdge:  new THREE.Color(...fresnelCfg.colorEdge)
  };

  material.onBeforeCompile = (shader) => {

    shader.uniforms.fresnelIntensity = { value: material.userData.fresnel.intensity };
    shader.uniforms.colorFront = { value: material.userData.fresnel.colorFront };
    shader.uniforms.colorMid   = { value: material.userData.fresnel.colorMid };
    shader.uniforms.colorEdge  = { value: material.userData.fresnel.colorEdge };
	shader.uniforms.chromaBoost = { value: material.userData.fresnel.chromaBoost };
	shader.uniforms.baseChromaBoost = { value: material.userData.baseChromaBoost ?? 1.0 };

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>

      uniform float fresnelIntensity;
      uniform vec3 colorFront;
      uniform vec3 colorMid;
      uniform vec3 colorEdge;
	  uniform float chromaBoost;
	  uniform float baseChromaBoost;

      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `
      #include <lights_fragment_end>

		// ---- BOOST COLOR BASE (diffuse + specular tint) ----
		float baseLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
		vec3 baseChroma = diffuseColor.rgb - vec3(baseLum);
		vec3 boostedBase = vec3(baseLum) + baseChroma * baseChromaBoost;

		diffuseColor.rgb = boostedBase;

		// también tintamos ligeramente el specular indirecto
		reflectedLight.indirectSpecular.rgb *= boostedBase;

      float f = pow(
		  1.0 - dot(normalize(geometryNormal), normalize(vViewPosition)),
		  0.5
		);

		float frontMix = smoothstep(0.1, 0.35, f);
		float edgeMix  = smoothstep(0.6, 0.98, f);

		vec3 fresnelColor = mix(
		  colorFront,
		  mix(colorMid, colorEdge, edgeMix),
		  frontMix
		);

		// ---- SATURACIÓN INTELIGENTE ----

		// 1. Extraer luminancia
		float lum = dot(fresnelColor, vec3(0.299, 0.587, 0.114));

		// 2. Separar cromaticidad
		vec3 chroma = fresnelColor - vec3(lum);

		// 3. Reforzar solo la cromaticidad
		fresnelColor = vec3(lum) + chroma * chromaBoost;

		// ---- Aplicación controlada ----
		reflectedLight.indirectSpecular.rgb +=
		  fresnelColor * pow(f, 1.5) * fresnelIntensity;
			  `
    );
		material.userData.shader = shader;

  };


  material.needsUpdate = true;
}

// ─────────────────────────────
// UI FOR MODEL SELECTION
// ─────────────────────────────


function createVariantButtons(variants) {

  // borrar UI anterior
  const old = document.getElementById("variantsUI");
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = "variantsUI";

  container.style.position = "fixed";
  container.style.right = "20px";
  container.style.top = "20px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "8px";
  container.style.zIndex = "20";

  document.body.appendChild(container);

  variants.forEach(v => {

    const btn = document.createElement("button");

    btn.textContent = v.name;

    btn.style.padding = "8px 12px";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.background = "#111";
    btn.style.color = "#fff";
    btn.style.fontSize = "12px";

	btn.onclick = () => {

	  if (!currentModel) return;

	  selectVariant(currentModel, v.name);

	};

    container.appendChild(btn);

  });

}



// ─────────────────────────────
// LOAD GLB MODEL
// ─────────────────────────────

function loadModel(config) {
	
  glassAnimationEnabled = config.glass?.animate === true;


  // ───── clean last model
  if (currentModel) {
    scene.remove(currentModel);
	const isWebGPU = renderer.isWebGPURenderer;

	currentModel.traverse(obj => {

	  if (obj.geometry) obj.geometry.dispose();

	  // ⚠️ SOLO WebGL
	  if (!isWebGPU && obj.material) {

		if (Array.isArray(obj.material)) {
		  obj.material.forEach(m => m.dispose());
		} else {
		  obj.material.dispose();
		}
	  }

	});
  }

  // state reset
  glassMaterials.length = 0;
  originalGlassColors.length = 0;
  armsTextMeshes.length = 0;
  glassAnim.state = 'waitGreen';
  glassAnim.timer = 0;
  Object.keys(cameraTargets).forEach(k => delete cameraTargets[k]);

  // limpiar cache Fresnel WebGPU solo si hay entradas
  if (fresnelMatCache.size > 0) {
    fresnelMatCache.forEach(mat => {
      try { mat.dispose(); } catch(e) {}
    });
    fresnelMatCache.clear();
  }

	const isWebGPU = renderer.isWebGPURenderer;

	const modelPath = isWebGPU
	  ? config.glbHigh
	  : config.glbLow;

	console.log("Loading model:", modelPath);


  loader.load(modelPath, (gltf) => {

    gltfData = gltf;
	currentModel = gltf.scene;

	
    scene.add(currentModel);
	
	
	
	// ───── get variants from GLB
	variantsExtension = gltf.userData.gltfExtensions?.KHR_materials_variants;

	if (variantsExtension) {

	  const variants = variantsExtension.variants;
	  createVariantButtons(variants);
	  
	  if (variants.length > 0) {
		  selectVariant(currentModel, variants[0].name);
		}

	}
	
	// ───── calculate model pivot
	const box = new THREE.Box3().setFromObject(currentModel);
	const modelCenter = new THREE.Vector3();
	box.getCenter(modelCenter);


	// ───── load cameras from file
	Object.entries(CAMERAS).forEach(([name, cam]) => {

	  cameraTargets[name] = {

		position: new THREE.Vector3(...cam.position),

		quaternion: cam.quaternion
		  ? new THREE.Quaternion(...cam.quaternion)
		  : new THREE.Quaternion(),

		target: modelCenter.clone(),

		fov: cam.fov

	  };

	});

	currentModel.traverse(obj => {

	  if (!obj.isMesh) return;

	  const mat = obj.material;
	  if (!mat) return;
	  
	  const materials = Array.isArray(mat) ? mat : [mat];

	materials.forEach((m) => {

	  if (!m.name) return;

	  const isGlass = m.name?.toLowerCase().includes("lenses");
	  const isAnimated = m.name?.toLowerCase().includes("anim");

	if (isGlass) {

	  m.transparent = true;
	  m.depthWrite = true; 

	  const name = m.name.toLowerCase();

	  if (name.includes("Lens.back")) {
		obj.renderOrder = 11;
	  }

	  if (name.includes("Temple")) {
		obj.renderOrder = 10.5;
	  }

	  if (name.includes("Lens.front")) {
		obj.renderOrder = 10;
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

	  const isWebGPU = renderer.isWebGPURenderer;

	  // 🔥 REFLECTION BOOST 
	  if (mat.envMapIntensity !== undefined) {
		mat.envMapIntensity *= isWebGPU ? 1.5 : 1.0;
	  }

	  // 🔥 MICRO ROUGHNESS ADJ
	  if (mat.roughness !== undefined) {
		mat.roughness *= 0.95;
	  }

	});

    // load starting camera
    smoothSwitchCamera(config.startCamera);

  });
}


// ─────────────────────────────
// GLASS ANIMATION
// ─────────────────────────────
const glassAnim = {
  state: 'waitGreen',
  timer: 0,

  duration: 1.5,
  waitGreen: 1.0,
  waitClear: 1.0
};


// ─────────────────────────────
// GLASS MAT (GLOBAL)
// ─────────────────────────────
const glassMaterials = [];
let armsTextMeshes = [];
const originalGlassColors = [];
const originalGlassOpacities = [];



// ─────────────────────────────────────────────
// CAMERAS
// ─────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

const cameraTargets = {};
let pendingFreeCamera = false;



// ─────────────────────────────────────────────
// ACTIVE CAMERA + TRANSITION STATE
// ─────────────────────────────────────────────

let transition = {
  active: false,
  startTime: 0,
  duration: 0.8,
  fromPos: new THREE.Vector3(),
  toPos: new THREE.Vector3(),
  fromQuat: new THREE.Quaternion(),
  toQuat: new THREE.Quaternion()
};



// ─────────────────────────────────────────────
// RENDERER
// ─────────────────────────────────────────────
let renderer;

async function initRenderer() {
	
  isRendererReady = false;

  let useWebGPU;

	if (renderMode === 'webgpu') {
	  useWebGPU = true;

	} else if (renderMode === 'webgl') {
	  useWebGPU = false;

	} else {
	  useWebGPU = await isWebGPUSupported();
	}

  if (useWebGPU) {
    console.log("🚀 Using WebGPU");
    rendererLabel.textContent = `Renderer: WebGPU | DPR: ${window.devicePixelRatio}`;

    renderer = new WebGPURenderer({
      antialias: true
    });

    await renderer.init();

  } else {
    console.log("⚠ Using WebGL");
    rendererLabel.textContent = `Renderer: WebGL | ${window.innerWidth}x${window.innerHeight}`;

    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.physicallyCorrectLights = true;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  document.body.appendChild(renderer.domElement);
  
  isRendererReady = true;
}


async function restartApp() {
	
  if (animationId) {
	  cancelAnimationFrame(animationId);
	  animationId = null;
	}	

  console.log("Restarting app with mode:", renderMode);

  // 🧹 clean renderer 
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }

  // 🧹 clean model
	if (currentModel) {
	  scene.remove(currentModel);
	  currentModel = null;
	}

  // 🧹 reset scene 
  scene = new THREE.Scene();

  await initRenderer();

  const isWebGPU = renderer.isWebGPURenderer;

	scene.background = new THREE.Color(
	  isWebGPU ? 0xffffff : 0xcccccc
	);

	// ambient LIGHTING
	//scene.add(new THREE.AmbientLight(0xffffff, 0.0));

  // 🎮 controls 
  controls = new OrbitControls(camera, renderer.domElement);

  controls.enabled = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.minDistance = 0.5;
  controls.maxDistance = 1.2;

  setupEnvironment();
  loadModel(currentConfig);
  animate();
}

// ─────────────────────────────────────────────
// CONTROLS
// ─────────────────────────────────────────────
let controls;

// ─────────────────────────────────────────────
// AMBIENT LIGHTING
// ─────────────────────────────────────────────
// scene.add(new THREE.AmbientLight(0xffffff, 5.0));

// ─────────────────────────────────────────────
// ENVIRONMENT
// ─────────────────────────────────────────────
function setupEnvironment() {

	new EXRLoader().load('studio.exr', (hdr) => {

	  hdr.mapping = THREE.EquirectangularReflectionMapping;

	  if (renderer.isWebGPURenderer) {

		// ✅ WebGPU → usar directamente
		scene.environment = hdr;

	  } else {

		// ✅ WebGL → usar PMREM
		const pmrem = new THREE.PMREMGenerator(renderer);
		pmrem.compileEquirectangularShader();

		const envMap = pmrem.fromEquirectangular(hdr).texture;
		scene.environment = envMap;

		pmrem.dispose();
		hdr.dispose();
	  }

	  scene.environmentRotation = new THREE.Euler(0, Math.PI * 0, 0);
	  const isWebGPU = renderer.isWebGPURenderer;

	  scene.environmentIntensity = isWebGPU ? 1.0 : 1.0;

	});
}
// ─────────────────────────────────────────────
// SMOOTH SWITCH CAMERAS
// ─────────────────────────────────────────────

function smoothSwitchCamera(name) {
  activeCameraName = name;

  const camData = cameraTargets[name];
  if (!camData) return;

  // ───── CAM_FREE (NO TRANSITION)
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

  // ───── CAMERA TRANSITION
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
  transition.active = true;
}


// ─────────────────────────────────────────────
// RESIZE
// ─────────────────────────────────────────────
window.addEventListener('resize', () => {

  if (!renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────
// LOOP ANIMATE
// ─────────────────────────────────────────────
function animate(time) {
	
	frames++;

	if (time > lastTime + 1000) {
	  fps = Math.round((frames * 1000) / (time - lastTime));
	  lastTime = time;
	  frames = 0;

	  fpsLabel.textContent = `FPS: ${fps}`;
	}
  animationId = requestAnimationFrame(animate);

  // ─────────────────────────────────────────
  // CAMERA TRANSITIONS (Still Cameras)
  // ─────────────────────────────────────────
  if (transition.active) {

    const elapsed = (time - transition.startTime) / 1000;
    const t = Math.min(elapsed / transition.duration, 1);
    const ease = t * t * (3 - 2 * t);

    camera.position.lerpVectors(
      transition.fromPos,
      transition.toPos,
      ease
    );

    if (activeCameraName !== 'Cam_Free') {
      camera.quaternion
        .copy(transition.fromQuat)
        .slerp(transition.toQuat, ease);
    }

    if (t >= 1) {
      transition.active = false;
    }
  }

  // ─────────────────────────────────────────
  // ORBIT CONTROLS (only Cam_Free)
  // ─────────────────────────────────────────
  if (controls.enabled) {
    controls.update();
  }

  // ─────────────────────────────────────────
  // GLASS ANIMATION (controlled by config)
  // ─────────────────────────────────────────
  
  const shouldAnimateGlass =
    glassAnimationEnabled &&
    glassMaterials.length > 0 &&
    activeCameraName === glassAnimateCamera;

  if (shouldAnimateGlass) {

    wasAnimatingGlass = true;

    const delta = clock.getDelta();
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
          const t = Math.min(glassAnim.timer / glassAnim.duration, 1);
          const ease = t * t * (3 - 2 * t);

          mat.color.lerpColors(
            originalColor,
            new THREE.Color(1, 1, 1),
            ease
          );

		  mat.opacity = THREE.MathUtils.lerp(
			originalGlassOpacities[i],
			0.0,
			ease
		  );

          if (t >= 1) {
            glassAnim.timer = 0;
            glassAnim.state = 'waitClear';
          }
          break;
        }

        case 'waitClear':
          if (glassAnim.timer > glassAnim.waitClear) {
            glassAnim.timer = 0;
            glassAnim.state = 'toGreen';
          }
          break;

        case 'toGreen': {
          const t = Math.min(glassAnim.timer / glassAnim.duration, 1);
          const ease = t * t * (3 - 2 * t);

          mat.color.lerpColors(
            new THREE.Color(1, 1, 1),
            originalColor,
            ease
          );

		  mat.opacity = THREE.MathUtils.lerp(
			0.0,
			originalGlassOpacities[i],
			ease
		  );


          if (t >= 1) {
            glassAnim.timer = 0;
            glassAnim.state = 'waitGreen';
          }
          break;
        }
      }
    });

  } else {

    // Reset ONLY when leave animate
    if (wasAnimatingGlass) {
      glassMaterials.forEach((mat, i) => {
        mat.color.copy(originalGlassColors[i]);
		mat.opacity = originalGlassOpacities[i];
      });

      glassAnim.state = 'waitGreen';
      glassAnim.timer = 0;
      wasAnimatingGlass = false;
    }
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  
	if (!isRendererReady) return;

	if (renderer.isWebGPURenderer) {
	  renderer.render(scene, camera);
	} else {
	  renderer.render(scene, camera);
	}
	}

// ─────────────────────────────────────────────
// CAMERA BUTTONS UI
// ─────────────────────────────────────────────
const ui = document.createElement('div');
ui.style.position = 'fixed';
ui.style.bottom = '20px';
ui.style.left = '50%';
ui.style.transform = 'translateX(-50%)';
ui.style.display = 'flex';
ui.style.gap = '10px';
ui.style.zIndex = '10';

document.body.appendChild(ui);

const cameraButtons = [
  { label: 'Front', name: 'Cam_Front' },
  { label: 'Side', name: 'Cam_Side' },
  { label: 'Camera', name: 'Cam_Camera' },
  { label: 'Capture', name: 'Cam_Capture' },
  { label: 'Power', name: 'Cam_Power' },
  { label: 'Lenses', name: 'Cam_Lenses' },
  { label: 'Free', name: 'Cam_Free' }
];

cameraButtons.forEach(({ label, name }) => {
  const btn = document.createElement('button');
  btn.textContent = label;

  btn.style.padding = '8px 14px';
  btn.style.border = 'none';
  btn.style.borderRadius = '6px';
  btn.style.cursor = 'pointer';
  btn.style.background = '#111';
  btn.style.color = '#fff';
  btn.style.fontSize = '13px';

  btn.addEventListener('click', () => smoothSwitchCamera(name));
  ui.appendChild(btn);
});

const rendererLabel = document.createElement('div');

rendererLabel.style.position = 'fixed';
rendererLabel.style.top = '20px';
rendererLabel.style.left = '20px';
rendererLabel.style.padding = '6px 10px';
rendererLabel.style.background = 'rgba(0,0,0,0.7)';
rendererLabel.style.color = '#fff';
rendererLabel.style.fontSize = '12px';
rendererLabel.style.fontFamily = 'monospace';
rendererLabel.style.borderRadius = '4px';
rendererLabel.style.zIndex = '100';

rendererLabel.textContent = 'Renderer: detecting...';

const fpsLabel = document.createElement('div');

fpsLabel.style.position = 'fixed';
fpsLabel.style.top = '50px';
fpsLabel.style.left = '20px';
fpsLabel.style.padding = '6px 10px';
fpsLabel.style.background = 'rgba(0,0,0,0.7)';
fpsLabel.style.color = '#0f0';
fpsLabel.style.fontSize = '12px';
fpsLabel.style.fontFamily = 'monospace';
fpsLabel.style.borderRadius = '4px';
fpsLabel.style.zIndex = '100';

fpsLabel.textContent = 'FPS: --';

document.body.appendChild(fpsLabel);

document.body.appendChild(rendererLabel);

const modeUI = document.createElement('div');

modeUI.style.position = 'fixed';
modeUI.style.top = '90px';
modeUI.style.left = '20px';
modeUI.style.display = 'flex';
modeUI.style.gap = '6px';
modeUI.style.zIndex = '100';

document.body.appendChild(modeUI);

const modes = [
  { label: 'AUTO', value: 'auto' },
  { label: 'WEBGPU', value: 'webgpu' },
  { label: 'WEBGL', value: 'webgl' }
];

modes.forEach(({ label, value }) => {

  const btn = document.createElement('button');
  btn.textContent = label;

  btn.style.padding = '6px 10px';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.style.cursor = 'pointer';
  btn.style.background = '#222';
  btn.style.color = '#fff';
  btn.style.fontSize = '11px';

  btn.onclick = async () => {
    renderMode = value;
    await restartApp();
  };

  modeUI.appendChild(btn);
});

async function init() {
  await initRenderer();
  
  const isWebGPU = renderer.isWebGPURenderer;

	// 🎨 background color
	scene.background = new THREE.Color(
	  isWebGPU ? 0xffffff : 0xffffff
	);

  // CONTROLS (ahora que renderer existe)
  controls = new OrbitControls(camera, renderer.domElement);

  controls.enabled = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.minDistance = 0.5;
  controls.maxDistance = 1.2;

  // ENVIRONMENT (IMPORTANTE → depende de renderer)
  setupEnvironment();

  loadModel(currentConfig);
  animate();
}

init();




















