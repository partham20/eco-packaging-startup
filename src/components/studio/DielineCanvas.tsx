import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Design, Dieline } from '../../types';
import { renderDieline, type ImageMap } from '../../lib/render';

interface Props {
  dl: Dieline;
  design: Design;
  images: ImageMap;
  imagesVersion: number;
  selected: string | null;
  onSelect: (panelId: string | null) => void;
  /** drag delta in mm for the artwork under the pointer */
  onDrag: (panelId: string | null, dx: number, dy: number) => void;
  maxHeight?: number;
}

export default function DielineCanvas({ dl, design, images, imagesVersion, selected, onSelect, onDrag, maxHeight = 560 }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cssW, setCssW] = useState(600);
  const drag = useRef<{ x: number; y: number; target: string | null } | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => setCssW(el.clientWidth));
    ro.observe(el);
    setCssW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // CSS px per mm, limited by available width and height
  const scale = Math.min(cssW / dl.width, maxHeight / dl.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  useEffect(() => {
    if (!canvas.current) return;
    renderDieline(canvas.current, dl, design, images, { pxPerMm: scale * dpr, overlay: true, selectedPanel: selected });
  }, [dl, design, images, imagesVersion, selected, scale, dpr]);

  const toMm = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  };
  const hit = (x: number, y: number) =>
    dl.panels.find((p) => p.kind === 'print' && x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h)?.id ?? null;

  return (
    <div ref={wrap} className="w-full">
      <canvas
        ref={canvas}
        style={{ width: dl.width * scale, height: dl.height * scale, touchAction: 'none' }}
        className="mx-auto block cursor-grab rounded-md active:cursor-grabbing"
        onPointerDown={(e) => {
          const { x, y } = toMm(e);
          const panel = hit(x, y);
          if (panel) onSelect(panel);
          const target = panel && design.perPanel[panel] ? panel : design.whole ? null : undefined;
          if (target === undefined) return;
          drag.current = { x, y, target };
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const { x, y } = toMm(e);
          onDrag(drag.current.target, x - drag.current.x, y - drag.current.y);
          drag.current = { ...drag.current, x, y };
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      />
    </div>
  );
}
