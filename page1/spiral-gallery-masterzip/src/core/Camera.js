import * as THREE from 'three';

const FRUSTUM = 3;

export class Camera {
  constructor() {
    const aspect = window.innerWidth / window.innerHeight;
    this.instance = new THREE.OrthographicCamera(
      -FRUSTUM * aspect / 2,
       FRUSTUM * aspect / 2,
       FRUSTUM / 2,
      -FRUSTUM / 2,
      0.1, 200,
    );
  }

  resize() {
    const aspect = window.innerWidth / window.innerHeight;
    this.instance.left   = -FRUSTUM * aspect / 2;
    this.instance.right  =  FRUSTUM * aspect / 2;
    this.instance.top    =  FRUSTUM / 2;
    this.instance.bottom = -FRUSTUM / 2;
    this.instance.updateProjectionMatrix();
  }
}
