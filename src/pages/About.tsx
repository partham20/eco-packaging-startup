import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div>
      <section className="container-x max-w-3xl py-16">
        <p className="eyebrow">Our story</p>
        <h1 className="mt-4 text-4xl leading-tight text-forest sm:text-5xl">
          Good packaging shouldn't need a bulk order to get started.
        </h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/80">
          <p>
            <i>Petti</i> is the Tamil word for box. It's what everyone at home calls the box that holds the important things.
          </p>
          <p>
            We started Petti after watching friends launch brands. The product took months to perfect. The packaging took one phone
            call, and that call always ended the same way: a large minimum order and a big advance. So many young brands spent their
            first year sitting on boxes in the wrong size, with a logo they had already changed.
          </p>
          <p>
            Digital printing and on-demand die-cutting have made small runs possible. Petti takes that technology and wraps it in a
            simple website: pick a style, set your own size, preview it flat and in 3D, request a quote and a physical sample, then
            order only what your pilot needs.
          </p>
        </div>
      </section>

      <section className="kraft-texture">
        <div className="container-x py-16">
          <h2 className="text-3xl text-forest">Business model at a glance</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['Customer segments', 'Startups and emerging brands launching pilot runs, founders testing a product, cafés and cloud kitchens, gifting businesses, and event organisers.'],
              ['Value proposition', 'No minimum order, prototyping support, a physical sample before you commit, and a flat plus 3D preview before you pay.'],
              ['Channels', 'Website and design studio, organic search ("custom boxes no minimum order"), founder communities, Instagram, and the free prototype-kit lead magnet.'],
              ['Revenue streams', 'Per-piece product margin (higher on small runs), premium finishes and custom structures, bulk contracts for brands that grow, and design services.'],
              ['Key resources', 'Digital press for short runs, a CNC/plotter die-cutter (no physical dies), offset partners for bulk, and the online studio.'],
              ['Why customers stay', 'Brands that start at 10 boxes grow to 10,000. Tiered prices, saved designs and a sales team that already has your specs make reordering easy.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-paper/90 p-5">
                <h3 className="font-sans font-semibold text-forest">{t}</h3>
                <p className="mt-2 text-sm text-ink/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 text-center">
        <h2 className="text-3xl text-forest">Make your first prototype today.</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/studio" className="btn-primary">Open the studio →</Link>
          <Link to="/starter-kit" className="btn-ghost">Get the free prototype kit</Link>
        </div>
      </section>
    </div>
  );
}
