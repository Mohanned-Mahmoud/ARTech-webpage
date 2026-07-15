import gsap from 'gsap';

const IDLE_DELAY   = 1000; // ms of silence before snap fires
const SNAP_EASE    = 'power3.out';
const SNAP_DURATION = 0.9; // seconds

export class ScrollManager {
  /** @param {HTMLElement} scrollEl */
  constructor(scrollEl) {
    this._el  = scrollEl;
    this._mid = (scrollEl.scrollHeight - scrollEl.clientHeight) / 2;
    scrollEl.scrollTop = this._mid;

    this.offset       = 0;
    this.smoothOffset = 0;
    this.velocity     = 0;

    this._ease          = 0.04;
    this._lastScrollAt  = 0;
    this._snapping      = false;
    this._snapFn        = null;   // set by App after Gallery is ready

    // Store bound references so they can be removed later
    this._boundOnScroll = this._onScroll.bind(this);
    this._boundTick     = this._tick.bind(this);

    scrollEl.addEventListener('scroll', this._boundOnScroll, { passive: true });
    gsap.ticker.add(this._boundTick);
  }

  /** @param {function(number): number} fn  — receives smoothOffset, returns snap target */
  setSnapFn(fn) {
    this._snapFn = fn;
  }

  _onScroll() {
    const delta    = this._el.scrollTop - this._mid;
    this.offset   += delta;
    this._el.scrollTop = this._mid;

    this._lastScrollAt = performance.now();

    // Cancel any in-progress snap the moment the user touches the scroll again
    if (this._snapping) {
      gsap.killTweensOf(this);
      this._snapping = false;
    }
  }

  _tick() {
    const prev        = this.smoothOffset;
    this.smoothOffset += (this.offset - this.smoothOffset) * this._ease;

    const rawVel   = (this.smoothOffset - prev) * 0.4;
    this.velocity += (rawVel - this.velocity) * 0.12;

    // Snap once idle and a snap function is registered
    const idle = performance.now() - this._lastScrollAt > IDLE_DELAY;
    if (idle && !this._snapping && this._snapFn) {
      const target = this._snapFn(this.smoothOffset);
      // Only snap if we're meaningfully off-centre
      if (Math.abs(target - this.offset) > 0.5) {
        this._snapping = true;
        gsap.to(this, {
          offset:   target,
          duration: SNAP_DURATION,
          ease:     SNAP_EASE,
          onUpdate: () => {
            // Keep smoothOffset chasing offset during the tween
            // (the normal lerp in _tick handles this automatically)
          },
          onComplete: () => { this._snapping = false; },
        });
      }
    }
  }

  destroy() {
    gsap.killTweensOf(this);
    gsap.ticker.remove(this._boundTick);
    this._el.removeEventListener('scroll', this._boundOnScroll);
  }
}
