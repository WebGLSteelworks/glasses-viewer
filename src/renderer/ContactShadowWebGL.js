import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// ContactShadowWebGL
//
// Direct WebGL port of ContactShadowWebGPU.
// Identical structure and render() call — no EffectComposer integration needed.
// The floor lives in this.group (added to the main scene) exactly like the
// WebGPU version. Works because main.js uses renderer.render() directly
// (bypassing the composer) when contact shadow is active in WebGL.
//
// The only WebGL-specific differences from the WebGPU original:
//   - NodeMaterial  → ShaderMaterial
//   - QuadMesh      → PlaneGeometry(2,2) fullscreen mesh
//   - RenderTarget  → WebGLRenderTarget
//   - viewZToOrthographicDepth TSL → equivalent GLSL formula
// ─────────────────────────────────────────────────────────────────────────────

const LOG_MAX_RESOLUTION = 9;
const LOG_MIN_RESOLUTION = 6;
const DEFAULT_HARD_INTENSITY = 0.3;

function lerp(x, y, t) {
  return (1 - t) * x + t * y;
}

const blurVertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function makeBlurFragmentShader(axis) {
  const offsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const weights = [0.051, 0.0918, 0.12245, 0.1531, 0.1633, 0.1531, 0.12245, 0.0918, 0.051];
  const samples = offsets.map((o, i) => {
    const uv = axis === 'h'
      ? `vUv + vec2(uStep * ${o.toFixed(1)}, 0.0)`
      : `vUv + vec2(0.0, uStep * ${o.toFixed(1)})`;
    return `color += texture2D(uTexture, ${uv}) * ${weights[i].toFixed(5)};`;
  }).join('\n  ');
  return /* glsl */`
    uniform sampler2D uTexture;
    uniform float uStep;
    varying vec2 vUv;
    void main() {
      vec4 color = vec4(0.0);
      ${samples}
      gl_FragColor = color;
    }
  `;
}


export default class ContactShadowWebGL {

  constructor() {
    this.group        = new THREE.Group();
    this.intensity    = 0;
    this.softness     = 1;
    this.boundingBox  = new THREE.Box3();
    this.size         = new THREE.Vector3();
    this.maxDimension = 0;
    this.needsUpdate  = false;
    this.renderTarget     = null;
    this.renderTargetBlur = null;

    // Ortho camera — identical setup to WebGPU version
    this.camera            = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    this.camera.rotation.x = Math.PI / 2;
    this.group.add(this.camera);

    // Floor — identical to WebGPU version: transparent, inside group, visible = false
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(),
      new THREE.MeshBasicMaterial({
        opacity:            1,
        // transparent MUST be true (and stay true — see setIntensity()) for
        // NormalBlending to actually blend; otherwise WebGL treats the draw
        // as opaque and overwrites instead of blending by alpha.
        transparent:        true,
        depthWrite:         false,
        // depthTest MUST be true — NOT false. Making this material
        // transparent (above) moved it into three.js's separate transparent
        // render queue, which always draws AFTER the opaque queue (the
        // frame geometry) regardless of renderOrder — renderOrder only
        // orders objects within the same queue, it doesn't interleave
        // opaque and transparent passes. With depthTest:false the floor
        // could paint over the already-drawn frame with nothing to stop it
        // (confirmed: this caused the shadow to render on top of the
        // frame in WebGL). depthTest:true lets it correctly respect the
        // depth buffer the frame already wrote, so it stays occluded
        // wherever the frame covers it, while depthWrite stays false so
        // the floor itself doesn't block other transparent draws (lenses)
        // behind it in the same pass.
        depthTest:          true,
        // NormalBlending (SRC_ALPHA, ONE_MINUS_SRC_ALPHA), NOT MultiplyBlending.
        // MultiplyBlending's WebGL blend equation is (ZERO, SRC_COLOR) — it
        // ignores src alpha entirely, multiplying dst by src RGB only. The
        // depth material below writes constant black RGB (0,0,0) with the
        // actual shadow gradient encoded ONLY in alpha, so MultiplyBlending
        // always multiplied every touched pixel to solid black regardless
        // of its alpha, instead of a soft falloff — this is what caused the
        // shadow to render as an opaque black/invisible patch instead of a
        // soft gradient. NormalBlending correctly respects alpha here.
        blending:           THREE.NormalBlending,
        premultipliedAlpha: true,
        side:               THREE.FrontSide,
      })
    );
    this.floor.rotation.x     = -Math.PI / 2;
    this.floor.rotation.z     = Math.PI;
    this.floor.renderOrder    = -1;    // before all geometry
    this.floor.userData.noHit = true;
    this.floor.visible        = false;
    this.group.add(this.floor);

    // Depth material — WebGL equivalent of the WebGPU NodeMaterial depth pass.
    // viewZToOrthographicDepth(positionView.z, near, far) in GLSL:
    //   depth01 = (-positionView.z - near) / (far - near)
    //   alpha   = (1 - depth01) * opacity
    this._opacityValue = 1.0;
    // Depth material: gl_FragCoord.z is always [0,1] in NDC, reliable across
    // all camera orientations. near plane = 0, far plane = 1.
    // Shadow darkness = 1 - depth: geometry close to ground = dark, far = faint.
    this.depthMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader: /* glsl */`
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uOpacity;
        void main() {
          float depth = gl_FragCoord.z;   // [0=near .. 1=far]
          float alpha = (1.0 - depth) * uOpacity;
          gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        }
      `,
      uniforms: {
        uOpacity: { value: 1.0 },
      },
      transparent: true,
    });

    // Blur materials — identical kernel to WebGPU version
    this.horizontalBlurMaterial = new THREE.ShaderMaterial({
      vertexShader:   blurVertexShader,
      fragmentShader: makeBlurFragmentShader('h'),
      uniforms: { uTexture: { value: null }, uStep: { value: 1 / 512 } },
      depthTest: false, depthWrite: false,
    });

    this.verticalBlurMaterial = new THREE.ShaderMaterial({
      vertexShader:   blurVertexShader,
      fragmentShader: makeBlurFragmentShader('v'),
      uniforms: { uTexture: { value: null }, uStep: { value: 1 / 512 } },
      depthTest: false, depthWrite: false,
    });

    // Fullscreen quad — WebGL equivalent of QuadMesh
    this._quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.horizontalBlurMaterial);
    this._quadMesh.frustumCulled = false;
    this._quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._quadScene  = new THREE.Scene();
    this._quadScene.add(this._quadMesh);

    this.group.visible = false;
  }


  // ── public API — identical signatures to ContactShadowWebGPU ─────────────

  setScene(model, softness) {
    const s = softness ?? this.softness;
    const box = new THREE.Box3().setFromObject(model);
    this.boundingBox.copy(box);
    this.size.copy(box.getSize(new THREE.Vector3()));
    this.maxDimension = Math.max(this.size.x, this.size.y, this.size.z);
    this.boundingBox.getCenter(this.group.position);
    this.group.position.y = this.boundingBox.min.y;
    this.setSoftness(s);
  }

  setSoftness(softness) {
    this.softness = Math.max(softness, 0.01);
    const resolution = Math.pow(
      2,
      LOG_MAX_RESOLUTION - this.softness * (LOG_MAX_RESOLUTION - LOG_MIN_RESOLUTION)
    );
    this.#setMapSize(resolution);

    const softFar = this.size.y / 4;
    const hardFar = this.size.y / 2;
    this.camera.near = 0;
    this.camera.far  = lerp(hardFar, softFar, this.softness);

    this.camera.updateProjectionMatrix();
    this.setIntensity(this.intensity);  // recalculates uOpacity correctly with intensity
    this.floor.position.y = 0.001 * this.maxDimension;
  }

  setIntensity(intensity) {
    this.intensity = intensity;
    if (intensity > 0) {
      this.group.visible = true;
      this.floor.visible = true;
      // With MultiplyBlending, opacity blends between multiply effect (1.0)
      // and no effect (0.0). We use it as the shadow strength control.
      this.floor.material.opacity = Math.min(
        intensity * lerp(DEFAULT_HARD_INTENSITY, 1, this.softness * this.softness),
        1.0
      );
      // transparent is fixed to true in the constructor and must stay that
      // way — do NOT toggle it based on opacity here. NormalBlending only
      // blends by alpha when transparent:true; flipping it false (which
      // happened whenever opacity rounded to exactly 1.0) silently broke
      // the shadow by making WebGL treat the draw as opaque.
      this.depthMaterial.uniforms.uOpacity.value =
        (intensity / this.softness) * lerp(DEFAULT_HARD_INTENSITY, 1, this.softness * this.softness);
    } else {
      this.group.visible = false;
      this.floor.visible = false;
    }
  }

  // Identical flow to WebGPU render() — no composer involvement
  render(renderer, scene) {
    const { renderTarget } = this;
    if (renderTarget == null) return;

    const initialClearAlpha = renderer.getClearAlpha();
    const initialAutoClear  = renderer.autoClear;
    const oldRenderTarget   = renderer.getRenderTarget();

    scene.overrideMaterial = this.depthMaterial;
    renderer.setClearAlpha(0);
    this.floor.visible = false;
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, this.camera);
    scene.overrideMaterial = null;
    this.floor.visible = true;

    this.#blurShadow(renderer);

    renderer.setRenderTarget(oldRenderTarget);
    renderer.setClearAlpha(initialClearAlpha);
    renderer.autoClear = initialAutoClear;
  }

  dispose() {
    this.renderTarget?.dispose();
    this.renderTargetBlur?.dispose();
    this.depthMaterial.dispose();
    this.horizontalBlurMaterial.dispose();
    this.verticalBlurMaterial.dispose();
    this.floor.material.dispose();
    this.floor.geometry.dispose();
    this._quadMesh.geometry.dispose();
    this.group.removeFromParent();
  }


  // ── private ───────────────────────────────────────────────────────────────

  #setMapSize(maxMapSize) {
    const { size } = this;
    if (size.x <= 0 || size.z <= 0) return;

    const baseWidth = Math.max(1, Math.floor(
      size.z > 0 && size.x > size.z ? maxMapSize
        : size.z > 0 ? (maxMapSize * size.x) / size.z
        : maxMapSize
    ));
    const baseHeight = Math.max(1, Math.floor(
      size.x > 0 && size.x > size.z ? (maxMapSize * size.z) / size.x : maxMapSize
    ));

    const TAP_WIDTH = 10;
    const width     = TAP_WIDTH + baseWidth;
    const height    = TAP_WIDTH + baseHeight;

    if (
      this.renderTarget != null &&
      (this.renderTarget.width !== width || this.renderTarget.height !== height)
    ) {
      this.renderTarget.dispose();
      this.renderTarget = null;
      this.renderTargetBlur?.dispose();
      this.renderTargetBlur = null;
    }

    if (this.renderTarget == null) {
      this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
        format:    THREE.RGBAFormat,
        type:      THREE.UnsignedByteType,
        depthBuffer: true,
      });
      this.renderTargetBlur = new THREE.WebGLRenderTarget(width, height, {
        format:    THREE.RGBAFormat,
        type:      THREE.UnsignedByteType,
        depthBuffer: false,
      });
      this.floor.material.map         = this.renderTarget.texture;
      this.floor.material.needsUpdate = true;
    }

    const halfW = (size.x * (1 + TAP_WIDTH / baseWidth))  / 2;
    const halfH = (size.z * (1 + TAP_WIDTH / baseHeight)) / 2;
    this.camera.left   = -halfW;
    this.camera.right  =  halfW;
    this.camera.top    =  halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
    this.floor.scale.set(halfW * 2, halfH * 2, 1);
    this.needsUpdate = true;
  }

  #blurShadow(renderer) {
    const { renderTarget, renderTargetBlur } = this;
    if (renderTarget == null || renderTargetBlur == null) return;

    this.horizontalBlurMaterial.uniforms.uTexture.value = renderTarget.texture;
    this.horizontalBlurMaterial.uniforms.uStep.value    = 1 / renderTarget.width;
    this._quadMesh.material = this.horizontalBlurMaterial;
    renderer.setRenderTarget(renderTargetBlur);
    renderer.render(this._quadScene, this._quadCamera);

    this.verticalBlurMaterial.uniforms.uTexture.value = renderTargetBlur.texture;
    this.verticalBlurMaterial.uniforms.uStep.value    = 1 / renderTargetBlur.height;
    this._quadMesh.material = this.verticalBlurMaterial;
    renderer.setRenderTarget(renderTarget);
    renderer.render(this._quadScene, this._quadCamera);
  }
}
