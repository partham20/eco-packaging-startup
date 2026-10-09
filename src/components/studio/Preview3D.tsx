import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Dieline, Dims, FaceKey } from '../../types';
import { buildTextures, type TextureSet } from '../../lib/textures';
import { SLEEVE_CLEARANCE, hangTabDims, lidDims, lidRatio, trayLength } from '../../data/dielines';

const FACE_ORDER: FaceKey[] = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
const BG = '#F2ECE1';

export interface ViewOptions {
  autoRotate: boolean;
  /** 0 = closed, 1 = fully open (lid lifted, drawer pulled out, flaps open …) */
  open: number;
  /** 0 = assembled, 1 = folded flat (collapsible box only) */
  fold: number;
}

interface Props {
  dl: Dieline;
  dims: Dims;
  print: HTMLCanvasElement | null;
  k: number;
  board: string;
  view: ViewOptions;
}

type V3 = [number, number, number];

export default function Preview3D({ dl, dims, print, k, board, view }: Props) {
  const tex = useMemo(() => (print ? buildTextures(dl, print, k) : null), [dl, print, k]);
  useEffect(() => () => tex?.all.forEach((t) => t.dispose()), [tex]);

  const { height, span } = extent(dl, dims);
  const s = 2 / Math.max(span, height);
  const floor = -height / 2;

  return (
    <Canvas
      flat
      shadows={false}
      dpr={[1, 2]}
      camera={{ position: [2.6, 1.6, 3.6], fov: 38 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <color attach="background" args={[BG]} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} />
      <group scale={s}>{tex && <ProductModel dl={dl} dims={dims} floor={floor} tex={tex} board={board} view={view} />}</group>
      <ContactShadows position={[0, floor * s - 0.005, 0]} opacity={0.35} scale={6} blur={2.4} far={2} />
      <OrbitControls makeDefault enableDamping autoRotate={view.autoRotate} autoRotateSpeed={1.2} minDistance={1.5} maxDistance={9} />
    </Canvas>
  );
}

/**
 * Worst-case visible height and horizontal span in mm (lid lifted, drawer out …), so the
 * model keeps a fixed scale and position while the view sliders move.
 */
function extent(dl: Dieline, d: Dims): { height: number; span: number } {
  const { L, W, H } = d;
  const st = dl.styleId;
  switch (dl.productId) {
    case 'rigid-box':
      if (st === 'drawer') return { height: H + SLEEVE_CLEARANCE, span: Math.max(L * 1.35, W) };
      if (st === 'collapsible') return { height: H + 3 + W * 0.85, span: Math.max(L, W * 1.5) };
      if (st === 'magnetic') return { height: H + lidDims(d).W * 0.8, span: Math.max(L, W * 1.5) };
      return { height: H + lidDims(d).D * 1.6, span: Math.max(L, W) };
    case 'corrugated':
      if (st === 'mailer') return { height: H + W * 0.85, span: Math.max(L, W * 1.5) };
      if (st === 'telescopic') return { height: H + lidDims(d, 0.5).D * 1.6, span: Math.max(L, W) };
      return { height: H + W / 2, span: Math.max(L, W) };
    case 'mono-carton':
      if (st === 'sleeve') return { height: H * 2.05, span: Math.max(L, W) };
      if (st === 'tray-sleeve') return { height: H + SLEEVE_CLEARANCE, span: Math.max(L * 1.35, W) };
      if (st === 'hang-tab') return { height: H + Math.max(W * 0.9, hangTabDims(d).h), span: Math.max(L, W * 1.4) };
      return { height: H + W * 0.9, span: Math.max(L, W * 1.4) };
    case 'paper-bag':
      return { height: st === 'sos' || st === 'die-cut' ? H : H + L * 0.24, span: Math.max(L, W) };
    case 'paper-cup':
      if (st === 'sip-lid') return { height: H + 55, span: d.topDia };
      if (st === 'cold-dome') return { height: H + 120, span: d.topDia };
      return { height: H, span: d.topDia };
  }
}

interface MProps {
  dl: Dieline;
  dims: Dims;
  floor: number;
  tex: TextureSet;
  board: string;
  view: ViewOptions;
}

function ProductModel(p: MProps) {
  const st = p.dl.styleId;
  switch (p.dl.productId) {
    case 'rigid-box':
      if (st === 'drawer') return <DrawerModel {...p} />;
      if (st === 'collapsible') return <CollapsibleModel {...p} />;
      if (st === 'magnetic') return <MagneticModel {...p} />;
      return <LidBaseModel {...p} ratio={lidRatio('rigid-box', st)} />;
    case 'corrugated':
      if (st === 'mailer') return <MailerModel {...p} />;
      if (st === 'telescopic') return <LidBaseModel {...p} ratio={lidRatio('corrugated', st)} />;
      return <CartonModel {...p} />;
    case 'mono-carton':
      if (st === 'sleeve') return <SleeveModel {...p} />;
      if (st === 'tray-sleeve') return <DrawerModel {...p} />;
      return <TuckModel {...p} />;
    case 'paper-bag':
      return <BagModel {...p} />;
    case 'paper-cup':
      return <CupModel {...p} />;
  }
}

/* ───────────────────────────── rigid / lid-and-base ───────────────────────────── */

function LidBaseModel({ dims, floor, tex, board, view, ratio }: MProps & { ratio: number }) {
  const { L, W, H } = dims;
  const lid = lidDims(dims, ratio);
  const lidY = floor + H - lid.D / 2 + 1;
  const o = view.open;
  return (
    <group>
      <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} openTop />
      <group position={[0, lidY + lid.D * 1.6 * o, -W * 0.15 * o]} rotation={[-0.35 * o, 0, 0]}>
        <BoxPart size={[lid.L, lid.D, lid.W]} faces={tex.faces.lid} board={board} openBottom />
      </group>
    </group>
  );
}

/** Flip-top box: lid hinged at the back edge, two magnets on the front rim. */
function MagneticModel({ dims, floor, tex, board, view }: MProps) {
  const { L, W, H } = dims;
  const lid = lidDims(dims);
  const top = floor + H;
  return (
    <group>
      <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} openTop />
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[L * x, top + 0.5, W / 2 - 2]}>
          <cylinderGeometry args={[5, 5, 1.2, 24]} />
          <meshStandardMaterial color="#8E959C" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <group position={[0, top, -lid.W / 2]} rotation={[-view.open * 2.15, 0, 0]}>
        <BoxPart size={[lid.L, lid.D, lid.W]} position={[0, -lid.D / 2 + 1, lid.W / 2]} faces={tex.faces.lid} board={board} openBottom />
      </group>
    </group>
  );
}

/** Tray sliding out of a sleeve (rigid drawer box, mono-carton tray & sleeve). */
function DrawerModel({ dims, floor, tex, board, view }: MProps) {
  const { L, W, H } = dims;
  const c = SLEEVE_CLEARANCE;
  const tl = trayLength(dims);
  return (
    <group position={[-0.3 * L * view.open, 0, 0]}>
      <BoxPart size={[L, H + c, W + c]} position={[0, floor + (H + c) / 2, 0]} faces={tex.faces.sleeve} board={board} hide={['px', 'nx']} />
      <BoxPart size={[tl, H, W]} position={[view.open * L * 0.6, floor + c / 2 + H / 2, 0]} faces={tex.faces.body} board={board} openTop />
    </group>
  );
}

/** Foldable box: walls hinge up from the base, lid hinges off the back wall. */
function CollapsibleModel({ dims, floor, tex, board, view }: MProps) {
  const { L, W, H } = dims;
  const T = 3; // base thickness
  const t = 2.5; // wall thickness
  const y = floor + T;
  const a = -view.fold * (Math.PI / 2) * 0.985;
  const lidMap = useFlipped(tex.faces.lid?.pz);
  const lidAngle = -Math.PI / 2 + view.open * (Math.PI / 2 + 0.45);
  const walls = [
    { key: 'pz' as const, pos: [0, y, W / 2] as V3, ry: 0, w: L, lift: 0 },
    { key: 'px' as const, pos: [L / 2, y, 0] as V3, ry: Math.PI / 2, w: W, lift: 1 },
    { key: 'nz' as const, pos: [0, y, -W / 2] as V3, ry: Math.PI, w: L, lift: 2 },
    { key: 'nx' as const, pos: [-L / 2, y, 0] as V3, ry: -Math.PI / 2, w: W, lift: 3 },
  ];
  return (
    <group>
      <BoxPart size={[L, T, W]} position={[0, floor + T / 2, 0]} faces={{ ny: tex.faces.body?.ny }} board={board} />
      {walls.map((w) => (
        <group key={w.key} position={[w.pos[0], w.pos[1] + w.lift * (t + 0.4) * view.fold, w.pos[2]]} rotation={[0, w.ry, 0]}>
          <group rotation={[a, 0, 0]}>
            <BoxPart size={[w.w, H, t]} position={[0, H / 2, t / 2]} faces={{ pz: tex.faces.body?.[w.key] }} board={board} />
            {w.key === 'nz' && (
              <group position={[0, H, 0]} rotation={[lidAngle, 0, 0]}>
                <BoxPart size={[L + 2 * t, W + t, t]} position={[0, (W + t) / 2, t / 2]} faces={{ pz: lidMap }} board={board} />
              </group>
            )}
          </group>
        </group>
      ))}
    </group>
  );
}

/* ───────────────────────────── corrugated ───────────────────────────── */

/** Regular slotted carton: four flaps. */
function CartonModel({ dims, floor, tex, board, view }: MProps) {
  const { L, W, H } = dims;
  const flapsClosed = 1 - view.open;
  const angle = 0.55 - flapsClosed * (Math.PI / 2 + 0.55);
  const top = floor + H;
  const flaps = [
    { key: 'flapFront', w: L, pos: [0, top, W / 2], ry: 0, under: false },
    { key: 'flapRight', w: W, pos: [L / 2, top - 0.6, 0], ry: Math.PI / 2, under: true },
    { key: 'flapBack', w: L, pos: [0, top, -W / 2], ry: Math.PI, under: false },
    { key: 'flapLeft', w: W, pos: [-L / 2, top - 0.6, 0], ry: -Math.PI / 2, under: true },
  ] as const;
  return (
    <group>
      <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} openTop />
      {flaps.map((f) => (
        <group key={f.key} position={f.pos as unknown as V3} rotation={[0, f.ry, 0]}>
          <group rotation={[f.under ? Math.min(angle + 0.02, 0.55) : angle, 0, 0]}>
            <Flap w={f.w} h={W / 2} map={tex.single[f.key]} board={board} />
          </group>
        </group>
      ))}
    </group>
  );
}

/** Mailer box: lid hinged at the back, front tuck flap slides inside the front wall. */
function MailerModel({ dims, floor, tex, board, view }: MProps) {
  const { L, W, H } = dims;
  const tuck = Math.min(45, Math.max(20, Math.round(H * 0.3)));
  return (
    <group>
      <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} openTop />
      <group position={[0, floor + H, -W / 2]} rotation={[-view.open * 2.0, 0, 0]}>
        <BoxPart size={[L, 3, W]} position={[0, 1.5, W / 2]} faces={tex.faces.lid} board={board} />
        <group position={[0, 0, W - 3]} rotation={[Math.PI + 0.1, 0, 0]}>
          <Flap w={L - 1} h={tuck} board={board} />
        </group>
      </group>
    </group>
  );
}

/* ───────────────────────────── mono carton ───────────────────────────── */

/** Tuck-end carton. The lid hangs off the back wall; the hang-tab style hinges at the front instead. */
function TuckModel({ dims, dl, floor, tex, board, view }: MProps) {
  const { L, W, H } = dims;
  const tab = dl.styleId === 'hang-tab';
  const top = floor + H;
  const dir = tab ? 1 : -1; // hinge at front (+z) lifts with +rotation, at back (-z) with -rotation
  const hz = tab ? W / 2 : -W / 2;
  const t = hangTabDims(dims);
  return (
    <group>
      <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} openTop />
      <group position={[0, top, hz]} rotation={[dir * view.open * 2.2, 0, 0]}>
        <BoxPart size={[L, 1.4, W]} position={[0, 0.7, -dir * (W / 2)]} faces={tex.faces.lid} board={board} />
        <group position={[0, 0, -dir * (W - 1.5)]} rotation={[tab ? Math.PI - 0.1 : Math.PI + 0.1, 0, 0]}>
          <Flap w={L - 1} h={15} board={board} />
        </group>
      </group>
      {tab && (
        <>
          <BoxPart size={[t.w, t.h, 1.5]} position={[0, top + 0.5 + t.h / 2, -W / 2 + 2]} faces={tex.faces.tab} board={board} />
          {[0.9, -0.9].map((dz, i) => (
            <mesh key={dz} position={[0, top + 0.5 + t.h / 2, -W / 2 + 2 + dz]} rotation={[0, i ? Math.PI : 0, 0]}>
              <circleGeometry args={[Math.min(7, t.w / 4), 24]} />
              <meshBasicMaterial color={BG} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

/** Open-ended tube that slides off the product inside it. */
function SleeveModel({ dims, floor, tex, board, view }: MProps) {
  const { L, W, H } = dims;
  const r = Math.max(4, Math.min(L, W) / 2 - 4);
  return (
    <group>
      <mesh position={[0, floor + H * 0.46, 0]}>
        <cylinderGeometry args={[r, r, H * 0.92, 40]} />
        <meshStandardMaterial color="#9DB8A4" roughness={0.45} />
      </mesh>
      <mesh position={[0, floor + H * 0.96, 0]}>
        <cylinderGeometry args={[r * 0.55, r * 0.55, H * 0.08, 24]} />
        <meshStandardMaterial color="#2B2B29" roughness={0.5} />
      </mesh>
      <group position={[0, view.open * H * 1.05, 0]}>
        <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} hide={['py', 'ny']} />
      </group>
    </group>
  );
}

/* ───────────────────────────── paper bag ───────────────────────────── */

function BagModel({ dims, dl, floor, tex, board }: MProps) {
  const { L, W, H } = dims;
  const st = dl.styleId;
  const top = floor + H;
  const cut = Math.min(55, L * 0.22);
  return (
    <group>
      <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} openTop />
      {(st === 'twisted' || st === 'flat' || st === 'rope') &&
        [W / 2 - 2, -W / 2 + 2].map((z) => <Handle key={z} L={L} y={top} z={z} variant={st} />)}
      {st === 'rope' &&
        [-1, 1].flatMap((sz) =>
          [-1, 1].map((sx) => (
            <mesh key={`${sx}${sz}`} position={[sx * L * 0.18, top - 14, sz * (W / 2 + 0.3)]}>
              <torusGeometry args={[3.4, 0.9, 10, 24]} />
              <meshStandardMaterial color="#C9A24A" metalness={0.6} roughness={0.35} />
            </mesh>
          )),
        )}
      {st === 'die-cut' &&
        [1, -1].map((sz) => (
          <mesh key={sz} position={[0, top - 24, sz * (W / 2 + 0.3)]} rotation={[0, sz > 0 ? 0 : Math.PI, 0]} scale={[cut, 10, 1]}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial color="#17120D" />
          </mesh>
        ))}
    </group>
  );
}

function Handle({ L, y, z, variant }: { L: number; y: number; z: number; variant: 'twisted' | 'flat' | 'rope' }) {
  const geo = useMemo(() => {
    const a = L * 0.18;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-a, -30, 0),
      new THREE.Vector3(-a, 10, 0),
      new THREE.Vector3(-a * 0.6, L * 0.24, 0),
      new THREE.Vector3(a * 0.6, L * 0.24, 0),
      new THREE.Vector3(a, 10, 0),
      new THREE.Vector3(a, -30, 0),
    ]);
    const radius = variant === 'twisted' ? 2.6 : variant === 'flat' ? 7 : 1.8;
    return new THREE.TubeGeometry(curve, 64, radius, 10, false);
  }, [L, variant]);
  useEffect(() => () => geo.dispose(), [geo]);
  const color = variant === 'twisted' ? '#A8835A' : variant === 'flat' ? '#B99565' : '#EDE6D6';
  return (
    <mesh geometry={geo} position={[0, y, z]} scale={[1, 1, variant === 'flat' ? 0.18 : 1]}>
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

/* ───────────────────────────── paper cup ───────────────────────────── */

function CupModel({ dims, dl, floor, tex, view }: MProps) {
  const st = dl.styleId;
  const top = dims.topDia / 2;
  const bot = Math.min(dims.botDia, dims.topDia - 10) / 2;
  const H = dims.H;
  const map = tex.single.cup;
  const ripple = useMemo(() => (st === 'ripple' ? rippleBump() : null), [st]);
  useEffect(() => () => ripple?.dispose(), [ripple]);
  return (
    <group position={[0, floor + H / 2, 0]}>
      <group rotation={[0, Math.PI, 0]}>
        <mesh>
          <cylinderGeometry args={[top, bot, H, 96, 1, true]} />
          <meshStandardMaterial key={map?.uuid} map={map ?? null} bumpMap={ripple} bumpScale={ripple ? 14 : 0} roughness={0.6} side={THREE.FrontSide} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[top - 0.4, bot - 0.4, H, 96, 1, true]} />
          <meshStandardMaterial color="#F4F1EA" roughness={0.9} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, -H / 2 + 6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[bot + 0.6, 64]} />
          <meshStandardMaterial color="#ECE6DA" roughness={1} />
        </mesh>
        <mesh position={[0, H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[top, 1.4, 12, 96]} />
          <meshStandardMaterial color="#F7F3EC" roughness={0.7} />
        </mesh>
      </group>
      {st === 'sip-lid' && <SipLid top={top} y={H / 2 + 1 + 45 * view.open} />}
      {st === 'cold-dome' && <DomeLid top={top} H={H} y={H / 2 + 1 + 40 * view.open} />}
    </group>
  );
}

/** Snap-on hot-drink lid with a drinking opening. */
function SipLid({ top, y }: { top: number; y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <cylinderGeometry args={[top + 1.8, top + 0.9, 8, 64]} />
        <meshStandardMaterial color="#EFEAE0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[top - 5, top - 3, 3, 64]} />
        <meshStandardMaterial color="#EFEAE0" roughness={0.6} />
      </mesh>
      <mesh position={[top * 0.5, 6.6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[9, 4.5, 1]}>
        <circleGeometry args={[1, 24]} />
        <meshBasicMaterial color="#2B2B29" />
      </mesh>
    </group>
  );
}

/** Clear dome lid; the straw stays in the cup when the lid lifts. */
function DomeLid({ top, H, y }: { top: number; H: number; y: number }) {
  return (
    <>
      <mesh position={[top * 0.18, H / 2 + 22, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[3, 3, H + 70, 16]} />
        <meshStandardMaterial color="#C2552E" roughness={0.5} />
      </mesh>
      <group position={[0, y, 0]}>
        <mesh>
          <cylinderGeometry args={[top + 1.6, top + 0.8, 7, 64]} />
          <meshStandardMaterial color="#E3EEF2" roughness={0.2} transparent opacity={0.55} depthWrite={false} />
        </mesh>
        <mesh position={[0, 3.5, 0]} scale={[1, 0.55, 1]}>
          <sphereGeometry args={[top + 0.6, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#E3EEF2" roughness={0.2} transparent opacity={0.45} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
}

/* ───────────────────────────── shared pieces ───────────────────────────── */

function BoxPart({
  size,
  position = [0, 0, 0],
  faces = {},
  board,
  openTop,
  openBottom,
  hide = [],
}: {
  size: V3;
  position?: V3;
  faces?: Partial<Record<FaceKey, THREE.Texture | undefined>>;
  board: string;
  openTop?: boolean;
  openBottom?: boolean;
  /** faces left out entirely (open ends of a sleeve) */
  hide?: FaceKey[];
}) {
  const hidden = new Set<FaceKey>(hide);
  if (openTop) hidden.add('py');
  if (openBottom) hidden.add('ny');
  const inner = useMemo(() => new THREE.Color(board).multiplyScalar(0.82), [board]);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        {FACE_ORDER.map((f, i) => {
          const map = faces[f];
          return (
            <meshStandardMaterial
              key={f + (map ? map.uuid : '')}
              attach={`material-${i}`}
              map={map ?? null}
              color={map ? '#ffffff' : board}
              roughness={0.85}
              visible={!hidden.has(f)}
            />
          );
        })}
      </mesh>
      {hidden.size > 0 && (
        <mesh scale={0.996}>
          <boxGeometry args={size} />
          {FACE_ORDER.map((f, i) => (
            <meshStandardMaterial key={f} attach={`material-${i}`} color={inner} side={THREE.BackSide} roughness={1} visible={!hidden.has(f)} />
          ))}
        </mesh>
      )}
    </group>
  );
}

function Flap({ w, h, map, board }: { w: number; h: number; map?: THREE.Texture; board: string }) {
  return (
    <group position={[0, h / 2, 0]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial key={map?.uuid} map={map ?? null} color={map ? '#ffffff' : board} roughness={0.85} side={THREE.FrontSide} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={board} roughness={1} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/** A copy of a texture turned 180°, for panels whose hinge flips them upside-down. */
function useFlipped(src?: THREE.Texture) {
  const t = useMemo(() => {
    if (!src) return undefined;
    const c = src.clone();
    c.center.set(0.5, 0.5);
    c.rotation = Math.PI;
    c.needsUpdate = true;
    return c;
  }, [src]);
  useEffect(() => () => t?.dispose(), [t]);
  return t;
}

/** Horizontal sine ridges for the ripple-wall cup. */
function rippleBump() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d')!;
  for (let y = 0; y < c.height; y++) {
    const v = Math.round(127 + 127 * Math.sin((y / c.height) * Math.PI * 2 * 12));
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(0, y, c.width, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
