import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Apple, ChevronLeft, ChevronRight, Plus, ShoppingBag, Wallet } from 'lucide-react';
import { CATALOG, type CatalogSection } from '../data/catalog';
import PackShot from '../components/PackShot';

const BAND = ['Doorstep Delivery', 'MOQ Starting at Only 1 Piece', 'Free Design in 3D', 'Free Sample with Every Quote', 'Samples Dispatched in 3 Days'];

const TESTIMONIALS = [
  {
    name: 'Ananya Iyer',
    role: 'A Brand Owner & Customer',
    quote: [
      'The quality is outstanding — the print is crisp, the board feels sturdy, and the soft-touch finish gives our skincare boxes a premium look.',
      'What really stood out was being able to order just 12 boxes for our launch event. Every question was answered quickly on WhatsApp. Truly impressed!',
    ],
  },
  {
    name: 'Rahul Menon',
    role: 'Co-founder, Coffee Brand',
    quote: ['The 3D preview caught a flap that would have covered our logo. We fixed it before the sample shipped, and the real box looked exactly like the render.'],
  },
  {
    name: 'Divya Sundar',
    role: 'D2C Apparel Founder',
    quote: ['Sample arrived in four days. Our pilot of 50 printed mailers sold out the same week, and the reorder took two minutes.'],
  },
  {
    name: 'Karthik Raj',
    role: 'Tea Startup Founder',
    quote: ['We change our blends every season. Printing 25 cartons at a time means no dead stock in the storeroom and no huge advance payment.'],
  },
];

const FAQS = [
  ['What is the minimum order quantity?', 'There is none. You can order a single piece. Prices step down automatically at 10, 50, 100, 250, 500 and 1,000 pieces.'],
  ['How do I design my packaging?', 'Open the free 3D Design Studio, pick a packaging style, type your size and drop your logo or artwork onto the flat dieline. Switch to 3D to spin it and open the lid before you order.'],
  ['Can I get a sample before ordering?', 'Yes. Choose "Request quote & sample" in the studio. We confirm the quotation and post one printed sample, usually within 3 days.'],
  ['How long does delivery take?', 'Pilot orders are usually delivered to your doorstep in 7 to 10 days, depending on quantity, finish and city. Every order has online tracking.'],
  ['Do you help with design?', 'Yes, design support is free. Upload your logo and our pre-press team prepares a print-ready file and sends you a digital proof.'],
];

function Dots({ count, active, onPick, onPrev, onNext }: { count: number; active: number; onPick: (i: number) => void; onPrev: () => void; onNext: () => void }) {
  if (count < 2) return null;
  return (
    <div className="flex items-center justify-center gap-5">
      <button onClick={onPrev} aria-label="Previous" className="text-ink/50 hover:text-ink"><ChevronLeft className="h-5 w-5" /></button>
      <div className="flex items-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <button key={i} onClick={() => onPick(i)} aria-label={`Go to slide ${i + 1}`} className={`h-2 rounded-full transition-all ${i === active ? 'w-[30px] bg-ink' : 'w-2 bg-ink/20 hover:bg-ink/40'}`} />
        ))}
      </div>
      <button onClick={onNext} aria-label="Next" className="text-ink hover:text-ink/70"><ChevronRight className="h-5 w-5" /></button>
    </div>
  );
}

/* ---------- hero ---------- */

function Monitor() {
  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      {/* floating glass panels */}
      <div className="absolute -left-6 top-6 z-10 hidden w-36 rounded-xl border border-white/60 bg-white/40 p-2 shadow-lg backdrop-blur-md sm:block">
        <div className="grid h-20 place-items-center rounded-lg bg-white/60"><PackShot kind="drawer" tone="cream" className="w-24" /></div>
        <div className="mt-1.5 flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 flex-1 rounded bg-white/80" />)}</div>
      </div>
      <div className="absolute -right-4 -top-8 z-10 hidden w-44 rounded-xl border border-white/60 bg-white/40 p-2 shadow-lg backdrop-blur-md sm:block">
        <div className="grid h-16 grid-cols-[1fr_auto] items-center gap-2 rounded-lg bg-white/60 px-2">
          <PackShot kind="rigid" tone="white" className="w-20" />
          <div className="space-y-1">{[0, 1, 2].map((i) => <span key={i} className="block h-1.5 w-8 rounded bg-ink/15" />)}</div>
        </div>
      </div>
      <div className="absolute -bottom-2 -left-10 z-10 hidden w-40 rounded-xl border border-white/60 bg-white/40 p-2 shadow-lg backdrop-blur-md md:block">
        <div className="grid h-16 place-items-center rounded-lg bg-white/60"><PackShot kind="tuck" tone="sage" className="w-20" /></div>
      </div>

      {/* screen */}
      <div className="relative rounded-[18px] bg-[#1b1b1b] p-2.5 shadow-2xl">
        <div className="grid aspect-[16/10] grid-cols-[34px_1fr_120px] overflow-hidden rounded-[10px] bg-[#f7f7f5]">
          <div className="flex flex-col items-center gap-2 border-r border-ink/10 bg-white py-3">
            {[0, 1, 2, 3, 4].map((i) => <span key={i} className={`h-4 w-4 rounded ${i === 1 ? 'bg-ink' : 'bg-ink/10'}`} />)}
          </div>
          <div className="relative grid place-items-center">
            <div className="absolute left-3 top-2 flex gap-1">
              <span className="rounded bg-ink px-2 py-0.5 text-[8px] font-semibold text-white">3D</span>
              <span className="rounded bg-ink/10 px-2 py-0.5 text-[8px]">Dieline</span>
            </div>
            <div className="absolute inset-6 rounded border border-dashed border-[#5fc3c0]/70" />
            <PackShot kind="rigid" tone="cream" className="w-[78%]" />
          </div>
          <div className="space-y-2 border-l border-ink/10 bg-white p-2.5">
            <span className="block h-2 w-3/4 rounded bg-ink/20" />
            <span className="block h-1.5 w-full rounded bg-ink/10" />
            <span className="block h-1.5 w-5/6 rounded bg-ink/10" />
            <div className="grid grid-cols-4 gap-1 pt-1">
              {['#E7B48C', '#1D1D1D', '#6DB33F', '#F2C94C', '#E26D5A', '#5FB7B2', '#EDE6F2', '#fff'].map((c) => (
                <span key={c} className="aspect-square rounded border border-ink/10" style={{ background: c }} />
              ))}
            </div>
            <span className="block h-1.5 w-2/3 rounded bg-ink/10" />
            <span className="mt-2 block rounded bg-ink py-1 text-center text-[7px] font-semibold text-white">Add to cart</span>
          </div>
        </div>
      </div>
      <div className="mx-auto h-10 w-24 bg-gradient-to-b from-[#d6d6d3] to-[#bdbdb9]" />
      <div className="mx-auto h-2.5 w-56 rounded-t-lg bg-[#cfcfcb]" />
    </div>
  );
}

const SLIDES: { content: ReactNode; art: ReactNode; bg: string }[] = [
  {
    bg: 'bg-[linear-gradient(120deg,#d9d9d6_0%,#c9c9c6_55%,#b7b9bd_100%)]',
    content: (
      <>
        <h1 className="text-[34px] font-extrabold uppercase leading-[1.05] tracking-tight text-[#2b2b2b] sm:text-5xl lg:text-[62px]">
          Design your<br />packaging in 3D
        </h1>
        <p className="mt-2 text-[28px] uppercase leading-none tracking-wide text-[#2b2b2b] sm:text-4xl lg:text-[50px]">Before you print.</p>
        <Link to="/studio" className="mt-6 inline-flex h-[58px] items-center rounded-full bg-ink px-12 text-xl text-white transition hover:bg-forest-light">Design Online</Link>
        <p className="mt-10 font-condensed text-3xl uppercase tracking-tight text-[#2b2b2b] sm:text-4xl lg:text-[44px]">See it. Spin it. Customize it.</p>
      </>
    ),
    art: <Monitor />,
  },
  {
    bg: 'bg-[linear-gradient(120deg,#eef3ea_0%,#dfe9d6_50%,#e9e2f0_100%)]',
    content: (
      <>
        <h1 className="text-[34px] font-extrabold uppercase leading-[1.05] tracking-tight text-[#2b2b2b] sm:text-5xl lg:text-[62px]">
          Prototype from<br />just one piece
        </h1>
        <p className="mt-2 text-[28px] uppercase leading-none tracking-wide text-[#2b2b2b] sm:text-4xl lg:text-[50px]">No minimum order.</p>
        <Link to="/starter-kit" className="mt-6 inline-flex h-[58px] items-center rounded-full bg-ink px-12 text-xl text-white transition hover:bg-forest-light">Get Free Sample</Link>
        <p className="mt-10 font-condensed text-3xl uppercase tracking-tight text-[#2b2b2b] sm:text-4xl lg:text-[44px]">Hold it. Test it. Launch it.</p>
      </>
    ),
    art: (
      <div className="relative mx-auto grid w-full max-w-[560px] grid-cols-2 items-end gap-2">
        <PackShot kind="bag" tone="espresso" className="w-full drop-shadow-xl" />
        <div className="space-y-[-10%]">
          <PackShot kind="magnetic" tone="blush" className="w-full drop-shadow-xl" />
          <PackShot kind="mailer" tone="kraft" className="w-full drop-shadow-xl" />
        </div>
      </div>
    ),
  },
];

function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((x) => (x + 1) % SLIDES.length), 7000);
    return () => clearTimeout(t);
  }, [i, paused]);
  return (
    <section onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((s, k) => (
            <div key={k} className={`relative w-full shrink-0 ${s.bg}`} aria-hidden={k !== i}>
              {/* iridescent glow, like light through foil */}
              <div className="pointer-events-none absolute left-[18%] top-1/2 h-[420px] w-[620px] -translate-y-1/2 rounded-full opacity-70 blur-3xl [background:conic-gradient(from_200deg,#7fe3d0,#f3a6e8,#ffe08a,#9ad7ff,#7fe3d0)]" />
              <div className="container-x relative grid min-h-[560px] items-center gap-10 py-14 lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr]">
                <div>{s.content}</div>
                <div className="hidden md:block">{s.art}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="py-5">
        <Dots count={SLIDES.length} active={i} onPick={setI} onPrev={() => setI((x) => (x - 1 + SLIDES.length) % SLIDES.length)} onNext={() => setI((x) => (x + 1) % SLIDES.length)} />
      </div>
    </section>
  );
}

/* ---------- product shelf ---------- */

function Shelf({ section }: { section: CatalogSection }) {
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // one dot per scroll position, stepping a single card at a time
    const measure = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + 12;
      const visible = Math.max(1, Math.round((el.clientWidth + 12) / step));
      setPages(Math.max(1, el.children.length - visible + 1));
      setPage(Math.round(el.scrollLeft / step));
    };
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const to = (p: number) => {
    const el = ref.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const n = (p + pages) % pages;
    el.scrollTo({ left: n * (card.offsetWidth + 12), behavior: 'smooth' });
  };

  return (
    <section className="container-x pt-8" id={section.id}>
      <div className="flex items-end justify-between gap-4">
        <h2 className="section-title">{section.title}</h2>
        <Link to="/products" className="shrink-0 border-b border-ink pb-0.5 text-[17px] hover:border-b-2">View all products</Link>
      </div>
      <div ref={ref} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth">
        {section.items.map((it) => (
          <Link
            key={it.title}
            to={`/studio/${it.product}/${it.style}`}
            className="group w-[calc(50%-6px)] shrink-0 snap-start border border-ink/10 bg-white lg:w-[calc(25%-9px)]"
          >
            <div className="grid aspect-square place-items-center overflow-hidden" style={{ background: it.bg }}>
              <PackShot kind={it.kind} tone={it.tone} className="w-[78%] drop-shadow-2xl transition duration-500 group-hover:scale-105" />
            </div>
            <h3 className="flex min-h-[108px] items-start justify-center px-4 pt-5 text-center text-lg font-normal leading-snug sm:text-[24px]">{it.title}</h3>
          </Link>
        ))}
      </div>
      <div className="py-6">
        <Dots count={pages} active={page} onPick={to} onPrev={() => to(page - 1)} onNext={() => to(page + 1)} />
      </div>
    </section>
  );
}

/* ---------- testimonials ---------- */

function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setI((x) => (x + 1) % TESTIMONIALS.length), 8000);
    return () => clearTimeout(t);
  }, [i]);
  const t = TESTIMONIALS[i];
  return (
    <section className="container-x pt-14">
      <h2 className="section-title">Testimonials</h2>
      <p className="mt-2 text-[17px]">What our clients say</p>
      <div className="mt-10 bg-stone px-6 py-16 text-center sm:px-16 sm:py-20">
        <p className="text-[17px]">{t.name}</p>
        <p className="mt-1 text-sm">{t.role}</p>
        <div key={i} className="mx-auto mt-10 max-w-[700px] space-y-5 font-serif text-2xl italic leading-snug sm:text-[30px]">
          {t.quote.map((q) => <p key={q}>{q}</p>)}
        </div>
        <div className="mt-10">
          <Dots count={TESTIMONIALS.length} active={i} onPick={setI} onPrev={() => setI((x) => (x - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} onNext={() => setI((x) => (x + 1) % TESTIMONIALS.length)} />
        </div>
        <p className="mt-6 text-[11px] text-ink/45">Illustrative testimonials for this concept demo.</p>
      </div>
    </section>
  );
}

/* ---------- page ---------- */

export default function Home() {
  return (
    <>
      <Hero />

      {/* lavender value band */}
      <div className="overflow-hidden bg-blush py-7">
        <div className="flex w-max animate-marquee-slow whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex" aria-hidden={k === 1}>
              {[...BAND, ...BAND].map((b, j) => (
                <span key={j} className="px-[110px] text-[22px] sm:text-[26px]">{b}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* steps */}
      <section className="container-x pt-2">
        <h2 className="section-title">Steps to Get Your Own Packaging.</h2>
        <p className="mt-3 text-[17px]">Everyone can do it.</p>
        <div className="mt-16 grid gap-12 sm:grid-cols-3 lg:w-3/4">
          {[
            [ShoppingBag, 'Choose a Packaging', 'Choose the best packaging type and opening style your product needs.'],
            [Apple, '3D Custom Design Online', 'Easy to customize your own packaging with our free 3D Design Studio.'],
            [Wallet, 'Last Mile Doorstep Delivery', 'Confirm delivery details & proceed to checkout. Track it to your door.'],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof ShoppingBag;
            return (
              <div key={t as string} className="text-center">
                <I className="mx-auto h-20 w-20" strokeWidth={0.9} />
                <h3 className="mt-10 text-[22px] font-normal">{t as string}</h3>
                <p className="mx-auto mt-2 max-w-[260px] text-[15px] leading-relaxed text-ink/75">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="pt-10">
        {CATALOG.map((s) => <Shelf key={s.id} section={s} />)}
      </div>

      <Testimonials />

      {/* mission + CTA */}
      <section className="container-x pt-12">
        <div className="grid items-center gap-10 border border-ink/10 py-20 md:grid-cols-2">
          <div className="relative mx-auto aspect-[2.35/1] w-full overflow-hidden bg-[linear-gradient(160deg,#2f5a2c,#1c3a1d_60%,#2a4a22)]">
            <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_30%_20%,#7fbf5a_0,transparent_45%),radial-gradient(circle_at_80%_90%,#a6d66f_0,transparent_40%)]" />
            <p className="relative pt-4 text-center font-display text-lg font-bold tracking-wide text-[#d7f0b9]">PETTI PROMISES</p>
            <div className="relative mx-auto mt-3 grid w-[92%] grid-cols-3 gap-2 sm:grid-cols-6">
              {[
                ['1', 'NO MINIMUM ORDER', '#3c8f4f'],
                ['2', 'ZERO DEAD STOCK', '#c9483b'],
                ['3', 'RECYCLED BOARD', '#b5852a'],
                ['4', 'WATER-BASED INKS', '#2c7f8f'],
                ['5', 'FAIR LOCAL JOBS', '#8a3c7a'],
                ['6', 'PLANTABLE LIDS', '#4e8a2a'],
              ].map(([n, t, c]) => (
                <div key={n} className="aspect-[4/5] rounded-md border border-white/30 p-1.5 text-white shadow-lg" style={{ background: `linear-gradient(160deg,${c}cc,${c}88)` }}>
                  <p className="text-lg font-bold leading-none">{n}</p>
                  <p className="mt-1 text-[7px] font-semibold leading-tight sm:text-[8px]">{t}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 text-center">
            <Link to="/studio" className="mx-auto inline-flex max-w-[290px] rounded-full bg-ink px-12 py-4 text-xl leading-tight text-white transition hover:bg-forest-light">Order Your Custom Packaging NOW</Link>
            <p className="mx-auto mt-14 max-w-[290px] text-lg leading-relaxed">"Empowering startups to build a brand, with professional packaging starting at just 1 piece."</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pt-20" id="faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="mt-8 border-t border-ink/10">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group border-b border-ink/10 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg [&::-webkit-details-marker]:hidden">
                {q}
                <Plus className="h-5 w-5 shrink-0 transition group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-3xl leading-relaxed text-ink/70">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
