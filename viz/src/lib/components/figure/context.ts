import { createContext } from 'svelte';
import type { Camera } from '../../iso.ts';

/** The camera every figure part draws with; set once by <Figure>. */
export const [getCamera, setCamera] = createContext<Camera>();

/** SVG user units per screen pixel, so text can stay a fixed on-screen size as figures scale. */
export const [getScale, setScale] = createContext<{ readonly px: number }>();

/** Tile size, spacing between tile origins, and standing height, in world units. */
export const TILE = { size: 34, pitch: 44, height: 12 } as const;

/**
 * Tween interpolator for a list of heights whose length may change between steps (a row that
 * grows or shrinks): shared entries tween, new ones appear at their target, dropped ones vanish.
 */
export const lerpList = (a: number[], b: number[]) => (t: number) =>
	b.map((v, i) => (a[i] === undefined ? v : a[i] + (v - a[i]) * t));
