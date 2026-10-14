<svelte:options namespace="svg" />

<script lang="ts" module>
	/** Which part of a column is lit: the bar itself or the fill resting on top of it. */
	export type BarPart = 'bar' | 'fill';
</script>

<script lang="ts">
	// An elevation map: one column of stacked unit blocks per value, standing in a row.
	// Seams on the front face count the units. An optional fill (e.g. trapped water) rests on
	// top of a column as a translucent, dash-edged block: a distinct physical state, not a bar.
	// A zero-height column lies flat as a dashed slot, so the ground still reads.
	// Place a Bars row behind (smaller y than) any row drawn in front of it: columns rise up the screen.
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { path, solid } from '../../iso.ts';
	import { TILE, getCamera, lerpList } from './context.ts';
	import Halo from './Halo.svelte';
	import Tile from './Tile.svelte';
	import Slot from './Slot.svelte';
	import Label from './Label.svelte';

	type Props = {
		/** Column heights in units, all >= 0. */
		values: number[];
		/** Units resting on top of each column (water, a level to reach, ...); 0 or missing for none. */
		fill?: number[];
		/** Row name drawn on the left at the base, e.g. "height". */
		name?: string;
		/** Depth of the row in world units. Rows drawn in front of it go at larger y. */
		y?: number;
		/** World height of one unit block. Keep the tallest column under ~10 units. */
		unit?: number;
		/** Index of the single lit column, the one that just changed. */
		lit?: number | null;
		/** Which part of the lit column to light; 'fill' lights only the fill block. */
		litPart?: BarPart;
		/** Engrave each column's value on its top face (default true). */
		engrave?: boolean;
		/** Pointer name -> index. An index equal to values.length sits one past the end. */
		pointers?: Record<string, number | null | undefined>;
		/** Pointer drawn in the strong tone, usually the one that moves next. */
		strong?: string;
		/** Columns to shift the row right. Indices and pointers move with it. */
		offset?: number;
		/** Labels under each column: false hides them, an array replaces the 0-based indices. */
		indices?: boolean | (number | string)[];
	};
	let {
		values, fill = [], name, y = 0, unit = 20, lit = null, litPart = 'bar', engrave = true,
		pointers = {}, strong, offset = 0, indices = true
	}: Props = $props();

	const { size: T, pitch: P } = TILE;
	const cam = getCamera();
	const box = (x: number) => ({ x: (x + offset) * P, y, w: T, d: T, r: 3 });
	const cx = (i: number) => (i + offset) * P + T / 2;

	// Columns and fills rise and fall between steps; lerpList lets the column count change too.
	const motion = { duration: () => (prefersReducedMotion.current ? 0 : 320), easing: cubicOut, interpolate: lerpList };
	const bars = Tween.of(() => values.map((v) => v * unit), motion);
	const fills = Tween.of(() => values.map((_, i) => (fill[i] ?? 0) * unit), motion);

	// A seam across the front face at each whole unit, so the stack reads as blocks.
	const seams = (i: number, h: number) => {
		const b = box(i), out: string[] = [];
		for (let z = unit; z < h - 0.5; z += unit)
			out.push(path([cam.p([b.x + 1, b.y + b.d, z]), cam.p([b.x + b.w - 1, b.y + b.d, z])], false));
		return out;
	};

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
	{#if (bars.current[i] ?? 0) > 0.5}<Halo box={box(i)} />{/if}
{/each}

{#each values as value, i}
	{@const h = bars.current[i] ?? 0}
	{@const f = fills.current[i] ?? 0}
	{@const barLit = i === lit && litPart === 'bar'}
	{#if h > 0.5}
		<Tile box={box(i)} {h} label={engrave ? value : undefined} lit={barLit} />
		<g class="seams" data-lit={barLit || undefined}>
			{#each seams(i, h) as d}<path {d} />{/each}
		</g>
	{:else}
		<Slot box={box(i)} kind="dashed" label={engrave ? value : undefined} />
	{/if}
	{#if f > 0.5}
		{@const shape = solid(cam, box(i), f, h > 0.5 ? h : 0)}
		<g class="fill" data-lit={(i === lit && litPart === 'fill') || undefined}>
			<path class="body" d={shape.outline} />
			<path class="top" d={shape.top} />
			<path class="edge" d={shape.outline} />
			<path class="edge" d={shape.top} />
		</g>
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

<style>
	.seams path { fill: none; stroke: var(--anatomy-lo); stroke-width: 0.6; opacity: 0.7; }
	.seams[data-lit] path { stroke: var(--anatomy-lit); opacity: 0.5; }
	.fill .body { fill: color-mix(in srgb, var(--anatomy-blue) 16%, transparent); }
	.fill .top { fill: color-mix(in srgb, var(--anatomy-blue) 22%, transparent); }
	.fill .edge {
		fill: none; stroke: var(--anatomy-blue); stroke-width: var(--anatomy-weight);
		stroke-dasharray: 3 3; stroke-linejoin: round; opacity: 0.8;
	}
	.fill[data-lit] .body { fill: color-mix(in srgb, var(--anatomy-blue) 30%, transparent); }
	.fill[data-lit] .top { fill: color-mix(in srgb, var(--anatomy-blue) 40%, transparent); }
	.fill[data-lit] .edge { stroke-dasharray: none; stroke-width: 1px; opacity: 1; }
</style>
