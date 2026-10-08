import { Link } from 'react-router-dom';
import { PRODUCTS, defaultDims } from '../data/products';
import { inr, unitPrice } from '../lib/pricing';
import ProductIcon from '../components/ProductIcon';

export default function Products() {
  return (
    <div className="container-x py-12">
      <p className="eyebrow">Product lines</p>
      <h1 className="mt-3 text-4xl font-semibold text-forest sm:text-5xl">Five formats, all made to order.</h1>
      <p className="mt-3 max-w-2xl text-ink/70">Every format comes in any size within its range. Every one ships from a single piece, with a free sample.</p>
      <div className="mt-10 space-y-6">
        {PRODUCTS.map((p) => {
          const spec = { productId: p.id, dims: defaultDims(p), materialId: p.materials[0].id, finishId: p.finishes[0].id };
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
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div><dt className="label">Sizes (mm)</dt><dd>{p.dims.map((d) => `${d.label} ${d.min}–${d.max}`).join(', ')}</dd></div>
                  <div><dt className="label">Materials</dt><dd>{p.materials.map((m) => m.label).join(', ')}</dd></div>
                  <div><dt className="label">Finishes</dt><dd>{p.finishes.map((f) => f.label).join(', ')}</dd></div>
                </dl>
              </div>
              <div className="flex flex-col justify-between gap-4 rounded-xl bg-paper p-4">
                <div className="text-sm">
                  <p className="text-ink/60">Standard size, 1 piece</p>
                  <p className="font-display text-3xl font-bold text-forest">{inr(unitPrice(spec, 1))}</p>
                  <p className="text-ink/60">or {inr(unitPrice(spec, 1000))} each at 1,000+</p>
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
