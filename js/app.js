import { FIGURES } from './figures.js';
import { CATEGORIES, ITEMS, ITEMS_BY_ID, SLOTS } from './items.js';
import { sceneSVG, thumbHTML, scenePNG } from './scene.js';
import * as sound from './sound.js';
import * as store from './storage.js';

const $ = (sel) => document.querySelector(sel);
const MAX_LOOKS = 60;
const LONG_PRESS_MS = 700;

const state = {
  fig: null,
  cat: CATEGORIES[0].id,
  outfits: store.load('outfits', {}),
  gallery: store.load('gallery', []),
  openLook: null,
};

const screens = {
  start: $('#screen-start'),
  dress: $('#screen-dress'),
  gallery: $('#screen-gallery'),
};

function show(name) {
  for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
}

const outfit = () => (state.outfits[state.fig] ??= {});
const saveOutfits = () => store.save('outfits', state.outfits);
const saveGallery = () => store.save('gallery', state.gallery);

function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // Animation neu starten
  el.classList.add(cls);
}

// --- Startbildschirm -------------------------------------------------------

function renderStart() {
  $('#figure-choice').innerHTML = Object.entries(FIGURES)
    .map(
      ([id, fig]) =>
        `<button class="fig-btn" data-fig="${id}" aria-label="${fig.name}">` +
        sceneSVG(id, state.outfits[id] ?? {}, { bg: true }) +
        `</button>`
    )
    .join('');
  const badge = $('#gallery-count');
  badge.textContent = state.gallery.length;
  badge.hidden = state.gallery.length === 0;
}

$('#figure-choice').addEventListener('click', (e) => {
  const btn = e.target.closest('.fig-btn');
  if (!btn) return;
  sound.tap();
  openDress(btn.dataset.fig);
});

$('#btn-gallery').addEventListener('click', () => {
  sound.tap();
  renderGallery();
  show('gallery');
});

// --- Anziehraum ------------------------------------------------------------

function openDress(fig) {
  state.fig = fig;
  renderTabs();
  renderTray();
  renderStage();
  show('dress');
}

function renderStage(pop = null) {
  $('#stage').innerHTML = sceneSVG(state.fig, outfit(), { bg: true, pop, live: true });
}

function renderTabs() {
  $('#tabs').innerHTML = CATEGORIES.map(
    (c) =>
      `<button class="tab${c.id === state.cat ? ' active' : ''}" data-cat="${c.id}" aria-label="${c.label}">` +
      `<img src="${c.icon}" alt="" draggable="false"></button>`
  ).join('');
}

function renderTray() {
  const o = outfit();
  $('#tray').innerHTML = ITEMS.filter((i) => i.cat === state.cat)
    .map(
      (i) =>
        `<button class="tile${o[i.slot] === i.id ? ' worn' : ''}" data-id="${i.id}" aria-label="${i.id}">` +
        thumbHTML(i) +
        `</button>`
    )
    .join('');
  $('#tray').scrollLeft = 0;
}

function toggleItem(id) {
  const item = ITEMS_BY_ID[id];
  const o = outfit();
  if (o[item.slot] === id) {
    delete o[item.slot];
    sound.takeOff();
    renderStage();
  } else {
    o[item.slot] = id;
    sound.wear();
    renderStage(item.slot);
  }
  saveOutfits();
  renderTray();
}

$('#tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab || tab.dataset.cat === state.cat) return;
  sound.tap();
  state.cat = tab.dataset.cat;
  renderTabs();
  renderTray();
});

$('#tray').addEventListener('click', (e) => {
  const tile = e.target.closest('.tile');
  if (tile) toggleItem(tile.dataset.id);
});

// Auf ein Teil an der Figur tippen = ausziehen
$('#stage').addEventListener('click', (e) => {
  const el = e.target.closest('.item');
  if (!el) return;
  delete outfit()[el.dataset.slot];
  sound.takeOff();
  saveOutfits();
  renderStage();
  renderTray();
});

$('#btn-home').addEventListener('click', () => {
  sound.tap();
  renderStart();
  show('start');
});

$('#btn-random').addEventListener('click', () => {
  const o = {};
  for (const slot of SLOTS) {
    if (Math.random() < 0.6) {
      const choices = ITEMS.filter((i) => i.slot === slot);
      o[slot] = choices[Math.floor(Math.random() * choices.length)].id;
    }
  }
  state.outfits[state.fig] = o;
  sound.dice();
  saveOutfits();
  renderStage();
  renderTray();
  replay($('#stage svg'), 'wiggle');
});

$('#btn-reset').addEventListener('click', () => {
  if (Object.keys(outfit()).length === 0) return;
  state.outfits[state.fig] = {};
  sound.sweep();
  saveOutfits();
  renderStage();
  renderTray();
});

$('#btn-photo').addEventListener('click', () => {
  state.gallery.unshift({ id: Date.now(), fig: state.fig, outfit: { ...outfit() } });
  state.gallery.length = Math.min(state.gallery.length, MAX_LOOKS);
  saveGallery();
  sound.shutter();
  replay($('#flash'), 'go');
  replay($('#btn-photo'), 'bounce');
});

// --- Galerie ---------------------------------------------------------------

function renderGallery() {
  const grid = $('#gallery-grid');
  grid.innerHTML = state.gallery
    .map((look) => `<button class="look" data-id="${look.id}">${sceneSVG(look.fig, look.outfit, { bg: true })}</button>`)
    .join('');
  $('#gallery-empty').hidden = state.gallery.length > 0;
}

const findLook = (id) => state.gallery.find((l) => String(l.id) === String(id));

$('#btn-gallery-home').addEventListener('click', () => {
  sound.tap();
  renderStart();
  show('start');
});

// Kurz tippen = Look in den Anziehraum laden.
// Lange drücken = Elternmenü (Herunterladen, Teilen, Löschen).
let pressTimer = null;
let longPressed = false;

$('#gallery-grid').addEventListener('pointerdown', (e) => {
  const tile = e.target.closest('.look');
  if (!tile) return;
  longPressed = false;
  clearTimeout(pressTimer);
  pressTimer = setTimeout(() => {
    longPressed = true;
    openLookDialog(findLook(tile.dataset.id));
  }, LONG_PRESS_MS);
});
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) {
  $('#gallery-grid').addEventListener(ev, () => clearTimeout(pressTimer));
}
$('#gallery-grid').addEventListener('contextmenu', (e) => e.preventDefault());

$('#gallery-grid').addEventListener('click', (e) => {
  const tile = e.target.closest('.look');
  if (!tile || longPressed) return;
  const look = findLook(tile.dataset.id);
  if (!look) return;
  state.outfits[look.fig] = { ...look.outfit };
  saveOutfits();
  sound.wear();
  openDress(look.fig);
});

// --- Elternmenü ------------------------------------------------------------

const dialog = $('#look-dialog');

function openLookDialog(look) {
  if (!look) return;
  state.openLook = look;
  $('#dialog-preview').innerHTML = sceneSVG(look.fig, look.outfit, { bg: true });
  $('#btn-share').hidden = !navigator.canShare;
  dialog.showModal();
}

function lookFileName(look) {
  return `anziehspass-${new Date(look.id).toISOString().slice(0, 10)}-${look.id % 10000}.png`;
}

$('#btn-download').addEventListener('click', async () => {
  const look = state.openLook;
  const blob = await scenePNG(look.fig, look.outfit);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = lookFileName(look);
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  dialog.close();
});

$('#btn-share').addEventListener('click', async () => {
  const look = state.openLook;
  const blob = await scenePNG(look.fig, look.outfit);
  const file = new File([blob], lookFileName(look), { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch {
      /* abgebrochen */
    }
  }
  dialog.close();
});

$('#btn-delete').addEventListener('click', () => {
  state.gallery = state.gallery.filter((l) => l !== state.openLook);
  saveGallery();
  renderGallery();
  dialog.close();
});

$('#btn-cancel').addEventListener('click', () => dialog.close());

// --- Start -----------------------------------------------------------------

renderStart();
show('start');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
