/** Read an uploaded file and downscale it so it fits comfortably in localStorage. */
export async function fileToDataUrl(file: File, max = 1024): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please upload an image file (PNG, JPG, SVG or WebP).');
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const k = Math.min(1, max / Math.max(img.naturalWidth || max, img.naturalHeight || max));
    const w = Math.max(1, Math.round((img.naturalWidth || max) * k));
    const h = Math.max(1, Math.round((img.naturalHeight || max) * k));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d')!.drawImage(img, 0, 0, w, h);
    // keep transparency for logos
    const keepAlpha = file.type === 'image/png' || file.type === 'image/svg+xml' || file.type === 'image/webp';
    return keepAlpha ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = src;
  });
}

/** Seamless repeating pattern used for the "try sample artwork" button. */
export function samplePattern(bg = '#1F3D2B', fg = '#C9A57B'): string {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = fg;
  g.fillStyle = fg;
  g.lineWidth = 3;
  const step = 64;
  for (let y = 0; y < c.height + step; y += step) {
    for (let x = 0; x < c.width + step; x += step) {
      const ox = (y / step) % 2 ? step / 2 : 0;
      g.save();
      g.translate(x + ox, y);
      g.rotate(-Math.PI / 4);
      g.beginPath();
      g.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2);
      g.globalAlpha = 0.55;
      g.stroke();
      g.beginPath();
      g.moveTo(-14, 0);
      g.lineTo(14, 0);
      g.stroke();
      g.restore();
    }
  }
  return c.toDataURL('image/jpeg', 0.85);
}

/** Transparent logo lockup with the brand name. */
export function sampleLogo(brand: string, color = '#F7F3EC'): string {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 400;
  const g = c.getContext('2d')!;
  g.fillStyle = color;
  g.strokeStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = 6;
  g.beginPath();
  g.arc(400, 110, 52, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(400, 75);
  g.quadraticCurveTo(440, 110, 400, 148);
  g.quadraticCurveTo(360, 110, 400, 75);
  g.fill();
  let size = 110;
  g.font = `600 ${size}px Fraunces, Georgia, serif`;
  while (g.measureText(brand).width > 740 && size > 30) {
    size -= 6;
    g.font = `600 ${size}px Fraunces, Georgia, serif`;
  }
  g.fillText(brand, 400, 250);
  g.font = '500 30px Inter, sans-serif';
  g.globalAlpha = 0.8;
  g.fillText('MADE WITH CARE · PLASTIC-FREE PACK', 400, 345);
  return c.toDataURL('image/png');
}

export function downloadBlob(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Shrink a canvas snapshot to a small JPEG thumbnail. */
export function shrinkCanvas(src: HTMLCanvasElement, max = 320): string {
  const k = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement('canvas');
  c.width = Math.round(src.width * k);
  c.height = Math.round(src.height * k);
  const g = c.getContext('2d')!;
  g.fillStyle = '#F7F3EC';
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8);
}
