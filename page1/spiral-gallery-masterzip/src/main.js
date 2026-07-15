import './style.css';
import * as THREE from 'three';
import { App }         from './core/App.js';
import { createLoader } from './utils/loader.js';
import { projects }    from './data/projects.js';

const loader = createLoader(12);
const app    = new App(document.getElementById('gl-canvas'));

// ── Custom cursor ────────────────────────────────────────────────
const cursorEl = document.getElementById('js-cursor');
window.addEventListener('mousemove', (e) => {
  cursorEl.style.left = e.clientX + 'px';
  cursorEl.style.top  = e.clientY + 'px';
});

// ── Overlay elements ─────────────────────────────────────────────
const overlay      = document.getElementById('js-overlay');
const overlayImg   = document.getElementById('js-overlay-img');
const overlayTitle = document.getElementById('js-overlay-title');
const overlayYear  = document.getElementById('js-overlay-year');
const overlayDesc  = document.getElementById('js-overlay-desc');
const overlayTags  = document.getElementById('js-overlay-tags');
const overlayLink  = document.getElementById('js-overlay-link');
const overlayClose = document.getElementById('js-overlay-close');

// ── Raycasting ───────────────────────────────────────────────────
const raycaster  = new THREE.Raycaster();
const mouse      = new THREE.Vector2();
let   isReady    = false;
let   mouseDownX = 0;
let   mouseDownY = 0;

app.init(loader.onProgress).then(() => {
  loader.dismiss();
  isReady = true;
});

// ── Project overlay ──────────────────────────────────────────────
function openProject(idx) {
  const p = projects[idx];
  overlayImg.src             = `/images/img-${idx + 1}.jpg`;
  overlayTitle.textContent   = p.title;
  overlayYear.textContent    = p.year;
  overlayDesc.textContent    = p.description;
  overlayTags.innerHTML      = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
  if (p.link) {
    overlayLink.href          = p.link;
    overlayLink.style.display = '';
  } else {
    overlayLink.style.display = 'none';
  }
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeProject() {
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

overlayClose.addEventListener('click', closeProject);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeProject(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProject(); });

// ── Click / cursor ───────────────────────────────────────────────
window.addEventListener('mousedown', (e) => { mouseDownX = e.clientX; mouseDownY = e.clientY; });

window.addEventListener('click', (e) => {
  if (!isReady || overlay.classList.contains('is-open')) return;
  // ignore drags
  if (Math.hypot(e.clientX - mouseDownX, e.clientY - mouseDownY) > 6) return;

  mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, app._camera.instance);
  const items  = app._gallery._items;
  const hits   = raycaster.intersectObjects(items.map(i => i.mesh), false);

  if (hits.length > 0) {
    const item = items.find(i => i.mesh === hits[0].object);
    // open if the card is actually visible (scale threshold = in focus zone)
    if (item && item._inFocus) openProject(item._texIdx);
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isReady || overlay.classList.contains('is-open')) return;

  mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, app._camera.instance);
  const items = app._gallery._items;
  const hits  = raycaster.intersectObjects(items.map(i => i.mesh), false);

  const hit = hits.length > 0 && items.find(i => i.mesh === hits[0].object);
  cursorEl.classList.toggle('is-pointer', !!(hit && hit._inFocus));
});

window.addEventListener('beforeunload', () => app.destroy());
