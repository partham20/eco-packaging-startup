import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../store/cartStore';
import { useOrders } from '../store/orderStore';
import { cartTotals, inr } from '../lib/pricing';
import type { Customer } from '../types';
import { Field, validEmail, validPhone } from '../components/forms';

const empty: Customer = { name: '', email: '', phone: '', company: '', address: '', city: '', pincode: '' };

export default function Checkout() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const place = useOrders((s) => s.place);
  const navigate = useNavigate();
  const [c, setC] = useState<Customer>(empty);
  const [method, setMethod] = useState('upi');
  const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({});
  const [paying, setPaying] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const t = cartTotals(items);

  if (items.length === 0 && !paying)
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl text-forest">Nothing to check out</h1>
        <Link to="/studio" className="btn-primary mt-6">Design something →</Link>
      </div>
    );

  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setC({ ...c, [k]: e.target.value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: typeof errors = {};
    if (!c.name.trim()) err.name = 'Required';
    if (!validEmail(c.email)) err.email = 'Enter a valid email';
    if (!validPhone(c.phone)) err.phone = 'Enter a 10-digit mobile number';
    if (!c.address.trim()) err.address = 'Required';
    if (!c.city.trim()) err.city = 'Required';
    if (!/^\d{6}$/.test(c.pincode.trim())) err.pincode = '6-digit PIN code';
    setErrors(err);
    if (Object.keys(err).length) return;
    setPaying(true);
    setFailed(null);
    // mock payment gateway round-trip
    setTimeout(() => {
      try {
        const order = place({ ...c, name: c.name.trim(), email: c.email.trim(), city: c.city.trim() }, items);
        clear();
        navigate(`/order/${order.id}`);
      } catch {
        setPaying(false);
        setFailed('We could not save your order: browser storage is full. Remove some items and try again.');
      }
    }, 1500);
  }

  return (
    <div className="container-x py-10">
      <h1 className="text-4xl text-forest">Checkout</h1>
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]" noValidate>
        <div className="space-y-6">
          <section className="card grid gap-4 p-6 sm:grid-cols-2">
            <h2 className="text-xl sm:col-span-2">Delivery details</h2>
            <Field label="Full name" error={errors.name}><input className="input" value={c.name} onChange={set('name')} autoComplete="name" /></Field>
            <Field label="Company / brand (optional)"><input className="input" value={c.company} onChange={set('company')} autoComplete="organization" /></Field>
            <Field label="Email" error={errors.email}><input className="input" type="email" value={c.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field label="Mobile" error={errors.phone}><input className="input" type="tel" value={c.phone} onChange={set('phone')} autoComplete="tel" placeholder="98765 43210" /></Field>
            <Field label="Address" error={errors.address} className="sm:col-span-2"><textarea className="input" rows={2} value={c.address} onChange={set('address')} autoComplete="street-address" /></Field>
            <Field label="City" error={errors.city}><input className="input" value={c.city} onChange={set('city')} autoComplete="address-level2" /></Field>
            <Field label="PIN code" error={errors.pincode}><input className="input" inputMode="numeric" maxLength={6} value={c.pincode} onChange={set('pincode')} autoComplete="postal-code" /></Field>
          </section>
          <section className="card p-6">
            <h2 className="text-xl">Payment</h2>
            <p className="mt-1 text-xs text-ink/50">Demo checkout. No real payment is taken.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ['upi', 'UPI'],
                ['card', 'Credit / debit card'],
                ['netbanking', 'Net banking'],
              ].map(([id, label]) => (
                <label key={id} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 text-sm ${method === id ? 'border-forest bg-forest/5' : 'border-ink/10'}`}>
                  <input type="radio" name="pay" checked={method === id} onChange={() => setMethod(id)} className="accent-forest" />
                  {label}
                </label>
              ))}
            </div>
          </section>
        </div>
        <aside className="card h-fit space-y-3 p-6">
          <h2 className="text-xl">Order summary</h2>
          <p className="text-sm text-ink/60">{items.length} design{items.length > 1 ? 's' : ''} · {items.reduce((a, i) => a + i.qty, 0).toLocaleString('en-IN')} pieces</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{inr(t.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span>{t.shipping ? inr(t.shipping) : 'Free'}</span></div>
            <div className="flex justify-between"><span className="text-ink/60">GST</span><span>{inr(t.gst)}</span></div>
          </div>
          <div className="flex items-baseline justify-between border-t border-ink/10 pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-forest">{inr(t.total)}</span>
          </div>
          {failed && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{failed}</p>}
          <button type="submit" disabled={paying} className="btn-primary w-full">
            {paying ? 'Processing payment…' : `Pay ${inr(t.total)}`}
          </button>
        </aside>
      </form>
      {paying && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm" role="dialog" aria-live="polite">
          <div className="card flex flex-col items-center gap-4 p-8">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-forest/20 border-t-forest" />
            <p className="font-semibold">Confirming payment…</p>
          </div>
        </div>
      )}
    </div>
  );
}
