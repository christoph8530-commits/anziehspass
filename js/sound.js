// Kleine Geräusche, direkt im Browser erzeugt (keine Audiodateien nötig).

let ctx = null;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(from, to, dur, { type = 'sine', vol = 0.18, delay = 0 } = {}) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const wear = () => tone(420, 900, 0.14);
export const takeOff = () => tone(700, 250, 0.16, { type: 'triangle' });
export const tap = () => tone(620, 640, 0.05, { vol: 0.08 });
export const dice = () =>
  [0, 0.07, 0.14, 0.21, 0.28].forEach((d, i) =>
    tone(450 + i * 110, 520 + i * 110, 0.06, { type: 'square', vol: 0.05, delay: d })
  );
export const fanfare = () =>
  [[523, 0, 0.12], [659, 0.13, 0.12], [784, 0.26, 0.12], [1047, 0.39, 0.45]].forEach(([hz, delay, len]) =>
    tone(hz, hz * 1.01, len, { type: 'triangle', vol: 0.16, delay })
  );
export const sweep = () => tone(900, 200, 0.35, { type: 'triangle', vol: 0.12 });

export function shutter() {
  const ac = audio();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * 0.12);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  gain.gain.value = 0.3;
  src.buffer = buf;
  src.connect(gain).connect(ac.destination);
  src.start();
  tone(1200, 1500, 0.08, { vol: 0.06, delay: 0.1 });
}
