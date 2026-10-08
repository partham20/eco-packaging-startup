import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Customer, Order, OrderStatus, Shipment } from '../types';
import { awb, orderId, randomCode } from '../lib/ids';
import { cartTotals, lineTotal, unitPrice } from '../lib/pricing';
import { FACTORY_CITY, MAIN_FLOW, SAMPLE_FLOW, STATUS_META } from '../data/status';

interface OrderState {
  orders: Order[];
  place: (customer: Customer, items: CartItem[]) => Order;
  advance: (orderId: string, kind: Shipment['kind'], note?: string) => void;
  addCheckpoint: (orderId: string, kind: Shipment['kind'], city: string, note?: string) => void;
  replaceAll: (orders: Order[]) => void;
}

export function flowFor(kind: Shipment['kind']) {
  return kind === 'main' ? MAIN_FLOW : SAMPLE_FLOW;
}

export function nextStatus(s: Shipment): OrderStatus | null {
  const flow = flowFor(s.kind);
  const i = flow.indexOf(s.status);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null;
}

export function findOrder(orders: Order[], id: string, contact: string): Order | undefined {
  const c = contact.trim().toLowerCase();
  const digits = c.replace(/\D/g, '');
  return orders.find(
    (o) =>
      o.id.toLowerCase() === id.trim().toLowerCase() &&
      (o.customer.email.toLowerCase() === c || (digits.length >= 10 && o.customer.phone.replace(/\D/g, '').endsWith(digits.slice(-10)))),
  );
}

export function etaFor(o: Order, kind: Shipment['kind']) {
  const days = kind === 'main' ? 7 : 3;
  return new Date(new Date(o.createdAt).getTime() + days * 864e5);
}

function updateShipment(orders: Order[], id: string, kind: Shipment['kind'], fn: (s: Shipment) => Shipment) {
  return orders.map((o) => (o.id === id ? { ...o, shipments: o.shipments.map((s) => (s.kind === kind ? fn(s) : s)) } : o));
}

export const useOrders = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (customer, items) => {
        const now = new Date().toISOString();
        const totals = cartTotals(items);
        const shipments: Shipment[] = [
          { kind: 'main', awb: awb(), status: 'placed', events: [{ status: 'placed', at: now, city: FACTORY_CITY }] },
        ];
        if (items.some((i) => i.freeSample))
          shipments.push({
            kind: 'sample',
            awb: awb(),
            status: 'placed',
            events: [{ status: 'placed', at: now, city: FACTORY_CITY, note: 'Free sample queued for same-day digital print.' }],
          });
        const order: Order = {
          id: orderId(),
          createdAt: now,
          customer,
          items: items.map((i) => ({ ...i, unitPrice: unitPrice(i, i.qty), lineTotal: lineTotal(i) })),
          ...totals,
          paymentRef: `pay_${randomCode(12)}`,
          shipments,
        };
        set({ orders: [order, ...get().orders] });
        return order;
      },
      advance: (id, kind, note) =>
        set({
          orders: updateShipment(get().orders, id, kind, (s) => {
            const next = nextStatus(s);
            if (!next) return s;
            const city =
              next === 'out_for_delivery' || next === 'delivered'
                ? get().orders.find((o) => o.id === id)?.customer.city
                : next === 'in_transit'
                  ? s.events[s.events.length - 1]?.city ?? FACTORY_CITY
                  : FACTORY_CITY;
            return {
              ...s,
              status: next,
              events: [...s.events, { status: next, at: new Date().toISOString(), city, note: note || STATUS_META[next].desc }],
            };
          }),
        }),
      addCheckpoint: (id, kind, city, note) =>
        set({
          orders: updateShipment(get().orders, id, kind, (s) => ({
            ...s,
            status: 'in_transit',
            events: [...s.events, { status: 'in_transit', at: new Date().toISOString(), city, note: note || `Arrived at ${city} hub` }],
          })),
        }),
      replaceAll: (orders) => set({ orders }),
    }),
    { name: 'petti.orders' },
  ),
);
