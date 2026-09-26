import alea from 'alea';
import {createNoise2D, createNoise3D} from 'simplex-noise';

/**
 * Seeded simplex noise. Same seed → same field on every frame, every tab,
 * every render. Never use Math.random() in this repo.
 */
const cache = new Map<string, {n2: ReturnType<typeof createNoise2D>; n3: ReturnType<typeof createNoise3D>}>();

export function noise(seed: string | number) {
  const key = String(seed);
  let n = cache.get(key);
  if (!n) {
    n = {n2: createNoise2D(alea(key)), n3: createNoise3D(alea(key, 'n3'))};
    cache.set(key, n);
  }
  return n;
}

/**
 * Slow scalar drift in [-1, 1]. `period` in frames: the time for the field
 * to decorrelate, roughly. Use for breathing, camera float, secondary motion.
 */
export const drift = (seed: string | number, frame: number, period = 120) =>
  noise(seed).n2(frame / period, 0);
