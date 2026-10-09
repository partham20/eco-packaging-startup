import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, defaultDims, dimsLabel, getProduct, getStyle } from '../data/products';
import { buildDieline, dielineSvg } from '../data/dielines';
import { downloadBlob } from '../lib/image';
import { inr, unitPrice } from '../lib/pricing';
import { useLeads } from '../store/leadStore';
import { Field, validEmail, validPhone } from './forms';
import type { ProductId } from '../types';

const QTYS = [1, 5, 10, 25, 50, 100, 250];

/**
 * Lead magnet: pick a pack, style and quantity; the price and the matching blank dieline
 * unlock once the visitor leaves their contact details.
 */
export default function InstantQuote({ className = '' }: { className?: string }) {
  const add = useLeads((s) => s.add);
  const [pid, setPid] = useState<ProductId>('rigid-box');
  const product = getProduct(pid);
  const [sid, setSid] = useState(product.styles[0].id);
  const [qty, setQty] = useState(10);
  const [f, setF] = useState({ name: '', email: '', phone: '', company: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [unlocked, setUnlocked] = useState(false);

  const style = getStyle(product, sid);
  const dims = useMemo(() => defaultDims(product, style.id), [product, style.id]);
  const spec = { productId: pid, styleId: style.id, dims, materialId: product.materials[0].id, finishId: product.finishes[0].id };
  const unit = unitPrice(spec, qty);

  function pickProduct(id: ProductId) {
    setPid(id);
    setSid(getProduct(id).styles[0].id);
    setUnlocked(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!f.name.trim()) x.name = 'Required';
    if (!validEmail(f.email)) x.email = 'Enter a valid email';
    if (f.phone.trim() && !validPhone(f.phone)) x.phone = 'Enter a 10-digit mobile number';
    setErr(x);
    if (Object.keys(x).length) return;
    add({
      name: f.name.trim(),
      designation: '',
      company: f.company.trim(),
      address: '',
      email: f.email.trim(),
      phone: f.phone.trim(),
      productInterest: [pid],
      monthlyQty: `Prototype / pilot: ${qty}`,
      message: `Instant prototype quote: ${product.name}, ${style.name}, ${dimsLabel(product, dims)}, ${qty} pcs`,
      source: 'instant-quote',
    });
    setUnlocked(true);
  }

  return (
    <div className={`card relative overflow-hidden border-clay/30 p-6 shadow-xl ${className}`}>
      <span className="pill absolute right-5 top-5 bg-clay text-white">Free</span>
      <p className="eyebrow">Instant prototype quote</p>
      <h2 className="mt-2 text-2xl font-semibold text-forest">Price your pilot run in 20 seconds</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">Pack</span>
          <select className="input" value={pid} onChange={(e) => pickProduct(e.target.value as ProductId)}>
            {PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Opening style</span>
          <select className="input" value={style.id} onChange={(e) => { setSid(e.target.value); setUnlocked(false); }}>
            {product.styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-3">
        <span className="label">How many pieces?</span>
        <div className="flex flex-wrap gap-1.5">
          {QTYS.map((q) => (
            <button key={q} type="button" onClick={() => setQty(q)} className={`pill border ${qty === q ? 'border-forest bg-forest text-paper' : 'border-ink/15 bg-white'}`}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {unlocked ? (
        <div className="mt-5 rounded-xl bg-forest/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest">Your estimate · {dimsLabel(product, dims)}</p>
          <p className="mt-1 font-display text-4xl font-bold text-forest">{inr(Math.round(unit * qty * 100) / 100)}</p>
          <p className="text-sm text-ink/65">{qty} × {inr(unit)} per piece. Final quotation confirmed by our team.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/studio/${pid}/${style.id}`} className="btn-primary !px-4 !py-2">Design it in 3D →</Link>
            <button
              className="btn-ghost !px-4 !py-2"
              onClick={() => downloadBlob(dielineSvg(buildDieline(pid, dims, style.id), `${product.name}, ${style.name} ${dimsLabel(product, dims)}`), `petti-${pid}-${style.id}-dieline.svg`, 'image/svg+xml')}
            >
              ⬇ Blank dieline (SVG)
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper p-3 sm:col-span-2">
            <p className="text-xs text-ink/55">Estimate for {qty} × {style.name.toLowerCase()}</p>
            <p className="font-display text-2xl font-bold tracking-wide text-ink/30 blur-[5px] select-none" aria-hidden>₹ 0,000</p>
            <p className="text-xs font-semibold text-clay">Enter your details to unlock the price and the blank dieline.</p>
          </div>
          <Field label="Your name" error={err.name}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
          <Field label="Email" error={err.email}><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
          <Field label="Brand (optional)"><input className="input" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoComplete="organization" /></Field>
          <Field label="Phone (optional)" error={err.phone}><input className="input" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></Field>
          <button className="btn-accent sm:col-span-2 !py-3 text-base">Show my instant quote →</button>
        </form>
      )}
    </div>
  );
}
