<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';
	import type { RouteId } from '$app/types';
	import problems from '#lib/generated/problems.json';
	import studyplan from '#lib/generated/studyplan.json';
	import SoftText from '#lib/components/SoftText.svelte';
	import ThemeSwitch from '#lib/components/ThemeSwitch.svelte';
	import { slidingPill } from '#lib/transitions.ts';
	import { patternFamily, type Difficulty, type Meta, type ProblemInfo, type StudyPlan } from '#lib/types.ts';

	// Every route folder with a problem.ts is a visualization; main.py lists every Python problem.
	const modules = import.meta.glob<{ meta: Meta }>('./*/problem.ts', { eager: true });
	const hasViz = (n: number) => `./${n}/problem.ts` in modules;

	const plan = studyplan as StudyPlan;
	const all = problems as ProblemInfo[];
	const byNumber = new Map(all.map((p) => [p.number, p]));

	type Row = { number: number; title: string; difficulty: Difficulty; pattern?: string; added: boolean };
	type Group = { name: string; rows: Row[]; added: number; total?: number };

	// Plan sections in plan order, then anything outside the plan.
	const groups: Group[] = [
		...plan.sections.map((s) => ({
			name: s.name,
			total: s.problems.length,
			added: s.problems.filter((q) => byNumber.has(q.number)).length,
			rows: s.problems.map((q): Row => {
				const p = byNumber.get(q.number);
				return p ? { ...p, added: true } : { ...q, added: false };
			})
		})),
		(() => {
			const rows = all.filter((p) => !p.section).map((p) => ({ ...p, added: true }));
			return { name: 'Outside the plan', rows, added: rows.length };
		})()
	];

	const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
	const families = [...new Set(all.map((p) => patternFamily(p.pattern)))].sort((a, b) => a.localeCompare(b));
	const count = (pred: (p: ProblemInfo) => boolean) => all.filter(pred).length;

	let difficulty = $state<Difficulty | ''>('');
	let section = $state('');
	let pattern = $state('');

	const match = (r: Row) =>
		(!difficulty || r.difficulty === difficulty) && (!pattern || (r.pattern && patternFamily(r.pattern) === pattern));
	// Problems not added yet only show when their section is picked: that is the to-do list.
	const shown = $derived(
		groups
			.filter((g) => !section || g.name === section)
			.map((g) => ({ ...g, rows: g.rows.filter((r) => (r.added || section) && match(r)) }))
			.filter((g) => g.rows.length)
	);
	const shownCount = $derived(shown.reduce((n, g) => n + g.rows.filter((r) => r.added).length, 0));
	const filtered = $derived(Boolean(difficulty || section || pattern));

	// Filters live in the query string, so Back from a problem returns to the same list.
	let ready = $state(false);
	onMount(() => {
		const q = new URLSearchParams(location.search);
		const d = q.get('difficulty');
		difficulty = DIFFICULTIES.find((x) => x.toLowerCase() === d?.toLowerCase()) ?? '';
		section = groups.find((g) => g.name === q.get('section'))?.name ?? '';
		pattern = families.find((f) => f === q.get('pattern')) ?? '';
		ready = true;
	});
	$effect(() => {
		if (!ready) return;
		const q = new URLSearchParams();
		if (difficulty) q.set('difficulty', difficulty.toLowerCase());
		if (section) q.set('section', section);
		if (pattern) q.set('pattern', pattern);
		const search = q.size ? `?${q}` : '';
		if (search !== location.search) replaceState(`${location.pathname}${search}`, {});
	});

	function clear() {
		difficulty = section = pattern = '';
	}
</script>

<svelte:head><title>LeetCode practice</title></svelte:head>

<main>
	<header>
		<div class="meta">
			<span><SoftText text="{filtered ? `${shownCount} of your ${all.length}` : all.length} problems" /></span>
			<a href={plan.url}>{plan.name} ↗</a>
			<ThemeSwitch />
		</div>
		<h1>LeetCode practice</h1>
		<p class="lede">Open a problem to step through how it is solved.</p>
	</header>

	<form class="filters" onsubmit={(e) => e.preventDefault()}>
		<div class="row">
			<span class="label" id="difficulty-label">Difficulty</span>
			<div class="chips t-tabs" role="radiogroup" aria-labelledby="difficulty-label"
				{@attach slidingPill(['', ...DIFFICULTIES].indexOf(difficulty))}>
				<span class="t-tabs-pill" aria-hidden="true"></span>
				{#each ['', ...DIFFICULTIES] as d (d)}
					<button type="button" class="chip t-tab" role="radio" aria-checked={difficulty === d}
						onclick={() => (difficulty = d as Difficulty | '')}>
						{d || 'All'}
						<span class="n">{d ? count((p) => p.difficulty === d) : all.length}</span>
					</button>
				{/each}
			</div>
		</div>
		<div class="row">
			<label class="label" for="section">Section</label>
			<span class="select" class:set={section}>
				<select id="section" bind:value={section}>
					<option value="">All sections</option>
					{#each groups as g (g.name)}
						{#if g.total !== undefined}
							<option value={g.name}>{g.name} · {g.added}/{g.total}</option>
						{:else if g.added}
							<option value={g.name}>{g.name} · {g.added}</option>
						{/if}
					{/each}
				</select>
			</span>
		</div>
		<div class="row">
			<label class="label" for="pattern">Pattern</label>
			<span class="select" class:set={pattern}>
				<select id="pattern" bind:value={pattern}>
					<option value="">All patterns</option>
					{#each families as f (f)}
						<option value={f}>{f} · {count((p) => patternFamily(p.pattern) === f)}</option>
					{/each}
				</select>
			</span>
			{#if filtered}<button type="button" class="clear" onclick={clear}>Clear filters</button>{/if}
		</div>
	</form>

	{#if shown.length}
		<table>
			<colgroup><col class="c-num" /><col /><col class="c-diff" /><col class="c-pattern" /></colgroup>
			<thead class="sr-only">
				<tr><th scope="col">Nº</th><th scope="col">Problem</th><th scope="col">Difficulty</th><th scope="col">Pattern</th></tr>
			</thead>
			{#each shown as g (g.name)}
				<tbody>
					<tr class="section">
						<th scope="rowgroup" colspan="4">
							{g.name}
							<span class="n">
{#if g.total !== undefined}{g.added} of {g.total} added{/if}
							</span>
						</th>
					</tr>
					{#each g.rows as p (p.number)}
						<tr class:missing={!p.added}>
							<td class="num">{p.number}</td>
							<td>
								{#if !p.added}<span class="title">{p.title}</span>
								{:else if hasViz(p.number)}<a href={resolve(`/${p.number}` as RouteId)}>{p.title}</a>
								{:else}<span class="title">{p.title}</span> <span class="none">no visualization yet</span>{/if}
							</td>
							<td class="caps">{p.difficulty}</td>
							<td class="pattern">
								{#if p.pattern}{@const [family, ...detail] = p.pattern.split(' · ')}
									<span class="family">{family}</span>{detail.length ? ` · ${detail.join(' · ')}` : ''}
								{:else if !p.added}<span class="none">not added yet</span>{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			{/each}
		</table>
	{:else}
		<p class="empty">No problems match. <button type="button" class="btn" onclick={clear}>Clear filters</button></p>
	{/if}
</main>

<style>
	main { max-width: 840px; margin: 0 auto; padding: 56px 20px 96px; }
	.meta { display: flex; flex-wrap: wrap; gap: 6px 16px; align-items: baseline; white-space: nowrap; font: 11px var(--anatomy-mono); color: var(--anatomy-muted); }
	.meta a { color: var(--anatomy-muted); }
	h1 { font: 400 40px/1.1 var(--font-serif); color: var(--anatomy-strong); margin: 10px 0 6px; }
	.lede { font: italic 19px/1.45 var(--font-serif); margin: 0 0 28px; }

	.filters { display: grid; gap: 10px; margin: 0 0 12px; }
	.row { display: grid; grid-template-columns: 120px auto 1fr; gap: 24px; align-items: center; }
	.label { font: 11px var(--anatomy-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--anatomy-muted); }
	.chips { display: flex; flex-wrap: wrap; gap: 6px; }
	.chip, select {
		min-height: 30px; border-radius: 99px; cursor: pointer;
		font: 12px var(--font-sans); color: var(--anatomy-text);
		background: transparent; border: 1px solid var(--anatomy-faint);
		transition: border-color var(--duration-quick) var(--ease-smooth-out), color var(--duration-quick) var(--ease-smooth-out);
	}
	.chip { padding: 0 12px; transition: border-color var(--tabs-dur) var(--tabs-ease), color var(--tabs-dur) var(--tabs-ease); }
	.chip:hover, select:hover { border-color: var(--anatomy-mid); color: var(--anatomy-strong); }
	.chip[aria-checked='true'] { background: var(--anatomy-strong); border-color: var(--anatomy-strong); color: var(--anatomy-card); }
	/* Tabs sliding: once the pill is in place it carries the fill from chip to chip. */
	.chips { --tabs-pill-bg: var(--anatomy-strong); --tabs-pill-radius: 99px; }
	.chips:has(:global(.t-tabs-pill[data-placed])) .chip[aria-checked='true'] { background: transparent; }
	.chip .n { font: 10px var(--anatomy-mono); opacity: 0.6; margin-left: 4px; }

	/* A select drawn like a chip, with its own chevron; a picked value reads as set, like a checked chip. */
	.select { position: relative; display: inline-flex; }
	.select::after {
		content: ''; position: absolute; right: 14px; top: 50%; width: 5px; height: 5px; pointer-events: none;
		border: solid currentColor; border-width: 0 1px 1px 0; transform: translateY(-70%) rotate(45deg);
		color: var(--anatomy-mid);
	}
	select { appearance: none; min-width: 220px; padding: 0 34px 0 12px; }
	select option { color: var(--anatomy-strong); background: var(--anatomy-card); }
	.set select { color: var(--anatomy-strong); border-color: var(--anatomy-mid); }
	.set::after { color: var(--anatomy-strong); }

	.clear {
		justify-self: end; padding: 4px 0; cursor: pointer; background: none; border: 0;
		font: 11px var(--anatomy-mono); letter-spacing: 0.06em; color: var(--anatomy-muted);
		text-decoration: underline; text-underline-offset: 3px;
	}
	.clear:hover { color: var(--anatomy-strong); }
	.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

	/* Fixed columns, so every section lines up and long titles or patterns wrap inside their own cell. */
	table { width: 100%; border-collapse: collapse; table-layout: fixed; }
	.c-num { width: 48px; }
	.c-diff { width: 84px; }
	.c-pattern { width: 300px; }
	th {
		text-align: left; padding: 0 12px 8px 0; border-bottom: 1px solid var(--rule);
		font: 11px var(--anatomy-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--anatomy-muted);
	}
	.section th {
		padding: 28px 0 8px; font: 400 20px var(--font-serif); letter-spacing: 0; text-transform: none;
		color: var(--anatomy-strong); border-bottom: 1px solid var(--anatomy-faint);
	}
	.section .n { font: 11px var(--anatomy-mono); letter-spacing: 0.06em; color: var(--anatomy-muted); margin-left: 10px; }
	td { padding: 11px 16px 11px 0; border-bottom: 1px solid var(--rule); vertical-align: baseline; }
	td:last-child { padding-right: 0; }
	td a, .title { color: var(--anatomy-strong); font: 18px/1.3 var(--font-serif); }
	td a { text-decoration: none; }
	td a:hover { text-decoration: underline; text-decoration-color: var(--anatomy-mid); }
	.missing .title, .missing .num, .missing .caps { color: var(--anatomy-lo); }
	.num { font: 12px var(--anatomy-mono); color: var(--anatomy-muted); }
	.caps { font: 11px var(--anatomy-mono); letter-spacing: 0.06em; text-transform: uppercase; color: var(--anatomy-muted); }
	/* The family is what the Pattern filter groups by, so it reads first; the detail stays quiet. */
	.pattern { font: 12px/1.45 var(--anatomy-mono); color: var(--anatomy-muted); }
	.family { color: var(--anatomy-text); }
	.none { font: 11px var(--anatomy-mono); color: var(--anatomy-lo); margin-left: 8px; white-space: nowrap; }
	.pattern .none { margin-left: 0; }
	.empty { display: flex; gap: 12px; align-items: center; font: italic 17px var(--font-serif); margin-top: 32px; }

	@media (max-width: 560px) {
		.c-pattern { width: 0; }
		.c-num { width: 40px; }
		.row { grid-template-columns: 1fr; gap: 6px; }
		.clear { justify-self: start; }
		select { width: 100%; }
		.select { display: flex; }
		.pattern { display: none; }
		.section th { padding-top: 22px; }
	}
</style>
