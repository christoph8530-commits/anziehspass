// Sprachausgabe auf Deutsch (für Kinder, die noch nicht lesen können).
// Die Stimmen kommen vom Gerät. Welche Stimme und wie schnell, legen die Eltern im
// Elternbereich fest. Ist keine Stimme verfügbar, passiert einfach nichts.

import * as store from './storage.js';

const supported = 'speechSynthesis' in window;
const settings = { uri: null, rate: 1, ...store.load('voice', {}) };
let voice = null;
let pending = null;
const listeners = new Set();

// Android meldet Sprachcodes teils als «de_CH» statt «de-CH».
const langOf = (v) => (v.lang ?? '').replace('_', '-').toLowerCase();

export function germanVoices() {
  if (!supported) return [];
  return speechSynthesis.getVoices().filter((v) => langOf(v).startsWith('de'));
}

// Ohne eigene Wahl: Schweizer Stimme, sonst eine Google-Stimme (klingt auf
// Samsung-Geräten meist flüssiger als die Samsung-Stimme), sonst die erste deutsche.
function pickVoice() {
  const de = germanVoices();
  voice =
    de.find((v) => v.voiceURI === settings.uri) ??
    de.find((v) => langOf(v) === 'de-ch') ??
    de.find((v) => /google/i.test(v.name)) ??
    de.find((v) => langOf(v) === 'de-de' && v.localService) ??
    de[0] ??
    null;
  for (const fn of listeners) fn();
}

if (supported) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function say(text) {
  if (!supported) return;
  try {
    clearTimeout(pending);
    const speak = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang ?? 'de-DE';
      if (voice) u.voice = voice;
      // Tonhöhe bewusst 1: veränderte Tonhöhe klingt auf manchen Android-Geräten abgehackt
      u.rate = settings.rate;
      u.pitch = 1;
      speechSynthesis.speak(u);
    };
    // Sofort nach cancel() zu sprechen, stottert auf Android; deshalb kurz warten.
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      pending = setTimeout(speak, 120);
    } else {
      speak();
    }
  } catch {
    /* keine Sprachausgabe verfügbar */
  }
}

export function stopSpeaking() {
  clearTimeout(pending);
  try {
    if (supported) speechSynthesis.cancel();
  } catch {
    /* egal */
  }
}

export const currentVoice = () => voice;
export const currentRate = () => settings.rate;

export function setVoice(uri) {
  settings.uri = uri;
  store.save('voice', settings);
  pickVoice();
}

export function setRate(rate) {
  settings.rate = rate;
  store.save('voice', settings);
}

// Benachrichtigt, wenn die Stimmen des Geräts (nach)geladen wurden.
export function onVoicesChanged(fn) {
  listeners.add(fn);
}
