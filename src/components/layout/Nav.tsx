import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '../../store/cartStore';
import { cartTotals } from '../../lib/pricing';
import { INDUSTRIES } from '../../data/industries';
import { ALL_ITEMS, CATALOG } from '../../data/catalog';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Petti home">
      <svg viewBox="0 0 40 40" className="h-11 w-11" aria-hidden>
        <path d="M20 3l15 8v18l-15 8-15-8V11z" fill="#6DB33F" />
        <path d="M20 3l15 8-15 8-15-8z" fill="#8FCB5F" />
        <path d="M20 19v18l15-8V11z" fill="#4E8A2A" />
        <path d="M12.5 7l15 8v5" stroke="#fff" strokeWidth="2.2" fill="none" opacity=".85" />
      </svg>
      <span className="leading-none">
        <span className={`block font-display text-[30px] font-medium tracking-tight ${light ? 'text-white' : 'text-[#2E2A6B]'}`}>Petti</span>
        <span className={`block text-[7.5px] font-semibold tracking-wide ${light ? 'text-white/70' : 'text-ink/80'}`}>SMALL ORDER, BIG IMPACT</span>
      </span>
    </Link>
  );
}

function SearchBox({ onDone }: { onDone?: () => void }) {
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const nav = useNavigate();
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return ALL_ITEMS.filter((i) => `${i.title} ${i.section}`.toLowerCase().includes(s)).slice(0, 6);
  }, [q]);
  const go = (to: string) => {
    setQ('');
    setFocus(false);
    onDone?.();
    nav(to);
  };
  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (hits[0]) go(`/studio/${hits[0].product}/${hits[0].style}`);
        else if (q.trim()) go('/products');
      }}
    >
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink" strokeWidth={1.8} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        placeholder="Search for..."
        aria-label="Search packaging"
        className="h-[50px] w-full rounded-full border border-ink/15 bg-white pl-14 pr-5 text-base outline-none transition placeholder:text-ink/55 focus:border-ink"
      />
      {focus && q.trim() && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl">
          {hits.length ? (
            hits.map((h) => (
              <button type="button" key={h.title + h.section} onMouseDown={() => go(`/studio/${h.product}/${h.style}`)} className="flex w-full items-center justify-between px-5 py-3 text-left text-sm hover:bg-cream">
                <span>{h.title}</span>
                <span className="text-xs text-ink/50">{h.section}</span>
              </button>
            ))
          ) : (
            <p className="px-5 py-3 text-sm text-ink/60">No match. Try "mailer", "rigid" or "cup".</p>
          )}
        </div>
      )}
    </form>
  );
}

function Dropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-2 py-5 text-[16px] font-medium" aria-expanded={open} onClick={() => setOpen(!open)}>
        {label} <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.2} />
      </button>
      {open && <div className="absolute left-0 top-full z-50 min-w-60 rounded-b-xl border border-ink/10 bg-white p-2 shadow-xl">{children}</div>}
    </div>
  );
}

const item = 'block rounded-lg px-4 py-2.5 text-[15px] hover:bg-cream';

export default function Nav() {
  const items = useCart((s) => s.items);
  const total = cartTotals(items).subtotal;
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  const ecommerce = CATALOG.find((c) => c.id === 'e-commerce')!;

  return (
    <header className="relative z-40 bg-white">
      <div className="container-x flex h-[100px] items-center gap-4 lg:gap-8">
        <button className="grid h-10 w-10 place-items-center lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Logo />
        <div className="mx-auto hidden max-w-[670px] flex-1 lg:block">
          <SearchBox />
        </div>
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link to="/track" className="hidden h-[50px] items-center gap-2.5 rounded-full border border-ink px-5 text-[15px] font-medium transition hover:bg-ink hover:text-white sm:flex">
            <User className="h-5 w-5" strokeWidth={1.8} /> Account
          </Link>
          <Link to="/cart" className="flex h-[50px] items-center gap-2.5 rounded-full bg-ink px-5 text-[15px] font-medium text-white transition hover:bg-forest-light" aria-label={`Cart, ${items.length} items`}>
            <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
            <span className="hidden sm:inline">Rs. {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({items.length})</span>
            <span className="sm:hidden">({items.length})</span>
          </Link>
        </div>
      </div>

      <div className="border-y border-ink/10">
        <div className="container-x hidden items-center justify-between lg:flex">
          <nav className="flex items-center gap-10">
            <Dropdown label="By Industry">
              <div className="grid w-[460px] grid-cols-2">
                {INDUSTRIES.map((i) => (
                  <Link key={i.name} to={`/studio/${i.product}`} className={item}>{i.name}</Link>
                ))}
              </div>
            </Dropdown>
            <Dropdown label="E-Commerce">
              {ecommerce.items.map((i) => (
                <Link key={i.title} to={`/studio/${i.product}/${i.style}`} className={item}>{i.title}</Link>
              ))}
              <Link to="/studio/paper-bag" className={item}>Paper Bags</Link>
            </Dropdown>
            <Link to="/studio/rigid-box" className="py-5 text-[16px] font-medium hover:underline">Rigid Boxes</Link>
            <Link to="/studio/paper-bag" className="py-5 text-[16px] font-medium hover:underline">Paper Bags</Link>
            <Link to="/products" className="py-5 text-[16px] font-medium hover:underline">All Products</Link>
            <Link to="/#faq" className="py-5 text-[16px] font-medium hover:underline">FAQ</Link>
          </nav>
          <Link to="/studio" className="flex items-center gap-3">
            <svg viewBox="0 0 32 24" className="h-7 w-9" aria-hidden>
              <rect width="32" height="24" rx="6" fill="#E62117" />
              <path d="M13 7l8 5-8 5z" fill="#fff" />
            </svg>
            <span className="leading-tight">
              <span className="block text-[13px]">Design packaging for free</span>
              <span className="block text-[16px] font-medium">3D Design Studio</span>
            </span>
          </Link>
        </div>
        <div className="container-x py-3 lg:hidden">
          <SearchBox />
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-[100px] z-50 max-h-[80vh] overflow-y-auto border-t border-ink/10 bg-white shadow-xl lg:hidden">
          <div className="container-x py-4">
            {[
              ['/studio', '3D Design Studio'],
              ['/studio/rigid-box', 'Rigid Boxes'],
              ['/studio/corrugated', 'E-Commerce Boxes'],
              ['/studio/mono-carton', 'Product Cartons'],
              ['/studio/paper-bag', 'Paper Bags'],
              ['/studio/paper-cup', 'Paper Cups'],
              ['/products', 'All Products'],
              ['/starter-kit', 'Free Sample Kit'],
              ['/track', 'Account & Orders'],
              ['/#faq', 'FAQ'],
            ].map(([to, l]) => (
              <Link key={to} to={to} className="block border-b border-ink/5 py-3 text-base font-medium">{l}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

