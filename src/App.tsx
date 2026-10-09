import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';
import CookieBanner from './components/layout/CookieBanner';

export default function App() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // honour in-page anchors such as /#faq, otherwise start each page at the top
    const el = hash ? document.getElementById(hash.slice(1)) : null;
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
