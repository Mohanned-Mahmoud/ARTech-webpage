import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass }     from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CompositePass }  from '../shaders/composite.js';

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this._composer = new EffectComposer(renderer);
    this._composer.addPass(new RenderPass(scene, camera));

    this._compositePass = new ShaderPass(CompositePass);
    this._compositePass.renderToScreen = true;
    this._composer.addPass(this._compositePass);
  }

  render(time) {
    this._compositePass.uniforms.uTime.value = time;
    this._composer.render();
  }

  resize(w, h) {
    this._composer.setSize(w, h);
  }

  dispose() {
    this._composer.dispose();
  }
}
