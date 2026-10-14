<script lang="ts">
	// Text morph (transitions-dev 33): the letters two labels share stay put; only the part that
	// differs cross-blurs while its width eases. For button labels: Copy → Copied, Play → Pause.
	import { onDestroy, tick, untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { ms } from '../transitions.ts';

	let { text }: { text: string } = $props();

	let el: HTMLSpanElement;
	let morph = $state.raw<{ start: string; old: string; next: string; end: string } | null>(null);
	let current = untrack(() => text);
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect.pre(() => {
		const next = text;
		untrack(() => {
			if (next === current) return;
			const prev = current;
			current = next;
			clearTimeout(timer);
			if (!el || prefersReducedMotion.current) return void (morph = null);

			// Shared start (a) and shared end (b).
			let a = 0;
			while (a < prev.length && a < next.length && prev[a] === next[a]) a++;
			let b = 0;
			while (b < prev.length - a && b < next.length - a && prev[prev.length - 1 - b] === next[next.length - 1 - b]) b++;
			morph = {
				start: next.slice(0, a),
				old: prev.slice(a, prev.length - b),
				next: next.slice(a, next.length - b),
				end: next.slice(next.length - b)
			};

			tick().then(() => {
				if (current !== next) return;
				const swap = el.querySelector<HTMLElement>('.t-morph-swap')!;
				swap.style.width = `${swap.querySelector('.t-morph-old')!.getBoundingClientRect().width}px`;
				void swap.offsetWidth; // reflow, so the width transitions
				swap.classList.add('is-morphing');
				swap.style.width = `${swap.querySelector('.t-morph-new')!.getBoundingClientRect().width}px`;
				timer = setTimeout(() => (morph = null), Math.max(ms('--text-morph-dur'), ms('--text-morph-resize-dur')) + 40);
			});
		});
	});
	onDestroy(() => clearTimeout(timer));
</script>

<span class="t-morph" bind:this={el}
	>{#if morph}{#key morph}{morph.start}<span class="t-morph-swap"
				><span class="t-morph-old" aria-hidden="true">{morph.old}</span><span class="t-morph-new">{morph.next}</span></span
			>{morph.end}{/key}{:else}{text}{/if}</span
>
