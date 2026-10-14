<svelte:options namespace="svg" />

<script lang="ts" module>
	/** up: a live value, standing. free: space that may be overwritten. spent: a value already used. */
	export type CellState = 'up' | 'free' | 'spent';
</script>

<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { HEIGHT_TWEEN, TILE } from './context.ts';
	import Halo from './Halo.svelte';
	import Tile from './Tile.svelte';
	import Slot from './Slot.svelte';
	import Label from './Label.svelte';

	type Props = {
		values: (number | string)[];
		/** One per value; defaults to all 'up'. */
		states?: CellState[];
		/** Row name drawn on the left, e.g. "nums". */
		name?: string;
		/** Depth of the row in world units; use TILE.pitch * 2.5 or so between rows. */
		y?: number;
		/** Index of the single lit tile, the one that just changed. */
		lit?: number | null;
		/** Pointer name -> index. An index equal to values.length sits one past the end. */
		pointers?: Record<string, number | null | undefined>;
		/** Pointer drawn in the strong tone, usually the one being written to. */
		strong?: string;
		/** Columns to shift the row right, e.g. to slide a pattern under a text. Indices and pointers move with it. */
		offset?: number;
		/** Labels under each cell: false hides them, an array replaces the 0-based indices. */
		indices?: boolean | (number | string)[];
	};
	let { values, states, name, y = 0, lit = null, pointers = {}, strong, offset = 0, indices = true }: Props = $props();

	const { size: T, pitch: P, height: H } = TILE;
	const box = (x: number) => ({ x: (x + offset) * P, y, w: T, d: T, r: 3 });
	const cx = (i: number) => (i + offset) * P + T / 2;

	// Tiles rise and fall between states; lerpList lets a row grow or shrink between steps too.
	const heights = Tween.of(() => values.map((_, i) => ((states?.[i] ?? 'up') === 'up' ? H : 0)), HEIGHT_TWEEN);

	const pointerLabels = $derived.by(() => {
		const at = new Map<number, string[]>();
		for (const [label, i] of Object.entries(pointers)) {
			if (i == null || i < 0 || i > values.length) continue;
			at.set(i, [...(at.get(i) ?? []), label]);
		}
		return [...at].map(([i, names]) => ({ i, text: names.join(' '), strong: !!strong && names.includes(strong) }));
	});
</script>

{#each values as _, i}
	{#if (heights.current[i] ?? H) > 0.5}<Halo box={box(i)} />{/if}
{/each}

{#each values as value, i}
	{@const h = heights.current[i] ?? H}
	{#if h > 0.5}
		<Tile box={box(i)} {h} label={value} lit={i === lit} />
	{:else}
		<Slot box={box(i)} kind={states?.[i] === 'spent' ? 'dotted' : 'dashed'} label={states?.[i] === 'spent' ? value : undefined} />
	{/if}
	{#if indices !== false}
		<Label at={[cx(i), y + T]} text={Array.isArray(indices) ? (indices[i] ?? '') : i} tone="faint" dy={17} />
	{/if}
{/each}

{#each pointerLabels as p (p.i)}
	<Label at={[cx(p.i), y + T]} text={p.text} tone={p.strong ? 'strong' : 'text'} dy={32} />
{/each}

{#if name}
	<Label at={[offset * P - 14, y + T / 2]} text={name} anchor="end" />
{/if}
{#if values.length === 0}
	<Label at={[offset * P, y + T / 2]} text="empty" anchor="start" tone="faint" />
{/if}
