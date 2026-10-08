import { Link } from 'react-router-dom';
import { Logo } from './Nav';
import { PRODUCTS } from '../../data/products';

export default function Footer() {
  return (
    <footer className="mt-24 bg-forest-dark text-paper/80">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed">
            Custom eco-friendly packaging for D2C brands and young startups. No minimum order — start at one.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-paper">Products</h4>
          <ul className="space-y-2 text-sm">
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <Link to={`/studio/${p.id}`} className="hover:text-kraft">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-paper">For founders</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/quote" className="hover:text-kraft">Get a quote</Link></li>
            <li><Link to="/starter-kit" className="hover:text-kraft">Free packaging starter kit</Link></li>
            <li><Link to="/track" className="hover:text-kraft">Track an order</Link></li>
            <li><Link to="/about" className="hover:text-kraft">Our story</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-paper">Talk to us</h4>
          <p className="text-sm">hello@petti.example</p>
          <p className="text-sm">+91 90000 00000</p>
          <p className="mt-2 text-sm">Factory: Ambattur Industrial Estate, Chennai</p>
          <Link to="/admin" className="mt-4 inline-block text-xs text-paper/40 hover:text-paper/70">Team login</Link>
        </div>
      </div>
      <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/50">
        © {new Date().getFullYear()} Petti Packaging · An MBA entrepreneurship concept · All prices indicative
      </div>
    </footer>
  );
}
