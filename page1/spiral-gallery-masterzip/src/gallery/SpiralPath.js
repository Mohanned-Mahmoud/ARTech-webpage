import * as THREE from 'three';

/**
 * Spring / helix along the Y axis.
 *
 * Camera sits at (0, 0, camZ) looking at the origin.
 * Items scroll upward (+Y) and recycle.  X and Z oscillate to form the coil.
 *
 *   angle  = (y - yFar) / yRange * turns * 2π
 *   x      = radius * cos(angle)
 *   z      = basZ + zOffset * sin(angle)   ← depth pulses toward / away from camera
 */
export class SpiralPath {
  constructor({
    radius  = 1.4,    // horizontal spread of the coil
    zOffset = 0.35,   // depth oscillation amplitude
    turns   = 2.5,    // full rotations over the y range
    camZ    = 6,      // camera Z position
    yFar    = -2.8,   // bottom of pool range (wider than frustum so chain is dense)
    yNear   = 2.8,    // top of pool range
  } = {}) {
    this.radius  = radius;
    this.zOffset = zOffset;
    this.turns   = turns;
    this.camZ    = camZ;
    this.yFar    = yFar;
    this.yNear   = yNear;
    this.yRange  = yNear - yFar;
  }

  angleAt(y) {
    const frac = (y - this.yFar) / this.yRange;
    return frac * this.turns * Math.PI * 2;
  }

  positionAt(y) {
    const angle = this.angleAt(y);
    return new THREE.Vector3(
      this.radius  * Math.cos(angle),
      y,
      (this.camZ - 3) + this.zOffset * Math.sin(angle),
    );
  }

  rotationAt(y) {
    const angle = this.angleAt(y);
    return new THREE.Euler(
      Math.sin(angle) * 0.10,
      -Math.cos(angle) * 0.25,
      0,
    );
  }
}
