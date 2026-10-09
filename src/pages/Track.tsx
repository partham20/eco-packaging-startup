import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { findOrder, useOrders } from '../store/orderStore';
import { REQUEST_FLOW, REQUEST_META, findRequest, useRequests } from '../store/requestStore';
import Timeline from '../components/Timeline';
import { RequestStatusPill } from '../components/admin/RequestsPanel';
import { dimsLabel, getProduct, getStyle } from '../data/products';
import { inr } from '../lib/pricing';
import type { QuoteRequest } from '../types';

const isDemo = (id: string) => id.startsWith('PT-DEMO') || id.startsWith('QR-DEMO');
const isRequestId = (id: string) => id.trim().toUpperCase().startsWith('QR-');

export default function Track() {
  const params = useParams();
  const [search] = useSearchParams();
  const orders = useOrders((s) => s.orders);
  const requests = useRequests((s) => s.requests);
  const [id, setId] = useState(params.id ?? '');
  const [contact, setContact] = useState(search.get('c') ?? '');
  const [query, setQuery] = useState<{ id: string; contact: string } | null>(null);

  // demo links work without asking for contact details
  useEffect(() => {
    if (params.id && isDemo(params.id)) {
      const req = requests.find((x) => x.id === params.id);
      const order = orders.find((x) => x.id === params.id);
      const phone = req?.customer.phone ?? order?.customer.phone;
      if (phone) {
        setId(params.id);
        setContact(phone);
        setQuery({ id: params.id, contact: phone });
      }
    } else if (params.id && search.get('c')) setQuery({ id: params.id, contact: search.get('c')! });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const request = query && isRequestId(query.id) ? findRequest(requests, query.id, query.contact) : undefined;
  const order = query && !isRequestId(query.id) ? findOrder(orders, query.id, query.contact) : undefined;

  return (
    <div className="container-x max-w-3xl py-12">
      <p className="eyebrow">Tracking</p>
      <h1 className="mt-3 text-4xl font-semibold text-forest">Where's my request or order?</h1>
      <form
        className="card mt-8 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery({ id: id.trim(), contact });
        }}
      >
        <input className="input" placeholder="Request or order ID, e.g. QR-4HM9TA" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} aria-label="Request or order ID" required />
        <input className="input" placeholder="Email or mobile you used" value={contact} onChange={(e) => setContact(e.target.value)} aria-label="Email or mobile" required />
        <button className="btn-primary">Track</button>
      </form>
      <p className="mt-2 text-xs text-ink/50">
        Demo: <Link className="underline" to="/track/QR-DEMO01">QR-DEMO01</Link> (quote sent, sample on its way) ·{' '}
        <Link className="underline" to="/track/QR-DEMO02">QR-DEMO02</Link> (just received) ·{' '}
        <Link className="underline" to="/track/PT-DEMO01">PT-DEMO01</Link> (order being printed) ·{' '}
        <Link className="underline" to="/track/PT-DEMO02">PT-DEMO02</Link> (order in transit)
      </p>

      {query && !order && !request && (
        <p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          We couldn't find a request or order with that ID and contact. Check the confirmation, or <Link to="/quote" className="underline">contact us</Link>.
        </p>
      )}

      {request && <RequestView r={request} />}

      {order && (
        <div className="mt-8 space-y-6">
          <div className="card p-5 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span>
                <b className="font-mono">{order.id}</b> · {order.customer.company || order.customer.name}
              </span>
              <span className="text-ink/60">Ships to {order.customer.city} {order.customer.pincode}</span>
            </div>
            <p className="mt-2 text-ink/60">{order.items.map((i) => `${getProduct(i.productId).name} (${getStyle(getProduct(i.productId), i.styleId).name}) × ${i.qty}`).join(' · ')}</p>
          </div>
          {[...order.shipments]
            .sort((a, b) => Number(b.kind === 'sample') - Number(a.kind === 'sample'))
            .map((s) => (
              <div key={s.kind} className="card p-6">
                <Timeline order={order} shipment={s} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function RequestView({ r }: { r: QuoteRequest }) {
  const product = getProduct(r.spec.productId);
  const style = getStyle(product, r.spec.styleId);
  // the five customer-facing stages; the last event for each tells when it happened
  const stages = REQUEST_FLOW.filter((s) => s !== 'closed' && (r.wantsSample || (s !== 'sample_sent' && s !== 'sample_delivered')));
  const reached = (s: (typeof stages)[number]) => REQUEST_FLOW.indexOf(r.status) >= REQUEST_FLOW.indexOf(s) || (s === 'quoted' && !!r.quotation);
  const when = (s: (typeof stages)[number]) => [...r.events].reverse().find((e) => e.status === s);
  return (
    <div className="mt-8 space-y-6">
      <div className="card p-5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span><b className="font-mono">{r.id}</b> · {r.customer.company}</span>
          <RequestStatusPill status={r.status} />
        </div>
        <p className="mt-2 text-ink/70">
          {product.name} · {style.name} · {dimsLabel(product, r.spec.dims)} × {r.qty.toLocaleString('en-IN')}
        </p>
        <p className="mt-1 text-ink/50">{REQUEST_META[r.status].customer}</p>
      </div>

      {r.quotation && (
        <div className="card border-forest/30 bg-forest/5 p-5 text-sm">
          <p className="eyebrow !text-forest">Your quotation</p>
          <p className="mt-2 font-display text-3xl font-bold text-forest">{inr(r.quotation.total)} <span className="text-base font-normal text-ink/60">+ GST</span></p>
          <p className="text-ink/70">{r.quotation.qty.toLocaleString('en-IN')} pieces at {inr(r.quotation.unitPrice)} each · ready in about {r.quotation.leadTimeDays} days after approval · valid until {new Date(r.quotation.validUntil).toLocaleDateString('en-IN')}</p>
          {r.quotation.note && <p className="mt-2 italic text-ink/60">“{r.quotation.note}”</p>}
          <p className="mt-3 text-xs text-ink/50">To go ahead, reply to our email or call us, or re-open the design in the studio and add it to your cart.</p>
        </div>
      )}

      {r.sample && (
        <div className="card border-sky-200 bg-sky-50 p-5 text-sm">
          <p className="eyebrow !text-sky-800">Your physical sample</p>
          <p className="mt-2">Sent with <b>{r.sample.courier}</b>, tracking number <b className="font-mono">{r.sample.awb}</b>, on {new Date(r.sample.dispatchedAt).toLocaleDateString('en-IN')}.</p>
          <p className="text-ink/60">Posting to {r.customer.name}, {r.customer.city} {r.customer.pincode}{r.sample.deliveredAt ? ` · delivered ${new Date(r.sample.deliveredAt).toLocaleDateString('en-IN')}` : ''}</p>
        </div>
      )}

      <div className="card p-6">
        <ol className="space-y-4">
          {stages.map((s) => {
            const done = reached(s);
            const ev = when(s);
            return (
              <li key={s} className="flex gap-3">
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${done ? 'bg-forest' : 'border-2 border-ink/25'}`} />
                <span>
                  <span className={`font-semibold ${done ? '' : 'text-ink/40'}`}>{s === 'new' ? 'Request received' : REQUEST_META[s].label}</span>
                  {ev && <span className="block text-xs text-ink/55">{fmt(ev.at)} · {ev.note}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
