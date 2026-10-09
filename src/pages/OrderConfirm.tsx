import { Link, useParams } from 'react-router-dom';
import { useOrders, etaFor } from '../store/orderStore';
import { getProduct, getStyle, dimsLabel } from '../data/products';
import { inr } from '../lib/pricing';

export default function OrderConfirm() {
  const { id } = useParams();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  if (!order)
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl font-semibold text-forest">Order not found</h1>
        <Link to="/track" className="btn-primary mt-6">Track an order</Link>
      </div>
    );
  const sample = order.shipments.find((s) => s.kind === 'sample');
  return (
    <div className="container-x max-w-3xl py-14">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest text-3xl text-paper">✓</span>
        <h1 className="mt-5 text-4xl font-semibold text-forest">Thank you, {order.customer.name.split(' ')[0]}!</h1>
        <p className="mt-2 text-ink/70">
          Your order <b className="font-mono">{order.id}</b> is confirmed. We've sent the details to {order.customer.email}.
        </p>
      </div>
      <div className="card mt-10 divide-y divide-ink/10">
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <p className="label">What happens next</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink/75">
              {sample && <li>Your free sample ships within 2–3 days.</li>}
              <li>Our pre-press team checks your artwork within 24 hours.</li>
              <li>Production starts, and every stage appears on your tracking page.</li>
            </ol>
          </div>
          <div>
            <p className="label">Estimated delivery</p>
            <p className="font-display text-2xl font-semibold text-forest">
              {etaFor(order, 'main').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            {sample && <p className="text-sm text-ink/60">Sample by {etaFor(order, 'sample').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
          </div>
        </div>
        <ul className="p-6 text-sm">
          {order.items.map((i) => {
            const p = getProduct(i.productId);
            return (
              <li key={i.id} className="flex items-center gap-3 py-2">
                {i.thumbnail && <img src={i.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                <span className="flex-1">
                  {p.name} · {getStyle(p, i.styleId).name} · {dimsLabel(p, i.dims)} × {i.qty.toLocaleString('en-IN')}
                  {i.freeSample && <span className="pill ml-2 bg-forest/10 text-forest">+ free sample</span>}
                </span>
                <span>{inr(i.lineTotal)}</span>
              </li>
            );
          })}
          <li className="flex justify-between border-t border-ink/10 pt-3 font-semibold">
            <span>Paid (incl. GST & shipping)</span>
            <span>{inr(order.total)}</span>
          </li>
        </ul>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/track/${order.id}?c=${encodeURIComponent(order.customer.email)}`} className="btn-primary">Track this order →</Link>
        <Link to="/studio" className="btn-ghost">Design something else</Link>
      </div>
    </div>
  );
}
