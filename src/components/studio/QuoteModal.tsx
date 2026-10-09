import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProduct, getStyle, dimsLabel } from '../../data/products';
import { pxPerMmFor, renderDieline, type ImageMap } from '../../lib/render';
import { canvasToJpeg, fileToAttachment, shrinkCanvas } from '../../lib/image';
import { inr, unitPrice } from '../../lib/pricing';
import { useRequests } from '../../store/requestStore';
import { Field, validEmail, validPhone } from '../forms';
import type { Design, Dieline, Dims, QuoteRequest, RequestFile } from '../../types';

const VOLUME_BANDS = ['Just a prototype', 'Pilot launch, under 100', '100–500 a month', '500–1,000 a month', '1,000+ a month'];
const MAX_UPLOADS = 3;

interface Props {
  onClose: () => void;
  design: Design;
  dims: Dims;
  dl: Dieline;
  images: ImageMap;
  qty: number;
  /** 3D snapshot, when the 3D view is mounted */
  snapshot: () => string | undefined;
}

const empty = { name: '', designation: '', company: '', email: '', phone: '', address: '', city: '', pincode: '', message: '' };

export default function QuoteModal({ onClose, design, dims, dl, images, qty: initialQty, snapshot }: Props) {
  const add = useRequests((s) => s.add);
  const product = getProduct(design.productId);
  const style = getStyle(product, design.styleId);
  const material = product.materials.find((m) => m.id === design.materialId);
  const finish = product.finishes.find((f) => f.id === design.finishId);

  const [f, setF] = useState(empty);
  const [qty, setQty] = useState(initialQty);
  const [volume, setVolume] = useState(VOLUME_BANDS[1]);
  const [wantsSample, setWantsSample] = useState(true);
  const [uploads, setUploads] = useState<RequestFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<QuoteRequest | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // flat render of the current design: shown in the modal and attached as the print-ready file
  const flat = useMemo(() => {
    const c = document.createElement('canvas');
    renderDieline(c, dl, design, images, { pxPerMm: pxPerMmFor(dl, 1800) });
    return c;
  }, [dl, design, images]);
  const flatThumb = useMemo(() => shrinkCanvas(flat, 360), [flat]);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function addFiles(list: FileList | null) {
    if (!list) return;
    setFileError(null);
    const next = [...uploads];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_UPLOADS) {
        setFileError(`You can attach up to ${MAX_UPLOADS} extra files.`);
        break;
      }
      try {
        const dataUrl = await fileToAttachment(file);
        next.push({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl, origin: 'upload' });
      } catch (e) {
        setFileError((e as Error).message);
      }
    }
    setUploads(next);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!f.name.trim()) err.name = 'Required';
    if (!f.designation.trim()) err.designation = 'Required';
    if (!f.company.trim()) err.company = 'Required';
    if (!validEmail(f.email)) err.email = 'Enter a valid email';
    if (!validPhone(f.phone)) err.phone = 'Enter a 10-digit mobile number';
    if (wantsSample) {
      if (!f.address.trim()) err.address = 'We need an address to post the sample';
      if (!f.city.trim()) err.city = 'Required';
      if (!/^\d{6}$/.test(f.pincode.trim())) err.pincode = '6-digit PIN code';
    }
    if (!Number.isFinite(qty) || qty < 1) err.qty = 'At least 1';
    setErrors(err);
    if (Object.keys(err).length) return;

    setBusy(true);
    try {
      const printUrl = canvasToJpeg(flat);
      const designFile: RequestFile = {
        name: `petti-${design.productId}-${design.styleId}-print.jpg`,
        type: 'image/jpeg',
        size: Math.round(printUrl.length * 0.75),
        dataUrl: printUrl,
        origin: 'design',
      };
      const req = add({
        customer: {
          name: f.name.trim(),
          designation: f.designation.trim(),
          company: f.company.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          address: f.address.trim(),
          city: f.city.trim(),
          pincode: f.pincode.trim(),
        },
        spec: {
          productId: design.productId,
          styleId: design.styleId,
          styleNote: design.styleNote.trim() || undefined,
          dims,
          materialId: design.materialId,
          finishId: design.finishId,
        },
        qty,
        volumeNote: volume,
        wantsSample,
        message: f.message.trim(),
        files: [designFile, ...uploads],
        preview: snapshot() ?? flatThumb,
      });
      setDone(req);
    } finally {
      setBusy(false);
    }
  }

  const unit = unitPrice({ productId: design.productId, styleId: design.styleId, dims, materialId: design.materialId, finishId: design.finishId }, qty);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 p-3 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
        className="mx-auto w-full max-w-4xl rounded-2xl bg-paper p-5 shadow-2xl outline-none sm:p-8"
      >
        {done ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest text-3xl text-paper">✓</span>
            <h2 id="quote-title" className="mt-5 text-3xl font-semibold text-forest">Request received, {done.customer.name.split(' ')[0]}.</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/70">
              Our team will review your specs and artwork, confirm a quotation{done.wantsSample ? ' and post a physical sample to you' : ''}. Your reference is{' '}
              <b className="font-mono">{done.id}</b>. Keep it, with the email or phone you entered, to follow progress.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={`/track/${done.id}?c=${encodeURIComponent(done.customer.email)}`} className="btn-primary">Track this request →</Link>
              <button className="btn-ghost" onClick={onClose}>Back to the studio</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Free quote · free sample</p>
                <h2 id="quote-title" className="mt-1 text-3xl font-semibold text-forest">Request a quote & physical sample</h2>
                <p className="mt-1 text-sm text-ink/60">Your size, style and artwork travel with this request, so our team can price it and post you a sample unit.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="btn-ghost !px-3">✕</button>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
              {/* configuration summary */}
              <aside className="space-y-3">
                <div className="rounded-xl bg-[repeating-conic-gradient(#f3efe7_0%_25%,#faf8f3_0%_50%)] bg-[length:16px_16px] p-2">
                  <img src={flatThumb} alt="Flat dieline with your artwork" className="mx-auto max-h-48 w-auto" />
                </div>
                <dl className="card space-y-1 p-4 text-sm">
                  <div><dt className="label !mb-0">Pack</dt><dd className="font-semibold">{product.name}</dd></div>
                  <div><dt className="label !mb-0 mt-2">Opening style</dt><dd>{style.name}</dd></div>
                  {design.styleNote.trim() && <div><dd className="text-xs italic text-ink/60">“{design.styleNote.trim()}”</dd></div>}
                  <div><dt className="label !mb-0 mt-2">Size</dt><dd>{dimsLabel(product, dims)}</dd></div>
                  <div><dt className="label !mb-0 mt-2">Material & finish</dt><dd className="text-xs">{material?.label} · {finish?.label}</dd></div>
                  <div><dt className="label !mb-0 mt-2">Estimate</dt><dd className="text-xs">{inr(unit)} per piece at {qty.toLocaleString('en-IN')} · final price confirmed in your quotation</dd></div>
                </dl>
                <p className="rounded-lg bg-forest/10 p-3 text-xs text-forest">
                  ✓ A print-ready render of this design is attached automatically.
                </p>
              </aside>

              {/* contact + volume + files */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" error={errors.name}><input className="input" value={f.name} onChange={set('name')} autoComplete="name" /></Field>
                <Field label="Designation" error={errors.designation}><input className="input" value={f.designation} onChange={set('designation')} placeholder="Founder, Ops lead…" autoComplete="organization-title" /></Field>
                <Field label="Company / brand" error={errors.company}><input className="input" value={f.company} onChange={set('company')} autoComplete="organization" /></Field>
                <Field label="Phone" error={errors.phone}><input className="input" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" placeholder="98765 43210" /></Field>
                <Field label="Work email" error={errors.email} className="sm:col-span-2"><input className="input" type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>

                <Field label="Quantity for this run" error={errors.qty}>
                  <input className="input" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(100000, Math.floor(+e.target.value) || 1)))} />
                </Field>
                <Field label="If the pilot works, expected volume">
                  <select className="input" value={volume} onChange={(e) => setVolume(e.target.value)}>
                    {VOLUME_BANDS.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-dashed border-forest/40 bg-forest/5 p-3 sm:col-span-2">
                  <input type="checkbox" checked={wantsSample} onChange={(e) => setWantsSample(e.target.checked)} className="mt-1 h-4 w-4 accent-forest" />
                  <span className="text-sm">
                    <b>Post me a physical sample unit</b>
                    <span className="block text-xs text-ink/60">One printed piece of this design, free. Ships separately with its own tracking.</span>
                  </span>
                </label>

                {wantsSample && (
                  <>
                    <Field label="Address to post the sample to" error={errors.address} className="sm:col-span-2">
                      <textarea className="input" rows={2} value={f.address} onChange={set('address')} autoComplete="street-address" />
                    </Field>
                    <Field label="City" error={errors.city}><input className="input" value={f.city} onChange={set('city')} autoComplete="address-level2" /></Field>
                    <Field label="PIN code" error={errors.pincode}><input className="input" inputMode="numeric" maxLength={6} value={f.pincode} onChange={set('pincode')} autoComplete="postal-code" /></Field>
                  </>
                )}

                <div className="sm:col-span-2">
                  <span className="label">Design files (optional)</span>
                  <button type="button" className="btn-ghost w-full" onClick={() => fileRef.current?.click()} disabled={uploads.length >= MAX_UPLOADS}>
                    ⬆ Attach artwork, dielines or a brief ({uploads.length}/{MAX_UPLOADS})
                  </button>
                  <input ref={fileRef} type="file" multiple accept="image/*,application/pdf,.ai,.eps,.svg" className="hidden" onChange={(e) => { void addFiles(e.target.files); e.target.value = ''; }} />
                  {fileError && <p className="mt-1 text-xs text-red-700">{fileError}</p>}
                  {uploads.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {uploads.map((u, i) => (
                        <li key={u.name + i} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5">
                          <span className="truncate">{u.name} <span className="text-xs text-ink/40">· {(u.size / 1024).toFixed(0)} KB</span></span>
                          <button type="button" className="text-xs text-ink/50 hover:text-red-700" onClick={() => setUploads(uploads.filter((_, j) => j !== i))}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1 text-xs text-ink/50">PNG, JPG, SVG or PDF, up to 1.5 MB each.</p>
                </div>

                <Field label="Anything else? (deadline, inserts, special finishes)" className="sm:col-span-2">
                  <textarea className="input" rows={3} value={f.message} onChange={set('message')} />
                </Field>

                <button className="btn-accent sm:col-span-2 !py-3 text-base" disabled={busy}>
                  {busy ? 'Sending…' : wantsSample ? 'Send request: quote + free sample →' : 'Send request for a quote →'}
                </button>
                <p className="text-center text-xs text-ink/50 sm:col-span-2">We only use these details to reply to this request. No spam.</p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
