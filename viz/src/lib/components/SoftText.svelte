<script lang="ts">
	// Text swap soft (transitions-dev 34): the old text blurs out while the new one blurs in, in the
	// same spot, and the width eases so neighbors glide. For values that change because the data
	// behind the view did: variables, the step count.
	import { onDestroy, tick, untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { ms } from '../transitions.ts';

	type Props = { text: string | number; align?: 'start' | 'center' | 'end' };
	let { text, align = 'start' }: Props = $props();

	let el: HTMLSpanElement;
	let swap = $state.raw<{ old: string; next: string } | null>(null);
	let current = untrack(() => String(text));
	let timer: ReturnType<typeof setTimeout> | undefined;

	// .pre: measure the old width before the DOM shows the new text.
	$effect.pre(() => {
		const next = String(text);
		untrack(() => {
			if (next === current) return;
			const prev = current;
			current = next;
			clearTimeout(timer);
			if (!el || prefersReducedMotion.current) return void (swap = null);
			const w0 = el.getBoundingClientRect().width;
			el.classList.remove('is-swapping');
			swap = { old: prev, next };
			tick().then(() => {
				if (current !== next) return;
				const w1 = el.querySelector('.t-text-soft-new')!.getBoundingClientRect().width;
				el.style.width = `${w0}px`;
				void el.offsetWidth; // reflow, so every transition runs
				el.classList.add('is-swapping');
				el.style.width = `${w1}px`;
				timer = setTimeout(() => {
					el.classList.remove('is-swapping');
					el.style.removeProperty('width');
					swap = null;
				}, Math.max(ms('--text-soft-dur'), ms('--text-soft-resize-dur')) + 40);
			});
		});
	});
	onDestroy(() => clearTimeout(timer));
</script>

<span class="t-text-soft" style:--text-soft-align={align} bind:this={el}
	>{#if swap}{#key swap}<span class="t-text-soft-old" aria-hidden="true">{swap.old}</span><span class="t-text-soft-new"
				>{swap.next}</span
			>{/key}{:else}{text}{/if}</span
>
