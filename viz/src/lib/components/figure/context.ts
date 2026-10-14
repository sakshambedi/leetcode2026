import { createContext } from 'svelte';
import { quintOut } from 'svelte/easing';
import { prefersReducedMotion } from 'svelte/motion';
import type { Camera } from '../../iso.ts';
import { ms } from '../../transitions.ts';

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

/**
 * Tween options for heights that rise and fall between steps: card resize timing, --resize-dur
 * with the smooth ease-out (quintOut is cubic-bezier(0.22, 1, 0.36, 1)).
 */
export const HEIGHT_TWEEN = {
	duration: () => (prefersReducedMotion.current ? 0 : ms('--resize-dur', 300)),
	easing: quintOut,
	interpolate: lerpList
};
