import gsap from 'gsap';

export function createLoader(total) {
  const loaderEl = document.getElementById('js-loader');
  const fillEl   = document.getElementById('js-loader-fill');
  const countEl  = document.getElementById('js-loader-count');

  function onProgress(loaded) {
    const pct = (loaded / total) * 100;
    fillEl.style.width = `${pct}%`;
    countEl.textContent = `${loaded} / ${total}`;
  }

  function dismiss() {
    gsap.to(loaderEl, {
      opacity:  0,
      duration: 0.6,
      ease:     'power2.inOut',
      onComplete: () => loaderEl.remove(),
    });
  }

  return { onProgress, dismiss };
}
