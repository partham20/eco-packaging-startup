# Petti (பெட்டி): custom eco-friendly packaging, from one piece

A working prototype website for an MBA entrepreneurship project. Petti makes rigid boxes, corrugated cartons, mono cartons, paper cups and paper bags for D2C brands and small startups, with **no minimum order quantity** and **a free sample with every item**.

> Hero line: **"Everyone else starts at a thousand. We start at one."**

## Run it

You need Node.js 18 or newer.

```bash
npm install
npm run dev        # open http://localhost:5173
```

Production build: `npm run build`, then `npm run preview`. The `dist/` folder can be deployed to Netlify, Vercel or GitHub Pages as a single-page app (add a rewrite of `/*` to `/index.html`).

## What's inside

| Page | Route | What it shows |
|---|---|---|
| Landing page | `/` | Hero tagline, MOQ comparison, the "bedroom warehouse" problem, product lines, how it works, eco promise, lead magnets, FAQ |
| Design studio | `/studio/:product` | **Step 1:** flat dieline template for each product line. Upload a full-wrap background and/or per-panel artwork (logo on the front, lid, etc.), then drag, resize, pick a board colour, size, material and finish. **Step 2:** live 3D model you can rotate, zoom and pan (lift the lid, open/close carton flaps). **Step 3:** quantity from 1, live tiered pricing, free-sample toggle, add to cart |
| Cart / checkout | `/cart`, `/checkout` | Quantity edits, price-break hints, free samples, GST, shipping, mock payment |
| Order confirmation | `/order/:id` | Order ID, ETA, next steps |
| Tracking | `/track` | Lookup by order ID + email/phone. Separate timelines for the **production** stages (placed → artwork approved → printing → die-cutting → QC → packed) and **delivery** (shipped → hub scans → out for delivery → delivered), plus a separate track for the free sample |
| Get a quote | `/quote` | Lead-capture form: name, designation, company, address, email, phone, products, monthly volume, message |
| Starter kit | `/starter-kit` | Gated lead magnet with blank SVG dielines, a box-size cheat sheet, a material guide and an interactive MOQ-vs-monthly budget planner |
| Ops desk | `/admin` | Passcode `petti2026`. Advance order statuses, add hub scans, view and export leads to CSV |
| Products, Our story | `/products`, `/about` | Spec comparison, brand story, business model at a glance |

## Demo script (5 minutes)

1. **Home:** read the hero line and point at the MOQ comparison card (1,000 pieces and ₹93,000 upfront vs 1 piece for ₹207).
2. **Design studio → Rigid Box → "Try it"** with the company's brand name. Show the flat dieline, drag the logo around, then click **Convert to 3D** and rotate the box. Turn on **Lift the lid**.
3. Switch to **Paper Cup** and show how the curved fan template wraps around the 3D cup.
4. **Step 3:** click through the quantity presets to show the price falling, keep **Free sample** ticked, add to cart, check out (any valid details), and pay.
5. **Track this order**, then open `/admin` (passcode `petti2026`), click **Mark: Artwork approved** a few times, add a hub scan, and refresh the customer tracking page.
6. Show **Get a quote** and the **Starter Kit** (lead magnets), then the **Leads** tab in the ops desk with CSV export.

Demo tracking IDs: `PT-DEMO01` (printing, sample already delivered) and `PT-DEMO02` (in transit to Hyderabad).

## Tech notes

- Vite + React 18 + TypeScript + Tailwind CSS + react-router.
- 3D: three.js via @react-three/fiber and drei. The flat dieline is rendered to a canvas and sliced into one texture per face, so what you see in 2D is exactly what wraps the 3D model. The cup's curved fan is mathematically unwarped onto the cone.
- No backend: cart, orders and leads live in the browser's `localStorage` (zustand persist). Uploaded images are downscaled to 1024 px. To go live, swap the stores for an API (e.g. Supabase or Firebase), add real auth to `/admin`, and connect a payment gateway (Razorpay) and courier API.
- Prices are illustrative and come from `src/lib/pricing.ts` and `src/data/products.ts`. **Confirm the GST rate for each product's HSN code**: it is a single placeholder constant (`GST_RATE`).

## Key files

- `src/data/products.ts`: product lines, materials, finishes, size ranges, price parameters
- `src/data/dielines.ts`: flat template geometry for each product (mm)
- `src/lib/render.ts`: draws the dieline + artwork; unwarps the cup wrap
- `src/components/studio/Preview3D.tsx`: 3D models
- `src/store/orderStore.ts` and `src/data/status.ts`: order tracking state machine
- `src/pages/*`: one file per page
