import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';
import { uid } from '../lib/ids';

export const MAX_CART_ITEMS = 10;

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, 'id'>) => void;
  setQty: (id: string, qty: number) => void;
  toggleSample: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        if (get().items.length >= MAX_CART_ITEMS) throw new Error(`Your cart can hold up to ${MAX_CART_ITEMS} designs. Check out or remove one first.`);
        set({ items: [...get().items, { ...item, id: uid() }] });
      },
      setQty: (id, qty) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(100000, Math.floor(qty) || 1)) } : i)) }),
      toggleSample: (id) => set({ items: get().items.map((i) => (i.id === id ? { ...i, freeSample: !i.freeSample } : i)) }),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'petti.cart' },
  ),
);
