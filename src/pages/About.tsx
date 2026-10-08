import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div>
      <section className="container-x max-w-3xl py-16">
        <p className="eyebrow">Our story</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-forest sm:text-5xl">
          The industry wants 1,000 boxes before it says hello. We start at one.
        </h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/80">
          <p>
            <i>Petti</i> (பெட்டி) is the Tamil word for box. It's what everyone at home calls the box that holds the
            important things.
          </p>
          <p>
            We started Petti after watching friends launch D2C brands. The product took months to perfect. The packaging took
            one phone call, and that call always ended the same way: “Minimum 1,000 pieces, 50% advance.” So the first year of
            many brands was spent sitting on a mountain of boxes in the wrong size, with a logo they'd already changed.
          </p>
          <p>
            Digital printing and on-demand die-cutting have made small runs possible. Petti takes that technology and wraps it
            in a simple website: design online, see it in 3D, get a free sample, order what you need, and track it to your door.
          </p>
        </div>
      </section>

      <section className="kraft-texture">
        <div className="container-x py-16">
          <h2 className="text-3xl font-semibold text-forest">Business model at a glance</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['Customer segments', 'D2C brands in their first 3 years, home-grown founders, cafés and cloud kitchens, gifting businesses, and event organisers.'],
              ['Value proposition', 'No minimum order, a free sample, 3D preview before you pay, and eco-friendly materials as the default.'],
              ['Channels', 'Website and design studio, organic search ("custom boxes no MOQ"), founder communities, Instagram, and the free starter-kit lead magnet.'],
              ['Revenue streams', 'Per-piece product margin (higher on small runs), premium finishes, bulk contracts for brands that grow, and design services.'],
              ['Key resources', 'Digital press for short runs, a CNC/plotter die-cutter (no physical dies), offset partners for bulk, and the online studio.'],
              ['Why customers stay', 'Brands that start at 10 boxes grow to 10,000. Tiered prices and saved designs make reordering easy.'],
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
        <h2 className="text-3xl font-semibold text-forest">Make your first box today.</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/studio" className="btn-primary">Open the studio →</Link>
          <Link to="/quote" className="btn-ghost">Get a quote</Link>
        </div>
      </section>
    </div>
  );
}
