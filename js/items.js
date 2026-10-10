// Katalog aller Anziehsachen.
//
// Drei Arten von Teilen:
//  - emoji: Bild aus assets/emoji (Google Noto Emoji), an einem Andockpunkt platziert.
//  - art:   selbst gezeichnet in einer 128×128-Box, wird wie ein Emoji platziert.
//  - svg:   selbst gezeichnet, direkt im Koordinatensystem der Figur (passt auf alle Figuren).
//
// Für emoji/art: anchor = Andockpunkt (head, ear, eyes, neck, hand, back, ['footL','footR']),
// size = Breite relativ zum Andockpunkt, ax/ay = welcher Punkt im Bild (0..1) auf dem
// Andockpunkt liegt, flip = spiegeln, lift = schwebt an einer Schnur über der Hand.
//
// slot: pro Slot kann die Figur genau ein Teil tragen (neuer Hut ersetzt alten Hut).
// per: optionale Korrekturen pro Figur, z.B. { rabbit: { dy: -6 } }.

export const emojiSrc = (cp) => `assets/emoji/emoji_u${cp}.svg`;

export const CATEGORIES = [
  { id: 'head', label: 'Kopf', icon: emojiSrc('1f452') },
  { id: 'eyes', label: 'Augen', icon: emojiSrc('1f453') },
  { id: 'body', label: 'Kleider', icon: emojiSrc('1f457') },
  { id: 'acc', label: 'Hals und Rücken', icon: emojiSrc('1f9e3') },
  { id: 'feet', label: 'Schuhe', icon: emojiSrc('1f45f') },
  { id: 'toys', label: 'Spielsachen', icon: emojiSrc('1f9f8') },
];

// --- Zeichenhilfen ----------------------------------------------------------

const f = (n) => n.toFixed(1);
// Kanten des Torsos (siehe figures.js), damit Streifen genau passen.
const edgeL = (y) => 156 - 0.37 * (y - 247);
const edgeR = (y) => 244 + 0.37 * (y - 247);
const band = (y1, y2, fill) =>
  `<path d="M${f(edgeL(y1) + 3)} ${y1} H${f(edgeR(y1) - 3)} L${f(edgeR(y2) - 3)} ${y2} H${f(edgeL(y2) + 3)} Z" fill="${fill}"/>`;

function star(cx, cy, r, fill, stroke = '#E6A100') {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += (i ? 'L' : 'M') + f(cx + rr * Math.cos(a)) + ' ' + f(cy + rr * Math.sin(a));
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
}

function heart(cx, cy, s, fill, stroke) {
  return (
    `<path d="M${cx} ${f(cy + s * 0.9)} C${f(cx - s * 1.4)} ${cy} ${f(cx - s * 0.9)} ${f(cy - s * 1.1)} ${cx} ${f(cy - s * 0.35)} ` +
    `C${f(cx + s * 0.9)} ${f(cy - s * 1.1)} ${f(cx + s * 1.4)} ${cy} ${cx} ${f(cy + s * 0.9)} Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`
  );
}

function blossom(x, y, petal = '#F06292', r = 5) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5;
    s += `<circle cx="${f(x + r * 1.1 * Math.cos(a))}" cy="${f(y + r * 1.1 * Math.sin(a))}" r="${r}" fill="${petal}"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="${r * 0.8}" fill="#FFA000"/>`;
}

const perFoot = (draw) => [178, 222].map(draw).join('');

const TOP = 'M156 247 C175 236 225 236 244 247';
const LONG = `${TOP} L298 389 C250 406 150 406 102 389 Z`;
const COAT = `${TOP} L294 386 C250 402 150 402 106 386 Z`;
const SHORT = `${TOP} L277 336 C230 346 170 346 123 336 Z`;
const shape = (d, fill, stroke) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;

// --- Kleider (Koordinaten der Figur) --------------------------------------------

const DRESS =
  shape(LONG, '#E53935', '#B71C1C') +
  `<path d="M108 377 C150 392 250 392 292 377" fill="none" stroke="#FFCDD2" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 12"/>`;

const SHIRT = shape(SHORT, '#1E88E5', '#0D47A1') + star(212, 292, 20, '#FFEB3B');

const VEST =
  shape(`${TOP} L284 355 C240 366 160 366 116 355 Z`, '#FB8C00', '#E65100') +
  band(294, 306, '#FFF59D') +
  band(324, 336, '#FFF59D') +
  star(226, 268, 13, '#FFD54F');

const RAINCOAT =
  shape(COAT, '#FFD54F', '#F9A825') +
  `<path d="M168 246 L192 266 L200 252 L208 266 L232 246" fill="none" stroke="#F9A825" stroke-width="4" stroke-linejoin="round"/>` +
  [282, 310, 338, 366].map((y, i) => `<circle cx="${212 + i * 7}" cy="${y}" r="5" fill="#1565C0"/>`).join('') +
  `<path d="M138 336 h36 v24 h-36 z" fill="none" stroke="#F9A825" stroke-width="3"/>`;

const PRINCESS =
  shape(`${TOP} L306 392 C250 412 150 412 94 392 Z`, '#AB47BC', '#6A1B9A') +
  band(296, 308, '#F8BBD0') +
  [[150, 362], [200, 378], [250, 362], [178, 336], [226, 338], [120, 384], [282, 384]]
    .map(([x, y]) => star(x, y, 8, '#FFEB3B'))
    .join('');

const TUTU =
  shape(COAT, '#F48FB1', '#D81B60') +
  `<path d="M128 296 Q200 286 272 296 L318 336 Q300 350 280 340 Q260 354 240 342 Q220 356 200 344 Q180 356 160 342 Q140 354 120 340 Q100 350 82 336 Z" fill="#FCE4EC" stroke="#EC407A" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M110 324 Q200 340 290 324" fill="none" stroke="#F8BBD0" stroke-width="3"/>` +
  star(214, 268, 8, '#fff', '#F06292');

const OVERALLS =
  shape(COAT, '#FFEE58', '#F9A825') +
  shape(`M${f(edgeL(318))} 318 H${f(edgeR(318))} L294 386 C250 402 150 402 106 386 Z`, '#42A5F5', '#1565C0') +
  `<path d="M176 278 H226 V322 H176 Z" fill="#42A5F5" stroke="#1565C0" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M178 280 L166 250 M224 280 L236 250" stroke="#1565C0" stroke-width="7" stroke-linecap="round"/>` +
  `<circle cx="182" cy="286" r="4" fill="#FFEE58"/><circle cx="220" cy="286" r="4" fill="#FFEE58"/>` +
  `<path d="M188 298 H214 V312 H188 Z" fill="none" stroke="#1565C0" stroke-width="3"/>`;

const STRIPES =
  shape(SHORT, '#ffffff', '#C62828') +
  band(260, 272, '#E53935') +
  band(284, 296, '#E53935') +
  band(308, 320, '#E53935');

const FIREJACKET =
  shape(COAT, '#D32F2F', '#8E0000') +
  band(326, 338, '#FFEB3B') +
  band(356, 368, '#FFEB3B') +
  `<path d="M168 246 L200 262 L232 246" fill="none" stroke="#212121" stroke-width="6" stroke-linejoin="round"/>` +
  [278, 300].map((y) => `<rect x="214" y="${y}" width="14" height="6" rx="2" fill="#212121"/>`).join('');

const FLOWERDRESS =
  shape(LONG, '#FFF176', '#F9A825') +
  [[150, 330], [200, 352], [250, 330], [130, 376], [185, 384], [240, 380], [272, 370], [176, 300], [224, 296]]
    .map(([x, y], i) => blossom(x, y, i % 2 ? '#F06292' : '#BA68C8'))
    .join('');

const POLICEVEST =
  shape(`${TOP} L284 355 C240 366 160 366 116 355 Z`, '#1E5BB8', '#0D3A80') +
  [0, 14, 28]
    .map((dy) => `<path d="M128 ${292 + dy} L144 ${304 + dy} L160 ${292 + dy}" fill="none" stroke="#FFD54F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join('') +
  `<path d="M214 262 h24 v16 q0 12 -12 18 q-12 -6 -12 -18 Z" fill="#FFD54F" stroke="#F9A825" stroke-width="2"/>` +
  star(226, 276, 6, '#1E5BB8', '#0D3A80');

const REDJACKET =
  shape(`M${f(edgeL(330))} 330 H${f(edgeR(330))} L294 386 C250 402 150 402 106 386 Z`, '#4A78B5', '#2C4F80') +
  `<path d="M110 376 C150 391 250 391 290 376" fill="none" stroke="#8FB3E0" stroke-width="9" stroke-linecap="round"/>` +
  `<path d="M200 344 V392" stroke="#2C4F80" stroke-width="3"/>` +
  shape(`${TOP} L${f(edgeR(340))} 340 C230 350 170 350 ${f(edgeL(340))} 340 Z`, '#E53935', '#B71C1C') +
  `<path d="M170 246 L194 268 L200 254 L206 268 L230 246" fill="#C62828" stroke="#B71C1C" stroke-width="3" stroke-linejoin="round"/>` +
  [286, 310, 334].map((y, i) => `<circle cx="${214 + i * 6}" cy="${y}" r="5" fill="#FFD54F" stroke="#F9A825" stroke-width="1.5"/>`).join('');

const PYJAMA =
  shape(COAT, '#42A5F5', '#1565C0') +
  [[262, 274], [286, 298], [310, 322], [334, 346], [358, 370]].map(([a, b]) => band(a, b, '#EF5350')).join('') +
  `<path d="M168 246 L200 264 L232 246" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>`;

// --- Hals und Rücken -------------------------------------------------------------

const SCARF =
  `<path d="M222 264 L248 304 L231 311 L209 268 Z" fill="#29B6F6" stroke="#0277BD" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M155 246 C178 260 222 260 245 246 L247 260 C222 276 178 276 153 260 Z" fill="#29B6F6" stroke="#0277BD" stroke-width="3" stroke-linejoin="round"/>` +
  [[175, 258], [200, 264], [225, 258], [232, 290]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('');

const NECKLACE = Array.from({ length: 12 }, (_, i) => {
  const t = i / 11;
  const x = (1 - t) ** 2 * 162 + 2 * (1 - t) * t * 200 + t * t * 238;
  const y = (1 - t) ** 2 * 252 + 2 * (1 - t) * t * 292 + t * t * 252;
  return `<circle cx="${f(x)}" cy="${f(y)}" r="6" fill="#FAFAFA" stroke="#B0BEC5" stroke-width="2"/>`;
}).join('');

const CAPE = shape(
  'M168 248 C140 290 96 360 74 404 C130 416 270 416 312 402 C288 360 256 290 232 248 Z',
  '#E53935',
  '#B71C1C'
);

// --- Schuhe -----------------------------------------------------------------------

const WELLIES = perFoot(
  (x) =>
    `<path d="M${x - 10} 420 H${x + 10} V444 H${x + 20} Q${x + 28} 447 ${x + 26} 456 L${x + 25} 462 H${x - 12} Q${x - 15} 452 ${x - 10} 444 Z" fill="#E53935" stroke="#B71C1C" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M${x - 12} 457 H${x + 25}" stroke="#B71C1C" stroke-width="3"/>`
);

const BALLET = perFoot(
  (x) =>
    `<path d="M${x - 4} 446 L${x + 5} 430 M${x + 6} 446 L${x - 3} 432" stroke="#F48FB1" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M${x - 9} 447 Q${x + 6} 443 ${x + 20} 447 Q${x + 25} 457 ${x + 18} 461 H${x - 10} Q${x - 14} 454 ${x - 9} 447 Z" fill="#F48FB1" stroke="#C2185B" stroke-width="3" stroke-linejoin="round"/>` +
    `<circle cx="${x + 14}" cy="448" r="3.5" fill="#C2185B"/>`
);

const FLIPPERS = perFoot(
  (x) =>
    `<path d="M${x - 10} 446 L${x + 10} 444 L${x + 46} 438 Q${x + 54} 452 ${x + 46} 468 L${x + 10} 464 L${x - 10} 462 Z" fill="#29B6F6" stroke="#0277BD" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M${x + 16} 448 L${x + 42} 446 M${x + 16} 460 L${x + 42} 462" stroke="#0277BD" stroke-width="2"/>`
);

// --- Mützen, Helme, Brillen (128×128-Box) ------------------------------------------

const helmet = (fill, dark, extra = '') =>
  `<path d="M22 90 C22 34 106 34 106 90 Z" fill="${fill}" stroke="${dark}" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M64 40 V88" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>` +
  `<path d="M8 88 H118 Q127 89 122 98 Q118 104 104 104 H22 Q8 104 6 96 Q4 88 8 88 Z" fill="${fill}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>` +
  extra;

const PARTYHAT =
  `<path d="M64 8 L98 110 H30 Z" fill="#AB47BC" stroke="#6A1B9A" stroke-width="4" stroke-linejoin="round"/>` +
  [[56, 62, 5], [73, 82, 5], [50, 96, 5], [66, 40, 4], [80, 102, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFEB3B"/>`).join('') +
  `<path d="M30 110 H98" stroke="#FFEB3B" stroke-width="8" stroke-linecap="round"/>` +
  `<circle cx="64" cy="9" r="10" fill="#FF7043"/>`;

const WIZARDHAT =
  `<path d="M40 100 L58 20 Q66 2 86 10 Q72 14 70 28 L90 100 Z" fill="#3949AB" stroke="#1A237E" stroke-width="4" stroke-linejoin="round"/>` +
  `<ellipse cx="64" cy="100" rx="60" ry="12" fill="#3949AB" stroke="#1A237E" stroke-width="4"/>` +
  star(62, 62, 10, '#FFEB3B') +
  star(76, 86, 6, '#FFEB3B') +
  star(52, 86, 5, '#FFEB3B');

const FIREHELMET = helmet(
  '#E53935',
  '#B71C1C',
  `<path d="M82 52 h18 v14 l-9 9 l-9 -9 Z" fill="#FFD54F" stroke="#F9A825" stroke-width="2" stroke-linejoin="round"/>`
);

const BUILDERHELMET = helmet('#FDD835', '#F57F17');

const POLICECAP =
  `<path d="M14 58 Q60 26 112 50 L104 82 H26 Z" fill="#1E40AF" stroke="#172554" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M26 78 H104 V92 H26 Z" fill="#172554"/>` +
  `<path d="M96 90 Q122 88 126 100 Q108 104 90 98 Z" fill="#111"/>` +
  star(62, 58, 11, '#FFD54F');

const PIRATEHAT =
  `<path d="M6 86 Q16 36 64 46 Q112 36 122 86 Q64 70 6 86 Z" fill="#263238" stroke="#000" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M12 82 Q64 66 116 82" fill="none" stroke="#FFC107" stroke-width="4"/>` +
  `<circle cx="64" cy="58" r="9" fill="#fff"/>` +
  `<circle cx="60" cy="57" r="2.2" fill="#263238"/><circle cx="68" cy="57" r="2.2" fill="#263238"/>` +
  `<path d="M52 68 L76 76 M76 68 L52 76" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;

const NIGHTCAP =
  `<path d="M22 100 C26 52 52 18 92 22 C112 24 122 40 118 60 C108 46 96 44 88 52 C100 70 106 86 106 100 Z" fill="#5C6BC0" stroke="#283593" stroke-width="4" stroke-linejoin="round"/>` +
  star(60, 62, 7, '#FFEB3B') +
  star(84, 82, 5, '#FFEB3B') +
  star(44, 86, 5, '#FFEB3B') +
  `<path d="M16 96 H112 Q118 104 112 112 H16 Q10 104 16 96 Z" fill="#fff" stroke="#C5CAE9" stroke-width="3"/>` +
  `<circle cx="118" cy="62" r="11" fill="#fff" stroke="#C5CAE9" stroke-width="3"/>`;

const WREATH =
  `<ellipse cx="64" cy="78" rx="56" ry="18" fill="none" stroke="#7CB342" stroke-width="7"/>` +
  [0, 1, 2, 3, 4, 5, 6]
    .map((i) => {
      const a = Math.PI * (0.1 + (0.8 * i) / 6);
      return blossom(64 - 56 * Math.cos(a), 78 + 18 * Math.sin(a) - 6, ['#F06292', '#FFF176', '#BA68C8', '#4FC3F7'][i % 4], 7);
    })
    .join('');

const PLUSHBUNNY =
  `<path d="M44 40 C36 6 52 2 56 36 Z M72 36 C76 2 92 6 84 40 Z" fill="#ECEFF1" stroke="#90A4AE" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M48 34 C44 14 50 12 53 34 Z M75 34 C78 12 84 14 80 34 Z" fill="#F8BBD0"/>` +
  `<ellipse cx="64" cy="94" rx="30" ry="28" fill="#ECEFF1" stroke="#90A4AE" stroke-width="3"/>` +
  `<circle cx="64" cy="54" r="24" fill="#ECEFF1" stroke="#90A4AE" stroke-width="3"/>` +
  `<circle cx="55" cy="52" r="3.5" fill="#37474F"/><circle cx="73" cy="52" r="3.5" fill="#37474F"/>` +
  `<ellipse cx="64" cy="61" rx="4" ry="3" fill="#F48FB1"/>` +
  `<path d="M54 94 h20 M64 84 v20" stroke="#CFD8DC" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 4"/>`;

const BEANIE =
  `<path d="M20 96 C20 40 108 40 108 96 Z" fill="#E53935" stroke="#B71C1C" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M44 52 C40 66 40 82 42 94 M64 46 V94 M84 52 C88 66 88 82 86 94" fill="none" stroke="#C62828" stroke-width="4" stroke-linecap="round"/>` +
  `<path d="M14 90 H114 Q120 100 114 110 H14 Q8 100 14 90 Z" fill="#fff" stroke="#CFD8DC" stroke-width="3"/>` +
  `<circle cx="64" cy="34" r="14" fill="#fff" stroke="#CFD8DC" stroke-width="3"/>`;

const HEARTGLASSES =
  heart(34, 64, 22, '#F48FB1', '#C2185B') +
  heart(94, 64, 22, '#F48FB1', '#C2185B') +
  `<path d="M56 56 Q64 50 72 56" fill="none" stroke="#C2185B" stroke-width="4"/>`;

const STARGLASSES =
  star(34, 64, 30, '#FFEB3B', '#F57F17') +
  star(94, 64, 30, '#FFEB3B', '#F57F17') +
  `<path d="M56 60 Q64 54 72 60" fill="none" stroke="#F57F17" stroke-width="4"/>`;

const MASK =
  `<path fill-rule="evenodd" d="M4 58 Q64 36 124 58 Q128 84 100 86 Q76 88 64 74 Q52 88 28 86 Q0 84 4 58 Z ` +
  `M18 64 a16 12 0 1 0 32 0 a16 12 0 1 0 -32 0 Z M78 64 a16 12 0 1 0 32 0 a16 12 0 1 0 -32 0 Z" ` +
  `fill="#E53935" stroke="#B71C1C" stroke-width="3" stroke-linejoin="round"/>`;

const BOWTIE =
  `<path d="M64 64 L14 36 Q6 64 14 92 Z M64 64 L114 36 Q122 64 114 92 Z" fill="#E53935" stroke="#B71C1C" stroke-width="4" stroke-linejoin="round"/>` +
  [[30, 52], [30, 76], [98, 52], [98, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/>`).join('') +
  `<rect x="52" y="50" width="24" height="28" rx="8" fill="#C62828" stroke="#B71C1C" stroke-width="3"/>`;

const BODY_THUMB = '92 228 216 184';
const FEET_THUMB = '150 408 130 64';

// --- Katalog ---------------------------------------------------------------

export const ITEMS = [
  // Kopf
  { id: 'crown', cat: 'head', slot: 'head', emoji: '1f451', anchor: 'head', size: 0.95, ay: 0.82 },
  { id: 'tophat', cat: 'head', slot: 'head', emoji: '1f3a9', anchor: 'head', size: 1, ay: 0.88 },
  { id: 'sunhat', cat: 'head', slot: 'head', emoji: '1f452', anchor: 'head', size: 1.3, ay: 0.7 },
  { id: 'cap', cat: 'head', slot: 'head', emoji: '1f9e2', anchor: 'head', size: 1.1, ay: 0.75, flip: true },
  { id: 'helmet', cat: 'head', slot: 'head', emoji: '26d1', anchor: 'head', size: 1.05, ay: 0.78 },
  { id: 'firehelmet', cat: 'head', slot: 'head', art: FIREHELMET, anchor: 'head', size: 1.3, ay: 0.8 },
  { id: 'policecap', cat: 'head', slot: 'head', art: POLICECAP, anchor: 'head', size: 1.25, ay: 0.72 },
  { id: 'builderhelmet', cat: 'head', slot: 'head', art: BUILDERHELMET, anchor: 'head', size: 1.3, ay: 0.8 },
  { id: 'partyhat', cat: 'head', slot: 'head', art: PARTYHAT, anchor: 'head', size: 0.9, ay: 0.86 },
  { id: 'wizardhat', cat: 'head', slot: 'head', art: WIZARDHAT, anchor: 'head', size: 1.35, ay: 0.78 },
  { id: 'piratehat', cat: 'head', slot: 'head', art: PIRATEHAT, anchor: 'head', size: 1.4, ay: 0.74 },
  { id: 'beanie', cat: 'head', slot: 'head', art: BEANIE, anchor: 'head', size: 1.1, ay: 0.78 },
  { id: 'nightcap', cat: 'head', slot: 'head', art: NIGHTCAP, anchor: 'head', size: 1.15, ay: 0.82 },
  { id: 'wreath', cat: 'head', slot: 'head', art: WREATH, anchor: 'head', size: 1.15, ay: 0.62 },
  { id: 'gradcap', cat: 'head', slot: 'head', emoji: '1f393', anchor: 'head', size: 1.1, ay: 0.72 },
  { id: 'bow', cat: 'head', slot: 'bow', emoji: '1f380', anchor: 'ear', size: 1, ay: 0.5 },
  { id: 'sunflower', cat: 'head', slot: 'bow', emoji: '1f33b', anchor: 'ear', size: 0.9, ay: 0.5 },
  // Augen
  { id: 'glasses', cat: 'eyes', slot: 'eyes', emoji: '1f453', anchor: 'eyes', size: 1, ay: 0.5 },
  { id: 'sunglasses', cat: 'eyes', slot: 'eyes', emoji: '1f576', anchor: 'eyes', size: 1, ay: 0.5 },
  { id: 'goggles', cat: 'eyes', slot: 'eyes', emoji: '1f97d', anchor: 'eyes', size: 1.1, ay: 0.5 },
  { id: 'heartglasses', cat: 'eyes', slot: 'eyes', art: HEARTGLASSES, anchor: 'eyes', size: 1.05, ay: 0.5 },
  { id: 'starglasses', cat: 'eyes', slot: 'eyes', art: STARGLASSES, anchor: 'eyes', size: 1.05, ay: 0.5 },
  { id: 'mask', cat: 'eyes', slot: 'eyes', art: MASK, anchor: 'eyes', size: 1.05, ay: 0.5 },
  // Kleider
  { id: 'dress', cat: 'body', slot: 'body', svg: DRESS, thumb: BODY_THUMB },
  { id: 'princess', cat: 'body', slot: 'body', svg: PRINCESS, thumb: BODY_THUMB },
  { id: 'flowerdress', cat: 'body', slot: 'body', svg: FLOWERDRESS, thumb: BODY_THUMB },
  { id: 'tutu', cat: 'body', slot: 'body', svg: TUTU, thumb: '78 228 244 184' },
  { id: 'shirt', cat: 'body', slot: 'body', svg: SHIRT, thumb: BODY_THUMB },
  { id: 'stripes', cat: 'body', slot: 'body', svg: STRIPES, thumb: BODY_THUMB },
  { id: 'overalls', cat: 'body', slot: 'body', svg: OVERALLS, thumb: BODY_THUMB },
  { id: 'raincoat', cat: 'body', slot: 'body', svg: RAINCOAT, thumb: BODY_THUMB },
  { id: 'vest', cat: 'body', slot: 'body', svg: VEST, thumb: BODY_THUMB },
  { id: 'policevest', cat: 'body', slot: 'body', svg: POLICEVEST, thumb: BODY_THUMB },
  { id: 'redjacket', cat: 'body', slot: 'body', svg: REDJACKET, thumb: BODY_THUMB },
  { id: 'pyjama', cat: 'body', slot: 'body', svg: PYJAMA, thumb: BODY_THUMB },
  { id: 'firejacket', cat: 'body', slot: 'body', svg: FIREJACKET, thumb: BODY_THUMB },
  // Hals und Rücken
  { id: 'scarf', cat: 'acc', slot: 'neck', svg: SCARF, thumb: '140 230 125 92' },
  { id: 'bowtie', cat: 'acc', slot: 'neck', art: BOWTIE, anchor: 'neck', size: 1.1, ay: 0.4 },
  { id: 'necklace', cat: 'acc', slot: 'neck', svg: NECKLACE, thumb: '150 236 100 70' },
  { id: 'medal', cat: 'acc', slot: 'neck', emoji: '1f947', anchor: 'neck', size: 1.1, ay: 0.08 },
  { id: 'backpack', cat: 'acc', slot: 'back', emoji: '1f392', anchor: 'back', size: 1, ay: 0.5 },
  { id: 'cape', cat: 'acc', slot: 'back', svg: CAPE, thumb: '60 232 270 196' },
  { id: 'wings', cat: 'acc', slot: 'back', emoji: '1fabd', anchor: 'back', size: 1.5, ax: 0.3, ay: 0.65, flip: true },
  // Schuhe
  { id: 'wellies', cat: 'feet', slot: 'feet', svg: WELLIES, thumb: FEET_THUMB },
  { id: 'sneakers', cat: 'feet', slot: 'feet', emoji: '1f45f', anchor: ['footL', 'footR'], size: 1.15, ay: 0.8 },
  { id: 'ballet', cat: 'feet', slot: 'feet', svg: BALLET, thumb: FEET_THUMB },
  { id: 'boots', cat: 'feet', slot: 'feet', emoji: '1f97e', anchor: ['footL', 'footR'], size: 1.15, ay: 0.82 },
  { id: 'skates', cat: 'feet', slot: 'feet', emoji: '1f6fc', anchor: ['footL', 'footR'], size: 1.25, ay: 0.78 },
  { id: 'flippers', cat: 'feet', slot: 'feet', svg: FLIPPERS, thumb: '150 408 150 70' },
  // Spielsachen
  { id: 'plushbunny', cat: 'toys', slot: 'hand', art: PLUSHBUNNY, anchor: 'hand', size: 1, ay: 0.6 },
  { id: 'teddy', cat: 'toys', slot: 'hand', emoji: '1f9f8', anchor: 'hand', size: 0.85, ay: 0.55 },
  { id: 'balloon', cat: 'toys', slot: 'hand', emoji: '1f388', anchor: 'hand', size: 0.85, ay: 0.97, lift: 130 },
  { id: 'kite', cat: 'toys', slot: 'hand', emoji: '1fa81', anchor: 'hand', size: 1, ay: 0.9, lift: 170 },
  { id: 'umbrella', cat: 'toys', slot: 'hand', emoji: '2602', anchor: 'hand', size: 1.4, ay: 0.95 },
  { id: 'wand', cat: 'toys', slot: 'hand', emoji: '1fa84', anchor: 'hand', size: 0.95, ax: 0.2, ay: 0.8 },
  { id: 'flower', cat: 'toys', slot: 'hand', emoji: '1f338', anchor: 'hand', size: 0.75, ay: 0.6 },
  { id: 'icecream', cat: 'toys', slot: 'hand', emoji: '1f366', anchor: 'hand', size: 0.8, ay: 0.85 },
  { id: 'lollipop', cat: 'toys', slot: 'hand', emoji: '1f36d', anchor: 'hand', size: 0.8, ax: 0.3, ay: 0.85 },
  { id: 'ball', cat: 'toys', slot: 'hand', emoji: '26bd', anchor: 'hand', size: 0.6, ay: 0.4 },
  { id: 'bucket', cat: 'toys', slot: 'hand', emoji: '1faa3', anchor: 'hand', size: 0.75, ay: 0.15 },
  { id: 'bone', cat: 'toys', slot: 'hand', emoji: '1f9b4', anchor: 'hand', size: 0.7, ay: 0.5 },
  { id: 'carrot', cat: 'toys', slot: 'hand', emoji: '1f955', anchor: 'hand', size: 0.75, ax: 0.3, ay: 0.7 },
];

export const ITEMS_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
export const SLOTS = [...new Set(ITEMS.map((i) => i.slot))];
