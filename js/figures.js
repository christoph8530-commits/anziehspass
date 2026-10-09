// Figuren im Stil der Kinderserien: alle teilen denselben Körper,
// nur Kopf und Farben unterscheiden sich. Alle Figuren schauen nach rechts.
// Koordinatensystem: viewBox 0 0 400 520.

export const VIEWBOX = '0 0 400 520';

// Torso-Form, an der sich auch die selbst gezeichneten Kleider orientieren.
const TORSO = 'M160 250 C175 240 225 240 240 250 L290 385 C250 400 150 400 110 385 Z';
const LEGS = [178, 222];

const limb = (c, d) =>
  `<path d="${d}" fill="none" stroke="${c.line}" stroke-width="6" stroke-linecap="round"/>`;

const eye = (x, y) =>
  `<circle cx="${x}" cy="${y}" r="11" fill="#fff" stroke="#333" stroke-width="2"/>` +
  `<circle cx="${x + 3}" cy="${y}" r="5" fill="#222"/>`;

// Arme und Beine liegen hinter dem Torso.
export function limbs(c) {
  return (
    limb(c, 'M150 288 L104 326') +
    limb(c, 'M250 288 L296 326') +
    `<circle cx="101" cy="329" r="7" fill="${c.fill}" stroke="${c.line}" stroke-width="3"/>` +
    `<circle cx="299" cy="329" r="7" fill="${c.fill}" stroke="${c.line}" stroke-width="3"/>` +
    LEGS.map((x) => limb(c, `M${x} 392 V448`)).join('')
  );
}

export function bareFeet(c) {
  return LEGS.map(
    (x) => `<ellipse cx="${x + 6}" cy="452" rx="13" ry="7" fill="${c.fill}" stroke="${c.line}" stroke-width="3"/>`
  ).join('');
}

export function torso(c) {
  return `<path d="${TORSO}" fill="${c.fill}" stroke="${c.line}" stroke-width="4" stroke-linejoin="round"/>`;
}

function pigHead(c) {
  const ear = (d) =>
    `<path d="${d}" fill="${c.fill}" stroke="${c.line}" stroke-width="4" stroke-linejoin="round"/>`;
  return (
    ear('M150 140 L143 100 L178 124 Z') +
    ear('M182 126 L184 92 L210 120 Z') +
    `<path d="M135 200 C128 150 165 118 210 122 L268 96 C286 89 300 104 300 122 C300 138 292 150 282 154 L238 178 C240 222 205 248 170 244 C148 241 138 225 135 200 Z" fill="${c.fill}" stroke="${c.line}" stroke-width="4" stroke-linejoin="round"/>` +
    `<ellipse cx="289" cy="124" rx="13" ry="27" transform="rotate(-25 289 124)" fill="#F49AB9" stroke="${c.line}" stroke-width="3"/>` +
    `<ellipse cx="285" cy="114" rx="3" ry="5" fill="#B0477A"/>` +
    `<ellipse cx="293" cy="132" rx="3" ry="5" fill="#B0477A"/>` +
    eye(214, 142) +
    eye(246, 128) +
    `<circle cx="176" cy="206" r="15" fill="#F06292" opacity=".5"/>` +
    `<path d="M194 222 Q212 230 228 212" fill="none" stroke="#B0477A" stroke-width="4" stroke-linecap="round"/>`
  );
}

function dogHead(c) {
  return (
    `<ellipse cx="190" cy="182" rx="58" ry="56" fill="${c.fill}" stroke="${c.line}" stroke-width="4"/>` +
    `<ellipse cx="172" cy="150" rx="20" ry="15" fill="#C48A4E" opacity=".7"/>` +
    `<ellipse cx="246" cy="194" rx="38" ry="27" fill="#F3DDBA" stroke="${c.line}" stroke-width="3"/>` +
    `<ellipse cx="281" cy="184" rx="11" ry="9" fill="#3E2723"/>` +
    `<path d="M252 212 Q265 220 278 206" fill="none" stroke="#5D4037" stroke-width="4" stroke-linecap="round"/>` +
    eye(206, 162) +
    eye(236, 160) +
    `<path d="M152 146 C122 150 116 214 138 226 C152 232 164 208 166 168 Z" fill="#8D5A2B" stroke="#6D4320" stroke-width="3" stroke-linejoin="round"/>`
  );
}

function rabbitHead(c) {
  const part = (d, fill, stroke = c.line, w = 4) =>
    `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;
  return (
    part('M170 140 C142 84 146 28 166 30 C186 32 192 96 190 134 Z', c.fill) +
    part('M200 134 C206 74 226 22 242 34 C258 46 230 108 216 140 Z', c.fill) +
    part('M172 124 C158 86 160 48 167 46 C175 48 180 92 180 120 Z', '#F4B6C2', 'none', 0) +
    part('M207 120 C213 80 226 48 235 50 C243 58 226 100 214 124 Z', '#F4B6C2', 'none', 0) +
    `<ellipse cx="192" cy="186" rx="56" ry="54" fill="${c.fill}" stroke="${c.line}" stroke-width="4"/>` +
    `<ellipse cx="238" cy="198" rx="28" ry="21" fill="#F3E6D3" stroke="${c.line}" stroke-width="3"/>` +
    `<ellipse cx="262" cy="188" rx="8" ry="6" fill="#E57399"/>` +
    `<rect x="241" y="214" width="9" height="11" rx="2" fill="#fff" stroke="${c.line}" stroke-width="2"/>` +
    `<rect x="251" y="214" width="9" height="11" rx="2" fill="#fff" stroke="${c.line}" stroke-width="2"/>` +
    eye(210, 166) +
    eye(238, 164) +
    `<circle cx="186" cy="210" r="13" fill="#F06292" opacity=".45"/>`
  );
}

// Andockpunkte, die für alle Figuren gleich sind (gemeinsamer Körper).
const SHARED_ANCHORS = {
  hand: { x: 299, y: 329, w: 100 },
  neck: { x: 200, y: 254, w: 60 },
  back: { x: 122, y: 302, w: 92, rot: -8 },
  footL: { x: 184, y: 452, w: 42 },
  footR: { x: 228, y: 452, w: 42 },
};

export const FIGURES = {
  pig: {
    name: 'Schweinchen',
    colors: { fill: '#F8B5CB', line: '#D9799B' },
    head: pigHead,
    anchors: {
      ...SHARED_ANCHORS,
      head: { x: 176, y: 128, w: 95, rot: -14 },
      ear: { x: 160, y: 112, w: 48, rot: -20 },
      eyes: { x: 231, y: 135, w: 84, rot: -22 },
    },
  },
  dog: {
    name: 'Welpe',
    colors: { fill: '#E0B07A', line: '#A0703F' },
    head: dogHead,
    anchors: {
      ...SHARED_ANCHORS,
      head: { x: 186, y: 132, w: 105, rot: -4 },
      ear: { x: 148, y: 150, w: 46, rot: -15 },
      eyes: { x: 221, y: 161, w: 74, rot: -2 },
    },
  },
  rabbit: {
    name: 'Häschen',
    colors: { fill: '#D6B48C', line: '#A3825D' },
    head: rabbitHead,
    anchors: {
      ...SHARED_ANCHORS,
      head: { x: 194, y: 138, w: 92, rot: 0 },
      ear: { x: 232, y: 56, w: 44, rot: 20 },
      eyes: { x: 224, y: 165, w: 70, rot: -2 },
    },
  },
};
