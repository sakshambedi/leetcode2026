// The tab icon: the "solving" thinking orb (thinking-orbs, MIT, libraries.dev/orbs), moving as it
// does on that page. Its React-free engine draws each frame on a canvas that becomes the icon.
// assets/orb.svg is one still frame of the same orb, for the first paint and for browsers that
// ignore icon updates.
import { MODE_FRAMES, paintFrame, resolvePreset } from 'thinking-orbs/engine';

const SIZE = 32; // the engine's preset
const DOT = 1.5; // dots drawn 1.5x so they read at tab size
const CROP = 29.4; // the orb's extent within the 32px preset frame; the rest is room for motion
const STILL = 0.6; // the frame the library shows under reduced motion
// Safari reportedly picks up a new icon only when the <link> element itself is replaced, and
// updates it unreliably at speed, so it gets whole-element swaps at a gentler rate.
const SAFARI = typeof navigator !== 'undefined' && /^((?!chrome|chromium|crios|fxios|edg|android).)*safari/i.test(navigator.userAgent);
const SAFARI_FPS = 20;

/** Animate `link` (the page's rel="icon") until the returned stop function is called. */
export function animateFavicon(link: HTMLLinkElement): () => void {
	// Draw at the tab's real pixel size (16 CSS px times the screen's density): the browser then
	// shows the canvas 1:1, and sub-pixel dot motion stays as smooth anti-aliasing instead of
	// snapping to whole pixels when a larger image is shrunk into the tab.
	const PX = Math.round(16 * Math.min(Math.max(devicePixelRatio, 1), 4));
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = PX;
	const ctx = canvas.getContext('2d');
	if (!ctx) return () => {};

	const { mode, speed, opts } = resolvePreset('solving', SIZE);
	const scheme = matchMedia('(prefers-color-scheme: dark)'); // the tab strip follows the browser, not the page theme
	const reduced = matchMedia('(prefers-reduced-motion: reduce)');

	let shown = '';
	const draw = (t: number) => {
		const frame = MODE_FRAMES[mode](SIZE, t, opts);
		for (const dot of frame.dots) dot.r *= DOT;
		const k = PX / CROP;
		ctx.setTransform(k, 0, 0, k, -k * (SIZE - CROP) / 2, -k * (SIZE - CROP) / 2);
		ctx.clearRect(0, 0, SIZE, SIZE);
		paintFrame(ctx, frame, scheme.matches);
		// The "solving" bands rest between turns: skip the swap when the pixels did not change.
		const next = canvas.toDataURL('image/png');
		if (next === shown) return;
		shown = next;
		if (!SAFARI) return void (link.href = next);
		const fresh = link.cloneNode() as HTMLLinkElement;
		fresh.href = next;
		link.replaceWith(fresh);
		link = fresh;
	};

	// Same clock and cadence as the component on the page: every display frame, at seconds since
	// load times the preset's speed. requestAnimationFrame also stops by itself in a hidden tab.
	let raf = 0;
	let last = -Infinity;
	const loop = (now = performance.now()) => {
		if (!SAFARI || now - last >= 1000 / SAFARI_FPS - 1) {
			last = now;
			draw((now / 1000) * speed);
		}
		raf = requestAnimationFrame(loop);
	};
	const sync = () => {
		cancelAnimationFrame(raf);
		if (reduced.matches) return draw(STILL);
		loop();
	};
	sync();
	for (const target of [scheme, reduced]) target.addEventListener('change', sync);
	return () => {
		cancelAnimationFrame(raf);
		for (const target of [scheme, reduced]) target.removeEventListener('change', sync);
	};
}
