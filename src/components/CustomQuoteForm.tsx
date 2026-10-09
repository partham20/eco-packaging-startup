import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Upload, X } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useLeads } from '../store/leadStore';
import { validEmail, validPhone } from './forms';
import type { Lead, ProductId } from '../types';

const UNITS = ['mm', 'cm', 'in'] as const;
const COLOURS = ['Full colour (CMYK)', 'One colour (logo only)', 'White', 'Black', 'Kraft, no print', 'Not sure, need advice'];
const MAX_FILES = 10;
const MAX_MB = 25;

/** The "Get a custom quote" card: name, size, quantity, print colour and artwork in one go. */
export default function CustomQuoteForm({ className = '' }: { className?: string }) {
  const add = useLeads((s) => s.add);
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ first: '', last: '', phone: '', email: '', product: '' as ProductId | '', L: '', W: '', D: '', qty: '', colour: '', notes: '', consent: false });
  const [unit, setUnit] = useState<(typeof UNITS)[number]>('mm');
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Lead | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  function addFiles(list: FileList | null) {
    if (!list) return;
    const ok = Array.from(list).filter((x) => x.size <= MAX_MB * 1024 * 1024);
    setFiles((prev) => [...prev, ...ok].slice(0, MAX_FILES));
    if (ok.length < list.length) setErr((e) => ({ ...e, files: `Files over ${MAX_MB} MB were skipped` }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!f.first.trim()) x.first = 'Required';
    if (!validEmail(f.email)) x.email = 'Enter a valid email';
    if (f.phone.trim() && !validPhone(f.phone)) x.phone = 'Enter a 10-digit mobile number';
    if (!(Number(f.qty) > 0)) x.qty = 'How many pieces?';
    if (!f.colour) x.colour = 'Pick a print colour';
    setErr(x);
    if (Object.keys(x).length) return;
    const size = [f.L, f.W, f.D].some(Boolean) ? `${f.L || '?'} × ${f.W || '?'} × ${f.D || '?'} ${unit}` : 'not given';
    setDone(
      add({
        name: `${f.first.trim()} ${f.last.trim()}`.trim(),
        designation: '',
        company: '',
        address: '',
        email: f.email.trim(),
        phone: f.phone.trim(),
        productInterest: f.product ? [f.product] : [],
        monthlyQty: `${f.qty} pcs`,
        message: [`Size: ${size}`, `Print: ${f.colour}`, files.length ? `Artwork: ${files.map((x) => x.name).join(', ')}` : '', f.notes.trim()].filter(Boolean).join(' · '),
        source: 'quote',
      }),
    );
  }

  const box = `rounded-[28px] border border-ink/10 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(42,33,28,0.35)] sm:p-8 ${className}`;

  if (done)
    return (
      <div className={`${box} text-center`}>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage text-sage-deep"><Check className="h-7 w-7" /></span>
        <h3 className="mt-5 text-3xl">Thanks, {done.name.split(' ')[0]}. <span className="accent">We're on it.</span></h3>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink/65">
          A packaging specialist will email <b>{done.email}</b> within 4 working hours with a price and a free first proof. Your reference is{' '}
          <b className="font-mono">{done.id}</b>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/studio" className="btn-primary">Design it in 3D meanwhile <ArrowRight className="h-4 w-4" /></Link>
          <button className="btn-ghost" onClick={() => { setDone(null); setFiles([]); setF({ ...f, notes: '', qty: '' }); }}>Send another</button>
        </div>
      </div>
    );

  const Err = ({ k }: { k: string }) => (err[k] ? <span className="mt-1 block text-xs text-red-700">{err[k]}</span> : null);

  return (
    <form onSubmit={submit} noValidate className={box}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-3xl leading-tight">Get a <span className="font-serif italic">custom quote</span></h3>
        <span className="shrink-0 rounded-full bg-sage px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sage-deep">Free first proof</span>
      </div>
      <p className="mt-2 flex gap-4 text-xs text-ink/55">
        <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Reply in 4 hours</span>
        <span className="flex items-center gap-1"><Check className="h-3 w-3" /> No obligation</span>
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label><span className="label">First name*</span><input className="input" placeholder="Priya" value={f.first} onChange={set('first')} autoComplete="given-name" /><Err k="first" /></label>
        <label><span className="label">Last name</span><input className="input" placeholder="Raman" value={f.last} onChange={set('last')} autoComplete="family-name" /></label>
        <label><span className="label">Phone</span><input className="input" type="tel" placeholder="98765 43210" value={f.phone} onChange={set('phone')} autoComplete="tel" /><Err k="phone" /></label>
        <label><span className="label">Email address*</span><input className="input" type="email" placeholder="you@brand.com" value={f.email} onChange={set('email')} autoComplete="email" /><Err k="email" /></label>

        <label className="sm:col-span-2">
          <span className="label">Packaging type</span>
          <select className="input appearance-none" value={f.product} onChange={set('product')}>
            <option value="">Not sure yet</option>
            {PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>

        <div className="sm:col-span-2">
          <span className="label">Dimensions</span>
          <div className="grid grid-cols-3 gap-2">
            {(['L', 'W', 'D'] as const).map((k) => (
              <div key={k} className="relative">
                <input className="input pr-8" inputMode="decimal" placeholder="0" value={f[k]} onChange={set(k)} aria-label={{ L: 'Length', W: 'Width', D: 'Depth' }[k]} />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink/40">{k}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5">
            {UNITS.map((u) => (
              <button key={u} type="button" onClick={() => setUnit(u)} className={`h-8 min-w-11 rounded-full border px-3 text-xs transition ${unit === u ? 'border-ink bg-ink text-paper' : 'border-ink/15 bg-white hover:border-ink/40'}`}>
                {u}
              </button>
            ))}
          </div>
        </div>

        <label><span className="label">Quantity*</span><input className="input" inputMode="numeric" placeholder="e.g. 25" value={f.qty} onChange={set('qty')} /><Err k="qty" /></label>
        <label>
          <span className="label">Print colour*</span>
          <select className="input appearance-none" value={f.colour} onChange={set('colour')}>
            <option value="">Select colour</option>
            {COLOURS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <Err k="colour" />
        </label>

        <label className="sm:col-span-2">
          <span className="label">Tell us about your project</span>
          <textarea className="input" rows={3} value={f.notes} onChange={set('notes')} placeholder="What goes in the box? Any finishes you want (foil, emboss, soft-touch)? Brand colours, launch date…" />
        </label>

        <div className="sm:col-span-2">
          <span className="label">Upload artwork</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className="flex w-full flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-cream/50 px-4 py-6 text-center transition hover:border-clay"
          >
            <Upload className="h-5 w-5 text-ink/70" />
            <span className="mt-2 text-sm font-semibold">Click or drop your design here</span>
            <span className="mt-1 text-xs text-ink/50">PDF, AI, PNG, JPG, SVG · up to {MAX_MB} MB each · max {MAX_FILES} files</span>
          </button>
          <input ref={fileRef} type="file" multiple hidden accept=".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg,.webp" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          {files.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {files.map((x, i) => (
                <li key={i} className="flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-xs">
                  {x.name}
                  <button type="button" aria-label={`Remove ${x.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                </li>
              ))}
            </ul>
          )}
          <Err k="files" />
        </div>

        <label className="flex items-start gap-3 text-xs leading-relaxed text-ink/65 sm:col-span-2">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#2A211C]" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
          Send me WhatsApp updates about this quote. We never share your number with third parties.
        </label>

        <button className="btn-primary !py-3.5 text-base sm:col-span-2">Get My Custom Quote <ArrowRight className="h-4 w-4" /></button>
        <p className="text-center text-[11px] text-ink/45 sm:col-span-2">We only use your details to reply to this request. No spam, ever.</p>
      </div>
    </form>
  );
}
