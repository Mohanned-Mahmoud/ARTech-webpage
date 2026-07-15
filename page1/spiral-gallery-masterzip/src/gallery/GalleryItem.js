import * as THREE from 'three';
import { vertexShader, fragmentShader } from '../shaders/index.js';

const PLANE_W = 0.9;
const PLANE_H = 1.2;

export class GalleryItem {
  constructor(frontTexture, backTexture, scene) {
    this._uniforms = {
      uTexture:      { value: frontTexture },
      uBackTexture:  { value: backTexture },
      uOpacity:      { value: 0 },
      uVelocity:     { value: 0 },
      uImageSize:    { value: new THREE.Vector2(
        frontTexture.image?.naturalWidth  ?? 1200,
        frontTexture.image?.naturalHeight ?? 800,
      )},
      uBackImageSize: { value: new THREE.Vector2(
        backTexture.image?.naturalWidth  ?? 1200,
        backTexture.image?.naturalHeight ?? 800,
      )},
      uPlaneSize: { value: new THREE.Vector2(PLANE_W, PLANE_H) },
    };

    const geo = new THREE.PlaneGeometry(PLANE_W, PLANE_H, 20, 20);
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms:    this._uniforms,
      transparent: true,
      depthWrite:  false,
      side:        THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    scene.add(this.mesh);
  }

  update(proximity, velocity) {
    const fadeIn  = THREE.MathUtils.smoothstep(proximity, 0.04, 0.18);
    const fadeOut = 1.0 - THREE.MathUtils.smoothstep(proximity, 0.88, 0.98);
    this._uniforms.uOpacity.value  = fadeIn * fadeOut;
    this._uniforms.uVelocity.value = velocity;
  }

  dispose(scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
