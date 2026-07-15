export const vertexShader = /* glsl */ `
uniform float uVelocity;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Velocity wobble — slight tilt while scrolling
  float angle = uVelocity * 0.10;
  float si    = sin(angle);
  float co    = cos(angle);

  vec2 p       = uv - 0.5;
  vec2 rotated = vec2(p.x * co - p.y * si, p.x * si + p.y * co);

  pos.x += (rotated.x - p.x) * 0.12;
  pos.y += (rotated.y - p.y) * 0.12;

  float d  = distance(uv, vec2(0.5));
  pos.z   -= abs((1.0 - d) * uVelocity * 0.18);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform sampler2D uBackTexture;
uniform float     uOpacity;
uniform vec2      uImageSize;
uniform vec2      uBackImageSize;
uniform vec2      uPlaneSize;

varying vec2 vUv;

vec2 coverUv(vec2 uv, vec2 plane, vec2 image) {
  float planeAspect = plane.x / plane.y;
  float imageAspect = image.x / image.y;
  vec2 scale = planeAspect > imageAspect
    ? vec2(1.0, imageAspect / planeAspect)
    : vec2(planeAspect / imageAspect, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

float roundedAlpha(vec2 uv, vec2 size, float radius) {
  vec2 p = uv * size;
  vec2 q = abs(p - size * 0.5) - size * 0.5 + radius;
  float d = length(max(q, 0.0)) - radius;
  return 1.0 - smoothstep(-0.004, 0.004, d);
}

void main() {
  vec4 color;

  if (gl_FrontFacing) {
    vec2 uv = coverUv(vUv, uPlaneSize, uImageSize);
    color = texture2D(uTexture, uv);
  } else {
    vec2 flipped = vec2(1.0 - vUv.x, vUv.y);
    vec2 uv      = coverUv(flipped, uPlaneSize, uBackImageSize);
    color        = texture2D(uBackTexture, uv);
  }

  float corners = roundedAlpha(vUv, uPlaneSize, 0.07);
  color.a *= uOpacity * corners;
  gl_FragColor = color;
}
`;
