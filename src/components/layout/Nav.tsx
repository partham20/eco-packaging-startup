import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../store/cartStore';
import { PRODUCTS, plural } from '../../data/products';
import { INDUSTRIES } from '../../data/industries';

const TICKER = [
  'No minimum order: start at one piece',
  'Free physical sample with every quote',
  'Samples dispatched in 3 days',
  '21 opening styles, any custom size',
  'Prices step down at 10, 50, 100 and 250+',
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex flex-col items-center leading-none" aria-label="Petti home">
      <span className={`font-serif text-[34px] italic leading-none ${light ? 'text-blush' : 'text-clay'}`}>Petti</span>
      <span className={`mt-0.5 text-[9px] font-semibold tracking-[0.35em] ${light ? 'text-paper' : 'text-ink'}`}>PACKAGING</span>
    </Link>
  );
}

function Dropdown({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm font-medium text-ink/80 transition hover:text-ink" aria-expanded={open} onClick={() => setOpen(!open)}>
        {label} <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <div className={`rounded-2xl border border-ink/10 bg-white p-3 shadow-xl shadow-ink/5 ${wide ? 'grid w-[520px] grid-cols-2 gap-1' : 'w-64'}`}>{children}</div>
        </div>
      )}
    </div>
  );
}

const itemCls = 'block rounded-xl px-3 py-2 text-sm text-ink/80 transition hover:bg-cream hover:text-ink';

export default function Nav() {
  const count = useCart((s) => s.items.length);
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }: { isActive: boolean }) => `text-sm font-medium transition hover:text-ink ${isActive ? 'text-ink' : 'text-ink/80'}`;
  return (
    <header className="sticky top-0 z-40">
      <nav className="border-b border-ink/5 bg-paper/95 backdrop-blur">
        <div className="container-x flex h-20 items-center justify-between gap-6">
          <Logo />
          <div className="hidden items-center gap-8 lg:flex">
            <Dropdown label="Packaging types" wide>
              {PRODUCTS.map((p) => (
                <div key={p.id} className="p-1">
                  <Link to={`/studio/${p.id}`} className="block px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wider text-clay">
                    {plural(p.name)}
                  </Link>
                  {p.styles.slice(0, 3).map((s) => (
                    <Link key={s.id} to={`/studio/${p.id}/${s.id}`} className={itemCls}>
                      {s.name}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="flex items-end p-1">
                <Link to="/products" className="w-full rounded-xl bg-cream px-3 py-3 text-sm font-medium text-ink hover:bg-blush-light">
                  View the full catalog →
                </Link>
              </div>
            </Dropdown>
            <Dropdown label="By industry" wide>
              {INDUSTRIES.slice(0, 12).map((i) => (
                <Link key={i.name} to={`/studio/${i.product}`} className={`${itemCls} flex items-center gap-2`}>
                  <i.icon className="h-4 w-4 text-clay" /> {i.name}
                </Link>
              ))}
            </Dropdown>
            <NavLink to="/studio" className={cls}>Design studio</NavLink>
            <NavLink to="/starter-kit" className={cls}>Free sample kit</NavLink>
            <NavLink to="/track" className={cls}>Track</NavLink>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink to="/about" className={`${cls({ isActive: false })} hidden xl:inline`}>Our story</NavLink>
            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-cream" aria-label={`Cart, ${count} items`}>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">{count}</span>
              )}
            </Link>
            <Link to="/quote" className="btn-primary hidden sm:inline-flex">Get a Quote</Link>
            <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-ink/10 bg-paper lg:hidden">
            <div className="container-x flex flex-col gap-1 py-4">
              <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-clay">Packaging types</p>
              {PRODUCTS.map((p) => (
                <Link key={p.id} to={`/studio/${p.id}`} className={itemCls} onClick={() => setOpen(false)}>{plural(p.name)}</Link>
              ))}
              <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-clay">More</p>
              {[
                ['/studio', 'Design studio'],
                ['/products', 'Catalog'],
                ['/starter-kit', 'Free sample kit'],
                ['/track', 'Track an order'],
                ['/about', 'Our story'],
              ].map(([to, l]) => (
                <Link key={to} to={to} className={itemCls} onClick={() => setOpen(false)}>{l}</Link>
              ))}
              <Link to="/quote" className="btn-primary mt-3" onClick={() => setOpen(false)}>Get a Quote</Link>
            </div>
          </div>
        )}
      </nav>
      <div className="overflow-hidden border-b border-ink/5 bg-paper py-2 text-[13px] text-ink/80">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {[0, 1].map((k) => (
            <span key={k} aria-hidden={k === 1}>
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="mx-3">
                  {t} <span className="ml-3 text-clay">•</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
