import { Link } from 'react-router-dom';
import { PRODUCTS, defaultDims, getProduct } from '../data/products';
import { inr, unitPrice } from '../lib/pricing';
import ProductIcon from '../components/ProductIcon';
import InstantQuote from '../components/InstantQuote';
import type { Product } from '../types';

const spec = (p: Product) => ({ productId: p.id, styleId: p.styles[0].id, dims: defaultDims(p), materialId: p.materials[0].id, finishId: p.finishes[0].id });

const STYLE_COUNT = PRODUCTS.reduce((n, p) => n + p.styles.length, 0);

export default function Home() {
  const rigid = getProduct('rigid-box');
  const ladder = [
    { qty: 1, name: 'Prototype', line: 'One piece to check fit, feel and finish.' },
    { qty: 25, name: 'Pilot', line: 'A small batch for your first customers and shoots.' },
    { qty: 250, name: 'Launch', line: 'A proper run once the pilot proves the pack.' },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow">Prototyping & low-volume custom packaging</p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] text-forest sm:text-6xl lg:text-7xl">
              Prototype it. Pilot it.
              <span className="block text-clay">No minimum order.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
              Custom boxes, cartons, cups and bags for startups and emerging brands launching a pilot run. Choose an opening style,
              set your own size, drop in your artwork and turn it around in 3D. Then get a quote and a physical sample, with no bulk commitment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/studio" className="btn-primary !px-7 !py-3.5 text-base">
                Design your packaging →
              </Link>
              <Link to="/starter-kit" className="btn-ghost !px-7 !py-3.5 text-base">
                Get the free prototype kit
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/70">
              <li>✓ Order from a single piece</li>
              <li>✓ Physical sample before you commit</li>
              <li>✓ Quote and dieline in minutes</li>
            </ul>
          </div>

          {/* Lead magnet: instant prototype quote */}
          <div className="relative">
            <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-kraft/30 blur-3xl" aria-hidden />
            <InstantQuote className="relative" />
          </div>
        </div>
      </section>

      {/* PROTOTYPE → PILOT → LAUNCH */}
      <section className="bg-forest text-paper">
        <div className="container-x grid gap-10 py-16 md:grid-cols-[1fr_1.5fr] md:py-20">
          <div>
            <p className="eyebrow !text-kraft">Built for pilot launches</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">Pilot first. Commit later.</h2>
            <p className="mt-4 text-paper/75">
              Most first packs are designed before the product is final. Print a handful, put them in front of real customers, and change what needs changing before you scale.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {ladder.map((s) => (
              <div key={s.name} className="rounded-2xl border border-paper/15 bg-paper/5 p-5">
                <p className="font-display text-4xl font-bold text-kraft">{s.qty}<span className="ml-1 text-base font-normal text-paper/60">pc</span></p>
                <h3 className="mt-1 font-sans text-lg font-semibold">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{s.line}</p>
                <p className="mt-4 border-t border-paper/15 pt-3 text-sm text-paper/80">
                  <b className="text-paper">{inr(unitPrice(spec(rigid), s.qty))}</b> each
                  <span className="block text-xs text-paper/50">{rigid.name}, standard size</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS + STYLES */}
      <section className="container-x py-20" id="products">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{PRODUCTS.length} formats · {STYLE_COUNT} opening styles</p>
            <h2 className="mt-3 text-4xl font-semibold text-forest">Pick a Format, Make It Yours</h2>
            <p className="mt-2 max-w-2xl text-ink/65">Choose the pack, then the way it opens. Every style has its own flat dieline and a live 3D model.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-forest underline-offset-4 hover:underline">
            Compare all specs →
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="card flex flex-col p-5">
              <Link to={`/studio/${p.id}`} className="group">
                <div className="grid h-28 place-items-center rounded-xl bg-paper text-forest">
                  <ProductIcon id={p.id} className="h-20 w-20 transition group-hover:scale-110" />
                </div>
                <h3 className="mt-4 text-lg font-semibold group-hover:text-forest">{p.name}</h3>
              </Link>
              <p className="text-sm text-ink/60">{p.short}</p>
              <ul className="mt-3 space-y-1.5">
                {p.styles.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/studio/${p.id}/${s.id}`}
                      className="flex items-baseline justify-between gap-3 rounded-lg border border-ink/10 px-3 py-1.5 text-sm transition hover:border-forest/50 hover:bg-forest/5"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="shrink-0 text-xs text-ink/45">{s.opening}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-4 text-sm">
                <span className="text-ink/50">1 piece from </span>
                <span className="font-semibold text-forest">{inr(Math.min(...p.styles.map((s) => unitPrice({ ...spec(p), styleId: s.id, dims: defaultDims(p, s.id) }, 1))))}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="kraft-texture">
        <div className="container-x py-20">
          <p className="eyebrow !text-forest">How it works</p>
          <h2 className="mt-3 text-4xl font-semibold text-forest">From idea to a sample in your hands.</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {[
              ['Pick a style', 'Choose the format and how it opens: lid, drawer, magnetic, tuck-end, handles…'],
              ['Set your size', 'Type in length, width and depth, then drop your artwork onto the flat dieline.'],
              ['Inspect it', 'Switch between the unfolded dieline and a 3D model you can rotate and open.'],
              ['Request a quote', 'Send your specs, files and volume. We confirm a quotation and post a sample unit.'],
              ['Pilot, then scale', 'Order from 1 piece. The price per piece drops as your volume grows.'],
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

      {/* TRACKING + WHY */}
      <section className="container-x grid gap-8 py-20 lg:grid-cols-2">
        <div className="card p-8">
          <p className="eyebrow">Quote → sample → order</p>
          <h2 className="mt-3 text-3xl font-semibold text-forest">Know where your request stands.</h2>
          <p className="mt-3 text-ink/70">
            Every request has a reference. Follow it from review, to your confirmed quotation, to the sample unit leaving our factory. Orders have their own production and delivery timelines.
          </p>
          <ol className="mt-6 space-y-3 text-sm">
            {[
              ['Request received', 'Specs, artwork and volume attached', true],
              ['Quotation confirmed', 'Price, lead time and validity', true],
              ['Sample dispatched', 'Courier and tracking number', true],
              ['Sample delivered', 'Your feedback, then the pilot order', false],
            ].map(([t, c, done]) => (
              <li key={t as string} className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${done ? 'bg-forest' : 'border-2 border-ink/25'}`} />
                <span className="font-medium">{t}</span>
                <span className="text-ink/50">· {c}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/track/QR-DEMO01" className="btn-ghost">See a demo request →</Link>
            <Link to="/track/PT-DEMO02" className="btn-ghost">See a demo order →</Link>
          </div>
        </div>
        <div className="card bg-forest-dark p-8 text-paper">
          <p className="eyebrow !text-kraft">Why startups pilot with Petti</p>
          <h2 className="mt-3 text-3xl font-semibold">Packaging that keeps up with your product.</h2>
          <ul className="mt-6 space-y-4 text-sm text-paper/80">
            <li><b className="text-paper">No minimum order.</b> Print 1, 10 or 100 pieces. Nothing forces you into a bulk run.</li>
            <li><b className="text-paper">Prototype support.</b> Custom sizes, structural styles and a real sample unit before you decide.</li>
            <li><b className="text-paper">Change the design freely.</b> New logo or new product size? Update the file and print the next batch.</li>
            <li><b className="text-paper">Prices that step down.</b> As the pilot turns into demand, the per-piece price falls at 10, 50, 100, 250, 500 and 1,000 pieces.</li>
            <li><b className="text-paper">Printed on demand.</b> You only pay for the packs you will actually use.</li>
          </ul>
        </div>
      </section>

      {/* LEAD MAGNETS */}
      <section className="container-x" id="prototype-kit">
        <div className="grid overflow-hidden rounded-3xl bg-clay text-white md:grid-cols-2">
          <div className="p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Free · for founders launching a pilot</p>
            <h2 className="mt-3 text-3xl font-semibold">The Prototype Kit</h2>
            <p className="mt-3 text-white/85">
              Blank dielines for every one of our {STYLE_COUNT} styles, a box-size cheat sheet, a pilot-run cost planner and, if you
              like, a physical sample pack posted to your door.
            </p>
            <Link to="/starter-kit" className="btn mt-6 bg-white text-clay hover:bg-paper">Get the free kit →</Link>
          </div>
          <div className="bg-clay/80 p-10 md:border-l md:border-white/20">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Already have a design?</p>
            <h2 className="mt-3 text-3xl font-semibold">Request a quote & sample</h2>
            <p className="mt-3 text-white/85">
              Configure your pack in the studio, then send it to us with your volume and files. A packaging specialist confirms the
              quotation and we post you a sample unit.
            </p>
            <Link to="/studio" className="btn mt-6 border border-white/70 text-white hover:bg-white hover:text-clay">Open the studio →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x py-20">
        <h2 className="text-3xl font-semibold text-forest">Questions founders ask us</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ['Is it really one piece?', 'Yes. There is no minimum order. One-offs and short runs are printed digitally, and larger runs move to offset or flexo to bring the price down.'],
            ['How does the sample work?', 'Request a quote with "post me a physical sample" ticked. Our team reviews your specs, confirms a quotation and posts one printed unit. It ships with its own tracking number.'],
            ['Can I change the size or the opening style?', 'Yes. Type in your own length, width and depth, and pick any opening style. If you need something we do not list, choose "Other / custom opening" and describe it.'],
            ['What file should I upload?', 'PNG or JPG, at least 1500 px on the long side, dropped straight onto the dieline. For final print, our pre-press team will ask for a PDF with 3 mm bleed.'],
            ['How long does it take?', 'Samples ship in about 3 days after your quotation is confirmed. Pilot orders are usually delivered in 7 to 10 days, depending on quantity and finish.'],
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
