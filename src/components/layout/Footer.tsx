import { Link } from 'react-router-dom';
import { Eye, Lock, MessageCircle, ShieldCheck } from 'lucide-react';
import { Logo } from './Nav';
import { PRODUCTS, plural } from '../../data/products';
import PackShot, { type ShotKind, type ToneName } from '../PackShot';

// Little packs scattered along the bottom of the footer
const SCATTER: [ShotKind, ToneName, number, number, number][] = [
  ['shipper', 'kraft', 2, 62, 56],
  ['rigid', 'espresso', 12, 78, 48],
  ['bag', 'white', 22, 58, 40],
  ['cup', 'cream', 31, 80, 34],
  ['mailer', 'kraft', 40, 66, 52],
  ['tuck', 'sage', 51, 76, 40],
  ['magnetic', 'espresso', 60, 58, 46],
  ['drawer', 'white', 70, 78, 44],
  ['shipper', 'kraft', 80, 62, 40],
  ['cup', 'white', 89, 76, 36],
  ['rigid', 'sage', 95, 56, 34],
];

function SocialIcon({ d, label }: { d: string; label: string }) {
  return (
    <a href="#" onClick={(e) => e.preventDefault()} aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-paper/20 text-paper/80 transition hover:border-paper/60 hover:text-paper">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </a>
  );
}

export default function Footer() {
  return (
    <>
      <footer className="relative mt-0 overflow-hidden bg-forest-dark text-paper/75">
        <div className="container-x relative z-10 grid gap-10 pb-10 pt-16 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <div className="inline-block"><Logo light /></div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Custom packaging for startups and emerging brands. Made on demand from a single piece, shipped with care from Chennai.
            </p>
            <div className="mt-5 flex gap-2">
              <SocialIcon label="Instagram" d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5.5-1.5h.01" />
              <SocialIcon label="LinkedIn" d="M4 9h4v11H4zM6 4a2 2 0 110 4 2 2 0 010-4zm6 5h4v1.6c.6-1 1.9-1.9 3.6-1.9 3 0 3.4 2 3.4 4.6V20h-4v-5.6c0-1.3 0-3-1.8-3S13 12.8 13 14.3V20h-4z" />
              <SocialIcon label="Pinterest" d="M12 3a9 9 0 00-3.3 17.4c-.1-.8-.1-2 .1-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.8 0 1.2.6 1.2 1.4 0 .8-.5 2.1-.8 3.2-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.5 2.1-4.5 4.4 0 .9.3 1.8.8 2.3" />
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-paper">Products</h4>
            <ul className="space-y-2.5 text-sm">
              {PRODUCTS.map((p) => (
                <li key={p.id}><Link to={`/studio/${p.id}`} className="hover:text-paper">{plural(p.name)}</Link></li>
              ))}
              <li><Link to="/products" className="hover:text-paper">Full catalog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-paper">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-paper">Our story</Link></li>
              <li><Link to="/studio" className="hover:text-paper">Design studio</Link></li>
              <li><Link to="/starter-kit" className="hover:text-paper">Free sample kit</Link></li>
              <li><Link to="/quote" className="hover:text-paper">Contact us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-paper">Orders</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/track" className="hover:text-paper">Track a request or order</Link></li>
              <li><Link to="/cart" className="hover:text-paper">Your cart</Link></li>
              <li><Link to="/quote" className="hover:text-paper">Bulk & pilot pricing</Link></li>
              <li><Link to="/admin" className="hover:text-paper">Team login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-paper">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li>hello@petti.example</li>
              <li>+91 90000 00000</li>
              <li>Ambattur Industrial Estate,<br />Chennai, Tamil Nadu</li>
            </ul>
          </div>
        </div>

        <div className="pointer-events-none relative h-36 sm:h-44" aria-hidden>
          {SCATTER.map(([k, tone, left, top, size], i) => (
            <div key={i} className="absolute animate-float" style={{ left: `${left}%`, top: `${top - 50}%`, width: size * 1.6, animationDelay: `${i * 0.4}s` }}>
              <PackShot kind={k} tone={tone} className="w-full opacity-90" />
            </div>
          ))}
        </div>

        <div className="container-x relative z-10 flex flex-col items-center justify-between gap-4 border-t border-paper/10 py-6 text-xs text-paper/55 md:flex-row">
          <p>© {new Date().getFullYear()} Petti Packaging · An MBA entrepreneurship concept · Prices indicative</p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> SSL secure checkout</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure UPI & card payments</span>
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Data protection & privacy</span>
          </div>
          <div className="flex gap-1.5">
            {['UPI', 'VISA', 'RuPay', 'Mastercard'].map((p) => (
              <span key={p} className="rounded bg-paper px-2 py-1 text-[10px] font-bold text-ink">{p}</span>
            ))}
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/919000000000"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="no-print fixed bottom-5 left-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-clay text-white shadow-lg shadow-clay/30 transition hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </>
  );
}
