import { FIGURES } from './figures.js';
import { CATEGORIES, ITEMS, ITEMS_BY_ID, SLOTS } from './items.js';
import { sceneSVG, thumbHTML, scenePNG, backdropSVG } from './scene.js';
import * as sound from './sound.js';
import * as store from './storage.js';
import { initTimer } from './timer.js';

const $ = (sel) => document.querySelector(sel);
const MAX_LOOKS = 100;
const LONG_PRESS_MS = 700;

const state = {
  fig: null,
  cat: CATEGORIES[0].id,
  outfits: store.load('outfits', {}),
  gallery: store.load('gallery', []),
  openLook: null,
  galleryBack: 'start',
};

const screens = {
  start: $('#screen-start'),
  dress: $('#screen-dress'),
  gallery: $('#screen-gallery'),
  show: $('#screen-show'),
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

// Wartet auf das Ende einer Animation, spätestens nach der geplanten Dauer
// (falls der Browser im Hintergrund keine Frames zeichnet).
const played = (anim, ms) => Promise.race([anim.finished, new Promise((r) => setTimeout(r, ms + 150))]);

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
  updateBadges();
}

function updateBadges() {
  for (const badge of document.querySelectorAll('.gallery-count')) {
    badge.textContent = state.gallery.length;
    badge.hidden = state.gallery.length === 0;
  }
}

function openGallery(from) {
  state.galleryBack = from;
  renderGallery();
  show('gallery');
}

$('#figure-choice').addEventListener('click', (e) => {
  const btn = e.target.closest('.fig-btn');
  if (!btn) return;
  sound.tap();
  openDress(btn.dataset.fig);
});

$('#btn-gallery').addEventListener('click', () => {
  sound.tap();
  openGallery('start');
});

// --- Anziehraum ------------------------------------------------------------

function openDress(fig) {
  state.fig = fig;
  renderTabs();
  renderTray();
  renderStage();
  updateBadges();
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
  sound.shutter();
  replay($('#flash'), 'go');
  replay($('#btn-photo'), 'bounce');
  // Gleichen Look nicht doppelt speichern
  const last = state.gallery[0];
  if (last && last.fig === state.fig && JSON.stringify(last.outfit) === JSON.stringify(outfit())) {
    replay($('#btn-dress-gallery'), 'bounce');
    return;
  }
  state.gallery.unshift({ id: Date.now(), fig: state.fig, outfit: { ...outfit() } });
  state.gallery.length = Math.min(state.gallery.length, MAX_LOOKS);
  saveGallery();
  flyToGallery();
});

// Das Foto fliegt sichtbar in den Galerie-Knopf.
function flyToGallery() {
  const target = $('#btn-dress-gallery');
  const from = $('#stage').getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const w = Math.min(from.width * 0.6, (from.height * 0.7 * 400) / 520);
  const h = (w * 520) / 400;
  const card = document.createElement('div');
  card.className = 'fly-card';
  card.innerHTML = sceneSVG(state.fig, outfit(), { bg: true });
  Object.assign(card.style, {
    width: `${w}px`,
    height: `${h}px`,
    left: `${from.left + from.width / 2 - w / 2}px`,
    top: `${from.top + from.height / 2 - h / 2}px`,
  });
  document.body.append(card);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const anim = card.animate(
    [
      { transform: 'scale(0.6) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1) rotate(-4deg)', opacity: 1, offset: 0.25 },
      { transform: 'scale(1) rotate(-4deg)', opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.1) rotate(10deg)`, opacity: 0.6 },
    ],
    { duration: 1100, easing: 'cubic-bezier(.45,0,.55,1)' }
  );
  played(anim, 1100).then(() => {
    card.remove();
    updateBadges();
    replay(target, 'bounce');
    sound.wear();
  });
}

$('#btn-dress-gallery').addEventListener('click', () => {
  sound.tap();
  openGallery('dress');
});

// --- Galerie ---------------------------------------------------------------

function renderGallery() {
  const grid = $('#gallery-grid');
  grid.innerHTML = state.gallery
    .map((look) => `<button class="look" data-id="${look.id}">${sceneSVG(look.fig, look.outfit, { bg: true })}</button>`)
    .join('');
  $('#gallery-empty').hidden = state.gallery.length > 0;
  $('#btn-show').hidden = state.gallery.length === 0;
}

const findLook = (id) => state.gallery.find((l) => String(l.id) === String(id));

$('#btn-gallery-home').addEventListener('click', () => {
  sound.tap();
  if (state.galleryBack === 'dress' && state.fig) {
    openDress(state.fig);
  } else {
    renderStart();
    show('start');
  }
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

// --- Modenschau --------------------------------------------------------------
// Alle gespeicherten Looks laufen nacheinander über den Laufsteg.
// Antippen = nächster Look, 🏠 = zurück zur Galerie.

let showToken = 0;
let skipWait = null;
const runway = $('#runway');

const WALK_IN = [
  { transform: 'translateX(110%)' },
  { transform: 'translateX(82%) translateY(-14px)' },
  { transform: 'translateX(55%)' },
  { transform: 'translateX(27%) translateY(-14px)' },
  { transform: 'translateX(0)' },
];
const WALK_OUT = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-27%) translateY(-14px)' },
  { transform: 'translateX(-55%)' },
  { transform: 'translateX(-82%) translateY(-14px)' },
  { transform: 'translateX(-110%)' },
];

function waitOrTap(ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      skipWait = null;
      resolve();
    }
    skipWait = done;
  });
}

function confetti() {
  const colors = ['#FF6FA8', '#FFD54F', '#4FC3F7', '#81C784', '#BA68C8', '#FF8A65'];
  const height = runway.clientHeight;
  for (let i = 0; i < 44; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.background = colors[i % colors.length];
    piece.style.left = `${Math.random() * 100}%`;
    runway.append(piece);
    const drift = (Math.random() - 0.5) * 160;
    const duration = 1800 + Math.random() * 1400;
    const delay = Math.random() * 400;
    const anim = piece.animate(
      [
        { transform: 'translate(0, -30px) rotate(0deg)' },
        { transform: `translate(${drift}px, ${height + 40}px) rotate(${Math.random() * 900}deg)` },
      ],
      { duration, delay, easing: 'cubic-bezier(.2,.5,.4,1)', fill: 'both' }
    );
    played(anim, duration + delay).then(() => piece.remove());
  }
}

async function presentLook(look, token) {
  const el = document.createElement('div');
  el.className = 'runway-look';
  el.innerHTML = sceneSVG(look.fig, look.outfit, { live: true });
  runway.append(el);
  await played(el.animate(WALK_IN, { duration: 1500, easing: 'ease-out', fill: 'both' }), 1500);
  if (token !== showToken) return;
  sound.fanfare();
  confetti();
  el.firstElementChild.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.08) translateY(-10px)' }, { transform: 'scale(1)' }],
    { duration: 600, easing: 'ease-out' }
  );
  await waitOrTap(3200);
  if (token !== showToken) return;
  await played(el.animate(WALK_OUT, { duration: 1100, easing: 'ease-in', fill: 'both' }), 1100);
  el.remove();
}

async function startShow() {
  if (state.gallery.length === 0) return;
  const token = ++showToken;
  runway.innerHTML = `<div class="runway-backdrop">${backdropSVG()}</div>`;
  show('show');
  const looks = [...state.gallery].reverse(); // älteste zuerst
  for (let i = 0; token === showToken; i++) {
    await presentLook(looks[i % looks.length], token);
  }
}

function stopShow() {
  showToken++;
  skipWait?.();
  runway.innerHTML = '';
}

$('#btn-show').addEventListener('click', () => {
  sound.tap();
  startShow();
});

runway.addEventListener('click', () => skipWait?.());

$('#btn-show-home').addEventListener('click', () => {
  sound.tap();
  stopShow();
  renderGallery();
  show('gallery');
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
  updateBadges();
  dialog.close();
});

$('#btn-cancel').addEventListener('click', () => dialog.close());

// --- Start -----------------------------------------------------------------

renderStart();
show('start');
initTimer({
  // Läuft gerade die Modenschau, wird sie beim Sperren beendet.
  onLock: () => {
    if (screens.show.hidden) return;
    stopShow();
    renderGallery();
    show('gallery');
  },
});

if ('serviceWorker' in navigator) {
  // Kommt eine neue Version an, einmal neu laden, damit nicht alte und neue Dateien gemischt werden.
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
