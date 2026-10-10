// Sprachausgabe auf Deutsch (für Kinder, die noch nicht lesen können).
// Ist keine Stimme verfügbar, passiert einfach nichts.

let voice = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  voice = voices.find((v) => v.lang === 'de-CH') ?? voices.find((v) => v.lang?.startsWith('de')) ?? null;
}

if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function say(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang ?? 'de-DE';
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.pitch = 1.1;
    speechSynthesis.speak(u);
  } catch {
    /* keine Sprachausgabe verfügbar */
  }
}
