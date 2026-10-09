import type { Dims, Product, ProductId, ProductStyle, StyleId, ViewControl } from '../types';

const OPEN = (label: string, from = 'Closed', to = 'Open'): ViewControl => ({ key: 'open', label, from, to });

export const PRODUCTS: Product[] = [
  {
    id: 'rigid-box',
    name: 'Rigid Box',
    short: 'Premium box: lid, drawer, magnetic or foldable',
    blurb: 'Greyboard wrapped in printed paper. The unboxing moment for skincare, jewellery, gifting and launch kits.',
    useCases: ['Skincare & beauty', 'Jewellery', 'Gift hampers', 'PR kits'],
    materials: [
      { id: 'kraft-wrap', label: 'Greyboard + kraft wrap', multiplier: 1, note: 'Natural, earthy look' },
      { id: 'art-wrap', label: 'Greyboard + art paper wrap', multiplier: 1.1, note: 'Bright, sharp print' },
      { id: 'seed-wrap', label: 'Greyboard + seed paper lid', multiplier: 1.35, note: 'Lid can be planted' },
    ],
    finishes: [
      { id: 'plain', label: 'Plain (water-based ink)', multiplier: 1, note: 'No coating' },
      { id: 'aqueous', label: 'Aqueous matte coat', multiplier: 1.08, note: 'Soft-touch matte' },
      { id: 'foil', label: 'Gold foil logo', multiplier: 1.25, note: 'Metallic highlight' },
      { id: 'emboss', label: 'Blind emboss', multiplier: 1.2, note: 'No ink, raised logo' },
    ],
    dims: [
      { key: 'L', label: 'Length', min: 60, max: 400, default: 200 },
      { key: 'W', label: 'Width', min: 60, max: 300, default: 150 },
      { key: 'H', label: 'Depth / Height', min: 30, max: 200, default: 80 },
    ],
    styles: [
      {
        id: 'lid-base',
        name: 'Top & bottom (lid & base)',
        blurb: 'Two-piece box. The lid lifts straight off the base.',
        opening: 'Lid lifts off',
        priceFactor: 1,
        controls: [OPEN('Lift the lid', 'Closed', 'Lifted')],
      },
      {
        id: 'drawer',
        name: 'Drawer / sleeve',
        blurb: 'A tray that slides out of a printed outer sleeve.',
        opening: 'Tray slides out',
        priceFactor: 1.18,
        controls: [OPEN('Slide the drawer', 'Closed', 'Pulled out')],
      },
      {
        id: 'collapsible',
        name: 'Collapsible / foldable',
        blurb: 'Walls fold flat for storage and shipping. Flip-open lid.',
        opening: 'Folds flat · flip lid',
        priceFactor: 1.12,
        controls: [{ key: 'fold', label: 'Fold flat', from: 'Assembled', to: 'Flat' }, OPEN('Open the lid')],
      },
      {
        id: 'magnetic',
        name: 'Magnetic closure',
        blurb: 'Hinged flip-top lid held shut by hidden magnets.',
        opening: 'Flip-top · magnets',
        priceFactor: 1.22,
        controls: [OPEN('Flip the lid')],
      },
      {
        id: 'custom',
        name: 'Other / custom opening',
        blurb: 'Shoulder-neck, book-fold, window… tell us the opening you have in mind.',
        opening: 'You describe it',
        priceFactor: 1.3,
        controls: [OPEN('Lift the lid', 'Closed', 'Lifted')],
        freeText: true,
      },
    ],
    basePrice: 40,
    areaRate: 1.2,
  },
  {
    id: 'corrugated',
    name: 'Corrugated Box',
    short: 'Shipping carton, mailer or telescopic box',
    blurb: 'Strong corrugated boxes for e-commerce and shipping. Print outside, inside or both.',
    useCases: ['E-commerce shipping', 'Subscription boxes', 'Product launches'],
    materials: [
      { id: '3ply-kraft', label: '3-ply natural kraft', multiplier: 1, note: 'Everyday strength' },
      { id: '3ply-white', label: '3-ply white top', multiplier: 1.12, note: 'Better colour reproduction' },
      { id: '5ply-kraft', label: '5-ply natural kraft', multiplier: 1.3, note: 'For heavy goods' },
    ],
    finishes: [
      { id: 'plain', label: 'Flexo, water-based ink', multiplier: 1, note: 'Up to 2 colours' },
      { id: 'digital', label: 'Full-colour digital', multiplier: 1.15, note: 'Photo-quality print' },
      { id: 'inside', label: 'Outside + inside print', multiplier: 1.35, note: 'Surprise message inside' },
    ],
    dims: [
      { key: 'L', label: 'Length', min: 100, max: 600, default: 300 },
      { key: 'W', label: 'Width', min: 80, max: 400, default: 200 },
      { key: 'H', label: 'Depth / Height', min: 50, max: 400, default: 150 },
    ],
    styles: [
      {
        id: 'rsc',
        name: 'Shipping carton (RSC)',
        blurb: 'Regular slotted carton. Four flaps fold shut and are taped.',
        opening: 'Four flaps',
        priceFactor: 1,
        controls: [OPEN('Open the flaps', 'Closed', 'Open')],
      },
      {
        id: 'mailer',
        name: 'Mailer box (tuck-top)',
        blurb: 'Hinged lid with a tuck-in front flap. No tape needed.',
        opening: 'Hinged lid · tuck',
        priceFactor: 1.25,
        controls: [OPEN('Open the lid')],
      },
      {
        id: 'telescopic',
        name: 'Lid & base (telescopic)',
        blurb: 'Deep full-overlap lid that lifts off the tray.',
        opening: 'Lid lifts off',
        priceFactor: 1.3,
        controls: [OPEN('Lift the lid', 'Closed', 'Lifted')],
      },
    ],
    basePrice: 15,
    areaRate: 0.2,
  },
  {
    id: 'mono-carton',
    name: 'Mono Carton',
    short: 'Tuck-end, hang-tab, sleeve or drawer carton',
    blurb: 'Single-wall paperboard cartons for retail shelves: cosmetics, tea, supplements, candles.',
    useCases: ['Cosmetics', 'Tea & coffee', 'Supplements', 'Candles'],
    materials: [
      { id: 'sbs', label: '300 GSM SBS board', multiplier: 1, note: 'Smooth, bright white' },
      { id: 'fbb-recycled', label: '350 GSM recycled FBB', multiplier: 1.05, note: 'Stiff, cream back' },
      { id: 'kraft', label: '350 GSM kraft board', multiplier: 1.08, note: 'Natural brown look' },
    ],
    finishes: [
      { id: 'plain', label: 'Plain (soy-based ink)', multiplier: 1, note: 'No coating' },
      { id: 'aqueous', label: 'Aqueous gloss/matte', multiplier: 1.07, note: 'Scuff-resistant coat' },
      { id: 'spot-uv', label: 'Spot UV logo', multiplier: 1.18, note: 'Highlight a single element' },
    ],
    dims: [
      { key: 'L', label: 'Length', min: 30, max: 200, default: 60 },
      { key: 'W', label: 'Width', min: 20, max: 150, default: 40 },
      { key: 'H', label: 'Depth / Height', min: 40, max: 300, default: 150 },
    ],
    styles: [
      {
        id: 'straight-tuck',
        name: 'Tuck-end carton',
        blurb: 'The classic. Lid hinged at the back, tucks into the front.',
        opening: 'Tuck-in lid',
        priceFactor: 1,
        controls: [OPEN('Open the lid')],
      },
      {
        id: 'hang-tab',
        name: 'Hang-tab carton',
        blurb: 'Tuck-end carton with a punched tab for peg-hook displays.',
        opening: 'Tuck-in lid · hang tab',
        priceFactor: 1.1,
        dims: { L: 70, W: 25, H: 110 },
        controls: [OPEN('Open the lid')],
      },
      {
        id: 'sleeve',
        name: 'Open-ended sleeve',
        blurb: 'A printed tube that slides over a product or tray.',
        opening: 'Slides off',
        priceFactor: 0.8,
        controls: [OPEN('Slide the sleeve', 'On', 'Off')],
      },
      {
        id: 'tray-sleeve',
        name: 'Drawer (tray & sleeve)',
        blurb: 'Matchbox-style tray that slides out of a sleeve.',
        opening: 'Tray slides out',
        priceFactor: 1.2,
        dims: { L: 100, W: 60, H: 45 },
        controls: [OPEN('Slide the drawer', 'Closed', 'Pulled out')],
      },
    ],
    basePrice: 10,
    areaRate: 0.6,
  },
  {
    id: 'paper-cup',
    name: 'Paper Cup',
    short: 'Hot, sip-lid, cold-dome or ripple-wall cup',
    blurb: 'Branded hot & cold cups for cafés, cloud kitchens and events.',
    useCases: ['Cafés', 'Cloud kitchens', 'Events', 'Office pantries'],
    materials: [
      { id: 'aqueous-lined', label: 'Aqueous-lined cupstock', multiplier: 1, note: 'Standard hot & cold drinks' },
      { id: 'pla-lined', label: 'PLA-lined cupstock', multiplier: 1.15, note: 'Bio-based lining' },
      { id: 'double-wall', label: 'Double wall (no sleeve)', multiplier: 1.4, note: 'Insulated for hot drinks' },
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
    styles: [
      {
        id: 'hot',
        name: 'Hot cup (open top)',
        blurb: 'Single-wall open-top cup for coffee and tea.',
        opening: 'Open top',
        priceFactor: 1,
        controls: [],
      },
      {
        id: 'sip-lid',
        name: 'Hot cup with sip lid',
        blurb: 'Snap-on lid with a drinking opening.',
        opening: 'Snap-on sip lid',
        priceFactor: 1.15,
        controls: [OPEN('Lift the lid', 'On', 'Off')],
      },
      {
        id: 'cold-dome',
        name: 'Cold cup, dome lid & straw',
        blurb: 'Wider, straighter cup with a domed lid and straw slot.',
        opening: 'Dome lid · straw',
        priceFactor: 1.25,
        dims: { topDia: 92, botDia: 62, H: 120 },
        controls: [OPEN('Lift the lid', 'On', 'Off')],
      },
      {
        id: 'ripple',
        name: 'Ripple-wall hot cup',
        blurb: 'Grippy rippled outer wall that insulates without a sleeve.',
        opening: 'Open top',
        priceFactor: 1.3,
        controls: [],
      },
    ],
    basePrice: 4,
    areaRate: 0.4,
  },
  {
    id: 'paper-bag',
    name: 'Paper Bag',
    short: 'Twisted, flat, rope or die-cut handle bags',
    blurb: 'Kraft or white paper bags for retail, food and gifting, with the handle style that suits your brand.',
    useCases: ['Fashion retail', 'Bakeries', 'Pop-up stores', 'Gifting'],
    materials: [
      { id: 'kraft-120', label: '120 GSM brown kraft', multiplier: 1, note: 'Classic carry-bag paper' },
      { id: 'white-120', label: '120 GSM white kraft', multiplier: 1.08, note: 'Brighter print' },
      { id: 'kraft-170', label: '170 GSM heavy kraft', multiplier: 1.2, note: 'Carries up to 8 kg' },
    ],
    finishes: [
      { id: 'plain', label: 'Flexo, water-based ink', multiplier: 1, note: 'Up to 2 colours' },
      { id: 'digital', label: 'Full-colour digital', multiplier: 1.15, note: 'Photo-quality print' },
      { id: 'foil', label: 'Foil logo', multiplier: 1.22, note: 'Premium look' },
    ],
    dims: [
      { key: 'L', label: 'Width', min: 150, max: 450, default: 250 },
      { key: 'W', label: 'Gusset (depth)', min: 60, max: 200, default: 100 },
      { key: 'H', label: 'Height', min: 150, max: 500, default: 320 },
    ],
    styles: [
      {
        id: 'twisted',
        name: 'Twisted-handle bag',
        blurb: 'Twisted paper-rope handles glued inside the mouth.',
        opening: 'Twisted handles',
        priceFactor: 1,
        controls: [],
      },
      {
        id: 'flat',
        name: 'Flat-handle bag',
        blurb: 'Flat paper handles, the everyday retail carry bag.',
        opening: 'Flat handles',
        priceFactor: 1.05,
        controls: [],
      },
      {
        id: 'rope',
        name: 'Rope-handle bag (boutique)',
        blurb: 'Cotton rope threaded through metal eyelets.',
        opening: 'Rope + eyelets',
        priceFactor: 1.3,
        controls: [],
      },
      {
        id: 'die-cut',
        name: 'Die-cut handle bag',
        blurb: 'Handle cut straight into the bag mouth. Lowest cost.',
        opening: 'Cut-out handle',
        priceFactor: 0.95,
        controls: [],
      },
      {
        id: 'sos',
        name: 'Open-mouth bag (no handle)',
        blurb: 'Flat-bottom SOS bag for bakery and small items.',
        opening: 'Open mouth',
        priceFactor: 0.75,
        dims: { L: 150, W: 90, H: 250 },
        controls: [],
      },
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

/** The style with this id, or the product's first style when missing / unknown (older saved items). */
export function getStyle(p: Product, styleId?: StyleId): ProductStyle {
  return p.styles.find((s) => s.id === styleId) ?? p.styles[0];
}

export function isStyleId(p: Product, id: string | undefined): id is StyleId {
  return !!id && p.styles.some((s) => s.id === id);
}

export function defaultDims(p: Product, styleId?: StyleId): Dims {
  const d: Dims = { L: 0, W: 0, H: 0, topDia: 0, botDia: 0 };
  for (const s of p.dims) d[s.key] = s.default;
  const over = getStyle(p, styleId).dims;
  if (over) for (const k of Object.keys(over) as (keyof Dims)[]) d[k] = over[k] ?? d[k];
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

/** "Rigid Box" → "Rigid Boxes", "Paper Cup" → "Paper Cups". */
export const plural = (name: string) => (/(x|s|ch|sh)$/.test(name) ? `${name}es` : `${name}s`);
