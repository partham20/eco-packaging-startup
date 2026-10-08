import type { Dieline, Dims, Panel, ProductId } from '../types';

/**
 * Flat dielines in mm, origin top-left. Side panels are laid out as a strip
 * front → right → back → left so a single artwork wraps seamlessly around the
 * box, and each panel maps upright onto its BoxGeometry face (see Preview3D).
 */
export function buildDieline(productId: ProductId, d: Dims): Dieline {
  switch (productId) {
    case 'rigid-box':
      return rigidBox(d);
    case 'corrugated':
      return corrugated(d);
    case 'mono-carton':
      return monoCarton(d);
    case 'paper-bag':
      return paperBag(d);
    case 'paper-cup':
      return paperCup(d);
  }
}

export function lidDims(d: Dims) {
  return { L: d.L + 4, W: d.W + 4, D: Math.max(20, Math.round(d.H * 0.35)) };
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
): Panel[] {
  return [
    { id: `${prefix}front`, label: labels[0], x: 0, y, w: L, h, kind: 'print', target: { mesh, face: 'pz' } },
    { id: `${prefix}right`, label: labels[1], x: L, y, w: W, h, kind: 'print', target: { mesh, face: 'px' } },
    { id: `${prefix}back`, label: labels[2], x: L + W, y, w: L, h, kind: 'print', target: { mesh, face: 'nz' } },
    { id: `${prefix}left`, label: labels[3], x: 2 * L + W, y, w: W, h, kind: 'print', target: { mesh, face: 'nx' } },
    { id: `${prefix}glue`, label: 'Glue', x: 2 * L + 2 * W, y, w: glue, h, kind: 'glue' },
  ];
}

function rigidBox(d: Dims): Dieline {
  const { L, W, H } = d;
  const lid = lidDims(d);
  const gap = 20;
  const baseY = lid.W + lid.D + gap;
  const panels: Panel[] = [
    { id: 'lidTop', label: 'Lid top', x: 0, y: 0, w: lid.L, h: lid.W, kind: 'print', target: { mesh: 'lid', face: 'py' } },
    ...strip(lid.W, lid.D, lid.L, lid.W, 15, 'lid', 'lid-', ['Lid front', 'Lid right', 'Lid back', 'Lid left']),
    ...strip(baseY, H, L, W, 15, 'body'),
    { id: 'bottom', label: 'Base bottom', x: 0, y: baseY + H, w: L, h: W, kind: 'print', target: { mesh: 'body', face: 'ny' } },
  ];
  return {
    productId: 'rigid-box',
    width: Math.max(2 * lid.L + 2 * lid.W + 15, 2 * L + 2 * W + 15),
    height: baseY + H + W,
    panels,
  };
}

function corrugated(d: Dims): Dieline {
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
    width: 2 * L + 2 * W + 30,
    height: H + 2 * f,
    panels: [...flaps(0, true), ...strip(f, H, L, W, 30, 'body'), ...flaps(f + H, false)],
  };
}

function monoCarton(d: Dims): Dieline {
  const { L, W, H } = d;
  const tongue = 15;
  const dust = Math.round(W * 0.6);
  const y0 = tongue + W;
  return {
    productId: 'mono-carton',
    width: 2 * L + 2 * W + 12,
    height: y0 + H + W + tongue,
    panels: [
      { id: 'tuck-top', label: 'Tuck', x: 0, y: 0, w: L, h: tongue, kind: 'flap' },
      { id: 'lid', label: 'Top lid', x: 0, y: tongue, w: L, h: W, kind: 'print', target: { mesh: 'body', face: 'py' } },
      { id: 'dust-tr', label: 'Dust flap', x: L, y: y0 - dust, w: W, h: dust, kind: 'flap' },
      { id: 'dust-tl', label: 'Dust flap', x: 2 * L + W, y: y0 - dust, w: W, h: dust, kind: 'flap' },
      ...strip(y0, H, L, W, 12, 'body'),
      { id: 'base', label: 'Bottom lid', x: 0, y: y0 + H, w: L, h: W, kind: 'print', target: { mesh: 'body', face: 'ny' } },
      { id: 'tuck-bot', label: 'Tuck', x: 0, y: y0 + H + W, w: L, h: tongue, kind: 'flap' },
      { id: 'dust-br', label: 'Dust flap', x: L, y: y0 + H, w: W, h: dust, kind: 'flap' },
      { id: 'dust-bl', label: 'Dust flap', x: 2 * L + W, y: y0 + H, w: W, h: dust, kind: 'flap' },
    ],
  };
}

function paperBag(d: Dims): Dieline {
  const { L, W: G, H } = d;
  const fold = 40;
  return {
    productId: 'paper-bag',
    width: 2 * L + 2 * G + 15,
    height: fold + H + G,
    panels: [
      { id: 'topfold', label: 'Top fold-over (inside)', x: 0, y: 0, w: 2 * L + 2 * G + 15, h: fold, kind: 'flap' },
      ...strip(fold, H, L, G, 15, 'body', '', ['Front', 'Right gusset', 'Back', 'Left gusset']),
      { id: 'bottom', label: 'Bottom', x: 0, y: fold + H, w: L, h: G, kind: 'print', target: { mesh: 'body', face: 'ny' } },
    ],
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

function paperCup(d: Dims): Dieline {
  const { R, r, theta } = cupSector(d);
  const pad = 4;
  const width = 2 * R * Math.sin(theta / 2) + pad * 2;
  const height = R - r * Math.cos(theta / 2) + pad * 2;
  return {
    productId: 'paper-cup',
    width,
    height,
    sector: { cx: width / 2, cy: R + pad, R, r, theta },
    panels: [{ id: 'wrap', label: 'Cup wall (wrap)', x: 0, y: 0, w: width, h: height, kind: 'print', target: { mesh: 'cup' } }],
  };
}

export function dielineArea(dl: Dieline): number {
  if (dl.sector) return 0.5 * dl.sector.theta * (dl.sector.R ** 2 - dl.sector.r ** 2);
  return dl.panels.reduce((a, p) => a + p.w * p.h, 0);
}

/** Blank dieline as SVG (used for the Starter Kit + Studio download). */
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
        `<text x="${m + p.x + p.w / 2}" y="${m + p.y + p.h / 2}" font-size="${Math.min(10, p.h / 3, p.w / 6).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="#666" font-family="sans-serif">${p.label}</text>`,
      );
    }
  }
  parts.push(`<text x="${m}" y="${H - 8}" font-size="8" fill="#333" font-family="sans-serif">${title} — Petti blank dieline, units mm, 3 mm bleed recommended</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
}
