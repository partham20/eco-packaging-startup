import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirm from './pages/OrderConfirm';
import Track from './pages/Track';
import Quote from './pages/Quote';
import StarterKit from './pages/StarterKit';
import Admin from './pages/Admin';
import About from './pages/About';
import NotFound from './pages/NotFound';

// three.js is heavy — only load it when someone opens the studio
const Studio = lazy(() => import('./pages/Studio'));

const loading = (el: ReactNode) => (
  <Suspense fallback={<div className="container-x py-24 text-center text-ink/60">Loading the design studio…</div>}>{el}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'studio/:productId?', element: loading(<Studio />) },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'order/:id', element: <OrderConfirm /> },
      { path: 'track/:id?', element: <Track /> },
      { path: 'quote', element: <Quote /> },
      { path: 'starter-kit', element: <StarterKit /> },
      { path: 'admin', element: <Admin /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
