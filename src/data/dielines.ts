import type { Dieline, Dims, Mark, Panel, ProductId, StyleId } from '../types';
import { getProduct, getStyle } from './products';

/**
 * Flat dielines in mm, origin top-left. Side panels are laid out as a strip
 * front → right → back → left so a single artwork wraps seamlessly around the
 * box, and each panel maps upright onto its BoxGeometry face (see Preview3D).
 *
 * Every product line has several opening styles; `styleId` picks the template.
 * An unknown / missing style falls back to the product's first style.
 */
export function buildDieline(productId: ProductId, d: Dims, styleId?: StyleId): Dieline {
  const style = getStyle(getProduct(productId), styleId).id;
  switch (productId) {
    case 'rigid-box':
      if (style === 'drawer') return drawer('rigid-box', style, d, 15);
      if (style === 'collapsible') return collapsible(style, d);
      return lidBase('rigid-box', style, d, { hinge: style === 'magnetic', ratio: 0.35, glue: 15 });
    case 'corrugated':
      if (style === 'mailer') return mailer(style, d);
      if (style === 'telescopic') return lidBase('corrugated', style, d, { ratio: 0.5, glue: 30 });
      return corrugated(style, d);
    case 'mono-carton':
      if (style === 'sleeve') return sleeve(style, d);
      if (style === 'tray-sleeve') return drawer('mono-carton', style, d, 12);
      return tuckCarton(style, d, style === 'hang-tab');
    case 'paper-bag':
      return paperBag(style, d);
    case 'paper-cup':
      return paperCup(style, d);
  }
}

/** Depth ratio of the lid for lid-and-base styles. */
export function lidRatio(productId: ProductId, styleId?: StyleId): number {
  return productId === 'corrugated' && styleId === 'telescopic' ? 0.5 : 0.35;
}

export function lidDims(d: Dims, ratio = 0.35) {
  return { L: d.L + 4, W: d.W + 4, D: Math.max(20, Math.round(d.H * ratio)) };
}

/** Drawer styles: the tray is a hair shorter than the sleeve, the sleeve a hair taller. */
export const SLEEVE_CLEARANCE = 4;
export const trayLength = (d: Dims) => d.L - 2;

/** Mono-carton hang tab. */
export function hangTabDims(d: Dims) {
  return { w: Math.max(16, Math.round(d.L * 0.6)), h: 24 };
}

function strip(
  y: number,
  h: number,
  L: number,
  W: number,
  glue: number,
  mesh: 'body' | 'lid',
  prefix = '',
  labels = ['Front', 'Right side', 'Back', 'Left side'],
  x0 = 0,
): Panel[] {
  return [
    { id: `${prefix}front`, label: labels[0], x: x0, y, w: L, h, kind: 'print', target: { mesh, face: 'pz' } },
    { id: `${prefix}right`, label: labels[1], x: x0 + L, y, w: W, h, kind: 'print', target: { mesh, face: 'px' } },
    { id: `${prefix}back`, label: labels[2], x: x0 + L + W, y, w: L, h, kind: 'print', target: { mesh, face: 'nz' } },
    { id: `${prefix}left`, label: labels[3], x: x0 + 2 * L + W, y, w: W, h, kind: 'print', target: { mesh, face: 'nx' } },
    ...(glue > 0 ? [{ id: `${prefix}glue`, label: 'Glue', x: x0 + 2 * L + 2 * W, y, w: glue, h, kind: 'glue' as const }] : []),
  ];
}

/** Two-piece box: lid + base. `hinge` adds the hinge strip of a flip-top (magnetic) lid. */
function lidBase(
  productId: ProductId,
  styleId: StyleId,
  d: Dims,
  o: { hinge?: boolean; ratio: number; glue: number },
): Dieline {
  const { L, W, H } = d;
  const lid = lidDims(d, o.ratio);
  const gap = 20;
  const baseY = lid.W + lid.D + gap;
  const panels: Panel[] = [
    { id: 'lidTop', label: 'Lid top', x: 0, y: 0, w: lid.L, h: lid.W, kind: 'print', target: { mesh: 'lid', face: 'py' } },
    ...strip(lid.W, lid.D, lid.L, lid.W, o.glue, 'lid', 'lid-', ['Lid front', 'Lid right', 'Lid back', 'Lid left']),
    ...strip(baseY, H, L, W, o.glue, 'body'),
    { id: 'bottom', label: 'Base bottom', x: 0, y: baseY + H, w: L, h: W, kind: 'print', target: { mesh: 'body', face: 'ny' } },
  ];
  if (o.hinge)
    panels.push({ id: 'hinge', label: 'Hinge strip (lid → base back)', x: L + W, y: lid.W + lid.D, w: L, h: gap, kind: 'flap' });
  return {
    productId,
    styleId,
    width: Math.max(2 * lid.L + 2 * lid.W + o.glue, 2 * L + 2 * W + o.glue),
    height: baseY + H + W,
    panels,
    hero: ['lidTop', 'front'],
  };
}

/** Tray that slides out of a sleeve. The tray strip sits on the left, the stacked sleeve on the right. */
function drawer(productId: ProductId, styleId: StyleId, d: Dims, glue: number): Dieline {
  const { W, H } = d;
  const tl = trayLength(d);
  const c = SLEEVE_CLEARANCE;
  const trayW = 2 * tl + 2 * W + glue;
  const sx = trayW + 20;
  const sh = [H + c, W + c, H + c, W + c];
  const ys = [0, sh[0], sh[0] + sh[1], sh[0] + sh[1] + sh[2]];
  const sleeve: Panel[] = [
    { id: 'sl-front', label: 'Sleeve front', x: sx, y: ys[0], w: d.L, h: sh[0], kind: 'print', target: { mesh: 'sleeve', face: 'pz' } },
    { id: 'sl-top', label: 'Sleeve top', x: sx, y: ys[1], w: d.L, h: sh[1], kind: 'print', target: { mesh: 'sleeve', face: 'py' } },
    { id: 'sl-back', label: 'Sleeve back', x: sx, y: ys[2], w: d.L, h: sh[2], kind: 'print', target: { mesh: 'sleeve', face: 'nz' } },
    { id: 'sl-bottom', label: 'Sleeve bottom', x: sx, y: ys[3], w: d.L, h: sh[3], kind: 'print', target: { mesh: 'sleeve', face: 'ny' } },
    { id: 'sl-glue', label: 'Glue', x: sx, y: ys[3] + sh[3], w: d.L, h: 12, kind: 'glue' },
  ];
  const sleeveH = ys[3] + sh[3] + 12;
  return {
    productId,
    styleId,
    width: sx + d.L,
    height: Math.max(H + W, sleeveH),
    panels: [
      ...strip(0, H, tl, W, glue, 'body', '', ['Tray front', 'Tray end (drawer front)', 'Tray back', 'Tray end (inside)']),
      { id: 'bottom', label: 'Tray bottom', x: 0, y: H, w: tl, h: W, kind: 'print', target: { mesh: 'body', face: 'ny' } },
      ...sleeve,
    ],
    hero: ['sl-top', 'sl-front'],
  };
}

/** Foldable rigid box: four walls hinged to the base, flip-open lid hinged to the back wall. */
function collapsible(styleId: StyleId, d: Dims): Dieline {
  const { L, W, H } = d;
  const gap = 20;
  const stripY = W + gap;
  return {
    productId: 'rigid-box',
    styleId,
    width: 2 * L + 2 * W + 15,
    height: stripY + H + W,
    panels: [
      { id: 'lidTop', label: 'Lid (hinged to back wall)', x: L + W, y: 0, w: L, h: W, kind: 'print', target: { mesh: 'lid', face: 'pz' } },
      ...strip(stripY, H, L, W, 15, 'body', '', ['Front wall', 'Right wall', 'Back wall', 'Left wall']),
      { id: 'bottom', label: 'Base (walls fold up from here)', x: 0, y: stripY + H, w: L, h: W, kind: 'print', target: { mesh: 'body', face: 'ny' } },
    ],
    hero: ['lidTop', 'front'],
  };
}

function corrugated(styleId: StyleId, d: Dims): Dieline {
  const { L, W, H } = d;
  const f = W / 2;
  const flaps = (y: number, top: boolean): Panel[] => {
    const name = top ? 'Top flap' : 'Bottom flap';
    const meshes = ['flapFront', 'flapRight', 'flapBack', 'flapLeft'] as const;
    const xs = [0, L, L + W, 2 * L + W];
    const ws = [L, W, L, W];
    const sides = ['front', 'right', 'back', 'left'];
    return xs.map((x, i) => ({
      id: `${top ? 'top' : 'bot'}-${sides[i]}`,
      label: `${name} (${sides[i]})`,
      x,
      y,
      w: ws[i],
      h: f,
      kind: top ? ('print' as const) : ('flap' as const),
      target: top ? { mesh: meshes[i] } : undefined,
    }));
  };
  return {
    productId: 'corrugated',
    styleId,
    width: 2 * L + 2 * W + 30,
    height: H + 2 * f,
    panels: [...flaps(0, true), ...strip(f, H, L, W, 30, 'body'), ...flaps(f + H, false)],
    hero: ['front', 'back', 'top-front'],
  };
}

/** Mailer: hinged lid on the back wall with a tuck-in front flap. */
function mailer(styleId: StyleId, d: Dims): Dieline {
  const { L, W, H } = d;
  const tuck = Math.min(45, Math.max(20, Math.round(H * 0.3)));
  const y0 = tuck + W;
  return {
    productId: 'corrugated',
    styleId,
    width: 2 * L + 2 * W + 30,
    height: y0 + H + W,
    panels: [
      { id: 'tuck', label: 'Front tuck flap', x: L + W, y: 0, w: L, h: tuck, kind: 'flap' },
      { id: 'lidTop', label: 'Lid (hinged to back wall)', x: L + W, y: tuck, w: L, h: W, kind: 'print', target: { mesh: 'lid', face: 'py' } },
      ...strip(y0, H, L, W, 30, 'body'),
      { id: 'bottom', label: 'Base bottom', x: 0, y: y0 + H, w: L, h: W, kind: 'print', target: { mesh: 'body', face: 'ny' } },
    ],
    hero: ['lidTop', 'front', 'back'],
  };
}

/**
 * Tuck-end carton. The lid hangs off the back wall (straight tuck) or, for the hang-tab
 * style, off the front wall so the hang tab can extend the back wall.
 */
function tuckCarton(styleId: StyleId, d: Dims, tab: boolean): Dieline {
  const { L, W, H } = d;
  const tongue = 15;
  const dust = Math.round(W * 0.6);
  const y0 = tongue + W;
  const lx = tab ? 0 : L + W; // lid + bottom closure column
  const panels: Panel[] = [
    { id: 'tuck-top', label: 'Tuck', x: lx, y: 0, w: L, h: tongue, kind: 'flap' },
    { id: 'lid', label: 'Top lid', x: lx, y: tongue, w: L, h: W, kind: 'print', target: { mesh: 'lid', face: 'py' } },
    { id: 'dust-tr', label: 'Dust flap', x: L, y: y0 - dust, w: W, h: dust, kind: 'flap' },
    { id: 'dust-tl', label: 'Dust flap', x: 2 * L + W, y: y0 - dust, w: W, h: dust, kind: 'flap' },
    ...strip(y0, H, L, W, 12, 'body'),
    { id: 'base', label: 'Bottom lid', x: lx, y: y0 + H, w: L, h: W, kind: 'print', target: { mesh: 'body', face: 'ny' } },
    { id: 'tuck-bot', label: 'Tuck', x: lx, y: y0 + H + W, w: L, h: tongue, kind: 'flap' },
    { id: 'dust-br', label: 'Dust flap', x: L, y: y0 + H, w: W, h: dust, kind: 'flap' },
    { id: 'dust-bl', label: 'Dust flap', x: 2 * L + W, y: y0 + H, w: W, h: dust, kind: 'flap' },
  ];
  const marks: Mark[] = [];
  if (tab) {
    const t = hangTabDims(d);
    const tx = L + W + (L - t.w) / 2;
    panels.push({ id: 'hang-tab', label: 'Hang tab', x: tx, y: y0 - t.h, w: t.w, h: t.h, kind: 'print', target: { mesh: 'tab', face: 'pz' } });
    marks.push({ id: 'hang-hole', kind: 'ellipse', cx: tx + t.w / 2, cy: y0 - t.h / 2, rx: Math.min(7, t.w / 4), ry: 3.5, label: 'Hang hole' });
  }
  return {
    productId: 'mono-carton',
    styleId,
    width: 2 * L + 2 * W + 12,
    height: y0 + H + W + tongue,
    panels,
    marks,
    hero: ['front', 'back', 'lid'],
  };
}

/** Open-ended tube: four walls and a glue flap, no top or bottom. */
function sleeve(styleId: StyleId, d: Dims): Dieline {
  const { L, W, H } = d;
  return {
    productId: 'mono-carton',
    styleId,
    width: 2 * L + 2 * W + 12,
    height: H,
    panels: strip(0, H, L, W, 12, 'body', '', ['Front', 'Right side', 'Back', 'Left side']),
    hero: ['front', 'back'],
  };
}

function paperBag(styleId: StyleId, d: Dims): Dieline {
  const { L, W: G, H } = d;
  const fold = styleId === 'die-cut' ? 55 : 40;
  const marks: Mark[] = [];
  if (styleId === 'die-cut') {
    const rx = Math.min(55, L * 0.22);
    marks.push(
      { id: 'cut-front', kind: 'ellipse', cx: L / 2, cy: fold + 24, rx, ry: 9, label: 'Handle cut-out' },
      { id: 'cut-back', kind: 'ellipse', cx: L + G + L / 2, cy: fold + 24, rx, ry: 9, label: 'Handle cut-out' },
    );
  }
  return {
    productId: 'paper-bag',
    styleId,
    width: 2 * L + 2 * G + 15,
    height: fold + H + G,
    panels: [
      { id: 'topfold', label: 'Top fold-over (inside)', x: 0, y: 0, w: 2 * L + 2 * G + 15, h: fold, kind: 'flap' },
      ...strip(fold, H, L, G, 15, 'body', '', ['Front', 'Right gusset', 'Back', 'Left gusset']),
      { id: 'bottom', label: 'Bottom', x: 0, y: fold + H, w: L, h: G, kind: 'print', target: { mesh: 'body', face: 'ny' } },
    ],
    marks,
    hero: ['front', 'back'],
  };
}

/** Cup wall unrolls into an annular sector (a "fan"). Outer arc = top rim. */
export function cupSector(d: Dims) {
  const top = d.topDia;
  const bot = Math.min(d.botDia, top - 10);
  const s = Math.sqrt(d.H ** 2 + ((top - bot) / 2) ** 2);
  const R = (s * top) / (top - bot);
  const r = R - s;
  const theta = (Math.PI * top) / R;
  return { R, r, s, theta };
}

function paperCup(styleId: StyleId, d: Dims): Dieline {
  const { R, r, theta } = cupSector(d);
  const pad = 4;
  const width = 2 * R * Math.sin(theta / 2) + pad * 2;
  const height = R - r * Math.cos(theta / 2) + pad * 2;
  return {
    productId: 'paper-cup',
    styleId,
    width,
    height,
    sector: { cx: width / 2, cy: R + pad, R, r, theta },
    panels: [{ id: 'wrap', label: 'Cup wall (wrap)', x: 0, y: 0, w: width, h: height, kind: 'print', target: { mesh: 'cup' } }],
    hero: ['wrap'],
  };
}

export function dielineArea(dl: Dieline): number {
  if (dl.sector) return 0.5 * dl.sector.theta * (dl.sector.R ** 2 - dl.sector.r ** 2);
  return dl.panels.reduce((a, p) => a + p.w * p.h, 0);
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Blank dieline as SVG (used for the Prototype Kit + Studio download). */
export function dielineSvg(dl: Dieline, title: string): string {
  const m = 20;
  const W = dl.width + m * 2;
  const H = dl.height + m * 2 + 20;
  const parts: string[] = [];
  if (dl.sector) {
    const { cx, cy, R, r, theta } = dl.sector;
    const pt = (rad: number, a: number) => `${(m + cx + rad * Math.sin(a)).toFixed(2)} ${(m + cy - rad * Math.cos(a)).toFixed(2)}`;
    const a0 = -theta / 2;
    const a1 = theta / 2;
    parts.push(
      `<path d="M ${pt(R, a0)} A ${R} ${R} 0 0 1 ${pt(R, a1)} L ${pt(r, a1)} A ${r} ${r} 0 0 0 ${pt(r, a0)} Z" fill="none" stroke="#000" stroke-width="0.5"/>`,
    );
  } else {
    for (const p of dl.panels) {
      parts.push(
        `<rect x="${m + p.x}" y="${m + p.y}" width="${p.w}" height="${p.h}" fill="none" stroke="${p.kind === 'print' ? '#000' : '#888'}" stroke-width="0.5" stroke-dasharray="${p.kind === 'print' ? '' : '3 2'}"/>`,
        `<text x="${m + p.x + p.w / 2}" y="${m + p.y + p.h / 2}" font-size="${Math.min(10, p.h / 3, p.w / 6).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="#666" font-family="sans-serif">${esc(p.label)}</text>`,
      );
    }
  }
  for (const mk of dl.marks ?? [])
    parts.push(`<ellipse cx="${m + mk.cx}" cy="${m + mk.cy}" rx="${mk.rx}" ry="${mk.ry}" fill="none" stroke="#c2552e" stroke-width="0.6"/>`);
  parts.push(`<text x="${m}" y="${H - 8}" font-size="8" fill="#333" font-family="sans-serif">${esc(title)} — Petti blank dieline, units mm, 3 mm bleed recommended</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
}
