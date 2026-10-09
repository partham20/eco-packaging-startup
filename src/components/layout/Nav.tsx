import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../store/cartStore';

const links = [
  { to: '/products', label: 'Products' },
  { to: '/studio', label: 'Design studio' },
  { to: '/track', label: 'Track order' },
  { to: '/starter-kit', label: 'Free prototype kit' },
  { to: '/about', label: 'Our story' },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="7" fill={light ? '#F7F3EC' : '#1F3D2B'} />
        <path d="M8 12l8-4 8 4v9l-8 4-8-4z" fill="#C9A57B" />
        <path d="M8 12l8 4 8-4M16 16v9" stroke={light ? '#F7F3EC' : '#1F3D2B'} strokeWidth="1.5" fill="none" />
      </svg>
      <span className={`font-display text-2xl font-bold ${light ? 'text-paper' : 'text-forest'}`}>Petti</span>
    </Link>
  );
}

export default function Nav() {
  const count = useCart((s) => s.items.length);
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition hover:text-forest ${isActive ? 'text-forest' : 'text-ink/70'}`;
  return (
    <nav className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={cls}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/quote" className="btn-accent hidden sm:inline-flex">
            Get a quote
          </Link>
          <Link to="/cart" className="btn-ghost relative !px-3" aria-label={`Cart, ${count} items`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button className="btn-ghost !px-3 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-ink/10 bg-paper lg:hidden">
          <div className="container-x flex flex-col gap-3 py-4">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={cls} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <Link to="/quote" className="btn-accent" onClick={() => setOpen(false)}>
              Get a quote
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
