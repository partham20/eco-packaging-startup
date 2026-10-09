import { buildDieline, dielineArea } from '../data/dielines';
import { getProduct, getStyle } from '../data/products';
import type { CartItem, Dims, ProductId, StyleId } from '../types';

/** Placeholder rate — confirm the GST rate for each product's HSN code before going live. */
export const GST_RATE = 0.18;
export const FREE_SHIPPING_ABOVE = 999;
export const SHIPPING_FEE = 79;

export const TIERS: { min: number; factor: number }[] = [
  { min: 1, factor: 1 },
  { min: 10, factor: 0.93 },
  { min: 50, factor: 0.85 },
  { min: 100, factor: 0.75 },
  { min: 250, factor: 0.65 },
  { min: 500, factor: 0.55 },
  { min: 1000, factor: 0.45 },
];

export function tierFor(qty: number) {
  let t = TIERS[0];
  for (const x of TIERS) if (qty >= x.min) t = x;
  return t;
}

export interface PriceSpec {
  productId: ProductId;
  styleId?: StyleId;
  dims: Dims;
  materialId: string;
  finishId: string;
}

export function baseUnitPrice(spec: PriceSpec): number {
  const p = getProduct(spec.productId);
  const style = getStyle(p, spec.styleId);
  const area = dielineArea(buildDieline(spec.productId, spec.dims, style.id));
  const mat = p.materials.find((m) => m.id === spec.materialId)?.multiplier ?? 1;
  const fin = p.finishes.find((f) => f.id === spec.finishId)?.multiplier ?? 1;
  return (p.basePrice + (p.areaRate * area) / 1000) * mat * fin * style.priceFactor;
}

export function unitPrice(spec: PriceSpec, qty: number): number {
  const u = baseUnitPrice(spec) * tierFor(qty).factor;
  return u < 20 ? Math.round(u * 100) / 100 : Math.round(u);
}

export function lineTotal(item: CartItem): number {
  return Math.round(unitPrice(item, item.qty) * item.qty * 100) / 100;
}

export function cartTotals(items: CartItem[]) {
  const subtotal = Math.round(items.reduce((a, i) => a + lineTotal(i), 0) * 100) / 100;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const gst = Math.round((subtotal + shipping) * GST_RATE * 100) / 100;
  return { subtotal, shipping, gst, total: Math.round((subtotal + shipping + gst) * 100) / 100 };
}

export const inr = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
