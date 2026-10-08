import type { Dims, Product, ProductId } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'rigid-box',
    name: 'Rigid Box',
    short: 'Premium two-piece box with lid',
    blurb: 'Greyboard wrapped in printed paper. The unboxing moment for skincare, jewellery, gifting and launch kits.',
    useCases: ['Skincare & beauty', 'Jewellery', 'Gift hampers', 'PR kits'],
    materials: [
      { id: 'kraft-wrap', label: 'Greyboard + kraft wrap', multiplier: 1, note: '100% recycled board, plastic-free' },
      { id: 'art-wrap', label: 'Greyboard + art paper wrap', multiplier: 1.1, note: 'Bright print, recyclable' },
      { id: 'seed-wrap', label: 'Greyboard + seed paper lid', multiplier: 1.35, note: 'Lid can be planted' },
    ],
    finishes: [
      { id: 'plain', label: 'Plain (water-based ink)', multiplier: 1, note: 'No coating' },
      { id: 'aqueous', label: 'Aqueous matte coat', multiplier: 1.08, note: 'Plastic-free, recyclable' },
      { id: 'foil', label: 'Gold foil logo', multiplier: 1.25, note: 'Recyclable foil' },
      { id: 'emboss', label: 'Blind emboss', multiplier: 1.2, note: 'No ink, no coating' },
    ],
    dims: [
      { key: 'L', label: 'Length', min: 60, max: 400, default: 200 },
      { key: 'W', label: 'Width', min: 60, max: 300, default: 150 },
      { key: 'H', label: 'Height', min: 30, max: 200, default: 80 },
    ],
    basePrice: 40,
    areaRate: 1.2,
  },
  {
    id: 'corrugated',
    name: 'Corrugated Carton',
    short: 'Shipping box (RSC, 3-ply / 5-ply)',
    blurb: 'Strong regular slotted cartons for e-commerce shipping. Print inside, outside or both.',
    useCases: ['E-commerce shipping', 'Subscription boxes', 'Bulk transit'],
    materials: [
      { id: '3ply-kraft', label: '3-ply natural kraft', multiplier: 1, note: 'Recycled fibre' },
      { id: '3ply-white', label: '3-ply white top', multiplier: 1.12, note: 'Better colour reproduction' },
      { id: '5ply-kraft', label: '5-ply natural kraft', multiplier: 1.3, note: 'For heavy goods' },
    ],
    finishes: [
      { id: 'plain', label: 'Flexo, water-based ink', multiplier: 1, note: 'Most sustainable' },
      { id: 'digital', label: 'Full-colour digital', multiplier: 1.15, note: 'Photo-quality print' },
      { id: 'inside', label: 'Outside + inside print', multiplier: 1.35, note: 'Surprise message inside' },
    ],
    dims: [
      { key: 'L', label: 'Length', min: 100, max: 600, default: 300 },
      { key: 'W', label: 'Width', min: 80, max: 400, default: 200 },
      { key: 'H', label: 'Height', min: 50, max: 400, default: 150 },
    ],
    basePrice: 15,
    areaRate: 0.2,
  },
  {
    id: 'mono-carton',
    name: 'Mono Carton',
    short: 'Folding tuck-end carton',
    blurb: 'Single-wall paperboard cartons for retail shelves: cosmetics, tea, supplements, candles.',
    useCases: ['Cosmetics', 'Tea & coffee', 'Supplements', 'Candles'],
    materials: [
      { id: 'sbs', label: '300 GSM SBS board', multiplier: 1, note: 'Recyclable virgin fibre' },
      { id: 'fbb-recycled', label: '350 GSM recycled FBB', multiplier: 1.05, note: 'Recycled content' },
      { id: 'kraft', label: '350 GSM kraft board', multiplier: 1.08, note: 'Natural brown look' },
    ],
    finishes: [
      { id: 'plain', label: 'Plain (soy-based ink)', multiplier: 1, note: 'No coating' },
      { id: 'aqueous', label: 'Aqueous gloss/matte', multiplier: 1.07, note: 'Plastic-free coat' },
      { id: 'spot-uv', label: 'Spot UV logo', multiplier: 1.18, note: 'Highlight a single element' },
    ],
    dims: [
      { key: 'L', label: 'Length', min: 30, max: 200, default: 60 },
      { key: 'W', label: 'Width', min: 20, max: 150, default: 40 },
      { key: 'H', label: 'Height', min: 40, max: 300, default: 150 },
    ],
    basePrice: 10,
    areaRate: 0.6,
  },
  {
    id: 'paper-cup',
    name: 'Paper Cup',
    short: 'Single-wall printed cup',
    blurb: 'Branded hot & cold cups for cafés, cloud kitchens and events. Aqueous-lined, no PE plastic.',
    useCases: ['Cafés', 'Cloud kitchens', 'Events', 'Office pantries'],
    materials: [
      { id: 'aqueous-lined', label: 'Aqueous-lined cupstock', multiplier: 1, note: 'Plastic-free, repulpable' },
      { id: 'pla-lined', label: 'PLA-lined (compostable)', multiplier: 1.15, note: 'Industrial compost' },
      { id: 'double-wall', label: 'Double wall (no sleeve)', multiplier: 1.4, note: 'For hot drinks' },
    ],
    finishes: [
      { id: 'plain', label: 'Flexo, food-safe ink', multiplier: 1, note: 'Up to 4 colours' },
      { id: 'digital', label: 'Full-colour digital', multiplier: 1.12, note: 'Gradients & photos' },
    ],
    dims: [
      { key: 'topDia', label: 'Top diameter', min: 60, max: 100, default: 80 },
      { key: 'botDia', label: 'Bottom diameter', min: 40, max: 75, default: 56 },
      { key: 'H', label: 'Height', min: 60, max: 140, default: 92 },
    ],
    basePrice: 4,
    areaRate: 0.4,
  },
  {
    id: 'paper-bag',
    name: 'Paper Bag',
    short: 'Twisted-handle carry bag',
    blurb: 'Kraft or white paper bags with twisted paper handles for retail, food and gifting.',
    useCases: ['Fashion retail', 'Bakeries', 'Pop-up stores', 'Gifting'],
    materials: [
      { id: 'kraft-120', label: '120 GSM brown kraft', multiplier: 1, note: 'Recycled, recyclable' },
      { id: 'white-120', label: '120 GSM white kraft', multiplier: 1.08, note: 'Brighter print' },
      { id: 'kraft-170', label: '170 GSM heavy kraft', multiplier: 1.2, note: 'Carries up to 8 kg' },
    ],
    finishes: [
      { id: 'plain', label: 'Flexo, water-based ink', multiplier: 1, note: 'Most sustainable' },
      { id: 'digital', label: 'Full-colour digital', multiplier: 1.15, note: 'Photo-quality print' },
      { id: 'foil', label: 'Foil logo', multiplier: 1.22, note: 'Premium look' },
    ],
    dims: [
      { key: 'L', label: 'Width', min: 150, max: 450, default: 250 },
      { key: 'W', label: 'Gusset', min: 60, max: 200, default: 100 },
      { key: 'H', label: 'Height', min: 150, max: 500, default: 320 },
    ],
    basePrice: 10,
    areaRate: 0.14,
  },
];

export function getProduct(id: ProductId): Product {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown product ${id}`);
  return p;
}

export function isProductId(id: string | undefined): id is ProductId {
  return !!id && PRODUCTS.some((p) => p.id === id);
}

export function defaultDims(p: Product): Dims {
  const d: Dims = { L: 0, W: 0, H: 0, topDia: 0, botDia: 0 };
  for (const s of p.dims) d[s.key] = s.default;
  return d;
}

/** Clamp dims to the product's ranges and enforce cup taper. */
export function clampDims(p: Product, dims: Dims): Dims {
  const out = { ...dims };
  for (const s of p.dims) out[s.key] = Math.min(s.max, Math.max(s.min, Math.round(dims[s.key] || s.default)));
  if (p.id === 'paper-cup' && out.botDia > out.topDia - 10) out.botDia = out.topDia - 10;
  return out;
}

export function dimsLabel(p: Product, dims: Dims): string {
  return p.dims.map((s) => dims[s.key]).join(' × ') + ' mm';
}
