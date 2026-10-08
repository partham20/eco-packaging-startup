import type { Order, Shipment } from '../types';
import { STATUS_META } from '../data/status';
import { etaFor, flowFor } from '../store/orderStore';

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export function StatusPill({ s }: { s: Shipment }) {
  const done = s.status === 'delivered';
  const delivery = STATUS_META[s.status].phase === 'delivery';
  return (
    <span className={`pill ${done ? 'bg-forest text-paper' : delivery ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
      {STATUS_META[s.status].label}
    </span>
  );
}

export default function Timeline({ order, shipment }: { order: Order; shipment: Shipment }) {
  const flow = flowFor(shipment.kind);
  const currentIdx = flow.indexOf(shipment.status);
  const pct = Math.round((currentIdx / (flow.length - 1)) * 100);
  const eta = etaFor(order, shipment.kind);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-sans text-lg font-semibold">{shipment.kind === 'main' ? 'Your order' : 'Free sample'}</h3>
          <p className="text-xs text-ink/50">AWB {shipment.awb}</p>
        </div>
        <div className="text-right">
          <StatusPill s={shipment} />
          <p className="mt-1 text-xs text-ink/50">
            {shipment.status === 'delivered' ? 'Delivered' : `Expected by ${eta.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ol className="mt-6">
        {flow.map((status, i) => {
          const events = shipment.events.filter((e) => e.status === status);
          const done = i < currentIdx || (i === currentIdx && status === 'delivered');
          const current = i === currentIdx && status !== 'delivered';
          const meta = STATUS_META[status];
          const showPhase = i === 0 || STATUS_META[flow[i - 1]].phase !== meta.phase;
          return (
            <li key={status}>
              {showPhase && (
                <p className="relative z-10 mb-2 mt-1 bg-white py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">
                  {meta.phase === 'production' ? (shipment.kind === 'sample' ? 'Preparation' : 'Production · Chennai factory') : 'Delivery'}
                </p>
              )}
              <div className="relative flex gap-4 pb-5">
                {i < flow.length - 1 && <span className={`absolute left-[9px] top-6 h-full w-0.5 ${i < currentIdx ? 'bg-forest' : 'bg-ink/10'}`} />}
                <span
                  className={`relative z-10 mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                    done ? 'bg-forest text-paper' : current ? 'bg-clay text-white ring-4 ring-clay/20' : 'border-2 border-ink/20 bg-white'
                  }`}
                >
                  {done ? '✓' : ''}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${i > currentIdx ? 'text-ink/40' : ''}`}>
                    {meta.label}
                    {current && <span className="ml-2 text-xs font-semibold text-clay">● Now</span>}
                  </p>
                  {events.length === 0 && i > currentIdx && <p className="text-xs text-ink/35">{meta.desc}</p>}
                  {events.map((e, j) => (
                    <div key={j} className="mt-1 text-sm">
                      <span className="text-ink/50">{fmt(e.at)}</span>
                      {e.city && <span className="ml-2 font-medium text-forest">{e.city}</span>}
                      {e.note && <p className="text-ink/70">{e.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
