import { Coffee, Cookie, Croissant, Dumbbell, Flame, Gem, Gift, HeartPulse, Leaf, PawPrint, Pill, Shirt, ShoppingBag, Smartphone, Soup, Sparkles, Sprout, Wine, type LucideIcon } from 'lucide-react';
import type { ProductId } from '../types';

export interface Industry {
  name: string;
  icon: LucideIcon;
  /** Pack we usually suggest first for this category. */
  product: ProductId;
  tint: 'blush' | 'sage' | 'cream';
}

export const INDUSTRIES: Industry[] = [
  { name: 'Beauty & Skincare', icon: Sparkles, product: 'mono-carton', tint: 'blush' },
  { name: 'Ayurveda & Wellness', icon: Leaf, product: 'mono-carton', tint: 'sage' },
  { name: 'Coffee & Tea', icon: Coffee, product: 'paper-cup', tint: 'cream' },
  { name: 'Candles', icon: Flame, product: 'rigid-box', tint: 'blush' },
  { name: 'Jewellery', icon: Gem, product: 'rigid-box', tint: 'blush' },
  { name: 'Gifting & Hampers', icon: Gift, product: 'rigid-box', tint: 'cream' },
  { name: 'Food & Cloud Kitchens', icon: Soup, product: 'paper-bag', tint: 'sage' },
  { name: 'Bakery & Sweets', icon: Croissant, product: 'mono-carton', tint: 'blush' },
  { name: 'Apparel', icon: Shirt, product: 'corrugated', tint: 'cream' },
  { name: 'Supplements', icon: Pill, product: 'mono-carton', tint: 'blush' },
  { name: 'Snacks', icon: Cookie, product: 'mono-carton', tint: 'cream' },
  { name: 'Pet Care', icon: PawPrint, product: 'corrugated', tint: 'sage' },
  { name: 'Beverages', icon: Wine, product: 'paper-cup', tint: 'blush' },
  { name: 'Retail & Boutiques', icon: ShoppingBag, product: 'paper-bag', tint: 'blush' },
  { name: 'Health', icon: HeartPulse, product: 'mono-carton', tint: 'sage' },
  { name: 'Electronics', icon: Smartphone, product: 'rigid-box', tint: 'cream' },
  { name: 'Fitness', icon: Dumbbell, product: 'corrugated', tint: 'blush' },
  { name: 'Plants & Gardening', icon: Sprout, product: 'corrugated', tint: 'sage' },
];
