import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Dieline, Dims, FaceKey } from '../../types';
import { buildTextures, type TextureSet } from '../../lib/textures';
import { lidDims } from '../../data/dielines';

const FACE_ORDER: FaceKey[] = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

export interface ViewOptions {
  lidOpen: boolean;
  flaps: number; // 0 = open outward, 1 = closed
  autoRotate: boolean;
}

interface Props {
  dl: Dieline;
  dims: Dims;
  print: HTMLCanvasElement | null;
  k: number;
  board: string;
  view: ViewOptions;
}

export default function Preview3D({ dl, dims, print, k, board, view }: Props) {
  const tex = useMemo(() => (print ? buildTextures(dl, print, k) : null), [dl, print, k]);
  useEffect(() => () => tex?.all.forEach((t) => t.dispose()), [tex]);

  const height = modelHeight(dl, dims, view);
  const maxDim = dl.productId === 'paper-cup' ? Math.max(dims.topDia, height) : Math.max(dims.L, dims.W, height);
  const s = 2 / maxDim;
  const floor = -height / 2;

  return (
    <Canvas
      flat
      shadows={false}
      dpr={[1, 2]}
      camera={{ position: [2.6, 1.6, 3.6], fov: 38 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <color attach="background" args={['#F2ECE1']} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} />
      <group scale={s}>
        {tex && <ProductModel dl={dl} dims={dims} floor={floor} tex={tex} board={board} view={view} />}
      </group>
      <ContactShadows position={[0, floor * s - 0.005, 0]} opacity={0.35} scale={6} blur={2.4} far={2} />
      <OrbitControls makeDefault enableDamping autoRotate={view.autoRotate} autoRotateSpeed={1.2} minDistance={1.5} maxDistance={9} />
    </Canvas>
  );
}

/** Total visible height in mm (handles, open flaps, lifted lid) so the model can be centred. */
function modelHeight(dl: Dieline, d: Dims, view: ViewOptions) {
  switch (dl.productId) {
    case 'paper-bag':
      return d.H + d.L * 0.24;
    case 'corrugated':
      return d.H + (d.W / 2) * Math.max(0, 1 - view.flaps * 1.6);
    case 'rigid-box':
      return d.H + (view.lidOpen ? lidDims(d).D * 1.6 : 0);
    default:
      return d.H;
  }
}

function ProductModel({ dl, dims, floor, tex, board, view }: { dl: Dieline; dims: Dims; floor: number; tex: TextureSet; board: string; view: ViewOptions }) {
  const { L, W, H } = dims;

  switch (dl.productId) {
    case 'rigid-box': {
      const lid = lidDims(dims);
      const lidY = floor + H - lid.D / 2 + 1;
      return (
        <group>
          <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} openTop />
          <group position={[0, view.lidOpen ? lidY + lid.D * 1.6 : lidY, view.lidOpen ? -W * 0.15 : 0]} rotation={[view.lidOpen ? -0.35 : 0, 0, 0]}>
            <BoxPart size={[lid.L, lid.D, lid.W]} faces={tex.faces.lid} board={board} openBottom />
          </group>
        </group>
      );
    }
    case 'corrugated': {
      const angle = 0.55 - view.flaps * (Math.PI / 2 + 0.55);
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
            <group key={f.key} position={f.pos as unknown as [number, number, number]} rotation={[0, f.ry, 0]}>
              <group rotation={[f.under ? Math.min(angle + 0.02, 0.55) : angle, 0, 0]}>
                <Flap w={f.w} h={W / 2} map={tex.single[f.key]} board={board} />
              </group>
            </group>
          ))}
        </group>
      );
    }
    case 'mono-carton':
      return <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} />;
    case 'paper-bag':
      return (
        <group>
          <BoxPart size={[L, H, W]} position={[0, floor + H / 2, 0]} faces={tex.faces.body} board={board} openTop />
          <Handle L={L} y={floor + H} z={W / 2 - 2} />
          <Handle L={L} y={floor + H} z={-W / 2 + 2} />
        </group>
      );
    case 'paper-cup':
      return <Cup dims={dims} floor={floor} map={tex.single.cup} />;
  }
}

function BoxPart({
  size,
  position = [0, 0, 0],
  faces = {},
  board,
  openTop,
  openBottom,
}: {
  size: [number, number, number];
  position?: [number, number, number];
  faces?: Partial<Record<FaceKey, THREE.Texture>>;
  board: string;
  openTop?: boolean;
  openBottom?: boolean;
}) {
  const open = openTop || openBottom;
  const outer = FACE_ORDER.map((f) => {
    const hidden = (openTop && f === 'py') || (openBottom && f === 'ny');
    return { f, hidden, map: faces[f] };
  });
  const inner = useMemo(() => new THREE.Color(board).multiplyScalar(0.82), [board]);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        {outer.map(({ f, hidden, map }, i) => (
          <meshStandardMaterial
            key={f + (map ? map.uuid : '')}
            attach={`material-${i}`}
            map={map ?? null}
            color={map ? '#ffffff' : board}
            roughness={0.85}
            visible={!hidden}
          />
        ))}
      </mesh>
      {open && (
        <mesh scale={0.996}>
          <boxGeometry args={size} />
          {FACE_ORDER.map((f, i) => (
            <meshStandardMaterial
              key={f}
              attach={`material-${i}`}
              color={inner}
              side={THREE.BackSide}
              roughness={1}
              visible={!((openTop && f === 'py') || (openBottom && f === 'ny'))}
            />
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

function Handle({ L, y, z }: { L: number; y: number; z: number }) {
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
    return new THREE.TubeGeometry(curve, 64, 2.6, 10, false);
  }, [L]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[0, y, z]}>
      <meshStandardMaterial color="#A8835A" roughness={0.9} />
    </mesh>
  );
}

function Cup({ dims, floor, map }: { dims: Dims; floor: number; map?: THREE.Texture }) {
  const top = dims.topDia / 2;
  const bot = Math.min(dims.botDia, dims.topDia - 10) / 2;
  const H = dims.H;
  return (
    <group position={[0, floor + H / 2, 0]} rotation={[0, Math.PI, 0]}>
      <mesh>
        <cylinderGeometry args={[top, bot, H, 96, 1, true]} />
        <meshStandardMaterial key={map?.uuid} map={map ?? null} roughness={0.6} side={THREE.FrontSide} />
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
  );
}
