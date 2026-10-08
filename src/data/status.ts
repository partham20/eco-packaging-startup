import type { OrderStatus } from '../types';

export const STATUS_META: Record<OrderStatus, { label: string; desc: string; phase: 'production' | 'delivery' }> = {
  placed: { label: 'Order placed', desc: 'Payment received and order logged.', phase: 'production' },
  artwork_approved: { label: 'Artwork approved', desc: 'Our pre-press team checked bleed, resolution and colours.', phase: 'production' },
  printing: { label: 'Printing', desc: 'Your design is on press with water-based inks.', phase: 'production' },
  die_cutting: { label: 'Die-cutting & assembly', desc: 'Sheets are cut, creased, folded and glued.', phase: 'production' },
  qc: { label: 'Quality check', desc: 'Colour, fold and strength inspection.', phase: 'production' },
  packed: { label: 'Packed', desc: 'Packed plastic-free and labelled for dispatch.', phase: 'production' },
  shipped: { label: 'Shipped', desc: 'Handed over to our courier partner.', phase: 'delivery' },
  in_transit: { label: 'In transit', desc: 'Moving through our hub network.', phase: 'delivery' },
  out_for_delivery: { label: 'Out for delivery', desc: 'With the delivery agent in your city.', phase: 'delivery' },
  delivered: { label: 'Delivered', desc: 'Delivered. Enjoy the unboxing!', phase: 'delivery' },
};

export const MAIN_FLOW: OrderStatus[] = [
  'placed',
  'artwork_approved',
  'printing',
  'die_cutting',
  'qc',
  'packed',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered',
];

/** Samples are printed digitally on the same day — no full production run. */
export const SAMPLE_FLOW: OrderStatus[] = ['placed', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];

export const HUBS = ['Chennai', 'Bengaluru', 'Coimbatore', 'Hyderabad', 'Mumbai', 'Pune', 'Nagpur', 'Delhi NCR', 'Kolkata', 'Ahmedabad', 'Kochi'];

export const FACTORY_CITY = 'Chennai';
