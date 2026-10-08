import { TIERS, inr, tierFor, unitPrice, type PriceSpec } from '../lib/pricing';

export default function PriceTiers({ spec, qty, onPick }: { spec: PriceSpec; qty: number; onPick?: (q: number) => void }) {
  const current = tierFor(qty);
  const idx = TIERS.indexOf(current);
  const next = TIERS[idx + 1];
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink/50">
            <th className="py-1 font-semibold">Quantity</th>
            <th className="py-1 text-right font-semibold">Per piece</th>
            <th className="py-1 text-right font-semibold">You save</th>
          </tr>
        </thead>
        <tbody>
          {TIERS.map((t) => {
            const on = t === current;
            return (
              <tr
                key={t.min}
                onClick={() => onPick?.(t.min)}
                className={`${onPick ? 'cursor-pointer hover:bg-paper' : ''} ${on ? 'bg-forest/10 font-semibold text-forest' : ''}`}
              >
                <td className="rounded-l-md px-2 py-1.5">{t.min.toLocaleString('en-IN')}+</td>
                <td className="px-2 py-1.5 text-right">{inr(unitPrice(spec, t.min))}</td>
                <td className="rounded-r-md px-2 py-1.5 text-right text-ink/60">{t.factor < 1 ? `${Math.round((1 - t.factor) * 100)}%` : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {next && (
        <p className="mt-2 rounded-lg bg-kraft/20 px-3 py-2 text-xs text-ink/75">
          Order <b>{(next.min - qty).toLocaleString('en-IN')}</b> more to pay <b>{inr(unitPrice(spec, next.min))}</b> per piece.
        </p>
      )}
    </div>
  );
}
