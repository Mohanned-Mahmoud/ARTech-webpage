import * as THREE from 'three';
import gsap from 'gsap';
import { Renderer }        from './Renderer.js';
import { Camera }          from './Camera.js';
import { Gallery }         from '../gallery/Gallery.js';
import { ScrollManager }   from '../scroll/ScrollManager.js';
import { loadTextures }    from '../utils/AssetLoader.js';

const IMAGE_URLS = Array.from({ length: 12 }, (_, i) => `/images/img-${i + 1}.jpg`);

export class App {
  constructor(canvas) {
    this._canvas  = canvas;
    this._clock   = new THREE.Clock();
    this._running = false;
  }

  async init(onProgress) {
    this._renderer = new Renderer(this._canvas);
    this._camera   = new Camera();
    this._scene    = new THREE.Scene();

    const scrollEl = document.querySelector('.scroll-container');
    this._scroll   = new ScrollManager(scrollEl);

    const textures = await loadTextures(IMAGE_URLS, onProgress);
    this._gallery  = new Gallery(this._scene, this._camera.instance, textures);
    this._gallery.resize(window.innerWidth, window.innerHeight);

    this._scroll.setSnapFn((offset) => this._gallery.getSnapOffset(offset));
    this._bindResize();
    this._start();
  }

  _start() {
    this._running   = true;
    this._boundTick = this._tick.bind(this);
    gsap.ticker.add(this._boundTick);
    gsap.ticker.fps(60);
  }

  _tick() {
    if (!this._running) return;
    this._gallery.update(this._scroll.smoothOffset, this._scroll.velocity);
    this._renderer.render(this._scene, this._camera.instance);
  }

  _bindResize() {
    this._boundResize = () => {
      this._renderer.resize();
      this._camera.resize();
      this._gallery.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this._boundResize);
  }

  destroy() {
    this._running = false;
    gsap.ticker.remove(this._boundTick);
    window.removeEventListener('resize', this._boundResize);
    this._scroll.destroy();
    this._gallery.dispose();
    this._scene.clear();
    this._renderer.dispose();
  }
}
