// Katalog aller Anziehsachen.
//
// Zwei Arten von Teilen:
//  - emoji: Bild aus assets/emoji (Google Noto Emoji). Es wird an einem Andockpunkt
//    der Figur platziert (anchor). size = Breite relativ zum Andockpunkt,
//    ax/ay = welcher Punkt im Bild (0..1) auf dem Andockpunkt liegt.
//  - svg: selbst gezeichnet, direkt im Koordinatensystem der Figur (passt auf alle Figuren).
//
// slot: pro Slot kann die Figur genau ein Teil tragen (neuer Hut ersetzt alten Hut).
// per: optionale Korrekturen pro Figur, z.B. { rabbit: { dy: -6 } }.

export const emojiSrc = (cp) => `assets/emoji/emoji_u${cp}.svg`;

export const CATEGORIES = [
  { id: 'head', label: 'Kopf', icon: emojiSrc('1f452') },
  { id: 'eyes', label: 'Augen', icon: emojiSrc('1f453') },
  { id: 'body', label: 'Kleider', icon: emojiSrc('1f457') },
  { id: 'feet', label: 'Schuhe', icon: emojiSrc('1f45f') },
  { id: 'extra', label: 'Spielsachen', icon: emojiSrc('1f392') },
];

// --- Selbst gezeichnete Kleider -------------------------------------------

const f = (n) => n.toFixed(1);
// Kanten des Torsos (siehe figures.js), damit Streifen genau passen.
const edgeL = (y) => 156 - 0.37 * (y - 247);
const edgeR = (y) => 244 + 0.37 * (y - 247);
const band = (y1, y2, fill) =>
  `<path d="M${f(edgeL(y1) + 3)} ${y1} H${f(edgeR(y1) - 3)} L${f(edgeR(y2) - 3)} ${y2} H${f(edgeL(y2) + 3)} Z" fill="${fill}"/>`;

function star(cx, cy, r, fill) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += (i ? 'L' : 'M') + f(cx + rr * Math.cos(a)) + ' ' + f(cy + rr * Math.sin(a));
  }
  return `<path d="${d}Z" fill="${fill}" stroke="#E6A100" stroke-width="2" stroke-linejoin="round"/>`;
}

const TOP = 'M156 247 C175 236 225 236 244 247';

const DRESS =
  `<path d="${TOP} L298 389 C250 406 150 406 102 389 Z" fill="#E53935" stroke="#B71C1C" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M108 377 C150 392 250 392 292 377" fill="none" stroke="#FFCDD2" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 12"/>`;

const SHIRT =
  `<path d="${TOP} L277 336 C230 346 170 346 123 336 Z" fill="#1E88E5" stroke="#0D47A1" stroke-width="4" stroke-linejoin="round"/>` +
  star(212, 292, 20, '#FFEB3B');

const VEST =
  `<path d="${TOP} L284 355 C240 366 160 366 116 355 Z" fill="#FB8C00" stroke="#E65100" stroke-width="4" stroke-linejoin="round"/>` +
  band(294, 306, '#FFF59D') +
  band(324, 336, '#FFF59D') +
  star(226, 268, 13, '#FFD54F');

const RAINCOAT =
  `<path d="${TOP} L294 386 C250 402 150 402 106 386 Z" fill="#FFD54F" stroke="#F9A825" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M168 246 L192 266 L200 252 L208 266 L232 246" fill="none" stroke="#F9A825" stroke-width="4" stroke-linejoin="round"/>` +
  [282, 310, 338, 366].map((y, i) => `<circle cx="${212 + i * 7}" cy="${y}" r="5" fill="#1565C0"/>`).join('') +
  `<path d="M138 336 h36 v24 h-36 z" fill="none" stroke="#F9A825" stroke-width="3"/>`;

const SCARF =
  `<path d="M222 264 L248 304 L231 311 L209 268 Z" fill="#29B6F6" stroke="#0277BD" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M155 246 C178 260 222 260 245 246 L247 260 C222 276 178 276 153 260 Z" fill="#29B6F6" stroke="#0277BD" stroke-width="3" stroke-linejoin="round"/>` +
  [[175, 258], [200, 264], [225, 258], [232, 290]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('');

const WELLIES = [178, 222]
  .map(
    (x) =>
      `<path d="M${x - 10} 420 H${x + 10} V444 H${x + 20} Q${x + 28} 447 ${x + 26} 456 L${x + 25} 462 H${x - 12} Q${x - 15} 452 ${x - 10} 444 Z" fill="#E53935" stroke="#B71C1C" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M${x - 12} 457 H${x + 25}" stroke="#B71C1C" stroke-width="3"/>`
  )
  .join('');

const BODY_THUMB = '92 228 216 184';

// --- Katalog ---------------------------------------------------------------

export const ITEMS = [
  // Kopf
  { id: 'crown', cat: 'head', slot: 'head', emoji: '1f451', anchor: 'head', size: 0.95, ay: 0.82 },
  { id: 'tophat', cat: 'head', slot: 'head', emoji: '1f3a9', anchor: 'head', size: 1, ay: 0.88 },
  { id: 'sunhat', cat: 'head', slot: 'head', emoji: '1f452', anchor: 'head', size: 1.3, ay: 0.7 },
  { id: 'cap', cat: 'head', slot: 'head', emoji: '1f9e2', anchor: 'head', size: 1.1, ay: 0.75, flip: true },
  { id: 'helmet', cat: 'head', slot: 'head', emoji: '26d1', anchor: 'head', size: 1.05, ay: 0.78 },
  { id: 'bow', cat: 'head', slot: 'bow', emoji: '1f380', anchor: 'ear', size: 1, ay: 0.5 },
  // Augen
  { id: 'glasses', cat: 'eyes', slot: 'eyes', emoji: '1f453', anchor: 'eyes', size: 1, ay: 0.5 },
  { id: 'sunglasses', cat: 'eyes', slot: 'eyes', emoji: '1f576', anchor: 'eyes', size: 1, ay: 0.5 },
  { id: 'goggles', cat: 'eyes', slot: 'eyes', emoji: '1f97d', anchor: 'eyes', size: 1.1, ay: 0.5 },
  // Kleider
  { id: 'dress', cat: 'body', slot: 'body', svg: DRESS, thumb: BODY_THUMB },
  { id: 'shirt', cat: 'body', slot: 'body', svg: SHIRT, thumb: BODY_THUMB },
  { id: 'vest', cat: 'body', slot: 'body', svg: VEST, thumb: BODY_THUMB },
  { id: 'raincoat', cat: 'body', slot: 'body', svg: RAINCOAT, thumb: BODY_THUMB },
  { id: 'scarf', cat: 'body', slot: 'neck', svg: SCARF, thumb: '140 230 125 92' },
  // Schuhe
  { id: 'wellies', cat: 'feet', slot: 'feet', svg: WELLIES, thumb: '150 408 112 62' },
  { id: 'sneakers', cat: 'feet', slot: 'feet', emoji: '1f45f', anchor: ['footL', 'footR'], size: 1.15, ay: 0.8 },
  // Spielsachen
  { id: 'backpack', cat: 'extra', slot: 'back', emoji: '1f392', anchor: 'back', size: 1, ay: 0.5 },
  { id: 'umbrella', cat: 'extra', slot: 'hand', emoji: '2602', anchor: 'hand', size: 1.4, ay: 0.95 },
  { id: 'wand', cat: 'extra', slot: 'hand', emoji: '1fa84', anchor: 'hand', size: 0.95, ax: 0.2, ay: 0.8 },
  { id: 'flower', cat: 'extra', slot: 'hand', emoji: '1f338', anchor: 'hand', size: 0.75, ay: 0.6 },
  { id: 'balloon', cat: 'extra', slot: 'hand', emoji: '1f388', anchor: 'hand', size: 0.85, ay: 0.97, lift: 130 },
];

export const ITEMS_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
export const SLOTS = [...new Set(ITEMS.map((i) => i.slot))];
