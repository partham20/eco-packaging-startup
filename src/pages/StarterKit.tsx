import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeads } from '../store/leadStore';
import { PRODUCTS, defaultDims, dimsLabel, getProduct, getStyle } from '../data/products';
import { buildDieline, dielineSvg } from '../data/dielines';
import { downloadBlob } from '../lib/image';
import { inr, unitPrice } from '../lib/pricing';
import { Field, validEmail, validPhone } from '../components/forms';
import ProductIcon from '../components/ProductIcon';
import type { ProductId, StyleId } from '../types';

const KIT_KEY = 'petti.kit';
const STYLE_COUNT = PRODUCTS.reduce((n, p) => n + p.styles.length, 0);

const SIZES: [string, ProductId, StyleId, string][] = [
  ['30 ml serum / dropper bottle', 'mono-carton', 'straight-tuck', '40 × 40 × 120'],
  ['50 g face-cream jar', 'mono-carton', 'straight-tuck', '65 × 65 × 55'],
  ['100 g tea or coffee pouch', 'mono-carton', 'hang-tab', '90 × 50 × 160'],
  ['200 ml candle jar', 'rigid-box', 'lid-base', '90 × 90 × 100'],
  ['Jewellery set (necklace + earrings)', 'rigid-box', 'magnetic', '120 × 120 × 40'],
  ['Gift set: 2 × 250 ml bottles', 'rigid-box', 'drawer', '200 × 150 × 80'],
  ['Folded T-shirt', 'corrugated', 'mailer', '300 × 250 × 60'],
  ['Pair of sneakers', 'corrugated', 'rsc', '340 × 220 × 130'],
  ['8 oz (240 ml) coffee', 'paper-cup', 'sip-lid', '80 top / 56 base / 92 tall'],
  ['Boutique apparel carry bag', 'paper-bag', 'rope', '250 × 100 × 320'],
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
  const [f, setF] = useState({ name: '', email: '', company: '', phone: '', address: '', city: '', pincode: '' });
  const [wantsPack, setWantsPack] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!f.name.trim()) x.name = 'Required';
    if (!validEmail(f.email)) x.email = 'Enter a valid email';
    if (!f.company.trim()) x.company = 'Required';
    if (f.phone.trim() && !validPhone(f.phone)) x.phone = 'Enter a 10-digit mobile number';
    if (wantsPack) {
      if (!f.address.trim()) x.address = 'We need an address to post the pack';
      if (!f.city.trim()) x.city = 'Required';
      if (!/^\d{6}$/.test(f.pincode.trim())) x.pincode = '6-digit PIN code';
      if (!f.phone.trim()) x.phone = 'The courier needs a phone number';
    }
    setErr(x);
    if (Object.keys(x).length) return;
    add({
      name: f.name.trim(),
      designation: '',
      company: f.company.trim(),
      address: wantsPack ? `${f.address.trim()}, ${f.city.trim()} ${f.pincode.trim()}` : '',
      email: f.email.trim(),
      phone: f.phone.trim(),
      productInterest: [],
      monthlyQty: 'Just a prototype',
      message: wantsPack ? 'Downloaded the prototype kit. Please post a physical sample pack.' : 'Downloaded the prototype kit',
      source: 'starter-kit',
    });
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
          <p className="eyebrow">Free download · optional physical pack</p>
          <h1 className="mt-3 text-4xl leading-tight text-forest sm:text-5xl">The Prototype Kit for founders launching a pilot</h1>
          <p className="mt-4 text-lg text-ink/70">Everything we wish someone had given us before we ordered our first run of packaging.</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              [`${STYLE_COUNT} blank dielines`, 'Print-ready SVG templates for every format and opening style, for your designer or for Canva.'],
              ['Size cheat sheet', 'Tested sizes for 10 common launch products, from serums to sneakers.'],
              ['Material guide', 'Which board, which wrap and which finish suit each format.'],
              ['Pilot cost planner', 'See what a prototype, a pilot batch and a launch run cost per piece.'],
            ].map(([t, d]) => (
              <li key={t} className="card p-4">
                <b className="text-forest">{t}</b>
                <p className="mt-1 text-sm text-ink/60">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submit} noValidate className="card space-y-4 p-6 sm:p-8">
          <h2 className="text-2xl">Where should we send it?</h2>
          <Field label="Your name" error={err.name}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
          <Field label="Email" error={err.email}><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
          <Field label="Brand / company" error={err.company}><input className="input" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoComplete="organization" /></Field>
          <Field label={wantsPack ? 'Phone' : 'Phone (optional)'} error={err.phone}><input className="input" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-dashed border-forest/40 bg-forest/5 p-3">
            <input type="checkbox" checked={wantsPack} onChange={(e) => setWantsPack(e.target.checked)} className="mt-1 h-4 w-4 accent-forest" />
            <span className="text-sm">
              <b>Also post me a physical sample pack</b>
              <span className="block text-xs text-ink/60">Swatches of our boards and finishes plus a few ready-made sample boxes, free of charge.</span>
            </span>
          </label>
          {wantsPack && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Delivery address" error={err.address} className="sm:col-span-2"><textarea className="input" rows={2} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} autoComplete="street-address" /></Field>
              <Field label="City" error={err.city}><input className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} autoComplete="address-level2" /></Field>
              <Field label="PIN code" error={err.pincode}><input className="input" inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => setF({ ...f, pincode: e.target.value })} autoComplete="postal-code" /></Field>
            </div>
          )}
          <button className="btn-accent w-full !py-3 text-base">{wantsPack ? 'Unlock the kit and post me the pack →' : 'Unlock the free kit →'}</button>
          <p className="text-center text-xs text-ink/50">Instant access. One useful email a month, unsubscribe anytime.</p>
        </form>
      </div>
    );

  return <KitContent />;
}

function KitContent() {
  const [cat, setCat] = useState<ProductId>('rigid-box');
  const [qty, setQty] = useState(25);
  const [pid, setPid] = useState<ProductId>('rigid-box');
  const [sid, setSid] = useState<StyleId>('lid-base');
  const category = getProduct(cat);
  const p = getProduct(pid);
  const style = getStyle(p, sid);
  const dims = defaultDims(p, style.id);
  const spec = { productId: pid, styleId: style.id, dims, materialId: p.materials[0].id, finishId: p.finishes[0].id };
  const ladder = [1, 10, 25, 50, 100, 250];

  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your prototype kit</p>
          <h1 className="mt-2 text-4xl text-forest">Prototype Kit</h1>
        </div>
        <button className="btn-ghost no-print" onClick={() => window.print()}>Print / save as PDF</button>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl">1. Blank dielines</h2>
        <p className="mt-1 text-sm text-ink/60">Default sizes, in mm. Need a custom size? Change the dimensions in the studio and download again.</p>
        <div className="mt-4 flex flex-wrap gap-2 no-print">
          {PRODUCTS.map((x) => (
            <button
              key={x.id}
              onClick={() => setCat(x.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${x.id === cat ? 'border-forest bg-forest text-paper' : 'border-ink/15 bg-white hover:border-forest/50'}`}
            >
              <ProductIcon id={x.id} className="h-5 w-5" /> {x.name}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {category.styles.map((s) => {
            const d = defaultDims(category, s.id);
            return (
              <button
                key={s.id}
                className="card flex flex-col items-start gap-1 p-4 text-left text-sm transition hover:shadow-md"
                onClick={() => downloadBlob(dielineSvg(buildDieline(category.id, d, s.id), `${category.name}, ${s.name} ${dimsLabel(category, d)}`), `petti-${category.id}-${s.id}-dieline.svg`, 'image/svg+xml')}
              >
                <b>{s.name}</b>
                <span className="text-xs text-ink/55">{s.blurb}</span>
                <span className="text-xs text-ink/50">{dimsLabel(category, d)}</span>
                <span className="mt-1 text-xs font-semibold text-clay">⬇ SVG</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">2. Size cheat sheet</h2>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink/50">
              <tr><th className="p-3">Product</th><th className="p-3">Suggested style</th><th className="p-3">Inner size (mm)</th></tr>
            </thead>
            <tbody>
              {SIZES.map(([item, id, st, size]) => (
                <tr key={item} className="border-t border-ink/5">
                  <td className="p-3">{item}</td>
                  <td className="p-3"><Link className="text-forest underline-offset-2 hover:underline" to={`/studio/${id}/${st}`}>{getProduct(id).name} · {getStyle(getProduct(id), st).name}</Link></td>
                  <td className="p-3 font-mono text-xs">{size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink/50">Rule of thumb: add 3–5 mm to each side of your product, plus room for any insert or crinkle paper.</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">3. Material guide</h2>
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
            <b>Choosing a finish</b>
            <p className="mt-2 text-paper/80">Plain print is the cheapest for a prototype. Add a coating, foil or emboss on the pilot batch once you have confirmed the structure and artwork with a sample.</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">4. Pilot cost planner</h2>
        <div className="card mt-4 grid gap-6 p-6 md:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="label">Format</span>
              <select className="input" value={pid} onChange={(e) => { const id = e.target.value as ProductId; setPid(id); setSid(getProduct(id).styles[0].id); }}>
                {PRODUCTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Opening style</span>
              <select className="input" value={style.id} onChange={(e) => setSid(e.target.value)}>
                {p.styles.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Pilot quantity: {qty}</span>
              <input type="range" min={1} max={500} step={1} value={qty} onChange={(e) => setQty(+e.target.value)} className="w-full accent-forest" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-forest/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest">Your pilot batch</p>
              <p className="mt-2 font-display text-3xl font-bold text-forest">{inr(Math.round(unitPrice(spec, qty) * qty))}</p>
              <p className="text-sm text-ink/60">{qty} pieces at {inr(unitPrice(spec, qty))} each · {dimsLabel(p, dims)}</p>
            </div>
            <div className="rounded-xl bg-paper p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Price per piece as you scale</p>
              <ul className="mt-2 space-y-1 text-sm">
                {ladder.map((q) => (
                  <li key={q} className={`flex justify-between ${q === qty ? 'font-semibold text-forest' : ''}`}>
                    <span>{q} pc</span>
                    <span>{inr(unitPrice(spec, q))} each · {inr(Math.round(unitPrice(spec, q) * q))}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-ink/70 sm:col-span-2">
              Happy with the numbers? <Link className="underline" to={`/studio/${pid}/${style.id}`}>Design this pack</Link> and request a quote and a physical sample.
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
