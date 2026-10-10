// Spielzeit-Timer mit Erinnerungen und Sperrbildschirm, geschützt durch eine Eltern-PIN.
//
// - Die PIN legen die Eltern beim ersten Öffnen des Elternbereichs selbst fest.
//   Gespeichert wird nur ein SHA-256-Hash, nie die PIN selbst.
// - Die Zeit läuft nach der Uhr (Endzeitpunkt), also auch weiter, wenn die App geschlossen ist.
// - Ist die Zeit um, bleibt die App gesperrt, auch nach einem Neustart, bis die PIN eingegeben wird.

import * as sound from './sound.js';
import * as store from './storage.js';
import {
  say,
  supported as speechSupported,
  germanVoices,
  currentVoiceUri,
  currentRate,
  setVoice,
  setRate,
  onVoicesChanged,
  onSpeechStatus,
  speechStatus,
} from './speech.js';

const $ = (sel) => document.querySelector(sel);
const REMINDERS = [15, 10, 5, 1]; // Minuten vor Ende
const DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90];
const PIN_LENGTH = 4;
const MAX_TRIES = 3;
const BLOCK_MS = 30_000;
const MIN = 60_000;

let timer = store.load('timer', null); // { end, total, fired: [] }
let locked = store.load('locked', false);
let onLockCallback = () => {};
let reminderTimeout = null;

// --- Hilfsfunktionen -------------------------------------------------------------

async function hash(pin) {
  const data = new TextEncoder().encode('anziehspass:' + pin);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const remaining = () => (timer ? timer.end - Date.now() : 0);

function saveTimer() {
  store.save('timer', timer);
}

function clock(ts) {
  return new Date(ts).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}

// Tortendiagramm: wie viel Zeit noch übrig ist (für Kinder ohne Uhrzeit-Kenntnisse).
function pieSVG(fraction, minutes) {
  const f = Math.max(0, Math.min(1, fraction));
  const color = minutes <= 5 ? '#EF5350' : minutes <= 10 ? '#FFB300' : '#66BB6A';
  const a = 2 * Math.PI * f;
  const x = 60 + 50 * Math.sin(a);
  const y = 60 - 50 * Math.cos(a);
  const slice =
    f >= 0.999
      ? `<circle cx="60" cy="60" r="50" fill="${color}"/>`
      : `<path d="M60 60 L60 10 A50 50 0 ${f > 0.5 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)} Z" fill="${color}"/>`;
  return (
    `<svg viewBox="0 0 120 120" aria-hidden="true">` +
    `<circle cx="60" cy="60" r="56" fill="#fff"/>` +
    `<circle cx="60" cy="60" r="50" fill="#E3F2FD"/>` +
    slice +
    `<circle cx="60" cy="60" r="56" fill="none" stroke="#5C6BC0" stroke-width="6"/>` +
    `<circle cx="60" cy="60" r="26" fill="#fff"/>` +
    `<text x="60" y="71" text-anchor="middle" font-size="30" font-weight="800" fill="#3a2d4a">${minutes}</text>` +
    `</svg>`
  );
}

// --- Fortschrittsbalken oben --------------------------------------------------------

function updateBar() {
  const bar = $('#timer-bar');
  if (!timer || locked) {
    bar.hidden = true;
    return;
  }
  const left = remaining();
  const m = left / MIN;
  bar.hidden = false;
  const fill = bar.firstElementChild;
  fill.style.width = `${Math.max(0, (left / timer.total) * 100)}%`;
  fill.style.background = m <= 5 ? '#EF5350' : m <= 10 ? '#FFB300' : '#66BB6A';
}

// --- Erinnerung --------------------------------------------------------------------

function showReminder(minutes) {
  const box = $('#reminder');
  $('#reminder-pie').innerHTML = pieSVG(remaining() / timer.total, minutes);
  box.hidden = false;
  sound.chime();
  say(minutes === 1 ? 'Noch eine Minute, dann ist Schluss für heute.' : `Noch ${minutes} Minuten, dann ist Schluss für heute.`);
  clearTimeout(reminderTimeout);
  reminderTimeout = setTimeout(hideReminder, 7000);
}

function hideReminder() {
  clearTimeout(reminderTimeout);
  $('#reminder').hidden = true;
}

// --- Sperre ------------------------------------------------------------------------

function lock() {
  locked = true;
  timer = null;
  store.save('locked', true);
  saveTimer();
  hideReminder();
  for (const d of document.querySelectorAll('dialog[open]')) d.close();
  closeParent();
  onLockCallback();
  $('#lock').hidden = false;
  updateBar();
  sound.lullaby();
  say('Die Spielzeit ist vorbei. Tschüss, bis zum nächsten Mal!');
}

function unlock() {
  locked = false;
  store.save('locked', false);
  $('#lock').hidden = true;
  updateBar();
}

function tick() {
  if (locked || !timer) return;
  const left = remaining();
  if (left <= 0) {
    lock();
    return;
  }
  // Erinnerungen: nur die kleinste überschrittene Schwelle zeigen (z.B. nach einem Neustart)
  const crossed = REMINDERS.filter((m) => left <= m * MIN && !timer.fired.includes(m));
  if (crossed.length) {
    timer.fired.push(...crossed);
    saveTimer();
    showReminder(Math.min(...crossed));
  }
  updateBar();
  if (!$('#parent').hidden) renderParentStatus();
}

function startTimer(minutes) {
  timer = {
    end: Date.now() + minutes * MIN,
    total: minutes * MIN,
    // Erinnerungen, die bei dieser Dauer keinen Sinn ergeben, gleich als erledigt markieren
    fired: REMINDERS.filter((m) => m >= minutes),
  };
  saveTimer();
  updateBar();
}

// --- PIN-Eingabe ----------------------------------------------------------------------

let pinEntry = '';
let pinHandler = null;
let tries = 0;

function openPin(title, handler) {
  pinEntry = '';
  pinHandler = handler;
  $('#pin-title').textContent = title;
  renderPin();
  $('#pin').hidden = false;
}

function closePin() {
  $('#pin').hidden = true;
  pinHandler = null;
}

function renderPin() {
  const blockedFor = store.load('pinBlockedUntil', 0) - Date.now();
  const blocked = blockedFor > 0;
  $('#pin-dots').innerHTML = Array.from({ length: PIN_LENGTH }, (_, i) => `<i class="${i < pinEntry.length ? 'on' : ''}"></i>`).join('');
  $('#pin-pad').classList.toggle('blocked', blocked);
  $('#pin-blocked').hidden = !blocked;
  if (blocked) {
    $('#pin-blocked-sec').textContent = Math.ceil(blockedFor / 1000);
    setTimeout(() => !$('#pin').hidden && renderPin(), 1000);
  }
}

function shakePin() {
  const el = $('#pin-dots');
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

async function pinComplete() {
  const entry = pinEntry;
  pinEntry = '';
  const ok = await pinHandler?.(entry);
  if (ok === false) {
    shakePin();
    sound.takeOff();
  }
  if (!$('#pin').hidden) renderPin();
}

$('#pin-pad').addEventListener('click', (e) => {
  const key = e.target.closest('button')?.dataset.key;
  if (!key || $('#pin-pad').classList.contains('blocked')) return;
  if (key === 'cancel') {
    closePin();
    return;
  }
  sound.tap();
  if (key === 'back') pinEntry = pinEntry.slice(0, -1);
  else if (pinEntry.length < PIN_LENGTH) pinEntry += key;
  renderPin();
  if (pinEntry.length === PIN_LENGTH) setTimeout(pinComplete, 150);
});

// Bestehende PIN prüfen; nach MAX_TRIES Fehlversuchen 30 Sekunden Pause.
function verifyPin(title, onSuccess) {
  openPin(title, async (entry) => {
    if ((await hash(entry)) === store.load('pin', null)) {
      tries = 0;
      closePin();
      onSuccess();
      return true;
    }
    tries++;
    if (tries >= MAX_TRIES) {
      tries = 0;
      store.save('pinBlockedUntil', Date.now() + BLOCK_MS);
    }
    return false;
  });
}

// Neue PIN zweimal eingeben lassen.
function setupPin(onDone) {
  let first = null;
  openPin('Neue Eltern-PIN festlegen', async (entry) => {
    if (first === null) {
      first = entry;
      $('#pin-title').textContent = 'PIN wiederholen';
      return true;
    }
    if (entry !== first) {
      first = null;
      $('#pin-title').textContent = 'Stimmt nicht überein. Neue PIN festlegen';
      return false;
    }
    store.save('pin', await hash(entry));
    closePin();
    onDone();
    return true;
  });
}

function withParentAccess(onSuccess) {
  if (store.load('pin', null)) verifyPin('Eltern-PIN eingeben', onSuccess);
  else setupPin(onSuccess);
}

// --- Elternbereich ----------------------------------------------------------------------

function openParent() {
  $('#duration-grid').innerHTML = DURATIONS.map(
    (m) => `<button class="text-btn" data-min="${m}">${m} Min.</button>`
  ).join('');
  renderParentStatus();
  renderVoice();
  renderVersion();
  $('#parent').hidden = false;
}

// Installierte App-Version (Name des Offline-Speichers), hilfreich bei Fragen zu Updates
function renderVersion() {
  if (!('caches' in window)) return;
  caches
    .keys()
    .then((keys) => {
      const v = keys.find((k) => k.startsWith('anziehspass-'));
      $('#app-version').textContent = v ? `App-Version ${v.replace('anziehspass-', '')}` : '';
    })
    .catch(() => {});
}

// Auswahl der Stimme (die Stimmen kommen vom Gerät)
function renderVoice() {
  const voices = germanVoices();
  const uri = currentVoiceUri();
  const option = (value, label) =>
    `<option value="${value}"${value === (uri ?? '') ? ' selected' : ''}>${label}</option>`;
  $('#voice-select').innerHTML =
    option('', 'Stimme des Geräts (empfohlen)') + voices.map((v) => option(v.voiceURI, `${v.name} (${v.lang})`)).join('');
  $('#voice-select').hidden = !speechSupported || voices.length === 0;
  for (const b of document.querySelectorAll('#voice-rate [data-rate]')) {
    b.classList.toggle('active', Number(b.dataset.rate) === currentRate());
  }
  renderSpeechStatus(speechStatus());
}

// Ergebnis des Sprachtests, damit man sieht, woran es liegt, wenn nichts zu hören ist
function renderSpeechStatus(st) {
  const voices = germanVoices().length;
  let text = '';
  if (!speechSupported || st.state === 'unsupported') {
    text = 'Dieser Browser kann nicht sprechen. Bitte Chrome aktualisieren.';
  } else if (st.state === 'pending') {
    text = 'Sprachtest läuft …';
  } else if (st.state === 'ok') {
    text = `✓ Sprachausgabe funktioniert (${st.voice}). Nichts gehört? Medien-Lautstärke prüfen.`;
  } else if (st.state === 'error') {
    text =
      `✗ Fehler «${st.error}». ` +
      (/language|voice/.test(st.error ?? '')
        ? 'Deutsche Stimme fehlt: Android-Einstellungen → Sprachausgabe → Stimmdaten installieren → Deutsch.'
        : 'Android-Einstellungen → Sprachausgabe prüfen (bevorzugtes Modul und Deutsch installiert).');
  } else if (st.state === 'silent') {
    text =
      '✗ Keine Rückmeldung vom Sprachdienst. Android-Einstellungen → Sprachausgabe: bevorzugtes Modul wählen und Deutsch installieren, dann App neu starten.';
  } else if (voices === 0) {
    text = 'Keine deutsche Stimme gefunden. Android-Einstellungen → Sprachausgabe → Deutsch installieren.';
  }
  $('#voice-hint').textContent = text;
}

function closeParent() {
  $('#parent').hidden = true;
}

function renderParentStatus() {
  const running = !!timer && !locked;
  $('#timer-status').textContent = running
    ? `Läuft noch ${Math.ceil(remaining() / MIN)} Min. (bis ${clock(timer.end)})`
    : 'Kein Timer aktiv';
  $('#timer-running').hidden = !running;
}

$('#duration-grid').addEventListener('click', (e) => {
  const min = Number(e.target.closest('[data-min]')?.dataset.min);
  if (!min) return;
  startTimer(min);
  closeParent();
});

$('#btn-add10').addEventListener('click', () => {
  if (!timer) return;
  timer.end += 10 * MIN;
  timer.total += 10 * MIN;
  timer.fired = timer.fired.filter((m) => remaining() <= m * MIN);
  saveTimer();
  renderParentStatus();
  updateBar();
});

$('#btn-stop-timer').addEventListener('click', () => {
  timer = null;
  saveTimer();
  renderParentStatus();
  updateBar();
});

$('#voice-select').addEventListener('change', (e) => {
  setVoice(e.target.value || null);
  say('Hallo! So klinge ich.');
});
$('#voice-rate').addEventListener('click', (e) => {
  const rate = Number(e.target.closest('[data-rate]')?.dataset.rate);
  if (!rate) return;
  setRate(rate);
  renderVoice();
  say('Noch 5 Minuten, dann ist Schluss für heute.');
});
$('#btn-voice-test').addEventListener('click', () => say('Es regnet! Was braucht der Elefant im Regen? Eins, zwei, drei. Super gemacht!'));
onVoicesChanged(() => !$('#parent').hidden && renderVoice());
onSpeechStatus((st) => !$('#parent').hidden && renderSpeechStatus(st));

$('#btn-lock-now').addEventListener('click', lock);
$('#btn-change-pin').addEventListener('click', () => {
  closeParent();
  setupPin(openParent);
});
$('#btn-parent-close').addEventListener('click', closeParent);

// --- Start ----------------------------------------------------------------------------

export function initTimer({ onLock } = {}) {
  onLockCallback = onLock ?? onLockCallback;

  $('#btn-parent').addEventListener('click', () => {
    sound.tap();
    withParentAccess(openParent);
  });
  $('#btn-unlock').addEventListener('click', () => {
    withParentAccess(() => {
      unlock();
      openParent();
    });
  });
  $('#reminder').addEventListener('click', hideReminder);

  // Abgelaufen, während die App zu war?
  if (timer && remaining() <= 0) {
    locked = true;
    timer = null;
    store.save('locked', true);
    saveTimer();
  }
  $('#lock').hidden = !locked;
  updateBar();
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tick();
  });
}
