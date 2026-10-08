import * as THREE from 'three';
import type { Dieline, FaceKey, FaceTarget } from '../types';
import { cropPanel, unwarpSector } from './render';

export type MeshKey = FaceTarget['mesh'];

export interface TextureSet {
  /** BoxGeometry face textures per mesh (body, lid) */
  faces: Partial<Record<MeshKey, Partial<Record<FaceKey, THREE.Texture>>>>;
  /** single-texture meshes (carton flaps, cup wall) */
  single: Partial<Record<MeshKey, THREE.Texture>>;
  all: THREE.Texture[];
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/** Slices a rendered (overlay-free) dieline into per-face textures. */
export function buildTextures(dl: Dieline, print: HTMLCanvasElement, k: number): TextureSet {
  const set: TextureSet = { faces: {}, single: {}, all: [] };
  for (const p of dl.panels) {
    if (!p.target) continue;
    const { mesh, face } = p.target;
    if (mesh === 'cup') {
      const t = toTexture(unwarpSector(print, dl, k));
      t.wrapS = THREE.ClampToEdgeWrapping;
      set.single.cup = t;
      set.all.push(t);
    } else if (face) {
      const t = toTexture(cropPanel(print, p, k));
      (set.faces[mesh] ??= {})[face] = t;
      set.all.push(t);
    } else {
      const t = toTexture(cropPanel(print, p, k));
      set.single[mesh] = t;
      set.all.push(t);
    }
  }
  return set;
}
