import { Link } from 'react-router-dom';
import { PRODUCTS, defaultDims, getProduct } from '../data/products';
import { inr, unitPrice } from '../lib/pricing';
import ProductIcon from '../components/ProductIcon';
import type { Product } from '../types';

const spec = (p: Product) => ({ productId: p.id, dims: defaultDims(p), materialId: p.materials[0].id, finishId: p.finishes[0].id });

export default function Home() {
  const rigid = getProduct('rigid-box');
  const one = unitPrice(spec(rigid), 1);
  const thousand = unitPrice(spec(rigid), 1000) * 1000;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="eyebrow">Eco-friendly custom packaging · No minimum order</p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] text-forest sm:text-6xl lg:text-7xl">
              Everyone else starts at a thousand.
              <span className="block text-clay">We start at one.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
              Rigid boxes, shipping cartons, mono cartons, paper cups and bags, printed with your brand. Upload your
              artwork, turn it around in 3D, and order a single piece if that's all you need. Every item comes with a
              free sample.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/studio" className="btn-primary !px-7 !py-3.5 text-base">
                Design your packaging →
              </Link>
              <Link to="/quote" className="btn-ghost !px-7 !py-3.5 text-base">
                Get a bulk quote
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/70">
              <li>✓ Free sample with every item</li>
              <li>✓ Tracking from press to doorstep</li>
              <li>✓ Plastic-free materials</li>
            </ul>
          </div>

          {/* Quote-ticket comparison */}
          <div className="relative">
            <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-kraft/30 blur-3xl" aria-hidden />
            <div className="relative grid gap-4">
              <div className="card rotate-[-2deg] p-6 opacity-80">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">A typical packaging supplier</p>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div><dt className="text-ink/50">Minimum order</dt><dd className="font-display text-2xl font-semibold line-through decoration-clay">1,000</dd></div>
                  <div><dt className="text-ink/50">Upfront</dt><dd className="font-display text-2xl font-semibold">{inr(Math.round(thousand / 1000) * 1000)}+</dd></div>
                  <div><dt className="text-ink/50">First look</dt><dd className="font-display text-2xl font-semibold">PDF proof</dd></div>
                </dl>
              </div>
              <div className="card relative rotate-[1.5deg] border-forest/30 p-6 shadow-xl">
                <span className="pill absolute -top-3 right-5 bg-clay text-white">Petti</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-forest">Same rigid box at Petti</p>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div><dt className="text-ink/50">Minimum order</dt><dd className="font-display text-4xl font-bold text-forest">1</dd></div>
                  <div><dt className="text-ink/50">Upfront</dt><dd className="font-display text-2xl font-semibold text-forest">{inr(one)}</dd></div>
                  <div><dt className="text-ink/50">First look</dt><dd className="font-display text-2xl font-semibold text-forest">3D + free sample</dd></div>
                </dl>
                <p className="mt-4 text-xs text-ink/50">
                  {rigid.name}, {rigid.dims.map((d) => d.default).join('×')} mm, kraft wrap. Prices fall automatically as you order more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-forest text-paper">
        <div className="container-x grid gap-10 py-16 md:grid-cols-[1fr_1.4fr] md:py-20">
          <div>
            <p className="eyebrow !text-kraft">The bedroom warehouse</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Ask a D2C founder where their first 1,000 boxes went.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ['Under the bed.', 'Cash that should have gone into product or ads, sitting in cartons for months.'],
              ['Wrong size.', 'Most first boxes are designed before the product is final. Then the product changes.'],
              ['Old logo.', 'A rebrand at month six turns 800 unused boxes into scrap.'],
            ].map(([t, d]) => (
              <div key={t} className="border-l-2 border-kraft/60 pl-4">
                <h3 className="font-display text-xl font-semibold text-kraft">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/75">{d}</p>
              </div>
            ))}
            <p className="text-lg leading-relaxed text-paper sm:col-span-3">
              Petti prints what you need when you need it: 1 box for a pitch, 40 for a launch, 4,000 once the orders roll in.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="container-x py-20" id="products">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Five product lines, one studio</p>
            <h2 className="mt-3 text-4xl font-semibold text-forest">Pick a format. Make it yours.</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-forest underline-offset-4 hover:underline">
            Compare all specs →
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PRODUCTS.map((p) => (
            <Link key={p.id} to={`/studio/${p.id}`} className="card group flex flex-col p-5 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="grid h-28 place-items-center rounded-xl bg-paper text-forest">
                <ProductIcon id={p.id} className="h-20 w-20 transition group-hover:scale-110" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-ink/60">{p.short}</p>
              <p className="mt-auto pt-4 text-sm">
                <span className="text-ink/50">1 piece from </span>
                <span className="font-semibold text-forest">{inr(unitPrice(spec(p), 1))}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="kraft-texture">
        <div className="container-x py-20">
          <p className="eyebrow !text-forest">How it works</p>
          <h2 className="mt-3 text-4xl font-semibold text-forest">From artwork to doorstep, all on one page.</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {[
              ['Upload', 'Drop your artwork onto the flat template for your box, cup or bag.'],
              ['See it in 3D', 'Rotate, zoom and check every side before anything is printed.'],
              ['Free sample', 'Tick "free sample" and we post one printed piece first.'],
              ['Order any quantity', 'From 1 to 10,000. The price per piece drops as you order more.'],
              ['Track it', 'Follow it through printing, quality check, hubs and delivery.'],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-2xl bg-paper/90 p-5 shadow-sm">
                <span className="font-display text-4xl font-bold text-clay">{i + 1}</span>
                <h3 className="mt-2 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-ink/65">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TRACKING + ECO */}
      <section className="container-x grid gap-8 py-20 lg:grid-cols-2">
        <div className="card p-8">
          <p className="eyebrow">Live tracking</p>
          <h2 className="mt-3 text-3xl font-semibold text-forest">Know exactly where your boxes are.</h2>
          <p className="mt-3 text-ink/70">
            Every order has two timelines: production in our factory, then delivery through our hubs. Your free sample gets its own tracking number.
          </p>
          <ol className="mt-6 space-y-3 text-sm">
            {[
              ['Printing', 'Chennai factory', true],
              ['Quality check', 'Chennai factory', true],
              ['In transit', 'Bengaluru hub', true],
              ['Out for delivery', 'Hyderabad', false],
            ].map(([t, c, done]) => (
              <li key={t as string} className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${done ? 'bg-forest' : 'border-2 border-ink/25'}`} />
                <span className="font-medium">{t}</span>
                <span className="text-ink/50">· {c}</span>
              </li>
            ))}
          </ol>
          <Link to="/track/PT-DEMO02" className="btn-ghost mt-6">See a live demo order →</Link>
        </div>
        <div className="card bg-forest-dark p-8 text-paper">
          <p className="eyebrow !text-kraft">Paper, not promises</p>
          <h2 className="mt-3 text-3xl font-semibold">What actually goes into your box.</h2>
          <ul className="mt-6 space-y-4 text-sm text-paper/80">
            <li><b className="text-paper">Water-based and soy inks.</b> No solvent inks on any product line.</li>
            <li><b className="text-paper">Aqueous coatings instead of plastic lamination.</b> The box stays recyclable with ordinary paper.</li>
            <li><b className="text-paper">Recycled board and kraft</b> as the default option, not an upsell.</li>
            <li><b className="text-paper">Plastic-free cups.</b> Aqueous-lined or compostable PLA, no PE film.</li>
            <li><b className="text-paper">Printed on demand.</b> Making only what you'll use is the simplest way to cut waste.</li>
          </ul>
        </div>
      </section>

      {/* LEAD MAGNETS */}
      <section className="container-x">
        <div className="grid overflow-hidden rounded-3xl bg-clay text-white md:grid-cols-2">
          <div className="p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Free · for first-time founders</p>
            <h2 className="mt-3 text-3xl font-semibold">The Packaging Starter Kit</h2>
            <p className="mt-3 text-white/85">
              Print-ready blank dielines for all five formats, a box-size cheat sheet for common D2C products, and a
              packaging budget planner for your first 100 orders.
            </p>
            <Link to="/starter-kit" className="btn mt-6 bg-white text-clay hover:bg-paper">Get the free kit →</Link>
          </div>
          <div className="bg-clay/80 p-10 md:border-l md:border-white/20">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Ordering 500+ a month?</p>
            <h2 className="mt-3 text-3xl font-semibold">Get a quote in 24 hours</h2>
            <p className="mt-3 text-white/85">
              Tell us what you ship and how many. A packaging specialist (a person, not a bot) will call you back
              with options and prices.
            </p>
            <Link to="/quote" className="btn mt-6 border border-white/70 text-white hover:bg-white hover:text-clay">Request a quote →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x py-20">
        <h2 className="text-3xl font-semibold text-forest">Questions founders ask us</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ['Is it really one piece?', 'Yes. Order a quantity of 1 at checkout. One-offs are printed digitally, and runs of 500 or more move to offset or flexo to bring the price down.'],
            ['What does the free sample include?', 'One printed piece of each design you tick, posted before your main run. It ships separately with its own tracking number.'],
            ['What file should I upload?', 'PNG or JPG, at least 1500 px on the long side. For final print, our pre-press team will ask for a PDF with 3 mm bleed.'],
            ['How long does it take?', 'Samples ship in about 3 days. Production orders are usually delivered in 7 to 10 days, depending on quantity and finish.'],
          ].map(([q, a]) => (
            <details key={q} className="card group p-5">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">
                <span className="mr-2 text-clay group-open:hidden">+</span>
                <span className="mr-2 hidden text-clay group-open:inline">–</span>
                {q}
              </summary>
              <p className="mt-3 text-sm text-ink/70">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
