import * as THREE from 'three';

export class Renderer {
	/** @param {HTMLCanvasElement} canvas */
	constructor(canvas) {
		this.instance = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: false,
			powerPreference: 'high-performance',
		});

		this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.instance.setSize(window.innerWidth, window.innerHeight);
		this.instance.setClearColor(0xffffff, 1);
		this.instance.outputColorSpace = THREE.LinearSRGBColorSpace;
	}

	resize() {
		this.instance.setSize(window.innerWidth, window.innerHeight);
		this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	render(scene, camera) {
		this.instance.render(scene, camera);
	}

	dispose() {
		this.instance.renderLists.dispose();
		this.instance.forceContextLoss();
		this.instance.dispose();
	}
}
