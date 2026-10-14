<script lang="ts" generics="T">
	// Text states swap (transitions-dev 04): the old content exits up with a blur, then the new one
	// enters from below. For content that reads as a step: the narration, the output verdict.
	import { onDestroy, tick, untrack, type Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { ms } from '../transitions.ts';

	type Props = {
		value: T;
		/** Renders a value; plain text when left out. */
		children?: Snippet<[T]>;
	};
	let { value, children }: Props = $props();

	const same = (a: T, b: T) => a === b || JSON.stringify(a) === JSON.stringify(b);
	let shown = $state.raw(untrack(() => value));
	let el: HTMLSpanElement;
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const next = value;
		untrack(() => {
			// An exit in flight picks up the latest value when it ends.
			if (timer !== undefined || same(next, shown)) return;
			if (prefersReducedMotion.current) return void (shown = next);
			el.classList.add('is-exit');
			timer = setTimeout(async () => {
				timer = undefined;
				shown = value;
				await tick();
				el.classList.remove('is-exit');
				el.classList.add('is-enter-start');
				void el.offsetHeight; // reflow, so the enter transitions
				el.classList.remove('is-enter-start');
			}, ms('--text-swap-dur', 150));
		});
	});
	onDestroy(() => clearTimeout(timer));
</script>

<span class="t-text-swap" bind:this={el}>{#if children}{@render children(shown)}{:else}{shown}{/if}</span>
