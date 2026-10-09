import type { Lead, Order, QuoteRequest, StatusEvent } from '../types';
import { useOrders } from '../store/orderStore';
import { useLeads } from '../store/leadStore';
import { useRequests } from '../store/requestStore';
import { STATUS_META } from './status';
import { defaultDims, getProduct } from './products';
import { lineTotal, unitPrice, cartTotals } from '../lib/pricing';

const SEED_KEY = 'petti.seeded.v1';
const SEED_REQUESTS_KEY = 'petti.seeded.requests.v1';

const ago = (h: number) => new Date(Date.now() - h * 36e5).toISOString();
const ev = (status: StatusEvent['status'], hoursAgo: number, city: string, note?: string): StatusEvent => ({
  status,
  at: ago(hoursAgo),
  city,
  note: note ?? STATUS_META[status].desc,
});

function line(productId: 'rigid-box' | 'paper-cup' | 'mono-carton', qty: number, freeSample: boolean) {
  const p = getProduct(productId);
  const item = {
    id: `${productId}-${qty}`,
    productId,
    dims: defaultDims(p),
    materialId: p.materials[0].id,
    finishId: p.finishes[1]?.id ?? p.finishes[0].id,
    qty,
    freeSample,
    hasArtwork: true,
  };
  return { ...item, unitPrice: unitPrice(item, qty), lineTotal: lineTotal(item) };
}

export function demoOrders(): Order[] {
  const itemsA = [line('rigid-box', 40, true), line('mono-carton', 120, true)];
  const itemsB = [line('paper-cup', 500, false)];
  return [
    {
      id: 'PT-DEMO01',
      createdAt: ago(80),
      customer: {
        name: 'Nila Raghavan',
        email: 'nila@kaadhalskin.in',
        phone: '9876543210',
        company: 'Kaadhal Skin Co.',
        address: '14, 2nd Cross, Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
      },
      items: itemsA,
      ...cartTotals(itemsA),
      paymentRef: 'pay_DEMO1PAYMENT',
      shipments: [
        {
          kind: 'sample',
          awb: 'PTX5550001001',
          status: 'delivered',
          events: [
            ev('placed', 80, 'Chennai'),
            ev('packed', 74, 'Chennai', 'Digital sample printed and packed.'),
            ev('shipped', 70, 'Chennai'),
            ev('in_transit', 60, 'Krishnagiri', 'Crossed Krishnagiri sort centre'),
            ev('out_for_delivery', 54, 'Bengaluru'),
            ev('delivered', 50, 'Bengaluru', 'Received by Nila. Sample approved on call.'),
          ],
        },
        {
          kind: 'main',
          awb: 'PTX5550001002',
          status: 'printing',
          events: [
            ev('placed', 80, 'Chennai'),
            ev('artwork_approved', 46, 'Chennai', 'Approved after customer signed off on the sample.'),
            ev('printing', 6, 'Chennai', 'On press — 160 units, 2-colour + gold foil.'),
          ],
        },
      ],
    },
    {
      id: 'PT-DEMO02',
      createdAt: ago(150),
      customer: {
        name: 'Arjun Mehta',
        email: 'arjun@chaipetti.com',
        phone: '9123456780',
        company: 'Chai Petti Café',
        address: 'Plot 22, Jubilee Hills Road No. 36',
        city: 'Hyderabad',
        pincode: '500033',
      },
      items: itemsB,
      ...cartTotals(itemsB),
      paymentRef: 'pay_DEMO2PAYMENT',
      shipments: [
        {
          kind: 'main',
          awb: 'PTX5550002001',
          status: 'in_transit',
          events: [
            ev('placed', 150, 'Chennai'),
            ev('artwork_approved', 140, 'Chennai'),
            ev('printing', 110, 'Chennai'),
            ev('die_cutting', 90, 'Chennai', 'Fans cut and cups formed.'),
            ev('qc', 70, 'Chennai', 'Leak test and print check passed.'),
            ev('packed', 52, 'Chennai', 'Packed in 10 sleeves of 50 cups.'),
            ev('shipped', 40, 'Chennai'),
            ev('in_transit', 28, 'Bengaluru', 'Arrived at Bengaluru hub'),
            ev('in_transit', 9, 'Kurnool', 'Arrived at Kurnool sort centre'),
          ],
        },
      ],
    },
  ];
}

export function demoLeads(): Lead[] {
  return [
    {
      id: 'LD-DEMO01',
      createdAt: ago(20),
      name: 'Fathima Rizwan',
      designation: 'Founder',
      company: 'Saffron Crumbs Bakery',
      address: 'RS Puram, Coimbatore 641002',
      email: 'fathima@saffroncrumbs.in',
      phone: '9840012345',
      productInterest: ['paper-bag', 'mono-carton'],
      monthlyQty: '100–500',
      message: 'Need cake boxes and bags for Diwali gifting. Can we get 3 sizes?',
      source: 'quote',
    },
    {
      id: 'LD-DEMO02',
      createdAt: ago(44),
      name: 'Rohan Kapoor',
      designation: 'Ops Manager',
      company: 'Thread & Loom',
      address: 'Sector 44, Gurugram 122003',
      email: 'rohan@threadloom.co',
      phone: '9811198111',
      productInterest: ['corrugated'],
      monthlyQty: '1,000–5,000',
      message: 'Moving to printed shipping cartons for our next pilot batch.',
      source: 'quote',
    },
    {
      id: 'LD-DEMO03',
      createdAt: ago(70),
      name: 'Meera Iyer',
      designation: 'Co-founder',
      company: 'Kuzhal Candles',
      address: 'Adyar, Chennai 600020',
      email: 'meera@kuzhal.in',
      phone: '9003090030',
      productInterest: [],
      monthlyQty: 'Just starting',
      message: '',
      source: 'starter-kit',
    },
  ];
}

function reqSpec(productId: 'paper-cup' | 'mono-carton', styleId: string, qty: number) {
  const p = getProduct(productId);
  return { productId, styleId, dims: defaultDims(p, styleId), materialId: p.materials[0].id, finishId: p.finishes[0].id, qty };
}

export function demoRequests(): QuoteRequest[] {
  const a = reqSpec('paper-cup', 'cold-dome', 60);
  const b = reqSpec('mono-carton', 'hang-tab', 25);
  const reqEv = (status: QuoteRequest['status'], hoursAgo: number, note: string) => ({ at: ago(hoursAgo), status, note });
  const printFile = (name: string) => ({ name, type: 'image/jpeg', size: 214_000, origin: 'design' as const });
  return [
    {
      id: 'QR-DEMO01',
      createdAt: ago(60),
      customer: {
        name: 'Ishaan Verma',
        designation: 'Co-founder',
        company: 'Brewline Cold Coffee',
        email: 'ishaan@brewline.co',
        phone: '9845012345',
        address: '7, Church Street, Shivajinagar',
        city: 'Bengaluru',
        pincode: '560001',
      },
      spec: { productId: a.productId, styleId: a.styleId, dims: a.dims, materialId: a.materialId, finishId: a.finishId },
      qty: a.qty,
      volumeNote: 'Pilot launch, under 100',
      wantsSample: true,
      message: 'Testing the cup design at two pop-ups next month. Need the straw slot to line up with the lid.',
      files: [printFile('petti-paper-cup-cold-dome-print.jpg')],
      status: 'sample_sent',
      quotation: {
        unitPrice: unitPrice(a, a.qty),
        qty: a.qty,
        total: Math.round(unitPrice(a, a.qty) * a.qty * 100) / 100,
        leadTimeDays: 7,
        validUntil: new Date(Date.now() + 12 * 864e5).toISOString(),
        note: 'Price holds for up to 100 pieces. Sample first, then we print your pilot batch.',
      },
      sample: { courier: 'Delhivery', awb: 'PTX5550003001', dispatchedAt: ago(18) },
      events: [
        reqEv('new', 60, 'Quote and sample requested.'),
        reqEv('reviewing', 52, 'Our team is checking your specs and artwork.'),
        reqEv('quoted', 40, 'Price holds for up to 100 pieces. Sample first, then we print your pilot batch.'),
        reqEv('sample_sent', 18, 'Sample handed to Delhivery, tracking PTX5550003001.'),
      ],
    },
    {
      id: 'QR-DEMO02',
      createdAt: ago(3),
      customer: {
        name: 'Divya Menon',
        designation: 'Founder',
        company: 'Wild Roots Tea',
        email: 'divya@wildroots.in',
        phone: '9886098860',
        address: 'Kakkanad, Infopark Road',
        city: 'Kochi',
        pincode: '682030',
      },
      spec: { productId: b.productId, styleId: b.styleId, dims: b.dims, materialId: b.materialId, finishId: b.finishId },
      qty: b.qty,
      volumeNote: 'Just a prototype',
      wantsSample: true,
      message: 'Small peg-hook cartons for a retail trial in three stores.',
      files: [printFile('petti-mono-carton-hang-tab-print.jpg')],
      status: 'new',
      events: [reqEv('new', 3, 'Quote and sample requested.')],
    },
  ];
}

export function seedDemoData(force = false) {
  try {
    if (force || !localStorage.getItem(SEED_REQUESTS_KEY)) {
      const requests = useRequests.getState().requests.filter((r) => !r.id.startsWith('QR-DEMO'));
      useRequests.getState().replaceAll([...requests, ...demoRequests()]);
      localStorage.setItem(SEED_REQUESTS_KEY, '1');
    }
    if (!force && localStorage.getItem(SEED_KEY)) return;
    const orders = useOrders.getState().orders.filter((o) => !o.id.startsWith('PT-DEMO'));
    const leads = useLeads.getState().leads.filter((l) => !l.id.startsWith('LD-DEMO'));
    useOrders.getState().replaceAll([...orders, ...demoOrders()]);
    useLeads.getState().replaceAll([...leads, ...demoLeads()]);
    localStorage.setItem(SEED_KEY, '1');
  } catch {
    /* storage unavailable — app still works without demo data */
  }
}
