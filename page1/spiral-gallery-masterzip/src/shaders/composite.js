const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */`
  uniform sampler2D tDiffuse;
  uniform float uTime;
  varying vec2 vUv;

  // ── Grain ────────────────────────────────────────────────────────
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  void main() {
    vec4 col = texture2D(tDiffuse, vUv);

    // Film grain — animated hash
    float grain  = hash(vUv + fract(uTime * 0.07)) * 2.0 - 1.0;
    col.rgb     += grain * 0.072;

    gl_FragColor = col;
  }
`;

export const CompositePass = {
  uniforms: {
    tDiffuse: { value: null },
    uTime:    { value: 0.0 },
  },
  vertexShader:   VERT,
  fragmentShader: FRAG,
};
