// Sprachausgabe auf Deutsch (für Kinder, die noch nicht lesen können).
//
// Standard ist die Stimme, die das Gerät selbst für Deutsch wählt (am zuverlässigsten).
// Im Elternbereich kann eine bestimmte Stimme gewählt werden. Bleibt diese stumm oder
// meldet einen Fehler, wird automatisch nochmal mit der Gerätestimme gesprochen.

import * as store from './storage.js';

export const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
// Tempo 1.25 als Standard: 1.0 klingt mit den Android-Stimmen langsam und abgehackt
const settings = { uri: null, rate: 1.25, ...store.load('voice', {}) };
let voice = null; // nur gesetzt, wenn die Eltern eine bestimmte Stimme gewählt haben
let generation = 0; // jede neue Ansage erhöht den Zähler; alte Wiederholungen verfallen
const listeners = new Set();

// Letzter Zustand für den Sprachtest im Elternbereich
let status = { state: supported ? 'idle' : 'unsupported', error: null, voice: null };
const statusListeners = new Set();
function setStatus(next) {
  status = { ...status, ...next };
  for (const fn of statusListeners) fn(status);
}

// Android meldet Sprachcodes teils als «de_CH» statt «de-CH».
const langOf = (v) => (v.lang ?? '').replace('_', '-').toLowerCase();

export function allVoices() {
  if (!supported) return [];
  try {
    return speechSynthesis.getVoices();
  } catch {
    return [];
  }
}

export function germanVoices() {
  if (!supported) return [];
  try {
    return speechSynthesis.getVoices().filter((v) => langOf(v).startsWith('de'));
  } catch {
    return [];
  }
}

function pickVoice() {
  voice = settings.uri ? germanVoices().find((v) => v.voiceURI === settings.uri) ?? null : null;
  for (const fn of listeners) fn();
}

if (supported) {
  pickVoice();
  try {
    speechSynthesis.addEventListener('voiceschanged', pickVoice);
  } catch {
    speechSynthesis.onvoiceschanged = pickVoice;
  }
}

function speak(text, useChosenVoice, gen) {
  const chosen = useChosenVoice ? voice : null;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = chosen?.lang ?? 'de-DE';
  try {
    if (chosen) u.voice = chosen;
  } catch {
    /* Stimme nicht verwendbar: Gerätestimme */
  }
  u.rate = settings.rate;
  u.pitch = 1;
  let started = false;
  let retried = false;
  const fallback = () => {
    if (retried || !chosen || gen !== generation) return;
    retried = true;
    speechSynthesis.cancel();
    speak(text, false, gen);
  };
  u.onstart = () => {
    started = true;
    if (gen !== generation) return;
    setStatus({ state: 'ok', error: null, voice: chosen?.name ?? 'Stimme des Geräts' });
  };
  u.onerror = (e) => {
    if (e.error === 'interrupted' || e.error === 'canceled' || gen !== generation) return;
    setStatus({ state: 'error', error: e.error ?? 'unbekannt', voice: chosen?.name ?? 'Stimme des Geräts' });
    fallback();
  };
  setStatus({ state: 'pending', error: null, voice: chosen?.name ?? 'Stimme des Geräts' });
  speechSynthesis.speak(u);
  // Keine Rückmeldung? Dann mit der Gerätestimme nochmal versuchen.
  setTimeout(() => {
    if (started || gen !== generation) return;
    if (chosen) fallback();
    else if (status.state === 'pending') setStatus({ state: 'silent' });
  }, 3000);
}

export function say(text) {
  if (!supported) return;
  try {
    speechSynthesis.cancel();
    if (speechSynthesis.paused) speechSynthesis.resume();
    speak(text, true, ++generation);
  } catch (e) {
    setStatus({ state: 'error', error: e?.message ?? 'unbekannt' });
  }
}

export function stopSpeaking() {
  generation++;
  try {
    if (supported) speechSynthesis.cancel();
  } catch {
    /* egal */
  }
}

export const currentVoiceUri = () => settings.uri;
export const currentRate = () => settings.rate;
export const speechStatus = () => status;

// uri = null: Stimme des Geräts
export function setVoice(uri) {
  settings.uri = uri || null;
  store.save('voice', settings);
  pickVoice();
}

export function setRate(rate) {
  settings.rate = rate;
  store.save('voice', settings);
}

export function onVoicesChanged(fn) {
  listeners.add(fn);
}

export function onSpeechStatus(fn) {
  statusListeners.add(fn);
}
