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

// Grosse braune Augen mit Lichtpunkt (für Welpe und Siebenschläfer)
const bigEye = (x, y, iris) =>
  `<circle cx="${x}" cy="${y}" r="12" fill="#fff" stroke="#333" stroke-width="2"/>` +
  `<circle cx="${x + 3}" cy="${y}" r="7" fill="${iris}"/>` +
  `<circle cx="${x + 3}" cy="${y}" r="3.5" fill="#1a1a1a"/>` +
  `<circle cx="${x + 5}" cy="${y - 3}" r="2" fill="#fff"/>`;

function dogHead(c) {
  const ear = (outer, inner) =>
    `<path d="${outer}" fill="${c.fill}" stroke="${c.line}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="${inner}" fill="#E7C08A"/>`;
  return (
    ear('M146 156 L132 76 Q162 88 184 132 Z', 'M150 140 L142 94 Q160 104 172 130 Z') +
    ear('M188 128 L204 58 Q228 80 226 132 Z', 'M196 122 L206 78 Q220 94 218 124 Z') +
    // dunkle Ohrspitzen
    `<path d="M136 100 L132 76 Q148 82 156 96 Z M201 80 L204 58 Q216 68 220 80 Z" fill="#4E3018"/>` +
    `<ellipse cx="190" cy="182" rx="58" ry="56" fill="${c.fill}" stroke="${c.line}" stroke-width="4"/>` +
    // dunklerer Sattel oben am Kopf
    `<path d="M140 168 C140 140 162 126 190 126 C214 126 232 136 238 150 C214 144 186 150 162 176 Z" fill="#7A4E26" opacity=".75"/>` +
    // helles Gesicht und Augenbrauen-Flecken
    `<path d="M178 214 C176 176 196 148 226 146 C250 146 262 168 262 190 C262 222 232 238 206 236 C190 234 180 226 178 214 Z" fill="#E7C08A"/>` +
    `<ellipse cx="204" cy="140" rx="9" ry="5" fill="#E7C08A"/><ellipse cx="234" cy="138" rx="9" ry="5" fill="#E7C08A"/>` +
    `<ellipse cx="248" cy="198" rx="36" ry="25" fill="#F3DDBA" stroke="${c.line}" stroke-width="3"/>` +
    `<ellipse cx="282" cy="188" rx="12" ry="9" fill="#2B1B14"/>` +
    `<path d="M254 214 Q266 222 278 210" fill="none" stroke="#5D4037" stroke-width="4" stroke-linecap="round"/>` +
    bigEye(208, 162, '#8D5524') +
    bigEye(238, 160, '#8D5524')
  );
}

function elephantHead(c) {
  return (
    `<ellipse cx="186" cy="178" rx="60" ry="58" fill="${c.fill}" stroke="${c.line}" stroke-width="4"/>` +
    // Rüssel nach vorne, Spitze nach oben gebogen
    `<path d="M226 158 C258 160 284 176 292 206 C296 222 300 234 312 230 C320 228 324 240 314 247 C294 258 276 238 272 216 C268 198 254 192 230 198 Z" fill="${c.fill}" stroke="${c.line}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M282 214 Q286 220 290 214 M286 228 Q290 234 294 228" fill="none" stroke="${c.line}" stroke-width="2.5" stroke-linecap="round"/>` +
    eye(206, 156) +
    eye(234, 152) +
    `<circle cx="196" cy="198" r="14" fill="#F06292" opacity=".4"/>` +
    `<path d="M214 218 Q228 228 240 214" fill="none" stroke="#5B6B7A" stroke-width="4" stroke-linecap="round"/>` +
    // grosses Ohr
    `<path d="M156 130 C108 118 92 178 104 214 C114 244 150 244 162 220 C170 200 168 160 156 130 Z" fill="${c.fill}" stroke="${c.line}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M150 144 C116 138 106 182 114 206 C122 228 146 228 154 212 C160 196 158 166 150 144 Z" fill="#F4C2C2" opacity=".8"/>`
  );
}

function dormouseTail(c) {
  return (
    `<path d="M138 360 C72 366 34 304 52 242 C64 200 104 186 122 214 C100 238 98 300 152 332 Z" fill="#A38F78" stroke="${c.line}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M66 250 C60 290 80 330 120 348" fill="none" stroke="#C9B8A3" stroke-width="5" stroke-linecap="round"/>`
  );
}

function dormouseHead(c) {
  const ear = (x, y) =>
    `<circle cx="${x}" cy="${y}" r="25" fill="${c.fill}" stroke="${c.line}" stroke-width="4"/>` +
    `<circle cx="${x + 2}" cy="${y + 2}" r="14" fill="#F4B6C2"/>`;
  return (
    ear(158, 136) +
    ear(212, 126) +
    `<ellipse cx="190" cy="184" rx="56" ry="52" fill="${c.fill}" stroke="${c.line}" stroke-width="4"/>` +
    `<ellipse cx="238" cy="198" rx="28" ry="20" fill="#EFE4D6" stroke="${c.line}" stroke-width="3"/>` +
    `<ellipse cx="264" cy="192" rx="7" ry="6" fill="#6D4C41"/>` +
    `<path d="M250 204 L282 198 M250 208 L282 212 M248 212 L276 224" stroke="#8C7660" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M236 214 Q244 220 252 212" fill="none" stroke="#6D4C41" stroke-width="3" stroke-linecap="round"/>` +
    bigEye(208, 168, '#3E2723') +
    bigEye(236, 166, '#3E2723') +
    `<circle cx="186" cy="208" r="13" fill="#F06292" opacity=".4"/>`
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
    // für die Sprachausgabe: «Was braucht das Schweinchen?», «Gib dem Schweinchen …»
    nom: 'das Schweinchen',
    dat: 'dem Schweinchen',
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
    // für die Sprachausgabe: «Was braucht der Welpe?», «Gib dem Welpen …»
    nom: 'der Welpe',
    dat: 'dem Welpen',
    colors: { fill: '#B07A45', line: '#7A5230' },
    head: dogHead,
    anchors: {
      ...SHARED_ANCHORS,
      head: { x: 188, y: 134, w: 105, rot: -4 },
      ear: { x: 216, y: 92, w: 44, rot: 15 },
      eyes: { x: 223, y: 161, w: 76, rot: -2 },
    },
  },
  rabbit: {
    name: 'Häschen',
    // für die Sprachausgabe: «Was braucht das Häschen?», «Gib dem Häschen …»
    nom: 'das Häschen',
    dat: 'dem Häschen',
    colors: { fill: '#D6B48C', line: '#A3825D' },
    head: rabbitHead,
    anchors: {
      ...SHARED_ANCHORS,
      head: { x: 194, y: 138, w: 92, rot: 0 },
      ear: { x: 232, y: 56, w: 44, rot: 20 },
      eyes: { x: 224, y: 165, w: 70, rot: -2 },
    },
  },
  elephant: {
    name: 'Elefant',
    // für die Sprachausgabe: «Was braucht der Elefant?», «Gib dem Elefanten …»
    nom: 'der Elefant',
    dat: 'dem Elefanten',
    colors: { fill: '#A7BACB', line: '#6E8499' },
    head: elephantHead,
    anchors: {
      ...SHARED_ANCHORS,
      head: { x: 182, y: 124, w: 110, rot: -4 },
      ear: { x: 150, y: 132, w: 46, rot: -20 },
      eyes: { x: 220, y: 154, w: 76, rot: -6 },
    },
  },
  dormouse: {
    name: 'Siebenschläfer',
    // für die Sprachausgabe: «Was braucht der Siebenschläfer?», «Gib dem Siebenschläfer …»
    nom: 'der Siebenschläfer',
    dat: 'dem Siebenschläfer',
    colors: { fill: '#BFA88E', line: '#8C7660' },
    head: dormouseHead,
    back: dormouseTail,
    anchors: {
      ...SHARED_ANCHORS,
      head: { x: 186, y: 134, w: 100, rot: -4 },
      ear: { x: 214, y: 106, w: 44, rot: 15 },
      eyes: { x: 222, y: 167, w: 74, rot: -2 },
    },
  },
};
