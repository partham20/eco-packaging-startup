import { Link } from 'react-router-dom';
import { useCart } from '../store/cartStore';
import { getProduct, getStyle, dimsLabel } from '../data/products';
import { FREE_SHIPPING_ABOVE, GST_RATE, TIERS, cartTotals, inr, lineTotal, tierFor, unitPrice } from '../lib/pricing';
import ProductIcon from '../components/ProductIcon';

export default function Cart() {
  const { items, setQty, toggleSample, remove } = useCart();
  const t = cartTotals(items);
  const samples = items.filter((i) => i.freeSample).length;

  if (items.length === 0)
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-4xl font-semibold text-forest">Your cart is empty</h1>
        <p className="mt-3 text-ink/60">Design a box, cup or bag. You can order just one.</p>
        <Link to="/studio" className="btn-primary mt-8">Open the design studio →</Link>
      </div>
    );

  return (
    <div className="container-x py-10">
      <h1 className="text-4xl font-semibold text-forest">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((i) => {
            const p = getProduct(i.productId);
            const next = TIERS[TIERS.indexOf(tierFor(i.qty)) + 1];
            return (
              <li key={i.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                <div className="grid h-28 w-full shrink-0 place-items-center overflow-hidden rounded-xl bg-paper sm:w-32">
                  {i.thumbnail ? <img src={i.thumbnail} alt={`${p.name} preview`} className="h-full w-full object-cover" /> : <ProductIcon id={p.id} className="h-16 w-16 text-forest" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-sans text-lg font-semibold">{p.name} <span className="text-sm font-normal text-ink/55">· {getStyle(p, i.styleId).name}</span></h2>
                      <p className="text-sm text-ink/60">
                        {dimsLabel(p, i.dims)} · {p.materials.find((m) => m.id === i.materialId)?.label} · {p.finishes.find((f) => f.id === i.finishId)?.label}
                      </p>
                      {i.styleNote && <p className="text-xs italic text-ink/55">Custom opening: “{i.styleNote}”</p>}
                      {!i.hasArtwork && <p className="text-xs text-clay">Unprinted (no artwork uploaded)</p>}
                    </div>
                    <button onClick={() => remove(i.id)} className="text-sm text-ink/50 hover:text-red-700" aria-label={`Remove ${p.name}`}>Remove</button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      Qty
                      <input type="number" min={1} value={i.qty} onChange={(e) => setQty(i.id, +e.target.value)} className="input w-24" />
                    </label>
                    <span className="text-sm text-ink/60">× {inr(unitPrice(i, i.qty))}</span>
                    <span className="ml-auto font-semibold">{inr(lineTotal(i))}</span>
                  </div>
                  {next && <p className="mt-1 text-xs text-ink/50">Add {next.min - i.qty} more to drop to {inr(unitPrice(i, next.min))} per piece.</p>}
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={i.freeSample} onChange={() => toggleSample(i.id)} className="h-4 w-4 accent-forest" />
                    Free printed sample first <span className="pill bg-forest/10 text-forest">₹0</span>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <aside className="card h-fit space-y-3 p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">Summary</h2>
          <Row k="Subtotal" v={inr(t.subtotal)} />
          {samples > 0 && <Row k={`Free samples (${samples})`} v="₹0" />}
          <Row k="Shipping" v={t.shipping ? inr(t.shipping) : 'Free'} />
          {t.shipping > 0 && <p className="text-xs text-ink/50">Free shipping above {inr(FREE_SHIPPING_ABOVE)}</p>}
          <Row k={`GST (${Math.round(GST_RATE * 100)}%)`} v={inr(t.gst)} />
          <div className="flex items-baseline justify-between border-t border-ink/10 pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-forest">{inr(t.total)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full">Checkout →</Link>
          <Link to="/studio" className="btn-ghost w-full">Add another design</Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink/60">{k}</span>
      <span>{v}</span>
    </div>
  );
}
