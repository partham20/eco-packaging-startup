import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { findOrder, useOrders } from '../store/orderStore';
import Timeline from '../components/Timeline';
import { getProduct } from '../data/products';

export default function Track() {
  const params = useParams();
  const [search] = useSearchParams();
  const orders = useOrders((s) => s.orders);
  const [id, setId] = useState(params.id ?? '');
  const [contact, setContact] = useState(search.get('c') ?? '');
  const [query, setQuery] = useState<{ id: string; contact: string } | null>(null);

  // demo order links work without asking for contact details
  useEffect(() => {
    if (params.id?.startsWith('PT-DEMO')) {
      const o = orders.find((x) => x.id === params.id);
      if (o) {
        setContact(o.customer.phone);
        setQuery({ id: o.id, contact: o.customer.phone });
      }
    } else if (params.id && search.get('c')) setQuery({ id: params.id, contact: search.get('c')! });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const order = query ? findOrder(orders, query.id, query.contact) : undefined;

  return (
    <div className="container-x max-w-3xl py-12">
      <p className="eyebrow">Order tracking</p>
      <h1 className="mt-3 text-4xl font-semibold text-forest">Where's my packaging?</h1>
      <form
        className="card mt-8 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery({ id, contact });
        }}
      >
        <input className="input" placeholder="Order ID, e.g. PT-7KX2QM" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} aria-label="Order ID" required />
        <input className="input" placeholder="Email or mobile used at checkout" value={contact} onChange={(e) => setContact(e.target.value)} aria-label="Email or mobile" required />
        <button className="btn-primary">Track</button>
      </form>
      <p className="mt-2 text-xs text-ink/50">
        Demo: <Link className="underline" to="/track/PT-DEMO01">PT-DEMO01</Link> (being printed, sample delivered) ·{' '}
        <Link className="underline" to="/track/PT-DEMO02">PT-DEMO02</Link> (in transit to Hyderabad)
      </p>

      {query && !order && (
        <p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          We couldn't find an order with that ID and contact. Check the confirmation email, or <Link to="/quote" className="underline">contact us</Link>.
        </p>
      )}

      {order && (
        <div className="mt-8 space-y-6">
          <div className="card p-5 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span>
                <b className="font-mono">{order.id}</b> · {order.customer.company || order.customer.name}
              </span>
              <span className="text-ink/60">Ships to {order.customer.city} {order.customer.pincode}</span>
            </div>
            <p className="mt-2 text-ink/60">{order.items.map((i) => `${getProduct(i.productId).name} × ${i.qty}`).join(' · ')}</p>
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
