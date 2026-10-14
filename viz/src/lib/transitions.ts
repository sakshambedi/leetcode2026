// The JS half of the transitions in transitions.css. Durations are read from the :root
// variables, so tuning a value there changes the CSS and the timers together.
import type { Attachment } from 'svelte/attachments';

/** A `--…` duration from :root in ms, or `fallback` where there is no document (SSR, tests). */
export function ms(name: string, fallback = 0): number {
	if (typeof document === 'undefined') return fallback;
	const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
	return Number.isFinite(v) ? v : fallback;
}

/**
 * Tabs sliding: put on a `.t-tabs` bar holding a `.t-tabs-pill` and `.t-tab` buttons; the pill
 * slides to the tab at `index`. It is placed without a transition on first paint and on resize,
 * so it never animates in from the corner. The tabs may wrap: the pill follows in both axes.
 */
export function slidingPill(index: number): Attachment<HTMLElement> {
	return (bar) => {
		const pill = bar.querySelector<HTMLElement>('.t-tabs-pill');
		if (!pill) return;

		const moveTo = (animate: boolean) => {
			const tab = bar.querySelectorAll<HTMLElement>('.t-tab')[index];
			if (!tab) return void (pill.style.opacity = '0');
			const write = () => {
				pill.style.opacity = '';
				pill.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
				pill.style.width = `${tab.offsetWidth}px`;
				pill.style.height = `${tab.offsetHeight}px`;
			};
			if (animate) return write();
			const prev = pill.style.transition;
			pill.style.transition = 'none';
			write();
			void pill.offsetWidth; // reflow, so restoring the transition does not animate this write
			pill.style.transition = prev;
		};

		// The first placement waits a frame, as in the snippet, so a selection restored right after
		// mount (from the query string, say) snaps into place instead of sliding there.
		let frame = 0;
		if (pill.dataset.placed) moveTo(true);
		else
			frame = requestAnimationFrame(() => {
				pill.dataset.placed = 'true';
				moveTo(false);
			});

		// Snap on a real resize only: an observer also fires once on observe(), which would
		// cut short the slide this run just started.
		let size = `${bar.offsetWidth}x${bar.offsetHeight}`;
		const resize = new ResizeObserver(() => {
			const now = `${bar.offsetWidth}x${bar.offsetHeight}`;
			if (now === size) return;
			size = now;
			if (pill.dataset.placed) moveTo(false);
		});
		resize.observe(bar);
		return () => {
			cancelAnimationFrame(frame);
			resize.disconnect();
		};
	};
}

/** Error state shake: replay the shake on each element from a clean start. */
export function shake(els: Iterable<HTMLElement | undefined>) {
	const total = ms('--shake-dur-a', 80) * 2 + ms('--shake-dur-b', 60) * 2;
	for (const el of els) {
		if (!el) continue;
		el.classList.remove('is-shaking');
		void el.offsetWidth; // reflow, so the animation restarts
		el.classList.add('is-shaking');
		setTimeout(() => el.classList.remove('is-shaking'), total + 20);
	}
}
