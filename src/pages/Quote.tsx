import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeads } from '../store/leadStore';
import { PRODUCTS } from '../data/products';
import { Field, validEmail, validPhone } from '../components/forms';
import ProductIcon from '../components/ProductIcon';
import type { Lead, ProductId } from '../types';

const QTY_BANDS = ['Just a prototype', 'Pilot launch, under 100', '100–500', '500–1,000', '1,000–5,000', '5,000+'];

type Form = Omit<Lead, 'id' | 'createdAt' | 'source'>;
const empty: Form = { name: '', designation: '', company: '', address: '', email: '', phone: '', productInterest: [], monthlyQty: '', message: '' };

export default function Quote() {
  const add = useLeads((s) => s.add);
  const [f, setF] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [done, setDone] = useState<Lead | null>(null);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const toggle = (id: ProductId) =>
    setF({ ...f, productInterest: f.productInterest.includes(id) ? f.productInterest.filter((x) => x !== id) : [...f.productInterest, id] });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: typeof errors = {};
    if (!f.name.trim()) err.name = 'Required';
    if (!f.designation.trim()) err.designation = 'Required';
    if (!f.company.trim()) err.company = 'Required';
    if (!f.address.trim()) err.address = 'Required';
    if (!validEmail(f.email)) err.email = 'Enter a valid email';
    if (!validPhone(f.phone)) err.phone = 'Enter a 10-digit mobile number';
    if (f.productInterest.length === 0) err.productInterest = 'Pick at least one';
    setErrors(err);
    if (Object.keys(err).length) return;
    setDone(add({ ...f, source: 'quote' }));
  }

  if (done)
    return (
      <div className="container-x max-w-2xl py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest text-3xl text-paper">✓</span>
        <h1 className="mt-5 text-4xl font-semibold text-forest">Thanks, {done.name.split(' ')[0]}. We're on it.</h1>
        <p className="mt-3 text-ink/70">
          A packaging specialist will call you on <b>{done.phone}</b> within one working day with sizes, materials and a price for{' '}
          {done.company}. Your reference is <b className="font-mono">{done.id}</b>.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/studio" className="btn-primary">Try the design studio meanwhile →</Link>
          <Link to="/starter-kit" className="btn-ghost">Get the free starter kit</Link>
        </div>
      </div>
    );

  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <p className="eyebrow">General enquiry</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-forest sm:text-5xl">Tell us what you're launching. We'll do the maths.</h1>
        <p className="mt-4 text-ink/70">
          Whether it's a single prototype, 50 boxes for a pilot or 5,000 cups a month, we'll suggest the right format and material, and send a price
          you can plan around.
        </p>
        <p className="mt-4 rounded-xl bg-forest/10 p-4 text-sm text-forest">
          Already know the pack you want? <Link to="/studio" className="font-semibold underline">Configure it in the studio</Link> and use
          <b> Request quote & sample</b>. Your size, style and artwork travel with the request and we post you a physical sample.
        </p>
        <ul className="mt-8 space-y-4 text-sm">
          {[
            ['A call back within 24 hours', 'From a person who knows board grades, not a chatbot.'],
            ['A physical sample on request', 'Hold it, test it, and show it to your co-founder.'],
            ['Your price drops as you grow', 'Prices step down at 10, 50, 100, 250, 500 and 1,000 pieces.'],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-kraft/40 text-forest">✓</span>
              <span><b>{t}</b><br /><span className="text-ink/60">{d}</span></span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={submit} noValidate className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
        <Field label="Your name" error={errors.name}><input className="input" value={f.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label="Designation" error={errors.designation}><input className="input" value={f.designation} onChange={set('designation')} placeholder="Founder, Ops lead…" autoComplete="organization-title" /></Field>
        <Field label="Company name" error={errors.company}><input className="input" value={f.company} onChange={set('company')} autoComplete="organization" /></Field>
        <Field label="Phone" error={errors.phone}><input className="input" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" placeholder="98765 43210" /></Field>
        <Field label="Work email" error={errors.email} className="sm:col-span-2"><input className="input" type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Company address" error={errors.address} className="sm:col-span-2"><textarea className="input" rows={2} value={f.address} onChange={set('address')} autoComplete="street-address" /></Field>
        <div className="sm:col-span-2">
          <span className="label">What do you need?</span>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map((p) => {
              const on = f.productInterest.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${on ? 'border-forest bg-forest text-paper' : 'border-ink/15 hover:border-forest/50'}`}
                >
                  <ProductIcon id={p.id} className="h-5 w-5" /> {p.name}
                </button>
              );
            })}
          </div>
          {errors.productInterest && <span className="mt-1 block text-xs text-red-700">{errors.productInterest}</span>}
        </div>
        <Field label="Estimated quantity (pilot or monthly)" className="sm:col-span-2">
          <select className="input" value={f.monthlyQty} onChange={set('monthlyQty')}>
            <option value="">Select…</option>
            {QTY_BANDS.map((q) => <option key={q}>{q}</option>)}
          </select>
        </Field>
        <Field label="Anything else? (sizes, product, opening style, deadline)" className="sm:col-span-2">
          <textarea className="input" rows={3} value={f.message} onChange={set('message')} />
        </Field>
        <button className="btn-accent sm:col-span-2 !py-3 text-base">Get my quote →</button>
        <p className="text-center text-xs text-ink/50 sm:col-span-2">We only use your details to reply to this request. No spam.</p>
      </form>
    </div>
  );
}
