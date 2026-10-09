// Baut die Szene (Figur + Anziehsachen) als SVG-Text zusammen.

import { FIGURES, VIEWBOX, limbs, bareFeet, torso } from './figures.js';
import { ITEMS_BY_ID, emojiSrc } from './items.js';

const BACKGROUND =
  `<g fill="#fff" opacity=".9">` +
  `<ellipse cx="70" cy="74" rx="38" ry="17"/><ellipse cx="94" cy="60" rx="27" ry="20"/>` +
  `<ellipse cx="330" cy="104" rx="34" ry="15"/><ellipse cx="352" cy="92" rx="22" ry="15"/></g>` +
  // Hügel: reicht über den Bildrand hinaus, damit er im Querformat nicht abbricht.
  `<path d="M-600 480 Q200 400 1000 480 V2000 H-600 Z" fill="#8BC34A" stroke="#7CB342" stroke-width="6"/>`;

// Platziert ein Emoji- oder art-Teil an einem Andockpunkt der Figur.
function anchoredItem(item, figId, anchor, images) {
  const a = { ...anchor, ...item.per?.[figId] };
  const w = (a.w ?? 100) * (item.size ?? 1);
  const ax = item.ax ?? 0.5;
  const ay = item.ay ?? 0.5;
  const rot = (a.rot ?? 0) + (item.rot ?? 0);
  const x = a.x + (a.dx ?? 0);
  const y = a.y + (a.dy ?? 0) - (item.lift ?? 0);
  let s = '';
  if (item.lift) {
    s += `<path d="M${a.x} ${a.y} Q${a.x + 12} ${a.y - item.lift / 2} ${x} ${y}" fill="none" stroke="#666" stroke-width="2"/>`;
  }
  const box = `x="${-w * ax}" y="${-w * ay}" width="${w}" height="${w}"`;
  let content;
  if (item.art) {
    content = `<svg ${box} viewBox="0 0 128 128" overflow="visible">${item.art}</svg>`;
  } else {
    const src = emojiSrc(item.emoji);
    content = `<image href="${images?.[src] ?? src}" ${box}/>`;
  }
  s += `<g transform="translate(${x} ${y}) rotate(${rot})${item.flip ? ' scale(-1 1)' : ''}">${content}</g>`;
  return s;
}

function itemSVG(item, figId, slot, pop, images) {
  const fig = FIGURES[figId];
  let inner;
  if (item.svg) {
    inner = item.svg;
  } else {
    const anchors = Array.isArray(item.anchor) ? item.anchor : [item.anchor];
    inner = anchors.map((name) => anchoredItem(item, figId, fig.anchors[name], images)).join('');
  }
  return `<g class="item" data-slot="${slot}"><g class="${pop ? 'pop' : ''}">${inner}</g></g>`;
}

/**
 * @param figId   'pig' | 'dog' | 'rabbit'
 * @param outfit  { slot: itemId }
 * @param opts.bg       Wolken und Hügel zeichnen
 * @param opts.pop      Slot, der gerade neu angezogen wurde (Animation)
 * @param opts.live     Figur wippt leicht (nur im Anziehraum)
 * @param opts.images   { src: dataURL } zum Einbetten (für den PNG-Export)
 */
export function sceneSVG(figId, outfit, { bg = false, pop = null, live = false, images = null } = {}) {
  const fig = FIGURES[figId];
  const c = fig.colors;
  const it = (slot) => {
    const item = ITEMS_BY_ID[outfit[slot]];
    return item ? itemSVG(item, figId, slot, slot === pop, images) : '';
  };
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" aria-hidden="true">` +
    (bg ? BACKGROUND : '') +
    `<ellipse cx="205" cy="462" rx="80" ry="9" fill="rgba(0,0,0,.13)"/>` +
    `<g class="${live ? 'bob' : ''}">` +
    it('back') +
    limbs(c) +
    bareFeet(c) +
    it('feet') +
    torso(c) +
    it('body') +
    it('neck') +
    fig.head(c) +
    it('bow') +
    it('eyes') +
    it('head') +
    it('hand') +
    `</g></svg>`
  );
}

/** Nur Wolken und Hügel, gleiche Grösse wie die Szene (für den Laufsteg). */
export function backdropSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" aria-hidden="true">${BACKGROUND}</svg>`;
}

/** Kleines Vorschaubild eines Teils für die Auswahlleiste. */
export function thumbHTML(item) {
  if (item.emoji) return `<img src="${emojiSrc(item.emoji)}" alt="" draggable="false">`;
  if (item.art) return `<svg viewBox="0 0 128 128" aria-hidden="true">${item.art}</svg>`;
  return `<svg viewBox="${item.thumb}" aria-hidden="true">${item.svg}</svg>`;
}

/** Rendert einen Look als PNG (für Herunterladen / Teilen). */
export async function scenePNG(figId, outfit, width = 800) {
  const srcs = new Set(
    Object.values(outfit)
      .map((id) => ITEMS_BY_ID[id])
      .filter((i) => i?.emoji)
      .map((i) => emojiSrc(i.emoji))
  );
  const images = {};
  await Promise.all(
    [...srcs].map(async (src) => {
      const text = await (await fetch(src)).text();
      images[src] = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(text)));
    })
  );
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sceneSVG(figId, outfit, { bg: true, images }));
  await img.decode();

  const height = Math.round((width * 520) / 400);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#A9DCFF');
  sky.addColorStop(1, '#E3F4FF');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
