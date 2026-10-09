import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Boxes, ChevronLeft, ChevronRight, Droplet, Gift, Palette, Plus, Recycle, Sparkles, Star, Trees, Truck, Leaf } from 'lucide-react';
import { PRODUCTS, defaultDims, getProduct } from '../data/products';
import { INDUSTRIES } from '../data/industries';
import { inr, unitPrice } from '../lib/pricing';
import PackShot, { type ShotKind, type ToneName } from '../components/PackShot';
import CustomQuoteForm from '../components/CustomQuoteForm';
import type { ProductId } from '../types';

const STYLE_COUNT = PRODUCTS.reduce((n, p) => n + p.styles.length, 0);

const fromPrice = (id: ProductId, styleId?: string) => {
  const p = getProduct(id);
  const s = styleId ?? p.styles[0].id;
  return unitPrice({ productId: id, styleId: s, dims: defaultDims(p, s), materialId: p.materials[0].id, finishId: p.finishes[0].id }, 1);
};

const CATALOG: { title: string; line: string; product: ProductId; style: string; kind: ShotKind; tone: ToneName; bg: string }[] = [
  { title: 'Custom Rigid Boxes', line: 'Lid & base luxury boxes for launches, PR kits and gifting.', product: 'rigid-box', style: 'lid-base', kind: 'rigid', tone: 'blush', bg: 'from-blush-light to-blush' },
  { title: 'Magnetic Closure Boxes', line: 'Flip-top lid held shut by hidden magnets. A proper reveal.', product: 'rigid-box', style: 'magnetic', kind: 'magnetic', tone: 'sage', bg: 'from-sage to-sage-mid' },
  { title: 'Drawer & Sleeve Boxes', line: 'A printed sleeve with a tray that slides out.', product: 'rigid-box', style: 'drawer', kind: 'drawer', tone: 'cream', bg: 'from-cream to-[#EFE3CF]' },
  { title: 'Custom Mailer Boxes', line: 'Tuck-top corrugated mailers, printed inside and out.', product: 'corrugated', style: 'mailer', kind: 'mailer', tone: 'terracotta', bg: 'from-[#F6E3DA] to-[#EFCFC2]' },
  { title: 'Shipping Cartons', line: 'Strong corrugated RSC cartons for e-commerce dispatch.', product: 'corrugated', style: 'rsc', kind: 'shipper', tone: 'kraft', bg: 'from-[#F3EADF] to-[#E8D8C3]' },
  { title: 'Custom Tuck Boxes', line: 'Mono cartons for skincare, soap, supplements and snacks.', product: 'mono-carton', style: 'straight-tuck', kind: 'tuck', tone: 'blush', bg: 'from-[#FBEFEA] to-[#F3DCD3]' },
  { title: 'Custom Paper Cups', line: 'Hot, cold and ripple-wall cups for cafés and events.', product: 'paper-cup', style: 'hot', kind: 'cup', tone: 'sage', bg: 'from-[#EEF3EA] to-sage' },
  { title: 'Custom Paper Bags', line: 'Twisted, flat, rope or die-cut handles. Boutique-ready.', product: 'paper-bag', style: 'rope', kind: 'bag', tone: 'espresso', bg: 'from-[#F1E9E2] to-[#E3D5C9]' },
];

const FINISHES = [
  { name: 'Gold Foiling', line: 'Warm, lustrous gold that turns your logo into something you can feel and treasure.', bg: 'linear-gradient(135deg,#F8E7DA 0%,#F2D3C1 45%,#E7B9A0 100%)', mark: 'linear-gradient(135deg,#B8862B,#F4D78B 45%,#A87422 70%,#E8C46A)', emboss: false },
  { name: 'Embossing', line: 'A raised logo pressed up from the board. No ink, all texture.', bg: 'linear-gradient(135deg,#FBF6EC,#EFE5D2)', mark: '#F4ECDD', emboss: true },
  { name: 'Debossing', line: 'Pressed into the surface for a quiet, tactile mark that ages beautifully.', bg: 'linear-gradient(135deg,#E7B48C,#C98A5E)', mark: '#B97A4E', emboss: true },
  { name: 'Spot UV', line: 'Gloss highlights on matte stock. Catches the light when the box turns.', bg: 'linear-gradient(135deg,#2E2622,#1C1714)', mark: 'linear-gradient(135deg,#3B322D,#6B5F58 50%,#2E2622)', emboss: false },
  { name: 'Soft-touch Matte', line: 'A velvety lamination that makes people stroke the lid before they open it.', bg: 'linear-gradient(135deg,#C8DCC8,#9FB89E)', mark: '#8DA98C', emboss: true },
  { name: 'Silver Foiling', line: 'Cool, crisp metallic for tech, menswear and minimal brands.', bg: 'linear-gradient(135deg,#25324A,#121A2B)', mark: 'linear-gradient(135deg,#9AA3AE,#F1F3F5 45%,#8A939E 70%,#D8DCE0)', emboss: false },
];

const TESTIMONIALS = [
  ['We printed 12 rigid boxes for an investor demo day and came back for 200 a month later. No one else would even quote under 1,000.', 'Ananya Iyer', 'Founder, Saaral Skincare'],
  ['The 3D preview caught a flap that would have covered our logo. Fixed it before the sample shipped.', 'Rahul Menon', 'Co-founder, Kaapi Collective'],
  ['Sample arrived in four days and looked exactly like the render. Our pilot of 50 mailers sold out the same week.', 'Divya Sundar', 'Brand Lead, Thread & Loom'],
  ['We change our tea blends every season. Printing 25 cartons at a time means no dead stock in the storeroom.', 'Karthik Raj', 'Founder, Nila Teas'],
  ['Rope-handle bags for a 3-day pop-up. Ordered 80, used 78. That is how it should work.', 'Meera Pillai', 'Owner, Ivy Boutique'],
  ['Clear pricing, real people on WhatsApp and a proof within hours. Our go-to for every launch now.', 'Arjun Das', 'Ops Head, Urban Tiffin'],
];

const BRANDS = ['Saaral', 'Kaapi Co.', 'Thread & Loom', 'Nila Teas', 'Ivy', 'Urban Tiffin', 'Mithai Box', 'Kolam'];

const FAQS = [
  ['Is there really no minimum order?', 'Yes. You can order a single piece. One-offs and short runs are printed digitally, and larger runs move to offset or flexo, so the price per piece drops as you grow.'],
  ['Can I get a sample before I confirm the order?', 'Yes. Configure your pack in the design studio and choose "Request quote & sample". Our team confirms the quotation and posts one printed sample unit, usually within 3 days.'],
  ['How long does delivery take?', 'Samples ship about 3 days after your quotation is confirmed. Pilot orders are usually delivered in 7 to 10 days, depending on quantity, finish and city.'],
  ['Do you offer discounts on bigger runs?', 'Prices step down automatically at 10, 50, 100, 250, 500 and 1,000 pieces. For monthly volumes, ask for a quote and we will lock a price for you.'],
  ['Do you offer eco-friendly packaging?', 'Yes. Kraft board, recycled corrugated, water-based inks and plantable seed-paper lids are all available, and most of our packs are curbside recyclable.'],
  ['Can you help with the design?', 'Yes. Upload your logo and our pre-press team will prepare a print-ready file and send you a free digital proof before anything is printed.'],
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-clay">
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />)}
    </div>
  );
}

function FinishPanel({ f, large = false }: { f: (typeof FINISHES)[number]; large?: boolean }) {
  const size = large ? 120 : 48;
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: f.bg }}>
      <div className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-white/15 blur-2xl" />
      <div
        className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        style={{
          width: size,
          height: size,
          background: f.mark,
          boxShadow: f.emboss ? (f.name === 'Debossing' ? 'inset 3px 3px 6px rgba(0,0,0,.25), inset -3px -3px 6px rgba(255,255,255,.25)' : '4px 4px 10px rgba(0,0,0,.15), -3px -3px 8px rgba(255,255,255,.6)') : '0 2px 8px rgba(0,0,0,.2)',
        }}
      >
        <span className="font-serif italic" style={{ fontSize: size * 0.55, color: f.emboss ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.55)' }}>P</span>
      </div>
    </div>
  );
}

function Finishes() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((x) => (x + 1) % FINISHES.length), 5000);
    return () => clearTimeout(t);
  }, [i, paused]);
  const f = FINISHES[i];
  const go = (d: number) => setI((x) => (x + d + FINISHES.length) % FINISHES.length);
  return (
    <section className="bg-[#F8F5EF]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Premium finishes</p>
            <h2 className="section-title mt-4 max-w-xl">Details that turn a box into an experience.</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/65">
              Explore the finishing techniques we use to make every unboxing feel unmistakably yours. Every finish is available from a single piece.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous finish" className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-white hover:border-ink/40"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => go(1)} aria-label="Next finish" className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper hover:bg-forest-light"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="mt-10 grid items-center gap-8 md:grid-cols-[minmax(0,420px)_1fr] md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-ink/10">
            <FinishPanel f={f} large />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{f.emboss ? 'Pressed in' : 'Applied'}</span>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
              {!paused && <div key={i} className="h-full bg-white" style={{ animation: 'grow 5s linear forwards' }} />}
            </div>
          </div>
          <div>
            <p className="text-xs tracking-widest text-ink/45">{String(i + 1).padStart(2, '0')} / {String(FINISHES.length).padStart(2, '0')}</p>
            <h3 className="mt-3 text-5xl">{f.name}</h3>
            <p className="mt-4 max-w-sm leading-relaxed text-ink/65">{f.line}</p>
            <Link to="/studio/rigid-box" className="mt-6 inline-block border-b border-ink pb-0.5 text-sm hover:text-clay">Add this finish to your box →</Link>
          </div>
        </div>

        <div className="no-scrollbar mt-10 flex gap-3 overflow-x-auto pb-2">
          {FINISHES.map((x, k) => (
            <button
              key={x.name}
              onClick={() => setI(k)}
              className={`relative h-32 w-40 shrink-0 overflow-hidden rounded-xl transition sm:h-36 sm:flex-1 ${k === i ? 'ring-2 ring-ink ring-offset-2 ring-offset-[#F8F5EF]' : 'opacity-85 hover:opacity-100'}`}
            >
              <FinishPanel f={x} />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6 text-[10px] font-bold uppercase tracking-widest text-white">{x.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink/5 bg-gradient-to-br from-[#FCEDEA] via-paper to-[#EEF3EA]">
        <div className="container-x grid items-center gap-12 py-16 lg:grid-cols-[1fr_1.1fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1 text-xs text-sage-deep">
              <Sparkles className="h-3.5 w-3.5" /> No minimum order · Made on demand
            </span>
            <h1 className="mt-6 text-5xl leading-[1.02] text-ink sm:text-6xl lg:text-[68px]">
              Custom packaging that <span className="text-clay">starts at one.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/70">
              Premium boxes, mailers, cups and bags for startups and growing brands. Design it in 3D, hold a free sample, then order 1, 50 or 5,000.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/studio" className="btn-primary !px-7 !py-3.5 text-base">Get Started <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/products" className="btn-ghost !px-7 !py-3.5 text-base">Explore Catalog</Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink/65">
              {[
                ['1 pc', 'Minimum order'],
                ['3 days', 'Sample dispatch'],
                [`${STYLE_COUNT}`, 'Opening styles'],
              ].map(([a, b], k) => (
                <div key={b} className={`flex gap-1.5 ${k ? 'sm:border-l sm:border-ink/10 sm:pl-8' : ''}`}>
                  <dt className="font-semibold text-ink">{a}</dt>
                  <dd>{b}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-20 w-20 rotate-6 rounded-3xl bg-blush/90 animate-float" aria-hidden />
            <div className="absolute -left-8 top-1/3 h-14 w-14 -rotate-12 rounded-2xl bg-sage-mid animate-float" style={{ animationDelay: '1.5s' }} aria-hidden />
            <div className="absolute -right-4 top-6 h-12 w-12 rounded-2xl bg-blush animate-float" style={{ animationDelay: '0.8s' }} aria-hidden />
            <div className="relative aspect-[5/4] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#F4CFC6] via-[#F7DDD6] to-[#EFD9CF] shadow-2xl shadow-clay/10">
              <span className="absolute right-5 top-5 z-10 rounded-full bg-sage px-3 py-1 text-xs font-semibold text-sage-deep">No MOQ</span>
              <PackShot kind="bag" tone="blush" className="absolute -left-[6%] top-[4%] w-[62%] drop-shadow-xl" />
              <PackShot kind="rigid" tone="cream" className="absolute right-[-4%] top-[-6%] w-[58%] drop-shadow-xl" />
              <PackShot kind="drawer" tone="sage" className="absolute bottom-[-8%] right-[2%] w-[56%] drop-shadow-xl" />
            </div>
            <div className="relative mt-4 w-full rounded-2xl sm:absolute sm:-bottom-6 sm:mt-0 sm:w-64 border border-ink/5 bg-white p-4 shadow-xl sm:left-10">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blush-light text-clay"><Gift className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold">Free sample kit</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink/60">Feel the board and finishes before you commit. Delivered in 4 to 7 days.</p>
                  <Link to="/starter-kit" className="mt-1.5 inline-block text-xs font-semibold text-clay">Claim now →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-ink/5 bg-white py-12">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-ink/70">Trusted by founders launching their first pack</p>
        <div className="mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="flex w-max animate-marquee-slow items-center">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span key={i} className={`mx-10 whitespace-nowrap text-2xl text-ink/45 ${i % 3 === 0 ? 'font-serif italic' : i % 3 === 1 ? 'font-display font-semibold tracking-tight' : 'font-display font-light uppercase tracking-[0.2em] text-xl'}`}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-paper" id="products">
        <div className="container-x py-20 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Our products</p>
              <h2 className="section-title mt-4">A box for every brand moment.</h2>
            </div>
            <p className="max-w-sm text-ink/65">
              From subscription mailers to luxury rigid boxes. Pick a style, set your size and customise every detail from one piece.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATALOG.map((c) => (
              <Link key={c.title} to={`/studio/${c.product}/${c.style}`} className="group overflow-hidden rounded-3xl border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5">
                <div className={`grid aspect-square place-items-center bg-gradient-to-br ${c.bg} p-6`}>
                  <PackShot kind={c.kind} tone={c.tone} className="w-full transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl">{c.title}</h3>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-clay" />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{c.line}</p>
                  <p className="mt-3 text-xs text-ink/50">1 piece from <b className="text-ink">{inr(fromPrice(c.product, c.style))}</b></p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/products" className="btn-ghost">See all {STYLE_COUNT} styles <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#F8F3EA]">
        <div className="container-x py-20 text-center lg:py-24">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title mx-auto mt-4 max-w-xl">From idea to doorstep in three steps.</h2>
          <div className="relative mt-16 grid gap-12 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-0 hidden h-px bg-ink/10 md:block" aria-hidden />
            {[
              [Boxes, 'Choose your style', 'Browse boxes, mailers, cartons, cups and bags. Pick how it opens and set your exact size.', 'bg-white text-clay'],
              [Palette, 'Design & approve', 'Drop your artwork on the dieline, check it in 3D, and get a free physical sample.', 'bg-sage text-ink'],
              [Truck, 'We print & ship', 'Order from one piece. Production-ready packaging delivered to your door, on schedule.', 'bg-blush-light text-clay'],
            ].map(([Icon, t, d, tint], k) => {
              const I = Icon as typeof Boxes;
              return (
                <div key={t as string} className="relative">
                  <div className={`mx-auto grid h-32 w-32 -translate-y-6 rotate-[-4deg] place-items-center rounded-[28px] shadow-[12px_16px_30px_-12px_rgba(42,33,28,0.25)] ${tint}`}>
                    <I className="h-9 w-9 rotate-[4deg]" strokeWidth={1.4} />
                  </div>
                  <p className="mt-6 text-xs font-semibold tracking-[0.3em] text-ink/60">{String(k + 1).padStart(2, '0')}</p>
                  <h3 className="mt-2 text-2xl">{t as string}</h3>
                  <p className="mx-auto mt-3 max-w-xs leading-relaxed text-ink/60">{d as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Finishes />

      {/* SUSTAINABILITY */}
      <section className="bg-sage">
        <div className="container-x grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="eyebrow !text-sage-deep">Sustainability</p>
            <h2 className="section-title mt-4 !text-sage-deep">Packaging the planet can love back.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-sage-deep/80">
              Printing on demand means no warehouse of unused boxes. Our boards, inks and processes are chosen for the smallest possible footprint, without giving up on quality.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [Recycle, 'Recycled board', 'Corrugated and kraft with high post-consumer fibre.'],
              [Leaf, 'Curbside recyclable', 'Designed to live a second life, not end up in landfill.'],
              [Trees, 'Plantable seed paper', 'Rigid lids that grow into herbs when planted.'],
              [Droplet, 'Water-based inks', 'Vibrant prints without the harsh solvents.'],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Leaf;
              return (
                <div key={t as string} className="flex gap-4 rounded-3xl bg-paper/70 p-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage text-sage-deep"><I className="h-5 w-5" strokeWidth={1.6} /></span>
                  <div>
                    <h3 className="text-lg">{t as string}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/60">{d as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT / PILOT PRICING */}
      <section className="bg-[#F4EFE6]">
        <div className="container-x py-20">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-ink/10 bg-white p-8 sm:p-14">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blush/60 blur-3xl" aria-hidden />
            <p className="eyebrow !text-clay">About Petti</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">Everything about <span className="accent">custom packaging</span> with Petti</h2>
            <div className="mt-8 space-y-8 text-ink/75">
              <div>
                <h3 className="text-2xl font-medium text-ink">Packaging that keeps up with your product</h3>
                <p className="mt-3 leading-relaxed">
                  Most first packs are designed before the product is final. Print a handful, put them in front of real customers, and change what needs changing before you scale. No dead stock, no bulk advance.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-medium text-ink">Prototype → Pilot → Launch</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    [1, 'Prototype', 'Check fit, feel and finish.'],
                    [25, 'Pilot', 'For first customers and shoots.'],
                    [250, 'Launch', 'A proper run once the pack is proven.'],
                  ].map(([q, n, d]) => {
                    const rigid = getProduct('rigid-box');
                    const each = unitPrice({ productId: 'rigid-box', styleId: 'lid-base', dims: defaultDims(rigid), materialId: rigid.materials[0].id, finishId: rigid.finishes[0].id }, q as number);
                    return (
                      <div key={n as string} className="rounded-2xl bg-cream p-5">
                        <p className="text-4xl text-ink">{q}<span className="ml-1 text-sm text-ink/50">pc</span></p>
                        <p className="mt-1 font-semibold text-ink">{n}</p>
                        <p className="text-sm text-ink/60">{d}</p>
                        <p className="mt-3 border-t border-ink/10 pt-3 text-sm"><b className="text-ink">{inr(each)}</b> each</p>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-ink/45">Rigid lid & base box, standard size. Indicative prices.</p>
              </div>
              <div>
                <h3 className="text-2xl font-medium text-ink">What sets Petti apart?</h3>
                <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {['No minimum order quantity', 'Free physical sample on request', 'Free design & pre-press support', 'No die or plate charges on digital runs', 'Live 3D preview of every style', 'Track every request and order online', 'Prices drop at 10, 50, 100, 250+', 'In-house production in Chennai'].map((x) => (
                    <li key={x} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-clay" /> {x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="bg-paper" id="industries">
        <div className="container-x py-20 lg:py-24">
          <p className="eyebrow text-center">Industries</p>
          <h2 className="section-title mt-4 text-center">Built for every category.</h2>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {INDUSTRIES.map((x) => (
              <Link key={x.name} to={`/studio/${x.product}`} className="group flex flex-col items-center gap-3 rounded-2xl border border-ink/10 bg-white px-3 py-6 text-center transition hover:-translate-y-0.5 hover:border-clay/40 hover:shadow-lg hover:shadow-ink/5">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${x.tint === 'blush' ? 'bg-blush' : x.tint === 'sage' ? 'bg-sage-mid' : 'bg-cream'}`}>
                  <x.icon className="h-5 w-5 text-ink" strokeWidth={1.6} />
                </span>
                <span className="text-sm font-semibold">{x.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="bg-gradient-to-b from-[#F8F3EA] to-[#FCEFEA]" id="quote">
        <div className="container-x grid items-start gap-12 py-20 lg:grid-cols-[1fr_1.15fr] lg:py-24">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow">Instant estimate</p>
            <h2 className="section-title mt-4">Get a custom quote.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink/65">
              Tell us about your packaging and we'll get back within 4 working hours with a tailored price and a free first proof.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-full bg-sage px-3 py-1.5 text-sage-deep"><Boxes className="h-3.5 w-3.5" /> No MOQ</span>
              <span className="flex items-center gap-1.5 rounded-full bg-blush px-3 py-1.5 text-ink"><Sparkles className="h-3.5 w-3.5" /> Free design support</span>
              <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-ink"><Gift className="h-3.5 w-3.5" /> Free sample</span>
            </div>
            <div className="relative mx-auto mt-12 max-w-sm">
              <div className="absolute inset-x-8 bottom-2 h-8 rounded-full bg-clay/10 blur-xl" />
              <PackShot kind="shipper" tone="blush" className="relative w-full animate-float" />
              <div className="absolute -left-2 bottom-4 rounded-2xl bg-white px-4 py-3 text-sm shadow-lg">
                <b className="text-sage-deep">Any size</b>
                <p className="text-xs text-ink/60">Length × width × depth, to the mm</p>
              </div>
              <div className="absolute -right-2 top-4 rounded-2xl bg-white px-4 py-3 text-sm shadow-lg">
                <b className="text-clay">From 1 piece</b>
                <p className="text-xs text-ink/60">No bulk commitment</p>
              </div>
            </div>
          </div>
          <CustomQuoteForm />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#FAF6EE]">
        <div className="container-x py-20 lg:py-24">
          <p className="eyebrow text-center">Loved by founders</p>
          <h2 className="section-title mt-4 text-center">What our customers say</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map(([q, n, r]) => (
              <figure key={n} className="flex flex-col rounded-3xl border border-ink/10 bg-paper p-6">
                <Stars />
                <blockquote className="mt-4 flex-1 text-lg leading-snug text-ink">“{q}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blush font-semibold text-ink">{n[0]}</span>
                  <span>
                    <b className="block text-sm">{n}</b>
                    <span className="text-xs text-ink/55">{r}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-center text-[11px] text-ink/40">Illustrative testimonials for this concept demo.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper">
        <div className="container-x py-16">
          <div className="relative overflow-hidden rounded-[32px] bg-forest-dark px-8 py-14 text-paper sm:px-14">
            <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-sage-deep/60 blur-3xl" aria-hidden />
            <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-[#7A5E50]/50 blur-3xl" aria-hidden />
            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
              <div>
                <h2 className="max-w-xl text-4xl leading-[1.05] sm:text-5xl">Get free samples. Start your custom packaging today.</h2>
                <p className="mt-4 max-w-lg text-paper/70">Request a complimentary sample kit and feel why founders across India pilot with Petti.</p>
              </div>
              <Link to="/starter-kit" className="btn shrink-0 bg-paper !px-7 !py-3.5 text-base text-ink hover:bg-white">Get Free Samples <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper">
        <div className="container-x max-w-3xl pb-24 pt-10">
          <p className="eyebrow text-center !text-clay">FAQ</p>
          <h2 className="mt-4 text-center text-4xl">Frequently Asked Questions</h2>
          <div className="mt-10">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group border-b border-ink/10 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg marker:hidden [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush-light text-clay transition group-open:rotate-45"><Plus className="h-4 w-4" /></span>
                </summary>
                <p className="mt-3 pr-12 leading-relaxed text-ink/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
