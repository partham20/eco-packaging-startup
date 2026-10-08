import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeads } from '../store/leadStore';
import { PRODUCTS, defaultDims, dimsLabel, getProduct } from '../data/products';
import { buildDieline, dielineSvg } from '../data/dielines';
import { downloadBlob } from '../lib/image';
import { inr, unitPrice } from '../lib/pricing';
import { Field, validEmail } from '../components/forms';
import ProductIcon from '../components/ProductIcon';
import type { ProductId } from '../types';

const KIT_KEY = 'petti.kit';

const SIZES: [string, ProductId, string][] = [
  ['30 ml serum / dropper bottle', 'mono-carton', '40 × 40 × 120'],
  ['50 g face-cream jar', 'mono-carton', '65 × 65 × 55'],
  ['100 g tea or coffee pouch', 'mono-carton', '90 × 50 × 160'],
  ['200 ml candle jar', 'rigid-box', '90 × 90 × 100'],
  ['Jewellery set (necklace + earrings)', 'rigid-box', '120 × 120 × 40'],
  ['Gift set: 2 × 250 ml bottles', 'rigid-box', '200 × 150 × 80'],
  ['Folded T-shirt', 'corrugated', '300 × 250 × 60'],
  ['Pair of sneakers', 'corrugated', '340 × 220 × 130'],
  ['8 oz (240 ml) coffee', 'paper-cup', '80 top / 56 base / 92 tall'],
  ['Boutique apparel carry bag', 'paper-bag', '250 × 100 × 320'],
];

function readUnlocked() {
  try {
    return localStorage.getItem(KIT_KEY) === '1';
  } catch {
    return false;
  }
}

export default function StarterKit() {
  const add = useLeads((s) => s.add);
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [f, setF] = useState({ name: '', email: '', company: '', phone: '' });
  const [err, setErr] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!f.name.trim()) x.name = 'Required';
    if (!validEmail(f.email)) x.email = 'Enter a valid email';
    if (!f.company.trim()) x.company = 'Required';
    setErr(x);
    if (Object.keys(x).length) return;
    add({ ...f, designation: '', address: '', productInterest: [], monthlyQty: 'Just starting', message: 'Downloaded the starter kit', source: 'starter-kit' });
    try {
      localStorage.setItem(KIT_KEY, '1');
    } catch {
      /* ignore */
    }
    setUnlocked(true);
  }

  if (!unlocked)
    return (
      <div className="container-x grid items-center gap-10 py-14 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Free download</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-forest sm:text-5xl">The Packaging Starter Kit for first-time founders</h1>
          <p className="mt-4 text-lg text-ink/70">Everything we wish someone had given us before we ordered our first box.</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ['5 blank dielines', 'Print-ready SVG templates for every format, for your designer or for Canva.'],
              ['Box-size cheat sheet', 'Tested sizes for 10 common D2C products, from serums to sneakers.'],
              ['Material guide', 'Which board, which coating, and what is actually recyclable in India.'],
              ['Budget planner', 'See how much cash a 1,000-piece MOQ locks up compared with ordering monthly.'],
            ].map(([t, d]) => (
              <li key={t} className="card p-4">
                <b className="text-forest">{t}</b>
                <p className="mt-1 text-sm text-ink/60">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submit} noValidate className="card space-y-4 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Where should we send it?</h2>
          <Field label="Your name" error={err.name}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
          <Field label="Email" error={err.email}><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
          <Field label="Brand / company" error={err.company}><input className="input" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoComplete="organization" /></Field>
          <Field label="Phone (optional)"><input className="input" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></Field>
          <button className="btn-accent w-full !py-3 text-base">Unlock the free kit →</button>
          <p className="text-center text-xs text-ink/50">Instant access. One useful email a month, unsubscribe anytime.</p>
        </form>
      </div>
    );

  return <KitContent />;
}

function KitContent() {
  const [orders, setOrders] = useState(100);
  const [pid, setPid] = useState<ProductId>('mono-carton');
  const p = getProduct(pid);
  const spec = { productId: pid, dims: defaultDims(p), materialId: p.materials[0].id, finishId: p.finishes[0].id };
  const pettiMonthly = unitPrice(spec, orders) * orders;
  const moqUpfront = unitPrice(spec, 1000) * 1000;
  const months = 1000 / Math.max(1, orders);

  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your starter kit</p>
          <h1 className="mt-2 text-4xl font-semibold text-forest">Packaging Starter Kit</h1>
        </div>
        <button className="btn-ghost no-print" onClick={() => window.print()}>Print / save as PDF</button>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">1. Blank dielines</h2>
        <p className="mt-1 text-sm text-ink/60">Default sizes, in mm. Need a custom size? Change the dimensions in the studio and download again.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PRODUCTS.map((x) => (
            <button
              key={x.id}
              className="card flex flex-col items-center gap-2 p-4 text-sm transition hover:shadow-md"
              onClick={() => downloadBlob(dielineSvg(buildDieline(x.id, defaultDims(x)), `${x.name} ${dimsLabel(x, defaultDims(x))}`), `petti-${x.id}-dieline.svg`, 'image/svg+xml')}
            >
              <ProductIcon id={x.id} className="h-12 w-12 text-forest" />
              <b>{x.name}</b>
              <span className="text-xs text-ink/50">{dimsLabel(x, defaultDims(x))}</span>
              <span className="text-xs font-semibold text-clay">⬇ SVG</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">2. Box-size cheat sheet</h2>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink/50">
              <tr><th className="p-3">Product</th><th className="p-3">Format</th><th className="p-3">Inner size (mm)</th></tr>
            </thead>
            <tbody>
              {SIZES.map(([item, id, size]) => (
                <tr key={item} className="border-t border-ink/5">
                  <td className="p-3">{item}</td>
                  <td className="p-3"><Link className="text-forest underline-offset-2 hover:underline" to={`/studio/${id}`}>{getProduct(id).name}</Link></td>
                  <td className="p-3 font-mono text-xs">{size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink/50">Rule of thumb: add 3–5 mm to each side of your product, plus room for any insert or crinkle paper.</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">3. Material guide</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((x) => (
            <div key={x.id} className="card p-5 text-sm">
              <b className="text-forest">{x.name}</b>
              <ul className="mt-2 space-y-1">
                {x.materials.map((m) => <li key={m.id}><span className="font-medium">{m.label}</span> · <span className="text-ink/60">{m.note}</span></li>)}
              </ul>
            </div>
          ))}
          <div className="card bg-forest p-5 text-sm text-paper">
            <b>Recyclability, in one line</b>
            <p className="mt-2 text-paper/80">Paper is recyclable until you laminate it with plastic film. Choose aqueous coatings, water-based inks and paper tape, and the whole pack can go in the paper bin.</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">4. Budget planner: MOQ vs. order-as-you-go</h2>
        <div className="card mt-4 grid gap-6 p-6 md:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="label">Format</span>
              <select className="input" value={pid} onChange={(e) => setPid(e.target.value as ProductId)}>
                {PRODUCTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Orders you ship per month: {orders}</span>
              <input type="range" min={10} max={1000} step={10} value={orders} onChange={(e) => setOrders(+e.target.value)} className="w-full accent-forest" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-paper p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Typical supplier (MOQ 1,000)</p>
              <p className="mt-2 font-display text-3xl font-bold">{inr(Math.round(moqUpfront))}</p>
              <p className="text-sm text-ink/60">paid upfront, lasting <b>{months.toFixed(months < 10 ? 1 : 0)} months</b> of stock</p>
            </div>
            <div className="rounded-xl bg-forest/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest">Petti, ordered monthly</p>
              <p className="mt-2 font-display text-3xl font-bold text-forest">{inr(Math.round(pettiMonthly))}<span className="text-base font-normal">/month</span></p>
              <p className="text-sm text-ink/60">{inr(unitPrice(spec, orders))} per piece at {orders} pieces. Change the design whenever you like.</p>
            </div>
            <p className="text-sm text-ink/70 sm:col-span-2">
              {moqUpfront > pettiMonthly
                ? <>Ordering monthly keeps <b>{inr(Math.round(moqUpfront - pettiMonthly))}</b> in your bank in month one. You can spend that on product, ads or runway.</>
                : <>At this volume, a bulk order makes sense. <Link className="underline" to="/quote">Ask us for a bulk quote</Link>.</>}
            </p>
          </div>
        </div>
      </section>

      <div className="no-print mt-12 flex flex-wrap gap-3">
        <Link to="/studio" className="btn-primary">Start designing →</Link>
        <Link to="/quote" className="btn-ghost">Talk to a specialist</Link>
      </div>
    </div>
  );
}
