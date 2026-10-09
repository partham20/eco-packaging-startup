/**
 * Soft, product-photo-style illustrations of each pack, drawn in isometric SVG so the
 * site needs no photography. Each shot takes a colour tone so cards can vary.
 */
export type ShotKind = 'rigid' | 'magnetic' | 'drawer' | 'mailer' | 'shipper' | 'tuck' | 'cup' | 'bag';

export interface Tone {
  top: string;
  left: string;
  right: string;
  inner: string;
  ink: string;
}

export const TONES = {
  blush: { top: '#F6D3CB', left: '#E9B2A6', right: '#DE9F92', inner: '#C98577', ink: '#9E5A4C' },
  sage: { top: '#CFDCCB', left: '#A8BEA6', right: '#97AF95', inner: '#7E987D', ink: '#3F5A43' },
  cream: { top: '#F7EEDC', left: '#E7D9BE', right: '#DCCBAB', inner: '#C6B18D', ink: '#8A7350' },
  kraft: { top: '#D9B48A', left: '#C29A6D', right: '#B38B5F', inner: '#9C774E', ink: '#6E4F2E' },
  espresso: { top: '#4A3C33', left: '#382D26', right: '#2E251F', inner: '#1F1915', ink: '#E8C9A0' },
  white: { top: '#FFFFFF', left: '#EFEAE2', right: '#E4DED4', inner: '#D2CABD', ink: '#C27560' },
  terracotta: { top: '#E39A80', left: '#CF8166', right: '#C27459', inner: '#A65E46', ink: '#FCEDEA' },
} satisfies Record<string, Tone>;

export type ToneName = keyof typeof TONES;

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);
type P3 = [number, number, number];

/** Isometric projection around an origin on the canvas. */
const iso = (ox: number, oy: number) => ([x, y, z]: P3) => `${(ox + (x - y) * C).toFixed(1)},${(oy + (x + y) * S - z).toFixed(1)}`;

function Box({ o, x = 0, y = 0, z = 0, w, d, h, t, stroke = 'rgba(0,0,0,0.06)' }: { o: (p: P3) => string; x?: number; y?: number; z?: number; w: number; d: number; h: number; t: Tone; stroke?: string }) {
  const pts = (arr: P3[]) => arr.map(o).join(' ');
  return (
    <g stroke={stroke} strokeWidth={0.6} strokeLinejoin="round">
      <polygon points={pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={t.left} />
      <polygon points={pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={t.right} />
      <polygon points={pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={t.top} />
    </g>
  );
}

/** A monogram laid flat on the top face of a box. */
function TopMark({ ox, oy, cx, cy, z, color, size = 14, text = 'P' }: { ox: number; oy: number; cx: number; cy: number; z: number; color: string; size?: number; text?: string }) {
  const tx = ox + (cx - cy) * C;
  const ty = oy + (cx + cy) * S - z;
  return (
    <g transform={`matrix(${C},${S},${-C},${S},${tx},${ty})`}>
      <circle r={size} fill="none" stroke={color} strokeWidth={0.9} opacity={0.8} />
      <text textAnchor="middle" dominantBaseline="central" fontFamily="Instrument Serif, Georgia, serif" fontStyle="italic" fontSize={size * 1.25} fill={color}>
        {text}
      </text>
    </g>
  );
}

/** A label laid on the left (front) face. */
function SideMark({ ox, oy, x, y, z, color, text, size = 7 }: { ox: number; oy: number; x: number; y: number; z: number; color: string; text: string; size?: number }) {
  const tx = ox + (x - y) * C;
  const ty = oy + (x + y) * S - z;
  return (
    <text transform={`matrix(${C},${S},0,1,${tx},${ty})`} textAnchor="middle" fontFamily="Instrument Serif, Georgia, serif" fontSize={size} letterSpacing={1.5} fill={color}>
      {text}
    </text>
  );
}

export default function PackShot({ kind, tone = 'blush', className = '', label = 'PETTI' }: { kind: ShotKind; tone?: ToneName; className?: string; label?: string }) {
  const t = TONES[tone];
  const ox = 100;
  const oy = 62;
  const o = iso(ox, oy);
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden>
      <defs>
        <radialGradient id="ps-shadow">
          <stop offset="0%" stopColor="#2A211C" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2A211C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="142" rx="78" ry="16" fill="url(#ps-shadow)" />
      {kind === 'rigid' && (
        <g>
          <Box o={o} x={0} y={0} z={0} w={70} d={52} h={30} t={t} />
          <Box o={o} x={-2} y={-2} z={22} w={74} d={56} h={14} t={t} />
          <TopMark ox={ox} oy={oy} cx={35} cy={26} z={36} color={t.ink} />
          <polyline points={[[30, -2, 36], [30, 54, 36], [30, 54, 22]].map((p) => o(p as P3)).join(' ')} fill="none" stroke={t.inner} strokeWidth={3} opacity={0.55} />
        </g>
      )}
      {kind === 'magnetic' && (
        <g>
          <Box o={o} x={0} y={0} z={0} w={70} d={52} h={30} t={t} />
          {/* inner tray */}
          <polygon points={[[3, 3, 30], [67, 3, 30], [67, 49, 30], [3, 49, 30]].map((p) => o(p as P3)).join(' ')} fill={t.inner} />
          <polygon points={[[3, 3, 30], [67, 3, 30], [67, 3, 8], [3, 3, 8]].map((p) => o(p as P3)).join(' ')} fill={t.right} opacity={0.6} />
          {/* flipped lid, hinged on the back edge */}
          <polygon points={[[0, 0, 30], [70, 0, 30], [70, -16, 80], [0, -16, 80]].map((p) => o(p as P3)).join(' ')} fill={t.top} stroke="rgba(0,0,0,0.06)" />
          <polygon points={[[70, 0, 30], [72, 0, 30], [72, -16, 80], [70, -16, 80]].map((p) => o(p as P3)).join(' ')} fill={t.right} />
        </g>
      )}
      {kind === 'drawer' && (
        <g>
          <Box o={o} x={-26} y={4} z={0} w={34} d={44} h={24} t={{ ...t, top: t.inner }} />
          <Box o={o} x={-26} y={4} z={0} w={34} d={44} h={20} t={t} />
          <Box o={o} x={8} y={0} z={0} w={62} d={52} h={28} t={t} />
          <SideMark ox={ox} oy={oy} x={39} y={52} z={10} color={t.ink} text={'PETTI'} />
        </g>
      )}
      {kind === 'mailer' && (
        <g>
          <Box o={o} x={0} y={0} z={0} w={76} d={56} h={24} t={t} />
          <polygon points={[[3, 3, 24], [73, 3, 24], [73, 53, 24], [3, 53, 24]].map((p) => o(p as P3)).join(' ')} fill={t.inner} />
          <polygon points={[[3, 3, 24], [73, 3, 24], [73, 3, 4], [3, 3, 4]].map((p) => o(p as P3)).join(' ')} fill={t.left} opacity={0.7} />
          <polygon points={[[3, 3, 24], [3, 53, 24], [3, 53, 4], [3, 3, 4]].map((p) => o(p as P3)).join(' ')} fill={t.right} opacity={0.6} />
          {/* tissue */}
          <path d={`M${o([12, 14, 24])} Q${o([38, 4, 30])} ${o([64, 16, 24])} L${o([60, 44, 24])} Q${o([36, 54, 28])} ${o([12, 40, 24])} Z`} fill="#FCEDEA" opacity={0.9} />
          <circle cx={Number(o([38, 28, 26]).split(',')[0])} cy={Number(o([38, 28, 26]).split(',')[1])} r="4" fill={t.ink} opacity="0.8" />
          {/* open lid */}
          <polygon points={[[0, 0, 24], [76, 0, 24], [76, -10, 78], [0, -10, 78]].map((p) => o(p as P3)).join(' ')} fill={t.top} stroke="rgba(0,0,0,0.06)" />
          <polygon points={[[0, -10, 78], [76, -10, 78], [76, -4, 84], [0, -4, 84]].map((p) => o(p as P3)).join(' ')} fill={t.left} />
        </g>
      )}
      {kind === 'shipper' && (
        <g>
          <Box o={o} x={0} y={0} z={0} w={66} d={54} h={48} t={t} />
          <polygon points={[[29, 0, 48], [37, 0, 48], [37, 54, 48], [29, 54, 48]].map((p) => o(p as P3)).join(' ')} fill="#EADBC4" opacity={0.85} />
          <polygon points={[[29, 54, 48], [37, 54, 48], [37, 54, 36], [29, 54, 36]].map((p) => o(p as P3)).join(' ')} fill="#DDCBB0" opacity={0.85} />
          <SideMark ox={ox} oy={oy} x={33} y={54} z={18} color={t.ink} text="PETTI" size={8} />
          <line x1={o([2, 0, 48]).split(',')[0]} y1={o([2, 0, 48]).split(',')[1]} x2={o([64, 0, 48]).split(',')[0]} y2={o([64, 0, 48]).split(',')[1]} stroke="rgba(0,0,0,0.12)" />
        </g>
      )}
      {kind === 'tuck' && (
        <g>
          <Box o={o} x={-30} y={18} z={0} w={26} d={20} h={70} t={t} />
          <polygon points={[[-30, 18, 70], [-4, 18, 70], [-4, 4, 82], [-30, 4, 82]].map((p) => o(p as P3)).join(' ')} fill={t.top} stroke="rgba(0,0,0,0.06)" />
          <SideMark ox={ox} oy={oy} x={-17} y={38} z={36} color={t.ink} text="PETTI" size={6} />
          <Box o={o} x={14} y={6} z={0} w={34} d={26} h={46} t={TONES.cream} />
          <SideMark ox={ox} oy={oy} x={31} y={32} z={22} color={TONES.cream.ink} text="SOAP" size={6} />
        </g>
      )}
      {kind === 'cup' && (
        <g>
          <path d="M62 34 L138 34 L128 140 L72 140 Z" fill={t.left} />
          <path d="M100 34 L138 34 L128 140 L100 140 Z" fill={t.right} opacity={0.6} />
          <path d="M66 70 L134 70 L130 108 L70 108 Z" fill={t.top} />
          <text x="100" y="94" textAnchor="middle" fontFamily="Instrument Serif, Georgia, serif" fontStyle="italic" fontSize="15" fill={t.ink}>
            petti
          </text>
          <ellipse cx="100" cy="140" rx="28" ry="5" fill={t.right} />
          <ellipse cx="100" cy="34" rx="38" ry="8" fill={t.inner} />
          <ellipse cx="100" cy="34" rx="38" ry="8" fill="none" stroke={t.top} strokeWidth="3" />
        </g>
      )}
      {kind === 'bag' && (
        <g>
          <Box o={o} x={0} y={14} z={0} w={58} d={22} h={66} t={t} />
          <path d={`M${o([16, 36, 66])} C${o([16, 36, 96])} ${o([42, 36, 96])} ${o([42, 36, 66])}`} fill="none" stroke={t.ink} strokeWidth={2.4} strokeLinecap="round" />
          <path d={`M${o([16, 14, 66])} C${o([16, 14, 92])} ${o([42, 14, 92])} ${o([42, 14, 66])}`} fill="none" stroke={t.inner} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
          <SideMark ox={ox} oy={oy} x={29} y={36} z={30} color={t.ink} text={label} size={9} />
        </g>
      )}
    </svg>
  );
}
