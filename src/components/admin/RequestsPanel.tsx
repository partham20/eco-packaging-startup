import { useState } from 'react';
import { REQUEST_FLOW, REQUEST_META, useRequests } from '../../store/requestStore';
import { dimsLabel, getProduct, getStyle } from '../../data/products';
import { inr, unitPrice } from '../../lib/pricing';
import { awb } from '../../lib/ids';
import type { QuoteRequest, RequestStatus } from '../../types';

const COURIERS = ['Delhivery', 'DTDC', 'Blue Dart', 'India Post'];

const STATUS_STYLE: Record<RequestStatus, string> = {
  new: 'bg-clay/10 text-clay',
  reviewing: 'bg-amber-100 text-amber-800',
  quoted: 'bg-forest/10 text-forest',
  sample_sent: 'bg-sky-100 text-sky-800',
  sample_delivered: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-ink/10 text-ink/60',
};

const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function RequestStatusPill({ status }: { status: RequestStatus }) {
  return <span className={`pill ${STATUS_STYLE[status]}`}>{REQUEST_META[status].label}</span>;
}

export default function RequestsPanel() {
  const requests = useRequests((s) => s.requests);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const shown = requests.filter((r) => filter === 'all' || r.status !== 'closed');
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-ink/60">Quote and sample requests raised from the design studio. Review the specs, confirm a quotation, post the sample.</p>
        <div className="flex shrink-0 gap-1 rounded-full border border-ink/15 bg-paper p-0.5 text-xs font-semibold">
          {(['open', 'all'] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-3 py-1 capitalize ${filter === k ? 'bg-forest text-paper' : 'text-ink/60'}`}>{k}</button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {shown.length === 0 && <p className="card p-6 text-center text-ink/60">No requests here yet. Requests appear when a customer uses “Request quote & free sample” in the studio.</p>}
        {shown.map((r) => <RequestCard key={r.id} r={r} />)}
      </div>
    </div>
  );
}

function RequestCard({ r }: { r: QuoteRequest }) {
  const [open, setOpen] = useState(r.status === 'new');
  const product = getProduct(r.spec.productId);
  const style = getStyle(product, r.spec.styleId);
  const material = product.materials.find((m) => m.id === r.spec.materialId)?.label;
  const finish = product.finishes.find((f) => f.id === r.spec.finishId)?.label;
  const estimate = unitPrice(r.spec, r.qty);
  const stage = REQUEST_FLOW.indexOf(r.status);

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <b className="font-mono">{r.id}</b>
            <RequestStatusPill status={r.status} />
            {r.wantsSample && <span className="pill bg-forest/10 text-forest">Sample requested</span>}
          </p>
          <p className="mt-1 text-sm">{r.customer.name} · {r.customer.designation} · <b>{r.customer.company}</b></p>
          <p className="text-xs text-ink/50">
            <a className="text-forest underline" href={`mailto:${r.customer.email}`}>{r.customer.email}</a> · <a href={`tel:${r.customer.phone}`}>{r.customer.phone}</a> · {fmt(r.createdAt)}
          </p>
        </div>
        <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Hide details' : 'Review details'}</button>
      </div>

      {/* progress */}
      <ol className="mt-4 grid grid-cols-6 gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink/40">
        {REQUEST_FLOW.map((s, i) => (
          <li key={s} className={`border-t-4 pt-1 ${i <= stage ? 'border-forest text-forest' : 'border-ink/10'}`}>{REQUEST_META[s].label}</li>
        ))}
      </ol>

      <p className="mt-3 text-sm text-ink/75">
        {product.name} · <b>{style.name}</b> · {dimsLabel(product, r.spec.dims)} × {r.qty.toLocaleString('en-IN')} · {r.volumeNote}
      </p>

      {open && (
        <div className="mt-4 space-y-5 border-t border-ink/10 pt-4">
          <div className="grid gap-5 md:grid-cols-[200px_1fr]">
            <div className="space-y-2">
              {r.preview ? <img src={r.preview} alt="Design preview" className="w-full rounded-xl border border-ink/10 bg-paper object-contain" /> : <div className="grid h-32 place-items-center rounded-xl bg-paper text-xs text-ink/40">No preview</div>}
            </div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <span className="label">Specification</span>
                <p>{product.name}, {style.name}</p>
                {r.spec.styleNote && <p className="text-xs italic text-ink/60">Custom opening: “{r.spec.styleNote}”</p>}
                <p>{dimsLabel(product, r.spec.dims)}</p>
                <p className="text-xs text-ink/60">{material} · {finish}</p>
                <p className="mt-1 text-xs text-ink/60">Auto-estimate: {inr(estimate)} each · {inr(Math.round(estimate * r.qty))} total</p>
              </div>
              <div>
                <span className="label">Sample delivery</span>
                {r.wantsSample ? (
                  <p>{r.customer.address}<br />{r.customer.city} {r.customer.pincode}</p>
                ) : (
                  <p className="text-ink/50">Customer did not ask for a sample.</p>
                )}
              </div>
              {r.message && (
                <div className="sm:col-span-2">
                  <span className="label">Customer note</span>
                  <p className="italic text-ink/70">“{r.message}”</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="label">Design files</span>
                <ul className="space-y-1">
                  {r.files.map((f, i) => (
                    <li key={f.name + i} className="flex items-center justify-between gap-3 rounded-lg bg-paper px-3 py-1.5">
                      <span className="truncate">{f.name} <span className="text-xs text-ink/40">· {f.origin === 'design' ? 'print-ready render' : 'uploaded'} · {(f.size / 1024).toFixed(0)} KB</span></span>
                      {f.dataUrl ? (
                        <a className="shrink-0 text-xs font-semibold text-forest underline" href={f.dataUrl} download={f.name}>Download</a>
                      ) : (
                        <span className="shrink-0 text-xs text-ink/40">file not stored</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Actions r={r} estimate={estimate} />

          <div>
            <span className="label">History</span>
            <ol className="space-y-1 text-xs text-ink/65">
              {[...r.events].reverse().map((e, i) => (
                <li key={i}><span className="font-semibold text-ink/80">{REQUEST_META[e.status].label}</span> · {fmt(e.at)} · {e.note}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  );
}

function Actions({ r, estimate }: { r: QuoteRequest; estimate: number }) {
  const { startReview, markSampleDelivered, close, remove } = useRequests();
  const done = r.status === 'closed';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {r.status === 'new' && <button className="btn-primary !px-4 !py-2 text-xs" onClick={() => startReview(r.id)}>Start review</button>}
        {r.sample && !r.sample.deliveredAt && !done && (
          <button className="btn-ghost !px-4 !py-2 text-xs" onClick={() => markSampleDelivered(r.id)}>Mark sample delivered</button>
        )}
        {!done && <button className="btn-ghost !px-4 !py-2 text-xs" onClick={() => close(r.id)}>Close request</button>}
        <button className="ml-auto text-xs text-ink/40 hover:text-red-700" onClick={() => confirm(`Delete request ${r.id}?`) && remove(r.id)}>Delete</button>
      </div>

      {r.quotation && (
        <div className="rounded-xl bg-forest/10 p-4 text-sm">
          <b className="text-forest">Quotation sent</b>: {inr(r.quotation.total)} for {r.quotation.qty.toLocaleString('en-IN')} pcs ({inr(r.quotation.unitPrice)} each) · {r.quotation.leadTimeDays} days lead time · valid until {new Date(r.quotation.validUntil).toLocaleDateString('en-IN')}
          {r.quotation.note && <span className="block text-xs text-ink/60">{r.quotation.note}</span>}
        </div>
      )}
      {r.sample && (
        <div className="rounded-xl bg-sky-50 p-4 text-sm">
          <b className="text-sky-900">Sample dispatched</b>: {r.sample.courier} · <span className="font-mono">{r.sample.awb}</span> · {new Date(r.sample.dispatchedAt).toLocaleDateString('en-IN')}
          {r.sample.deliveredAt && <span> · delivered {new Date(r.sample.deliveredAt).toLocaleDateString('en-IN')}</span>}
        </div>
      )}

      {!done && (
        <div className="grid gap-4 lg:grid-cols-2">
          <QuoteForm r={r} estimate={estimate} />
          {r.wantsSample && !r.sample && <SampleForm r={r} />}
        </div>
      )}
    </div>
  );
}

function QuoteForm({ r, estimate }: { r: QuoteRequest; estimate: number }) {
  const sendQuote = useRequests((s) => s.sendQuote);
  const q = r.quotation;
  const [unit, setUnit] = useState(q?.unitPrice ?? estimate);
  const [qty, setQty] = useState(q?.qty ?? r.qty);
  const [lead, setLead] = useState(q?.leadTimeDays ?? 7);
  const [valid, setValid] = useState(14);
  const [note, setNote] = useState(q?.note ?? '');
  const total = Math.round(unit * qty * 100) / 100;
  return (
    <form
      className="rounded-xl bg-paper p-4 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        sendQuote(r.id, {
          unitPrice: unit,
          qty,
          total,
          leadTimeDays: lead,
          validUntil: new Date(Date.now() + valid * 864e5).toISOString(),
          note: note.trim(),
        });
      }}
    >
      <b>{q ? 'Revise quotation' : 'Confirm quotation'}</b>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block"><span className="label">₹ per piece</span><input className="input !py-1.5" type="number" min={0} step="0.01" value={unit} onChange={(e) => setUnit(Math.max(0, +e.target.value))} /></label>
        <label className="block"><span className="label">Quantity</span><input className="input !py-1.5" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Math.floor(+e.target.value) || 1))} /></label>
        <label className="block"><span className="label">Lead time (days)</span><input className="input !py-1.5" type="number" min={1} value={lead} onChange={(e) => setLead(Math.max(1, Math.floor(+e.target.value) || 1))} /></label>
        <label className="block"><span className="label">Valid for (days)</span><input className="input !py-1.5" type="number" min={1} value={valid} onChange={(e) => setValid(Math.max(1, Math.floor(+e.target.value) || 1))} /></label>
      </div>
      <input className="input mt-2 !py-1.5" placeholder="Note for the customer (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-ink/60">Total <b className="text-ink">{inr(total)}</b> + GST</span>
        <button className="btn-primary !px-4 !py-1.5 text-xs">{q ? 'Update quotation' : 'Send quotation'}</button>
      </div>
    </form>
  );
}

function SampleForm({ r }: { r: QuoteRequest }) {
  const dispatchSample = useRequests((s) => s.dispatchSample);
  const [courier, setCourier] = useState(COURIERS[0]);
  const [tracking, setTracking] = useState(() => awb());
  const [note, setNote] = useState('');
  return (
    <form
      className="rounded-xl bg-paper p-4 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        dispatchSample(r.id, { courier, awb: tracking.trim() || awb(), dispatchedAt: new Date().toISOString(), note: note.trim() || undefined });
      }}
    >
      <b>Dispatch the physical sample</b>
      <p className="mt-1 text-xs text-ink/60">To {r.customer.name}, {r.customer.city} {r.customer.pincode}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block"><span className="label">Courier</span>
          <select className="input !py-1.5" value={courier} onChange={(e) => setCourier(e.target.value)}>{COURIERS.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="block"><span className="label">Tracking no.</span><input className="input !py-1.5 font-mono text-xs" value={tracking} onChange={(e) => setTracking(e.target.value)} /></label>
      </div>
      <input className="input mt-2 !py-1.5" placeholder="Note for the customer (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="mt-3 text-right"><button className="btn-primary !px-4 !py-1.5 text-xs">Mark sample dispatched</button></div>
    </form>
  );
}
