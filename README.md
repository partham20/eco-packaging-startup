# Petti: prototyping & low-volume custom packaging, no minimum order

A working prototype website for an MBA entrepreneurship project. Petti makes rigid boxes, corrugated boxes, mono cartons, paper cups and paper bags for **startups and emerging brands launching pilot runs**, with **no minimum order** and **a physical sample before you commit**.

> Positioning: **Custom packaging that starts at one.**

## Version 4 (this branch)

A storefront-style redesign modelled on the layout of ezpac.in, built on top of v3:

- Clean white storefront: DM Sans, near-black ink, leaf-green logo accent, lavender value band
- Header with live product search, Account and cart-total buttons; second row with *By Industry* and *E-Commerce* dropdowns and a "3D Design Studio" link
- Home: 2-slide hero ("Design your packaging in 3D before you print"), scrolling value band, 3-step guide, five product shelves (carousel with dots), testimonial slider, promise/CTA block, FAQ
- White footer with newsletter, cookie consent banner, WhatsApp chat bubble

## Version 3

A visual redesign modelled on the layout of alorapackaging.com, on top of all the v2 features (studio, 21 opening styles, quote & sample workflow, tracking, ops desk):

- Warm cream / espresso / terracotta palette with blush and sage tints, Inter Tight headings with Instrument Serif italic accents
- Sticky nav with *Packaging types* and *By industry* dropdowns, scrolling offer ticker, floating WhatsApp button
- Home page: hero with product composition and free-sample card, brand marquee, product cards, three-step "how it works", premium-finishes carousel, sustainability, pilot pricing, 18 industries, full custom-quote form with artwork upload, testimonials, CTA, FAQ
- Isometric SVG pack illustrations (`src/components/PackShot.tsx`) instead of photography
- Dark footer with scattered packs and trust badges

Versions: v1 = `main`, v2 = `pilot-prototyping`, v3 = `v3-alora-style`, v4 = `v4-ezpac-style`.

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
| Landing page | `/` | Hero with the **instant prototype quote** lead magnet, prototype → pilot → launch price ladder, **"Pick a Format, Make It Yours"** (5 formats, 21 opening styles), how it works, quote/sample tracking, the free Prototype Kit, FAQ |
| Design studio | `/studio/:product/:style` | Pick the opening style, type custom length / width / depth, upload artwork, switch between the **flat 2D dieline** and the **interactive 3D model**, then **request a quote & physical sample** |
| Cart / checkout | `/cart`, `/checkout` | For customers who want to order straight away: quantity edits, price-break hints, free samples, GST, shipping, mock payment |
| Order confirmation | `/order/:id` | Order ID, ETA, next steps |
| Tracking | `/track` | Look up a **quote/sample request** (`QR-…`) or an **order** (`PT-…`) with the email or phone used. Requests show review → quotation → sample dispatched → sample delivered; orders show production and delivery timelines |
| General enquiry | `/quote` | Lead-capture form for people who are not ready to configure a pack |
| Prototype Kit | `/starter-kit` | Gated lead magnet (optionally posts a physical sample pack): blank SVG dielines for every style, a size cheat sheet, a material guide and a pilot cost planner |
| Ops desk | `/admin` | Passcode `petti2026`. **Quotes & samples** (review specs and files, confirm a quotation, dispatch the sample), orders (advance statuses, hub scans) and leads (CSV export) |
| Products, Our story | `/products`, `/about` | Spec comparison with every opening style, brand story, business model at a glance |

## Opening styles

Every style has its own flat dieline and its own 3D model, and most have a slider that moves the opening part.

| Format | Styles |
|---|---|
| Rigid Box | Top & bottom (lid & base) · Drawer / sleeve · Collapsible / foldable · Magnetic closure · Other / custom opening (describe it) |
| Corrugated Box | Shipping carton (RSC) · Mailer box (tuck-top) · Lid & base (telescopic) |
| Mono Carton | Tuck-end · Hang-tab · Open-ended sleeve · Drawer (tray & sleeve) |
| Paper Cup | Hot (open top) · Hot with sip lid · Cold with dome lid & straw · Ripple wall |
| Paper Bag | Twisted handle · Flat handle · Rope handle · Die-cut handle · Open-mouth (no handle) |

## Quote & sample workflow

1. The customer configures size, style and artwork in the studio and checks it in 2D and 3D.
2. **Request quote & free sample** collects their contact details, order volume, delivery address for the sample and any extra design files. A print-ready render of the design and a snapshot are attached automatically.
3. The request lands in **Ops desk → Quotes & samples**. The team reviews the specs and files, **confirms a quotation** (price, quantity, lead time, validity) and **dispatches the physical sample** (courier and tracking number), then marks it delivered.
4. The customer follows every step at `/track` with the request ID (`QR-…`).

Demo tracking IDs: `QR-DEMO01` (quote sent, sample on its way), `QR-DEMO02` (just received), `PT-DEMO01` (order being printed, sample already delivered), `PT-DEMO02` (order in transit to Hyderabad).

## Tech notes

- Vite + React 18 + TypeScript + Tailwind CSS + react-router.
- 3D: three.js via @react-three/fiber and drei. The flat dieline is rendered to a canvas and sliced into one texture per face, so what you see in 2D is exactly what wraps the 3D model. The cup's curved fan is mathematically unwarped onto the cone.
- No backend: cart, orders, leads and quote requests live in the browser's `localStorage` (zustand persist). Uploaded images are downscaled to 1024 px (extra request files to 1600 px). Request files are stored as data URLs, so if browser storage fills up the files of older requests are dropped first. To go live, swap the stores for an API (e.g. Supabase or Firebase) with file storage, add real auth to `/admin`, and connect a payment gateway (Razorpay) and courier API.
- Prices are illustrative and come from `src/lib/pricing.ts` and `src/data/products.ts` (each style carries a `priceFactor`). **Confirm the GST rate for each product's HSN code**: it is a single placeholder constant (`GST_RATE`).

## Key files

- `src/data/products.ts`: product lines, **opening styles**, materials, finishes, size ranges, price parameters
- `src/data/dielines.ts`: flat template geometry for each product and style (mm)
- `src/lib/render.ts`: draws the dieline + artwork; unwarps the cup wrap
- `src/components/studio/Preview3D.tsx`: 3D models, one per style
- `src/components/studio/QuoteModal.tsx`: quote & sample request form
- `src/store/requestStore.ts`: quote request state machine; `src/components/admin/RequestsPanel.tsx`: the team's side
- `src/store/orderStore.ts` and `src/data/status.ts`: order tracking state machine
- `src/pages/*`: one file per page

### Adding an opening style

1. Add a `ProductStyle` to the product in `products.ts` (name, `priceFactor`, optional default `dims`, and the `controls` sliders).
2. Return its panels from `buildDieline` in `dielines.ts` (give panels a `target` mesh and face so the print maps onto the 3D model, and list the `hero` panels that get the sample logo).
3. Add a model for it in `Preview3D.tsx` and route to it in `ProductModel`. Add it to `extent()` so the camera frames it.

## Deploying to a static host

The app is a plain static site. For a host without a single-page-app fallback (GitHub Pages), build with hash routing and the sub-path it is served from:

```bash
VITE_HASH_ROUTER=1 npx vite build --base=/my-repo/pilot/
```
