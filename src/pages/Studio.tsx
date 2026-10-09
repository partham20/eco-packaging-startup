import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PRODUCTS, clampDims, defaultDims, dimsLabel, getProduct, getStyle, isProductId, isStyleId } from '../data/products';
import { buildDieline, dielineSvg } from '../data/dielines';
import { pxPerMmFor, renderDieline } from '../lib/render';
import { designSources, useImages } from '../lib/useImages';
import { downloadBlob, fileToDataUrl, sampleLogo, samplePattern, shrinkCanvas } from '../lib/image';
import { inr, unitPrice } from '../lib/pricing';
import { useCart } from '../store/cartStore';
import DielineCanvas from '../components/studio/DielineCanvas';
import Preview3D, { type ViewOptions } from '../components/studio/Preview3D';
import QuoteModal from '../components/studio/QuoteModal';
import PriceTiers from '../components/PriceTiers';
import ProductIcon from '../components/ProductIcon';
import type { Artwork, Design, Dieline, Product, ProductId, StyleId } from '../types';

const BOARD_COLOURS = [
  { label: 'Kraft', value: '#C9A57B' },
  { label: 'White', value: '#F5F2EA' },
  { label: 'Charcoal', value: '#2B2B29' },
  { label: 'Forest', value: '#1F3D2B' },
  { label: 'Blush', value: '#E8C4B8' },
];

const QTY_PRESETS = [1, 5, 10, 25, 50, 100, 250, 500];

const FRESH_VIEW: ViewOptions = { autoRotate: true, open: 0, fold: 0 };

function freshDesign(p: Product, styleId: StyleId, prev?: Design): Design {
  return {
    productId: p.id,
    styleId,
    styleNote: prev?.styleNote ?? '',
    dims: defaultDims(p, styleId),
    materialId: p.materials[0].id,
    finishId: p.finishes[0].id,
    whole: prev?.whole,
    perPanel: prev?.perPanel ?? {},
    bgColor: prev?.bgColor ?? (p.id === 'paper-cup' ? '#F5F2EA' : '#C9A57B'),
  };
}

function defaultPanel(dl: Dieline) {
  return dl.panels.find((p) => p.target?.mesh === 'body' && p.target.face === 'pz')?.id ?? dl.panels.find((p) => p.kind === 'print')?.id ?? null;
}

export default function Studio() {
  const params = useParams();
  const navigate = useNavigate();
  const productId: ProductId = isProductId(params.productId) ? params.productId : 'rigid-box';
  const product = getProduct(productId);
  const styleId: StyleId = isStyleId(product, params.styleId) ? params.styleId : product.styles[0].id;
  const style = getStyle(product, styleId);

  const [design, setDesign] = useState<Design>(() => freshDesign(product, styleId));
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stage, setStage] = useState<'2d' | '3d'>('2d');
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [brand, setBrand] = useState('Your Brand');
  const [view, setView] = useState<ViewOptions>(FRESH_VIEW);
  const [qty, setQty] = useState(1);
  const [sample, setSample] = useState(true);
  const [added, setAdded] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const addToCart = useCart((s) => s.add);

  // switching product or style keeps the artwork but resets size, material and the 3D sliders
  useEffect(() => {
    setDesign((d) => (d.productId === productId && d.styleId === styleId ? d : freshDesign(product, styleId, d)));
    setView((v) => ({ ...FRESH_VIEW, autoRotate: v.autoRotate }));
    setSelected(null);
    setAdded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, styleId]);

  const dims = useMemo(() => clampDims(product, design.dims), [product, design.dims]);
  const dl = useMemo(() => buildDieline(productId, dims, styleId), [productId, dims, styleId]);
  const panel = dl.panels.find((p) => p.id === (selected ?? defaultPanel(dl))) ?? null;
  const { images, version, ready } = useImages(designSources(design));

  // print-resolution render that feeds the 3D textures (only when 3D is visible)
  const print = useMemo(() => {
    if (stage !== '3d' || !ready) return null;
    const k = pxPerMmFor(dl, 2048);
    const c = document.createElement('canvas');
    renderDieline(c, dl, design, images, { pxPerMm: k });
    return { canvas: c, k };
  }, [stage, dl, design, images, version, ready]);

  const spec = { productId, styleId, dims, materialId: design.materialId, finishId: design.finishId };
  const unit = unitPrice(spec, qty);

  const patch = (p: Partial<Design>) => setDesign((d) => ({ ...d, ...p }));
  const patchArt = (key: string | null, p: Partial<Artwork>) =>
    setDesign((d) => {
      if (key === null) return d.whole ? { ...d, whole: { ...d.whole, ...p } } : d;
      const a = d.perPanel[key];
      return a ? { ...d, perPanel: { ...d.perPanel, [key]: { ...a, ...p } } } : d;
    });

  const go = (n: 1 | 2 | 3) => {
    setStep(n);
    setStage(n === 1 ? '2d' : '3d');
  };

  async function upload(file: File | undefined, target: 'whole' | string) {
    if (!file) return;
    setError(null);
    if (file.size > 20 * 1024 * 1024) return setError('That file is over 20 MB. Please export a smaller PNG or JPG.');
    setBusy(true);
    try {
      const src = await fileToDataUrl(file);
      setDesign((d) =>
        target === 'whole'
          ? { ...d, whole: { src, offsetX: 0, offsetY: 0, scale: 1, fit: 'cover' } }
          : { ...d, perPanel: { ...d.perPanel, [target]: { src, offsetX: 0, offsetY: 0, scale: 0.8, fit: 'contain' } } },
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function applySample() {
    await document.fonts?.ready;
    const logo = sampleLogo(brand.trim() || 'Your Brand');
    const art: Artwork = { src: logo, offsetX: 0, offsetY: 0, scale: productId === 'paper-cup' ? 0.45 : 0.75, fit: 'contain' };
    const perPanel: Record<string, Artwork> = {};
    for (const id of dl.hero) perPanel[id] = art;
    patch({ whole: { src: samplePattern(), offsetX: 0, offsetY: 0, scale: 1, fit: 'cover' }, perPanel, bgColor: '#1F3D2B' });
  }

  function downloadPrint() {
    const c = document.createElement('canvas');
    renderDieline(c, dl, design, images, { pxPerMm: pxPerMmFor(dl, 3600) });
    c.toBlob((b) => b && downloadBlob(b, `petti-${productId}-${styleId}-print.png`, 'image/png'), 'image/png');
  }

  const wrapRef = useRef<HTMLDivElement>(null);
  const snapshot = () => {
    const gl = wrapRef.current?.querySelector('canvas');
    return gl ? shrinkCanvas(gl) : undefined;
  };
  function handleAdd() {
    setError(null);
    try {
      addToCart({
        productId,
        styleId,
        styleNote: design.styleNote.trim() || undefined,
        dims,
        materialId: design.materialId,
        finishId: design.finishId,
        qty,
        freeSample: sample,
        thumbnail: snapshot(),
        hasArtwork: !!design.whole || Object.keys(design.perPanel).length > 0,
      });
      setAdded(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const material = product.materials.find((m) => m.id === design.materialId)!;
  const finish = product.finishes.find((f) => f.id === design.finishId)!;
  const panelArt = panel ? design.perPanel[panel.id] : undefined;
  const hasArtwork = !!design.whole || Object.keys(design.perPanel).length > 0;

  return (
    <div className="container-x py-8">
      {/* product tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/studio/${p.id}`, { replace: true })}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              p.id === productId ? 'border-forest bg-forest text-paper' : 'border-ink/15 bg-white hover:border-forest/50'
            }`}
          >
            <ProductIcon id={p.id} className="h-6 w-6" />
            {p.name}
          </button>
        ))}
      </div>

      {/* opening styles for the chosen product */}
      <div className="mt-3 rounded-2xl border border-ink/10 bg-white/70 p-3">
        <p className="px-1 text-xs font-bold uppercase tracking-wide text-ink/50">Opening style</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Opening style">
          {product.styles.map((s) => (
            <button
              key={s.id}
              role="radio"
              aria-checked={s.id === styleId}
              onClick={() => navigate(`/studio/${productId}/${s.id}`, { replace: true })}
              className={`shrink-0 rounded-xl border-2 px-3.5 py-2 text-left text-sm transition ${
                s.id === styleId ? 'border-clay bg-white shadow-sm' : 'border-transparent bg-paper hover:border-forest/30'
              }`}
            >
              <span className="block font-semibold">{s.name}</span>
              <span className="block text-xs text-ink/55">{s.opening}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 px-1 text-sm text-ink/65">{style.blurb}</p>
      </div>

      {/* stepper */}
      <ol className="mt-5 grid grid-cols-3 gap-2 text-sm">
        {(['Size & artwork', '3D preview', 'Quote & sample'] as const).map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          return (
            <li key={label}>
              <button
                onClick={() => go(n)}
                className={`w-full rounded-xl border-2 px-3 py-2 text-left transition ${
                  step === n ? 'border-clay bg-white' : step > n ? 'border-forest/30 bg-forest/5' : 'border-transparent bg-white/60'
                }`}
              >
                <span className="font-display text-lg font-bold text-clay">{n}</span>{' '}
                <span className="font-semibold">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* main stage */}
        <div className="card min-w-0 p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl text-forest">
              {product.name} <span className="text-base font-normal text-ink/50">· {style.name} · {dimsLabel(product, dims)}</span>
            </h1>
            <div className="inline-flex rounded-full border border-ink/15 bg-paper p-0.5 text-sm font-semibold" role="tablist" aria-label="Preview mode">
              {([['2d', 'Flat dieline'], ['3d', 'Interactive 3D']] as const).map(([k, label]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={stage === k}
                  onClick={() => setStage(k)}
                  className={`rounded-full px-4 py-1.5 transition ${stage === k ? 'bg-forest text-paper' : 'text-ink/60 hover:text-ink'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="mb-3 text-xs text-ink/50">
            {stage === '2d' ? 'Click a panel to select it · drag to move artwork · crease lines and print areas are marked' : 'Drag to rotate · scroll or pinch to zoom · right-drag to pan'}
          </p>
          {stage === '2d' ? (
            <>
              <div className="rounded-xl bg-[repeating-conic-gradient(#f3efe7_0%_25%,#faf8f3_0%_50%)] bg-[length:20px_20px] p-3">
                <DielineCanvas
                  dl={dl}
                  design={design}
                  images={images}
                  imagesVersion={version}
                  selected={panel?.id ?? null}
                  onSelect={setSelected}
                  onDrag={(key, dx, dy) =>
                    setDesign((d) => {
                      const a = key === null ? d.whole : d.perPanel[key];
                      if (!a) return d;
                      const moved = { ...a, offsetX: a.offsetX + dx, offsetY: a.offsetY + dy };
                      return key === null ? { ...d, whole: moved } : { ...d, perPanel: { ...d.perPanel, [key]: moved } };
                    })
                  }
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink/60">
                <span><span className="mr-1 inline-block h-0.5 w-5 bg-clay align-middle" />Printed panel · fold line</span>
                <span><span className="mr-1 inline-block w-5 border-t-2 border-dashed border-ink/50 align-middle" />Flap / tuck / glue</span>
                {dl.marks && dl.marks.length > 0 && <span><span className="mr-1 inline-block h-2.5 w-4 rounded-full border border-clay align-middle" />Cut-out</span>}
                {dl.sector && <span>The cup wall unrolls into a curved fan shape.</span>}
              </div>
            </>
          ) : (
            <div ref={wrapRef} id="preview3d" className="relative h-[420px] overflow-hidden rounded-xl sm:h-[520px]">
              {print ? (
                <Preview3D dl={dl} dims={dims} print={print.canvas} k={print.k} board={design.bgColor} view={view} />
              ) : (
                <div className="grid h-full place-items-center text-ink/50">Preparing your 3D model…</div>
              )}
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside className="space-y-4">
          <SizeCard product={product} design={design} setDesign={setDesign} freeText={!!style.freeText} />

          {step === 1 && (
            <>
              <section className="card p-5">
                <h2 className="font-sans text-sm uppercase tracking-wide text-ink/70">Artwork</h2>
                {!hasArtwork && (
                  <div className="mt-3 rounded-xl bg-paper p-3">
                    <p className="text-xs text-ink/60">No artwork yet? Try a sample with your brand name.</p>
                    <div className="mt-2 flex gap-2">
                      <input className="input" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={24} aria-label="Brand name" />
                      <button className="btn-accent shrink-0 !px-3" onClick={applySample}>Try it</button>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <span className="label">Full-wrap background</span>
                  <FileButton busy={busy} label={design.whole ? 'Replace image' : 'Upload your artwork'} onFile={(f) => upload(f, 'whole')} />
                  {design.whole && (
                    <ArtControls art={design.whole} onChange={(p) => patchArt(null, p)} onRemove={() => patch({ whole: undefined })} />
                  )}
                </div>

                {panel && (
                  <div className="mt-5 border-t border-ink/10 pt-4">
                    <label className="label" htmlFor="panelSel">Panel artwork (logo, label)</label>
                    <select id="panelSel" className="input" value={panel.id} onChange={(e) => setSelected(e.target.value)}>
                      {dl.panels
                        .filter((p) => p.kind === 'print')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label} {design.perPanel[p.id] ? '•' : ''}
                          </option>
                        ))}
                    </select>
                    <div className="mt-2">
                      <FileButton busy={busy} label={panelArt ? 'Replace image' : `Upload to ${panel.label.toLowerCase()}`} onFile={(f) => upload(f, panel.id)} />
                    </div>
                    {panelArt && (
                      <ArtControls
                        art={panelArt}
                        onChange={(p) => patchArt(panel.id, p)}
                        onRemove={() =>
                          setDesign((d) => {
                            const { [panel.id]: _, ...rest } = d.perPanel;
                            return { ...d, perPanel: rest };
                          })
                        }
                      />
                    )}
                  </div>
                )}

                <div className="mt-5 border-t border-ink/10 pt-4">
                  <span className="label">Board colour</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {BOARD_COLOURS.map((c) => (
                      <button
                        key={c.value}
                        title={c.label}
                        aria-label={c.label}
                        onClick={() => patch({ bgColor: c.value })}
                        className={`h-8 w-8 rounded-full border-2 ${design.bgColor === c.value ? 'border-clay ring-2 ring-clay/30' : 'border-ink/15'}`}
                        style={{ background: c.value }}
                      />
                    ))}
                    <input type="color" value={design.bgColor} onChange={(e) => patch({ bgColor: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-ink/15" aria-label="Custom colour" />
                  </div>
                </div>
              </section>

              <MaterialCard product={product} design={design} setDesign={setDesign} />

              <section className="card space-y-2 p-5 text-sm">
                <h2 className="font-sans text-sm uppercase tracking-wide text-ink/70">Files</h2>
                <button className="btn-ghost w-full" onClick={downloadPrint}>Download print-ready PNG</button>
                <button
                  className="btn-ghost w-full"
                  onClick={() => downloadBlob(dielineSvg(dl, `${product.name}, ${style.name} ${dimsLabel(product, dims)}`), `petti-${productId}-${styleId}-dieline.svg`, 'image/svg+xml')}
                >
                  Download blank dieline (SVG)
                </button>
              </section>

              <div className="grid gap-2">
                <button className="btn-primary w-full" onClick={() => go(2)}>Preview in 3D →</button>
                <button className="btn-ghost w-full" onClick={() => go(3)}>Skip to quote & sample</button>
              </div>
            </>
          )}

          {step === 2 && (
            <section className="card space-y-4 p-5">
              <h2 className="font-sans text-sm uppercase tracking-wide text-ink/70">View</h2>
              <Toggle label="Auto-rotate" on={view.autoRotate} onChange={(v) => setView({ ...view, autoRotate: v })} />
              {style.controls.map((c) => (
                <label key={c.key} className="block text-sm">
                  <span className="label !mb-0 flex justify-between"><span>{c.label}</span><span className="font-normal normal-case tracking-normal text-ink/40">{c.from} → {c.to}</span></span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={view[c.key]}
                    onChange={(e) => setView({ ...view, [c.key]: +e.target.value })}
                    className="mt-1 w-full accent-forest"
                    aria-label={c.label}
                  />
                </label>
              ))}
              {style.controls.length === 0 && <p className="text-xs text-ink/60">This style has no moving parts. Orbit around it to inspect every side.</p>}
              {productId === 'paper-cup' && <p className="text-xs text-ink/60">The 3D view bends the flat fan exactly the way the printed wall wraps around the cup.</p>}
              <div className="rounded-xl bg-paper p-3 text-sm">
                <p><b>{material.label}</b> · {finish.label}</p>
                <p className="mt-1 text-xs text-ink/60">{material.note}. {finish.note}.</p>
              </div>
              <button className="btn-ghost w-full" onClick={() => go(1)}>← Edit artwork</button>
              <button className="btn-primary w-full" onClick={() => go(3)}>Looks good. Get a quote →</button>
            </section>
          )}

          {step === 3 && (
            <section className="card space-y-4 p-5">
              <h2 className="font-sans text-sm uppercase tracking-wide text-ink/70">Quote & sample</h2>
              <p className="text-sm text-ink/70">
                Happy with the size, style and artwork? Send it to our team. We confirm a quotation and post you a <b>physical sample</b> before you commit.
              </p>
              <button className="btn-accent w-full !py-3 text-base" onClick={() => setQuoting(true)}>Request quote & free sample →</button>

              <div className="border-t border-ink/10 pt-4">
                <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-ink/70">Price check</h3>
                <div className="mt-3 flex items-center gap-2">
                  <button className="btn-ghost !px-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
                  <input
                    type="number"
                    min={1}
                    className="input text-center text-lg font-semibold"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(100000, Math.floor(+e.target.value) || 1)))}
                    aria-label="Quantity"
                  />
                  <button className="btn-ghost !px-3" onClick={() => setQty(qty + 1)} aria-label="Increase">+</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {QTY_PRESETS.map((q) => (
                    <button key={q} onClick={() => setQty(q)} className={`pill border ${qty === q ? 'border-forest bg-forest text-paper' : 'border-ink/15 bg-white'}`}>
                      {q.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <PriceTiers spec={spec} qty={qty} onPick={setQty} />
                </div>
                <div className="mt-3 flex items-baseline justify-between border-t border-ink/10 pt-3">
                  <span className="text-sm text-ink/60">{qty.toLocaleString('en-IN')} × {inr(unit)}</span>
                  <span className="font-display text-2xl font-bold text-forest">{inr(Math.round(unit * qty * 100) / 100)}</span>
                </div>
                <p className="mt-1 text-xs text-ink/50">Estimate. Your quotation is confirmed by our team.</p>
              </div>

              <div className="border-t border-ink/10 pt-4">
                <p className="text-sm font-semibold">Ready to order right now?</p>
                <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-xl border-2 border-dashed border-forest/40 bg-forest/5 p-3">
                  <input type="checkbox" checked={sample} onChange={(e) => setSample(e.target.checked)} className="mt-1 h-4 w-4 accent-forest" />
                  <span className="text-sm">
                    <b>Send a free printed sample first</b>
                    <span className="block text-xs text-ink/60">One piece ships ahead of your order with its own tracking. ₹0.</span>
                  </span>
                </label>
                {added ? (
                  <div className="mt-3 space-y-2">
                    <p className="rounded-lg bg-forest/10 px-3 py-2 text-sm text-forest">✓ Added to your cart.</p>
                    <Link to="/cart" className="btn-primary w-full">Go to cart →</Link>
                    <button className="btn-ghost w-full" onClick={() => { setAdded(false); go(1); }}>Design another</button>
                  </div>
                ) : (
                  <button className="btn-ghost mt-3 w-full" onClick={handleAdd}>Add to cart & order now</button>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>

      {quoting && <QuoteModal onClose={() => setQuoting(false)} design={design} dims={dims} dl={dl} images={images} qty={qty} snapshot={snapshot} />}
    </div>
  );
}

function FileButton({ label, onFile, busy }: { label: string; onFile: (f: File | undefined) => void; busy: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button className="btn-ghost w-full" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? 'Processing…' : `⬆ ${label}`}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </>
  );
}

function ArtControls({ art, onChange, onRemove }: { art: Artwork; onChange: (p: Partial<Artwork>) => void; onRemove: () => void }) {
  return (
    <div className="mt-3 space-y-2 text-sm">
      <label className="block">
        <span className="flex justify-between text-xs text-ink/60">Size <span>{Math.round(art.scale * 100)}%</span></span>
        <input type="range" min={0.2} max={3} step={0.01} value={art.scale} onChange={(e) => onChange({ scale: +e.target.value })} className="w-full accent-forest" />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {(['cover', 'contain'] as const).map((f) => (
          <button key={f} onClick={() => onChange({ fit: f })} className={`pill border ${art.fit === f ? 'border-forest bg-forest text-paper' : 'border-ink/15'}`}>
            {f === 'cover' ? 'Fill area' : 'Fit inside'}
          </button>
        ))}
        <button onClick={() => onChange({ offsetX: 0, offsetY: 0, scale: art.fit === 'cover' ? 1 : 0.8 })} className="pill border border-ink/15">Re-centre</button>
        <button onClick={onRemove} className="pill border border-red-200 text-red-700">Remove</button>
      </div>
    </div>
  );
}

/** Custom length / width / depth: a number box and a slider per dimension. */
function SizeCard({
  product,
  design,
  setDesign,
  freeText,
}: {
  product: Product;
  design: Design;
  setDesign: React.Dispatch<React.SetStateAction<Design>>;
  freeText: boolean;
}) {
  const setDim = (key: (typeof product.dims)[number]['key'], v: number) => setDesign((d) => ({ ...d, dims: { ...d.dims, [key]: v } }));
  const clampAll = () => setDesign((d) => ({ ...d, dims: clampDims(product, d.dims) }));
  return (
    <section className="card space-y-4 p-5">
      <h2 className="font-sans text-sm uppercase tracking-wide text-ink/70">Custom size (mm)</h2>
      {product.dims.map((s) => (
        <div key={s.key}>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium" htmlFor={`dim-${s.key}`}>{s.label}</label>
            <input
              id={`dim-${s.key}`}
              type="number"
              className="input !w-24 !py-1 text-right"
              min={s.min}
              max={s.max}
              value={design.dims[s.key] || ''}
              onChange={(e) => setDim(s.key, +e.target.value)}
              onBlur={clampAll}
            />
          </div>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={1}
            value={Math.min(s.max, Math.max(s.min, design.dims[s.key] || s.default))}
            onChange={(e) => setDim(s.key, +e.target.value)}
            className="mt-1 w-full accent-forest"
            aria-label={`${s.label} slider`}
          />
          <p className="-mt-0.5 text-[11px] text-ink/40">{s.min}–{s.max} mm</p>
        </div>
      ))}
      {freeText && (
        <label className="block">
          <span className="label">Describe your opening style</span>
          <textarea
            className="input"
            rows={3}
            maxLength={400}
            placeholder="e.g. shoulder-neck box with a ribbon pull, or a book-fold with a window"
            value={design.styleNote}
            onChange={(e) => setDesign((d) => ({ ...d, styleNote: e.target.value }))}
          />
          <span className="mt-1 block text-xs text-ink/50">The 3D preview shows a lid & base as a starting point. Our team builds what you describe.</span>
        </label>
      )}
    </section>
  );
}

function MaterialCard({ product, design, setDesign }: { product: Product; design: Design; setDesign: React.Dispatch<React.SetStateAction<Design>> }) {
  return (
    <section className="card space-y-4 p-5">
      <h2 className="font-sans text-sm uppercase tracking-wide text-ink/70">Material & finish</h2>
      <label className="block">
        <span className="label">Material</span>
        <select className="input" value={design.materialId} onChange={(e) => setDesign((d) => ({ ...d, materialId: e.target.value }))}>
          {product.materials.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-ink/55">{product.materials.find((m) => m.id === design.materialId)?.note}</span>
      </label>
      <label className="block">
        <span className="label">Finish</span>
        <select className="input" value={design.finishId} onChange={(e) => setDesign((d) => ({ ...d, finishId: e.target.value }))}>
          {product.finishes.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </label>
    </section>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm">
      {label}
      <button
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-forest' : 'bg-ink/20'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  );
}
