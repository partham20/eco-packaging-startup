import type { ProductId } from '../types';

/** Simple line illustrations, one per product line. */
export default function ProductIcon({ id, className = 'h-16 w-16' }: { id: ProductId; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      {id === 'rigid-box' && (
        <g {...common}>
          <path d="M10 26l22-9 22 9-22 9z" fill="#E6D3B8" />
          <path d="M10 26v8l22 9 22-9v-8" />
          <path d="M14 34v12l18 8 18-8V34" fill="#C9A57B" />
          <path d="M32 43v11" />
        </g>
      )}
      {id === 'corrugated' && (
        <g {...common}>
          <path d="M8 24l24-10 24 10v22L32 56 8 46z" fill="#C9A57B" />
          <path d="M8 24l24 10 24-10M32 34v22" />
          <path d="M8 24l-4 8 24 10 4-8M56 24l4 8-24 10-4-8" fill="#E6D3B8" />
          <path d="M20 20l24 10" strokeDasharray="2 2" />
        </g>
      )}
      {id === 'mono-carton' && (
        <g {...common}>
          <path d="M22 14l12-5 12 5v38l-12 5-12-5z" fill="#F7F3EC" />
          <path d="M22 14l12 5 12-5M34 19v38" />
          <path d="M22 14l-2-6 12-4 2 5" fill="#E6D3B8" />
          <circle cx="28" cy="34" r="4" fill="#1F3D2B" stroke="none" />
        </g>
      )}
      {id === 'paper-cup' && (
        <g {...common}>
          <path d="M16 14h32l-5 42H21z" fill="#F7F3EC" />
          <ellipse cx="32" cy="14" rx="16" ry="3" fill="#E6D3B8" />
          <path d="M18 28h28l-1 12H19z" fill="#1F3D2B" stroke="none" />
        </g>
      )}
      {id === 'paper-bag' && (
        <g {...common}>
          <path d="M12 22h30v34H12z" fill="#C9A57B" />
          <path d="M42 22l10 4v30H42" fill="#B9966C" />
          <path d="M20 22c0-10 14-10 14 0" strokeWidth="2.2" />
          <path d="M18 30h18" />
        </g>
      )}
    </svg>
  );
}
