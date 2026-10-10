// Minispiele mit der eigenen Figur, für Kinder ab ca. 4 Jahren:
// Aufgaben per Stimme und Bild, nur Antippen, kein «Verlieren».
//
//  - Wetter:     Figur passend zum Wetter anziehen (Regen, Sonne, Schnee, ...)
//  - Memory:     Paare finden, jedes Paar wird angezogen
//  - Zählen:     «Gib dem Elefanten 3 Ballons!»
//  - Was fehlt?: Ein Teil verschwindet, welches war es?

import { FIGURES } from './figures.js';
import { ITEMS, ITEMS_BY_ID, SLOTS, emojiSrc } from './items.js';
import { sceneSVG, thumbHTML } from './scene.js';
import * as sound from './sound.js';
import { say } from './speech.js';
import { confetti, played, sleep } from './fx.js';

const $ = (sel) => document.querySelector(sel);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const emojiImg = (cp, cls = '') => `<img class="${cls}" src="${emojiSrc(cp)}" alt="" draggable="false">`;

const PRAISE = ['Super!', 'Toll gemacht!', 'Genau!', 'Juhu!', 'Prima!', 'Sehr gut!'];
const NUMBERS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];

// --- Gemeinsamer Spielrahmen ---------------------------------------------------------

let ctx = null; // { show, getFig, getOutfit, onExit }
let session = 0; // jede neue Runde erhöht den Zähler, alte Abläufe brechen dann ab
let current = null; // laufendes Spiel
let fig = null;
let outfit = {};
let lastPrompt = '';
let onTray = null;
const level = { weather: 0, memory: 0, count: 0, missing: 0 };

const alive = (s) => s === session;
const stage = () => $('#game-stage');
const overlay = () => $('#game-overlay');
const tray = () => $('#game-tray');
const fill = (text) => text.replaceAll('{nom}', FIGURES[fig].nom).replaceAll('{dat}', FIGURES[fig].dat);

function prompt(text) {
  lastPrompt = text;
  say(text);
}

function renderScene(pop = null) {
  $('#game-scene').innerHTML = sceneSVG(fig, outfit, { bg: true, live: true, pop });
}

function wear(id) {
  const item = ITEMS_BY_ID[id];
  outfit[item.slot] = id;
  renderScene(item.slot);
}

function stars(total, done) {
  $('#game-stars').innerHTML = Array.from({ length: total }, (_, i) =>
    emojiImg('2b50', i < done ? 'on' : '')
  ).join('');
}

function setSky(top, bottom) {
  stage().style.background = top ? `linear-gradient(${top}, ${bottom})` : '';
}

function nope(el) {
  el.classList.remove('nope');
  void el.offsetWidth;
  el.classList.add('nope');
  sound.takeOff();
}

function tileHTML(id) {
  return `<button class="tile" data-id="${id}">${thumbHTML(ITEMS_BY_ID[id])}</button>`;
}

function resetBoard() {
  onTray = null;
  overlay().innerHTML = '';
  tray().innerHTML = '';
  tray().className = '';
  setSky(null);
  $('#game-win').hidden = true;
}

async function start(game) {
  const s = ++session;
  current = game;
  fig = ctx.getFig();
  resetBoard();
  $('#screen-game').dataset.game = game;
  ctx.show('game');
  await GAMES[game](s);
}

function stop() {
  session++;
  onTray = null;
  try {
    speechSynthesis.cancel();
  } catch {
    /* egal */
  }
}

function win(s) {
  if (!alive(s)) return;
  onTray = null;
  $('#win-figure').innerHTML = sceneSVG(fig, outfit, { bg: true });
  $('#game-win').hidden = false;
  sound.fanfare();
  confetti($('#game-win'));
  say(pick(['Super gemacht! Du hast es geschafft!', 'Juhu, geschafft!', 'Toll! Alles richtig!']));
}

// Gelöste Aufgabe: kleines Fest, dann weiter
async function solved(s, text) {
  sound.fanfare();
  say(text);
  confetti(stage(), 24);
  await sleep(2200);
  return alive(s);
}

// --- Wetter-Anziehspiel -------------------------------------------------------------

const WEATHER = [
  {
    icon: '1f327', particle: '1f4a7', sky: ['#90A4AE', '#CFD8DC'],
    say: 'Es regnet! Was braucht {nom} im Regen?',
    no: 'Hmm, brauchen wir das im Regen?',
    done: 'Jetzt bleibt {nom} schön trocken.',
    correct: ['raincoat', 'wellies', 'umbrella'],
    alsoOk: ['boots', 'beanie', 'cap'],
  },
  {
    icon: '2600', sky: ['#4FC3F7', '#FFF59D'],
    say: 'Die Sonne scheint! Was braucht {nom} in der Sonne?',
    no: 'Hmm, brauchen wir das in der Sonne?',
    done: 'Jetzt ist {nom} bereit für den Sonnentag.',
    correct: ['sunhat', 'sunglasses', 'icecream'],
    alsoOk: ['cap', 'flippers', 'goggles', 'bucket', 'ball', 'lollipop', 'balloon', 'kite'],
  },
  {
    icon: '2744', particle: '2744', sky: ['#B3E5FC', '#ECEFF1'],
    say: 'Es schneit! Was braucht {nom}, damit ihm schön warm ist?',
    no: 'Hmm, wird es damit warm?',
    done: 'Jetzt hat {nom} schön warm.',
    correct: ['beanie', 'scarf', 'boots'],
    alsoOk: ['wellies', 'raincoat', 'nightcap', 'firejacket'],
  },
  {
    icon: '1f319', sky: ['#1A237E', '#5C6BC0'],
    say: 'Es ist Schlafenszeit! Was braucht {nom} zum Schlafen?',
    no: 'Hmm, brauchen wir das im Bett?',
    done: 'Gute Nacht! Jetzt kann {nom} schlafen.',
    correct: ['pyjama', 'nightcap', 'teddy'],
    alsoOk: ['plushbunny'],
  },
  {
    icon: '1f30a', sky: ['#4FC3F7', '#B2EBF2'],
    say: 'Wir gehen ans Meer! Was braucht {nom} zum Schwimmen?',
    no: 'Hmm, brauchen wir das beim Schwimmen?',
    done: 'Jetzt kann {nom} schwimmen gehen.',
    correct: ['flippers', 'goggles', 'bucket'],
    alsoOk: ['sunhat', 'sunglasses', 'icecream', 'cap', 'ball'],
  },
  {
    icon: '1f389', sky: ['#F8BBD0', '#FFF9C4'],
    say: 'Heute ist ein Fest! Was braucht {nom} für die Party?',
    no: 'Hmm, ist das etwas für die Party?',
    done: 'Jetzt kann die Party losgehen!',
    correct: ['partyhat', 'balloon', 'bowtie'],
    alsoOk: ['crown', 'princess', 'tutu', 'lollipop', 'icecream', 'dress', 'flowerdress', 'wand', 'starglasses', 'heartglasses'],
  },
];

function weatherBackdrop(sc) {
  let html = emojiImg(sc.icon, 'weather-icon');
  if (sc.particle) {
    for (let i = 0; i < 16; i++) {
      const style = `left:${Math.random() * 100}%;animation-delay:${(-Math.random() * 3).toFixed(2)}s;animation-duration:${(2 + Math.random() * 2).toFixed(2)}s`;
      html += `<img class="particle" style="${style}" src="${emojiSrc(sc.particle)}" alt="" draggable="false">`;
    }
  }
  overlay().innerHTML = html;
}

function weatherTask(s, sc) {
  return new Promise((resolve) => {
    outfit = {};
    setSky(...sc.sky);
    weatherBackdrop(sc);
    renderScene();
    const ok = new Set([...sc.correct, ...sc.alsoOk]);
    const pool = [...new Set(WEATHER.flatMap((w) => w.correct))].filter((id) => !ok.has(id));
    const options = shuffle([...sc.correct, ...shuffle(pool).slice(0, 3)]);
    tray().innerHTML = options.map(tileHTML).join('');
    prompt(fill(sc.say));
    const found = new Set();
    onTray = async (el) => {
      const id = el.dataset.id;
      if (found.has(id)) return;
      if (!sc.correct.includes(id)) {
        nope(el);
        say(sc.no);
        return;
      }
      found.add(id);
      el.classList.add('done');
      wear(id);
      sound.wear();
      if (found.size < sc.correct.length) {
        say(pick(PRAISE));
        return;
      }
      onTray = null;
      if (await solved(s, `${pick(PRAISE)} ${fill(sc.done)}`)) resolve();
    };
  });
}

async function playWeather(s) {
  const rounds = 3 + Math.min(level.weather, 3);
  const scenarios = shuffle(WEATHER).slice(0, rounds);
  stars(scenarios.length, 0);
  for (let i = 0; i < scenarios.length; i++) {
    await weatherTask(s, scenarios[i]);
    if (!alive(s)) return;
    stars(scenarios.length, i + 1);
  }
  win(s);
}

// --- Memory ---------------------------------------------------------------------------

async function playMemory(s) {
  const pairs = [3, 4, 5, 6][Math.min(level.memory, 3)];
  outfit = {};
  renderScene();
  // Jedes Paar aus einem anderen Slot, damit am Ende alles gleichzeitig getragen wird
  const items = shuffle(SLOTS)
    .slice(0, pairs)
    .map((slot) => pick(ITEMS.filter((i) => i.slot === slot)).id);
  const cards = shuffle([...items, ...items]);
  tray().className = `memory cols-${pairs === 6 ? 4 : pairs}`;
  tray().innerHTML = cards
    .map(
      (id, i) =>
        `<button class="card" data-id="${id}" data-i="${i}"><span class="face back">${emojiImg('2b50')}</span>` +
        `<span class="face front">${thumbHTML(ITEMS_BY_ID[id])}</span></button>`
    )
    .join('');
  stars(pairs, 0);
  prompt('Finde zwei gleiche Bilder!');

  let first = null;
  let busy = false;
  let found = 0;
  await new Promise((resolve) => {
    onTray = async (el) => {
      if (busy || el.classList.contains('open')) return;
      el.classList.add('open');
      sound.tap();
      if (!first) {
        first = el;
        return;
      }
      const second = el;
      busy = true;
      if (first.dataset.id === second.dataset.id) {
        first.classList.add('done');
        second.classList.add('done');
        found++;
        stars(pairs, found);
        wear(second.dataset.id);
        sound.wear();
        say(pick(PRAISE));
        first = null;
        busy = false;
        if (found === pairs) {
          onTray = null;
          await sleep(900);
          resolve();
        }
      } else {
        await sleep(1100);
        if (!alive(s)) return;
        first.classList.remove('open');
        second.classList.remove('open');
        first = null;
        busy = false;
      }
    };
  });
  win(s);
}

// --- Zählspiel ---------------------------------------------------------------------------

const COUNTABLES = [
  { cp: '1f388', one: 'einen Ballon', oneNom: 'Ein Ballon', many: 'Ballons' },
  { cp: '1f338', one: 'eine Blume', oneNom: 'Eine Blume', many: 'Blumen' },
  { cp: '2b50', one: 'einen Stern', oneNom: 'Ein Stern', many: 'Sterne' },
  { cp: '1f34e', one: 'einen Apfel', oneNom: 'Ein Apfel', many: 'Äpfel' },
  { cp: '1f9b4', one: 'einen Knochen', oneNom: 'Ein Knochen', many: 'Knochen' },
  { cp: '1f955', one: 'eine Karotte', oneNom: 'Eine Karotte', many: 'Karotten' },
];

function flyTo(fromEl, toEl, cp) {
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();
  const img = document.createElement('img');
  img.src = emojiSrc(cp);
  img.className = 'flyer';
  Object.assign(img.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
  document.body.append(img);
  const anim = img.animate(
    [
      { transform: 'translate(0, 0) scale(1)' },
      {
        transform: `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(${b.width / a.width})`,
      },
    ],
    { duration: 450, easing: 'ease-in-out', fill: 'both' }
  );
  return played(anim, 450).then(() => img.remove());
}

function countTask(s, n, obj) {
  return new Promise((resolve) => {
    overlay().innerHTML =
      `<div class="count-bubble"><span class="count-number">${n}</span>` +
      `<span class="count-slots">${Array.from({ length: n }, () => `<span class="slot">${emojiImg(obj.cp)}</span>`).join('')}</span></div>`;
    const total = Math.min(Math.max(n + 3, 6), 12);
    tray().className = 'count';
    tray().innerHTML = Array.from({ length: total }, () => `<button class="obj">${emojiImg(obj.cp)}</button>`).join('');
    prompt(`Gib ${FIGURES[fig].dat} ${n === 1 ? obj.one : `${n} ${obj.many}`}!`);
    let filled = 0;
    onTray = async (el) => {
      if (filled >= n || el.classList.contains('used')) return;
      const slot = overlay().querySelectorAll('.slot')[filled];
      filled++;
      el.classList.add('used');
      sound.note(380 + filled * 70);
      say(NUMBERS[filled]);
      await flyTo(el, slot, obj.cp);
      slot.classList.add('on');
      if (filled < n) return;
      onTray = null;
      await sleep(500);
      const word = n === 1 ? obj.oneNom : `${NUMBERS[n][0].toUpperCase()}${NUMBERS[n].slice(1)} ${obj.many}`;
      if (await solved(s, `${pick(PRAISE)} ${word}!`)) resolve();
    };
  });
}

async function playCount(s) {
  const max = [5, 7, 10][Math.min(level.count, 2)];
  outfit = { ...ctx.getOutfit() };
  renderScene();
  const tasks = 5;
  stars(tasks, 0);
  let prev = 0;
  for (let i = 0; i < tasks; i++) {
    let n;
    do n = 1 + Math.floor(Math.random() * max);
    while (n === prev);
    prev = n;
    await countTask(s, n, pick(COUNTABLES));
    if (!alive(s)) return;
    stars(tasks, i + 1);
  }
  overlay().innerHTML = '';
  win(s);
}

// --- Was fehlt? ---------------------------------------------------------------------------

async function missingTask(s, k) {
  const slots = shuffle(SLOTS).slice(0, k);
  outfit = Object.fromEntries(slots.map((slot) => [slot, pick(ITEMS.filter((i) => i.slot === slot)).id]));
  tray().innerHTML = '';
  overlay().innerHTML = '';
  renderScene();
  prompt(`Schau gut hin! Was hat ${FIGURES[fig].nom} an?`);
  await sleep(3500 + k * 700);
  if (!alive(s)) return false;

  // Vorhang zu, ein Teil verschwindet, Vorhang auf
  overlay().innerHTML = '<div class="curtain"><i></i><i></i></div>';
  await sleep(50);
  overlay().firstElementChild.classList.add('closed');
  say('Augen zu!');
  await sleep(1400);
  if (!alive(s)) return false;
  const missSlot = pick(slots);
  const missing = outfit[missSlot];
  delete outfit[missSlot];
  renderScene();
  overlay().firstElementChild.classList.remove('closed');
  await sleep(700);
  if (!alive(s)) return false;
  overlay().innerHTML = '';

  // Auf der ersten Stufe kommen die falschen Antworten aus anderen Kategorien (leichter),
  // später darf auch ein ähnliches Teil dabei sein (z.B. ein anderes Kleid).
  const worn = new Set(Object.values(outfit));
  const usedSlots = new Set([missSlot]);
  const others = shuffle(ITEMS.filter((i) => !worn.has(i.id) && i.id !== missing))
    .filter((i) => level.missing > 0 || (!usedSlots.has(i.slot) && usedSlots.add(i.slot)))
    .slice(0, k >= 4 ? 3 : 2);
  tray().innerHTML = shuffle([missing, ...others.map((i) => i.id)]).map(tileHTML).join('');
  prompt('Was fehlt?');
  return new Promise((resolve) => {
    onTray = async (el) => {
      if (el.dataset.id !== missing) {
        nope(el);
        say('Hmm, das war es nicht. Schau nochmal!');
        return;
      }
      onTray = null;
      el.classList.add('done');
      wear(missing);
      resolve(await solved(s, `${pick(PRAISE)} Das hat gefehlt!`));
    };
  });
}

async function playMissing(s) {
  const k = [3, 4, 5][Math.min(level.missing, 2)];
  const tasks = 4;
  stars(tasks, 0);
  for (let i = 0; i < tasks; i++) {
    if (!(await missingTask(s, k))) return;
    stars(tasks, i + 1);
  }
  win(s);
}

const GAMES = { weather: playWeather, memory: playMemory, count: playCount, missing: playMissing };

// --- Menü und Steuerung ----------------------------------------------------------------

function openMenu() {
  stop();
  fig = ctx.getFig();
  $('#games-figure').innerHTML = sceneSVG(fig, ctx.getOutfit(), { bg: true, live: true });
  ctx.show('games');
}

export function initGames(options) {
  ctx = options;

  $('#games-grid').addEventListener('click', (e) => {
    const tile = e.target.closest('[data-game]');
    if (!tile) return;
    sound.tap();
    start(tile.dataset.game);
  });

  $('#btn-games-home').addEventListener('click', () => {
    sound.tap();
    stop();
    ctx.onExit();
  });

  $('#btn-game-back').addEventListener('click', () => {
    sound.tap();
    openMenu();
  });

  $('#btn-game-say').addEventListener('click', () => lastPrompt && say(lastPrompt));

  $('#game-tray').addEventListener('click', (e) => {
    const el = e.target.closest('button');
    if (el && onTray) onTray(el);
  });

  $('#btn-win-again').addEventListener('click', () => {
    sound.tap();
    level[current] = Math.min(level[current] + 1, 3);
    start(current);
  });

  $('#btn-win-menu').addEventListener('click', () => {
    sound.tap();
    openMenu();
  });

  return { openMenu, stop };
}
