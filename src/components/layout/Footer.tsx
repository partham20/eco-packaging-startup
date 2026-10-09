import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { validEmail } from '../forms';

const u = 'underline decoration-1 underline-offset-[5px] hover:decoration-2';

function Social({ d, label, fill = false }: { d: string; label: string; fill?: boolean }) {
  return (
    <a href="#" onClick={(e) => e.preventDefault()} aria-label={label} className="text-ink transition hover:opacity-70">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </a>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'bad' | 'ok'>('idle');
  return (
    <>
      <footer className="mt-12 border-t border-ink/10 bg-white text-ink">
        <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="text-[28px] font-normal">Petti</h4>
            <p className="mt-4 text-[17px]">Small Order, Big Impact</p>
            <div className="mt-5 flex items-center gap-4">
              <a href="tel:+919000000000" aria-label="Call us"><Phone className="h-[18px] w-[18px] fill-current" /></a>
              <a href="mailto:orders@petti.example" aria-label="Email us"><Mail className="h-[18px] w-[18px]" /></a>
              <Social label="Instagram" d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5.5-1.5h.01" />
              <Social label="LinkedIn" fill d="M4 9h4v11H4zM6 4a2 2 0 110 4 2 2 0 010-4zm6 5h4v1.6c.6-1 1.9-1.9 3.6-1.9 3 0 3.4 2 3.4 4.6V20h-4v-5.6c0-1.3 0-3-1.8-3S13 12.8 13 14.3V20h-4z" />
              <a href="https://wa.me/919000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle className="h-[18px] w-[18px]" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-[20px] font-medium">Packaging</h4>
            <ul className="mt-4 space-y-2 text-[17px]">
              <li><Link to="/products" className={u}>All Products</Link></li>
              <li><Link to="/studio" className={u}>3D Design Studio</Link></li>
              <li><Link to="/starter-kit" className={u}>Free Sample Kit</Link></li>
              <li><Link to="/quote" className={u}>Contact Us</Link></li>
              <li><Link to="/about" className={u}>Our Story</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[28px] font-normal">Contact information</h4>
            <p className="mt-4 text-[17px] leading-relaxed">
              Just contact us by email<br />orders@petti.example<br />+91 90000 00000<br />Ambattur Industrial Estate, Chennai
            </p>
          </div>
          <div>
            <h4 className="text-[20px] font-medium">Quick links</h4>
            <ul className="mt-4 space-y-2 text-[17px]">
              <li><Link to="/studio/rigid-box" className={u}>Rigid Boxes</Link></li>
              <li><Link to="/studio/corrugated" className={u}>E-Commerce</Link></li>
              <li><Link to="/studio/paper-bag" className={u}>Paper Bags</Link></li>
              <li><Link to="/track" className={u}>Track Order</Link></li>
              <li><Link to="/#faq" className={u}>FAQ</Link></li>
              <li><Link to="/admin" className={u}>Team Login</Link></li>
            </ul>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <h4 className="text-[20px] font-medium">Newsletter</h4>
            {state === 'ok' ? (
              <p className="mt-4 text-[15px] text-leaf-dark">Thanks! You're on the list for new styles and offers.</p>
            ) : (
              <form
                className="relative mt-4 w-full max-w-[272px]"
                onSubmit={(e) => {
                  e.preventDefault();
                  setState(validEmail(email) ? 'ok' : 'bad');
                }}
              >
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" aria-label="Email for newsletter" className="h-[52px] w-full rounded-md border border-ink/20 pl-3 pr-12 text-base outline-none focus:border-ink" />
                <button aria-label="Subscribe" className="absolute right-3 top-1/2 -translate-y-1/2"><Send className="h-6 w-6" strokeWidth={1.4} /></button>
                {state === 'bad' && <span className="mt-1 block text-xs text-red-700">Enter a valid email</span>}
              </form>
            )}
          </div>
        </div>
        <div className="border-t border-ink/10">
          <div className="container-x py-8 text-[15px]">
            Copyright © {new Date().getFullYear()} <Link to="/" className={u}>Petti</Link>. An MBA entrepreneurship concept · Prices indicative
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/919000000000"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="no-print fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#4CD964] text-white shadow-lg ring-4 ring-white transition hover:scale-105"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </>
  );
}
