import type { Artwork, Design, Dieline, Panel } from '../types';

export type ImageMap = Map<string, HTMLImageElement>;

export interface RenderOptions {
  pxPerMm: number;
  overlay?: boolean;
  selectedPanel?: string | null;
}

/** Recommended resolution so the longest side stays within maxPx. */
export function pxPerMmFor(dl: Dieline, maxPx = 2048) {
  return Math.min(4, maxPx / Math.max(dl.width, dl.height));
}

function sectorPath(g: CanvasRenderingContext2D, dl: Dieline, k: number) {
  const s = dl.sector!;
  // canvas angles are measured from +x; our sector is centred on "up" (-y)
  const a0 = -Math.PI / 2 - s.theta / 2;
  const a1 = -Math.PI / 2 + s.theta / 2;
  g.beginPath();
  g.arc(s.cx * k, s.cy * k, s.R * k, a0, a1);
  g.arc(s.cx * k, s.cy * k, s.r * k, a1, a0, true);
  g.closePath();
}

function rectPath(g: CanvasRenderingContext2D, panels: Panel[], k: number) {
  g.beginPath();
  for (const p of panels) g.rect(p.x * k, p.y * k, p.w * k, p.h * k);
}

function drawArtwork(
  g: CanvasRenderingContext2D,
  img: HTMLImageElement,
  art: Artwork,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  k: number,
) {
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;
  const fit = art.fit === 'contain' ? Math.min(rw / iw, rh / ih) : Math.max(rw / iw, rh / ih);
  const s = fit * art.scale;
  const w = iw * s;
  const h = ih * s;
  const x = rx + (rw - w) / 2 + art.offsetX;
  const y = ry + (rh - h) / 2 + art.offsetY;
  g.drawImage(img, x * k, y * k, w * k, h * k);
}

/** Paints the flat dieline (print layer + optional guide overlay) into a canvas. */
export function renderDieline(
  canvas: HTMLCanvasElement,
  dl: Dieline,
  design: Design,
  images: ImageMap,
  opts: RenderOptions,
) {
  const k = opts.pxPerMm;
  canvas.width = Math.ceil(dl.width * k);
  canvas.height = Math.ceil(dl.height * k);
  const g = canvas.getContext('2d')!;
  g.clearRect(0, 0, canvas.width, canvas.height);

  const printable = dl.panels.filter((p) => p.kind !== 'glue');
  const clipAll = () => (dl.sector ? sectorPath(g, dl, k) : rectPath(g, printable, k));

  // board colour
  g.save();
  clipAll();
  g.fillStyle = design.bgColor;
  g.fill();
  g.clip();
  if (design.whole) {
    const img = images.get(design.whole.src);
    if (img) drawArtwork(g, img, design.whole, 0, 0, dl.width, dl.height, k);
  }
  g.restore();

  for (const [panelId, art] of Object.entries(design.perPanel)) {
    const p = dl.panels.find((x) => x.id === panelId);
    const img = images.get(art.src);
    if (!p || !img) continue;
    g.save();
    if (dl.sector) sectorPath(g, dl, k);
    else rectPath(g, [p], k);
    g.clip();
    drawArtwork(g, img, art, p.x, p.y, p.w, p.h, k);
    g.restore();
  }

  // glue tabs stay raw board
  for (const p of dl.panels.filter((x) => x.kind === 'glue')) {
    g.fillStyle = '#B9966C';
    g.fillRect(p.x * k, p.y * k, p.w * k, p.h * k);
  }

  if (opts.overlay) drawOverlay(g, dl, k, opts.selectedPanel ?? null);
}

function drawOverlay(g: CanvasRenderingContext2D, dl: Dieline, k: number, selected: string | null) {
  g.save();
  g.lineWidth = Math.max(1, k * 0.5);
  if (dl.sector) {
    sectorPath(g, dl, k);
    g.strokeStyle = '#C2552E';
    g.stroke();
  }
  for (const p of dl.panels) {
    const x = p.x * k;
    const y = p.y * k;
    const w = p.w * k;
    const h = p.h * k;
    if (p.kind !== 'print') {
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(x, y, w, h);
    }
    if (!dl.sector) {
      g.setLineDash(p.kind === 'print' ? [] : [6, 4]);
      g.strokeStyle = p.kind === 'print' ? 'rgba(194,85,46,0.9)' : 'rgba(60,60,60,0.6)';
      g.strokeRect(x, y, w, h);
    }
    if (selected === p.id) {
      g.setLineDash([]);
      g.lineWidth = Math.max(3, k * 1.2);
      g.strokeStyle = '#2563eb';
      g.strokeRect(x + 1, y + 1, w - 2, h - 2);
      g.lineWidth = Math.max(1, k * 0.5);
    }
    // small tag in the panel's top-left corner so it never hides the artwork
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fs = Math.round(Math.min(11 * dpr, h * 0.45, w / 5));
    if (fs >= 7) {
      g.setLineDash([]);
      g.font = `600 ${fs}px Inter, sans-serif`;
      const tw = g.measureText(p.label).width;
      const pad = 3 * dpr;
      const lx = dl.sector ? x + w / 2 - tw / 2 - pad : x + pad;
      const ly = dl.sector ? y + h - fs - pad * 4 : y + pad;
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.fillRect(lx, ly, tw + pad * 2, fs + pad * 1.5);
      g.fillStyle = '#1B1B18';
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillText(p.label, lx + pad, ly + pad * 0.8);
    }
  }
  for (const m of dl.marks ?? []) {
    g.setLineDash([]);
    g.lineWidth = Math.max(1.5, k * 0.6);
    g.strokeStyle = '#C2552E';
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.beginPath();
    g.ellipse(m.cx * k, m.cy * k, m.rx * k, m.ry * k, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
  g.restore();
}

/** Crops one panel out of a rendered dieline for use as a face texture. */
export function cropPanel(src: HTMLCanvasElement, p: Panel, k: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(p.w * k));
  c.height = Math.max(2, Math.round(p.h * k));
  c.getContext('2d')!.drawImage(src, p.x * k, p.y * k, p.w * k, p.h * k, 0, 0, c.width, c.height);
  return c;
}

/**
 * Unwarps the cup's annular sector into a rectangle so it can wrap a
 * CylinderGeometry: u runs around the cup, v from top rim down to the base.
 */
export function unwarpSector(src: HTMLCanvasElement, dl: Dieline, k: number, outW = 1024): HTMLCanvasElement {
  const s = dl.sector!;
  const slant = s.R - s.r;
  const outH = Math.max(64, Math.round((outW * slant) / (s.theta * s.R)));
  const sw = src.width;
  const sh = src.height;
  const srcData = src.getContext('2d')!.getImageData(0, 0, sw, sh).data;
  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const og = out.getContext('2d')!;
  const img = og.createImageData(outW, outH);
  const d = img.data;
  for (let j = 0; j < outH; j++) {
    const rho = s.R - (j / (outH - 1)) * slant;
    for (let i = 0; i < outW; i++) {
      const phi = (i / (outW - 1) - 0.5) * s.theta;
      const x = Math.round((s.cx + rho * Math.sin(phi)) * k);
      const y = Math.round((s.cy - rho * Math.cos(phi)) * k);
      const o = (j * outW + i) * 4;
      if (x < 0 || y < 0 || x >= sw || y >= sh) continue;
      const si = (y * sw + x) * 4;
      d[o] = srcData[si];
      d[o + 1] = srcData[si + 1];
      d[o + 2] = srcData[si + 2];
      d[o + 3] = 255;
    }
  }
  og.putImageData(img, 0, 0);
  return out;
}
