import * as THREE from 'three';
import { QuadMesh, NodeMaterial } from 'three/webgpu';
import {
  cameraFar,
  cameraNear,
  float,
  positionView,
  texture,
  uniform,
  uv,
  vec2,
  vec4,
  viewZToOrthographicDepth,
} from 'three/tsl';

const LOG_MAX_RESOLUTION = 9;
const LOG_MIN_RESOLUTION = 6;
const DEFAULT_HARD_INTENSITY = 0.3;

function lerp(x, y, t) {
  return (1 - t) * x + t * y;
}

function buildBlurFragmentNode(texNode, stepUniform, axis) {
  const uvNode = uv();
  const offsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const weights = [
    0.051, 0.0918, 0.12245, 0.1531, 0.1633, 0.1531, 0.12245, 0.0918, 0.051,
  ];

  let sum = vec4(0, 0, 0, 0);
  for (let i = 0; i < offsets.length; i++) {
    const offset =
      axis === 'h'
        ? vec2(stepUniform.mul(offsets[i]), 0)
        : vec2(0, stepUniform.mul(offsets[i]));
    sum = sum.add(texture(texNode, uvNode.add(offset)).mul(weights[i]));
  }
  return sum;
}

export default class ContactShadow {
  #opacityUniform;
  #hStepUniform;
  #vStepUniform;
  #hTexNode;
  #vTexNode;

  constructor() {
    this.group = new THREE.Group();
    this.intensity = 0;
    this.softness = 1;
    this.boundingBox = new THREE.Box3();
    this.size = new THREE.Vector3();
    this.maxDimension = 0;
    this.needsUpdate = false;
    this.renderTarget = null;
    this.renderTargetBlur = null;

    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    this.camera.rotation.x = Math.PI / 2;
    this.group.add(this.camera);

    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(),
      new THREE.MeshBasicMaterial({
        opacity: 0,
        transparent: true,
        side: THREE.FrontSide,
      }),
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.userData.noHit = true;
    this.floor.visible = false;
    this.group.add(this.floor);

    this.#opacityUniform = uniform(1.0);
    const depthMaterial = new NodeMaterial();
    depthMaterial.side = THREE.DoubleSide;

    const depth01 = viewZToOrthographicDepth(
      positionView.z,
      cameraNear,
      cameraFar,
    );
    depthMaterial.fragmentNode = vec4(
      float(0),
      float(0),
      float(0),
      depth01.oneMinus().mul(this.#opacityUniform),
    );
    this.depthMaterial = depthMaterial;

    this.#hTexNode = texture(new THREE.Texture());
    this.#vTexNode = texture(new THREE.Texture());
    this.#hStepUniform = uniform(1 / 512);
    this.#vStepUniform = uniform(1 / 512);

    const hBlurMat = new NodeMaterial();
    hBlurMat.depthTest = false;
    hBlurMat.depthWrite = false;
    hBlurMat.fragmentNode = buildBlurFragmentNode(
      this.#hTexNode,
      this.#hStepUniform,
      'h',
    );
    this.horizontalBlurMaterial = hBlurMat;

    const vBlurMat = new NodeMaterial();
    vBlurMat.depthTest = false;
    vBlurMat.depthWrite = false;
    vBlurMat.fragmentNode = buildBlurFragmentNode(
      this.#vTexNode,
      this.#vStepUniform,
      'v',
    );
    this.verticalBlurMaterial = vBlurMat;

    this.quadMesh = new QuadMesh();
    this.group.visible = false;
  }

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
      LOG_MAX_RESOLUTION -
        this.softness * (LOG_MAX_RESOLUTION - LOG_MIN_RESOLUTION),
    );
    this.#setMapSize(resolution);
    const softFar = this.size.y / 4;
    const hardFar = this.size.y / 2;
    this.camera.near = 0;
    this.camera.far = lerp(hardFar, softFar, this.softness);
    this.#opacityUniform.value = 1.0 / this.softness;
    this.camera.updateProjectionMatrix();
    this.setIntensity(this.intensity);
    this.floor.position.y = 0.001 * this.maxDimension;
  }

  #setMapSize(maxMapSize) {
    const { size } = this;
    if (size.x <= 0 || size.z <= 0) {
      return;
    }
    const baseWidth = Math.max(
      1,
      Math.floor(
        size.z > 0 && size.x > size.z
          ? maxMapSize
          : size.z > 0
            ? (maxMapSize * size.x) / size.z
            : maxMapSize,
      ),
    );
    const baseHeight = Math.max(
      1,
      Math.floor(
        size.x > 0 && size.x > size.z
          ? (maxMapSize * size.z) / size.x
          : maxMapSize,
      ),
    );
    const TAP_WIDTH = 10;
    const width = TAP_WIDTH + baseWidth;
    const height = TAP_WIDTH + baseHeight;

    if (
      this.renderTarget != null &&
      (this.renderTarget.width !== width || this.renderTarget.height !== height)
    ) {
      this.renderTarget.dispose();
      this.renderTarget = null;
      if (this.renderTargetBlur != null) {
        this.renderTargetBlur.dispose();
      }
      this.renderTargetBlur = null;
    }

    if (this.renderTarget == null) {
      const rt = new THREE.RenderTarget(width, height);
      this.renderTarget = rt;
      this.renderTargetBlur = new THREE.RenderTarget(width, height, {
        depthBuffer: false,
      });
      this.floor.material.map = rt.texture;
      this.floor.material.needsUpdate = true;
    }

    const halfW = (size.x * (1 + TAP_WIDTH / baseWidth)) / 2;
    const halfH = (size.z * (1 + TAP_WIDTH / baseHeight)) / 2;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
    this.floor.scale.set(halfW * 2, halfH * 2, 1);
    this.needsUpdate = true;
  }

  setIntensity(intensity) {
    this.intensity = intensity;
    if (intensity > 0) {
      this.group.visible = true;
      this.floor.visible = true;
      this.floor.material.opacity =
        intensity *
        lerp(DEFAULT_HARD_INTENSITY, 1, this.softness * this.softness);
    } else {
      this.group.visible = false;
      this.floor.visible = false;
    }
  }

  render(renderer, scene) {
    const { renderTarget } = this;
    if (renderTarget == null) {
      return;
    }

    const initialClearAlpha = renderer.getClearAlpha();
    const initialAutoClear = renderer.autoClear;
    const oldRenderTarget = renderer.getRenderTarget();

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

  #blurShadow(renderer) {
    const { quadMesh, renderTarget, renderTargetBlur } = this;
    if (renderTarget == null || renderTargetBlur == null) {
      return;
    }

    this.#hStepUniform.value = 1 / renderTarget.width;
    this.#hTexNode.value = renderTarget.texture;
    quadMesh.material = this.horizontalBlurMaterial;
    renderer.setRenderTarget(renderTargetBlur);
    quadMesh.render(renderer);

    this.#vStepUniform.value = 1 / renderTargetBlur.height;
    this.#vTexNode.value = renderTargetBlur.texture;
    quadMesh.material = this.verticalBlurMaterial;
    renderer.setRenderTarget(renderTarget);
    quadMesh.render(renderer);
  }

  dispose() {
    this.renderTarget?.dispose();
    this.renderTargetBlur?.dispose();
    this.depthMaterial.dispose();
    this.horizontalBlurMaterial.dispose();
    this.verticalBlurMaterial.dispose();
    this.floor.material.dispose();
    this.floor.geometry.dispose();
    this.group.removeFromParent();
  }
}

