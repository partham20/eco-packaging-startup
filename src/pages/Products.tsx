import { Link } from 'react-router-dom';
import { PRODUCTS, defaultDims } from '../data/products';
import { inr, unitPrice } from '../lib/pricing';
import ProductIcon from '../components/ProductIcon';

export default function Products() {
  return (
    <div className="container-x py-12">
      <p className="eyebrow">Product lines</p>
      <h1 className="mt-3 text-4xl font-semibold text-forest sm:text-5xl">Five formats, every one made to order.</h1>
      <p className="mt-3 max-w-2xl text-ink/70">
        Every format comes in any size within its range, in several opening styles. Every one ships from a single piece, with no minimum order.
      </p>
      <div className="mt-10 space-y-6">
        {PRODUCTS.map((p) => {
          const spec = { productId: p.id, styleId: p.styles[0].id, dims: defaultDims(p), materialId: p.materials[0].id, finishId: p.finishes[0].id };
          return (
            <article key={p.id} className="card grid gap-6 p-6 md:grid-cols-[160px_1fr_220px]">
              <div className="grid h-36 place-items-center rounded-xl bg-paper text-forest">
                <ProductIcon id={p.id} className="h-24 w-24" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{p.name}</h2>
                <p className="mt-1 text-ink/70">{p.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.useCases.map((u) => <span key={u} className="pill bg-kraft/25 text-ink/80">{u}</span>)}
                </div>
                <div className="mt-4">
                  <span className="label">Opening styles</span>
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {p.styles.map((s) => (
                      <li key={s.id}>
                        <Link to={`/studio/${p.id}/${s.id}`} className="block rounded-lg border border-ink/10 px-3 py-1.5 text-sm transition hover:border-forest/50 hover:bg-forest/5">
                          <b>{s.name}</b>
                          <span className="block text-xs text-ink/50">{s.blurb}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div><dt className="label">Sizes (mm)</dt><dd>{p.dims.map((d) => `${d.label} ${d.min}–${d.max}`).join(', ')}</dd></div>
                  <div><dt className="label">Materials</dt><dd>{p.materials.map((m) => m.label).join(', ')}</dd></div>
                  <div><dt className="label">Finishes</dt><dd>{p.finishes.map((f) => f.label).join(', ')}</dd></div>
                </dl>
              </div>
              <div className="flex flex-col justify-between gap-4 rounded-xl bg-paper p-4">
                <div className="text-sm">
                  <p className="text-ink/60">{p.styles[0].name}, standard size, 1 piece</p>
                  <p className="font-display text-3xl font-bold text-forest">{inr(unitPrice(spec, 1))}</p>
                  <p className="text-ink/60">or {inr(unitPrice(spec, 250))} each at 250+</p>
                </div>
                <Link to={`/studio/${p.id}`} className="btn-primary">Design yours →</Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
