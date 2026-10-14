<svelte:options namespace="svg" />

<script lang="ts">
	// A hash map drawn as a row of key tiles, each with its stored value engraved under it.
	// Entries keep their insertion order; a new key stands up at the end, a deleted one leaves.
	import { TILE } from './context.ts';
	import Halo from './Halo.svelte';
	import Tile from './Tile.svelte';
	import Label from './Label.svelte';

	type Key = number | string;
	type Props = {
		/** [key, value] pairs in insertion order, e.g. [...map]. */
		entries: [Key, Key][];
		/** Map name drawn on the left, e.g. "pos". */
		name?: string;
		/** Depth of the row in world units. */
		y?: number;
		/** Key of the single lit entry, the one that just changed. */
		lit?: Key | null;
		/** Keys whose value label is drawn in the strong tone, e.g. the entry just looked up. */
		strong?: Key[];
	};
	let { entries, name, y = 0, lit = null, strong = [] }: Props = $props();

	const { size: T, pitch: P, height: H } = TILE;
	const box = (c: number) => ({ x: c * P, y, w: T, d: T, r: 3 });
	const cx = (c: number) => c * P + T / 2;
</script>

{#each entries as [k], c (k)}
	<Halo box={box(c)} />
{/each}

{#each entries as [k, v], c (k)}
	<Tile box={box(c)} h={H} label={k} lit={k === lit} />
	<Label at={[cx(c), y + T]} text={v} tone={k === lit || strong.includes(k) ? 'strong' : 'text'} dy={17} />
{/each}

{#if name}
	<Label at={[-14, y + T / 2]} text={name} anchor="end" />
{/if}
{#if entries.length === 0}
	<Label at={[0, y + T / 2]} text="empty" anchor="start" tone="faint" />
{/if}
