// Normalized 9-tap Gaussian weights (binomial approximation, sum = 1.0)
const WEIGHTS = `const float W[9] = float[9](
  0.0039, 0.0313, 0.1094, 0.2188, 0.2734, 0.2188, 0.1094, 0.0313, 0.0039
);`;

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Both passes derive the same radius from vUv.y so H and V match exactly.
const RADIUS_EXPR = /* glsl */`
  float dist   = abs(vUv.y - 0.5) * 2.0;
  float radius = smoothstep(uFalloff, 1.0, dist) * uMaxBlur;
`;

const SHARED_UNIFORMS = {
  tDiffuse: { value: null },
  uMaxBlur: { value: 0.008 },  // very subtle
  uFalloff: { value: 0.45  },  // sharp centre zone
};

export const DofBlurH = {
  uniforms: { ...SHARED_UNIFORMS },
  vertexShader: VERT,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uMaxBlur;
    uniform float uFalloff;
    varying vec2 vUv;
    ${WEIGHTS}
    void main() {
      ${RADIUS_EXPR}
      vec4 c = vec4(0.0);
      for (int i = 0; i < 9; i++) {
        float off = (float(i) - 4.0) * radius;
        c += texture2D(tDiffuse, vUv + vec2(off, 0.0)) * W[i];
      }
      gl_FragColor = c;
    }
  `,
};

export const DofBlurV = {
  uniforms: { ...SHARED_UNIFORMS },
  vertexShader: VERT,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uMaxBlur;
    uniform float uFalloff;
    varying vec2 vUv;
    ${WEIGHTS}
    void main() {
      ${RADIUS_EXPR}
      vec4 c = vec4(0.0);
      for (int i = 0; i < 9; i++) {
        float off = (float(i) - 4.0) * radius;
        c += texture2D(tDiffuse, vUv + vec2(0.0, off)) * W[i];
      }
      gl_FragColor = c;
    }
  `,
};
