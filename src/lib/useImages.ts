import { useEffect, useMemo, useReducer } from 'react';
import { loadImage } from './image';
import type { ImageMap } from './render';
import type { Design } from '../types';

const cache: ImageMap = new Map();

/** cheap identity for (possibly huge) data URLs */
const keyOf = (s: string) => `${s.length}:${s.slice(-24)}`;

export function designSources(d: Design): string[] {
  return [d.whole?.src, ...Object.values(d.perPanel).map((a) => a.src)].filter((s): s is string => !!s);
}

/** Loads every image used by a design; `version` bumps when a new one finishes loading. */
export function useImages(srcs: string[]) {
  const [version, bump] = useReducer((x: number) => x + 1, 0);
  const key = srcs.map(keyOf).join('|');
  useEffect(() => {
    let alive = true;
    for (const src of srcs) {
      if (cache.has(src)) continue;
      loadImage(src)
        .then((img) => {
          cache.set(src, img);
          if (alive) bump();
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const ready = srcs.every((s) => cache.has(s));
  return useMemo(() => ({ images: cache, version, ready }), [version, ready]);
}
