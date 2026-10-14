<script lang="ts">
	import { tick } from 'svelte';
	import { shake } from '../transitions.ts';
	import { defaultFits, fmt, type Case, type Field, type Problem } from '../types.ts';

	type Props = {
		cases: Case[];
		problem: Problem;
		/** Index into `cases`, or 'custom'. */
		selected: number | 'custom';
		/** Args currently on screen, used to prefill the Custom form. */
		current: unknown[] | undefined;
		onpick: (args: any[], expected: unknown, label: string) => void;
	};
	let { cases, problem, selected = $bindable(), current, onpick }: Props = $props();

	const fits = $derived(problem.fits ?? defaultFits);
	const shown = $derived(cases.map((c, i) => ({ ...c, i })).filter((c) => fits(c.args as any)));
	const hidden = $derived(cases.length - shown.length);
	const groups = $derived(
		[
			{ label: 'Examples', items: shown.filter((c) => c.id.startsWith('example_')) },
			{ label: 'Edge cases', items: shown.filter((c) => !c.id.startsWith('example_')) }
		].filter((g) => g.items.length)
	);

	const pretty = (id: string) => id.replace(/^example_(\d+)$/, 'Example $1').replace(/_/g, ' ');
	// How a field's value reads back in the Custom form: raw text for a string, quotes only when a word needs them.
	function prefill(field: Field<any>, v: unknown) {
		if (field.kind === 'string') return String(v);
		if (field.kind === 'strings') {
			const words = v as string[];
			return words.some((w) => /[,"]|^\s|\s$/.test(w) || w === '')
				? words.map((w) => JSON.stringify(w)).join(', ')
				: words.join(', ');
		}
		return fmt(v).replace(/[[\]]/g, '');
	}

	let values = $state<Record<string, string>>({});
	let error = $state('');
	/** The message stays in place while it fades out, so this flag, not `error`, shows it. */
	let failed = $state(false);
	let invalid = $state<string | null>(null);
	let chips: HTMLButtonElement[] = $state([]);
	let inputs: HTMLInputElement[] = $state([]);

	function pick(i: number | 'custom', focus = false) {
		selected = i;
		if (i === 'custom') {
			// Start from the case on screen: editing is quicker than typing from scratch.
			values = Object.fromEntries(
				problem.fields.map((f) => [f.name, current ? prefill(f, f.from(current as any)) : ''])
			);
			error = '';
			failed = false;
			invalid = null;
			if (focus) tick().then(() => inputs[0]?.focus());
		} else {
			onpick(cases[i].args as any[], cases[i].expected, pretty(cases[i].id));
		}
	}

	// Arrow keys move through the chips like a radio group.
	function onkeydown(e: KeyboardEvent) {
		const d = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
		if (!d) return;
		e.preventDefault();
		const order = [...shown.map((c) => c.i), 'custom' as const];
		const next = order[(order.indexOf(selected) + d + order.length) % order.length];
		pick(next);
		tick().then(() => chips.find((c) => c.dataset.i === String(next))?.focus());
	}

	function parse(field: Field<any>, raw: string) {
		if (field.kind === 'string') return raw;
		const text = raw.trim();
		if (field.kind === 'strings') {
			if (text.startsWith('"') || text.startsWith('[')) {
				try {
					const words = JSON.parse(text.startsWith('[') ? text : `[${text}]`);
					if (Array.isArray(words) && words.every((w) => typeof w === 'string')) return words;
				} catch {}
				throw new Error(`${field.name}: quote every word, e.g. "a, b", "c".`);
			}
			return text === '' ? [] : text.split(',').map((x) => x.trim());
		}
		if (field.kind === 'int') {
			if (!/^-?\d+$/.test(text)) throw new Error(`${field.name} must be a whole number.`);
			return Number(text);
		}
		const parts = text.replace(/^\[|\]$/g, '').split(',').map((x) => x.trim()).filter(Boolean);
		const bad = parts.find((x) => !/^-?\d+$/.test(x));
		if (bad !== undefined) throw new Error(`${field.name}: "${bad}" is not a whole number. Use commas, e.g. 1, 2, 3.`);
		return parts.map(Number);
	}

	function run(e: SubmitEvent) {
		e.preventDefault();
		invalid = null;
		try {
			const parsed: Record<string, number | number[] | string | string[]> = {};
			for (const f of problem.fields) {
				invalid = f.name;
				parsed[f.name] = parse(f, values[f.name] ?? '');
			}
			invalid = null;
			const args = problem.toArgs(parsed);
			if (!fits(args)) throw new Error('Too big to draw. Keep lists to 12 values or fewer, each under 1000, and strings short.');
			error = '';
			failed = false;
			onpick(args, undefined, 'Custom input');
		} catch (err) {
			error = (err as Error).message;
			failed = true;
			// Shake the field that failed to parse, or every field when the inputs break the problem's rules.
			const i = problem.fields.findIndex((f) => f.name === invalid);
			shake(i >= 0 ? [inputs[i]] : inputs);
		}
	}

	// Typing clears the error, so nothing is shaking at a value already being corrected.
	// The message fades out but keeps its line until the next run, so the form does not jump.
	function edited() {
		failed = false;
		invalid = null;
	}
</script>

<section class="cases">
	<div class="head">
		<span class="label" id="case-label">Test case</span>
		{#if hidden}<span class="note">{hidden} large case{hidden > 1 ? 's' : ''} hidden, too big to draw</span>{/if}
	</div>

	<div class="groups" role="radiogroup" aria-labelledby="case-label" tabindex="-1" {onkeydown}>
		{#each groups as group}
			<div class="group">
				<span class="group-label">{group.label}</span>
				<div class="chips">
					{#each group.items as c (c.i)}
						<button type="button" class="chip" role="radio" data-i={c.i} bind:this={chips[c.i]}
							aria-checked={selected === c.i} tabindex={selected === c.i ? 0 : -1}
							onclick={() => pick(c.i)}>{pretty(c.id)}</button>
					{/each}
				</div>
			</div>
		{/each}
		<div class="group">
			<span class="group-label">Your own</span>
			<div class="chips">
				<button type="button" class="chip custom" role="radio" data-i="custom" bind:this={chips[cases.length]}
					aria-checked={selected === 'custom'} tabindex={selected === 'custom' ? 0 : -1}
					onclick={() => pick('custom', true)}>Custom</button>
			</div>
		</div>
	</div>

	<!-- Accordion expand: the form stays mounted and grows open; inert keeps it out of reach while closed. -->
	<div class="t-acc" data-open={selected === 'custom'}>
		<div class="t-acc-panel" inert={selected !== 'custom'}>
			<div class="t-acc-panel-inner">
				<form class="custom t-input-wrap" class:is-error={failed} onsubmit={run} novalidate>
					{#each problem.fields as f, n}
						<label class="field">
							<span>{f.name}</span>
							<input class="t-input" class:is-error={failed && invalid === f.name} bind:this={inputs[n]}
								bind:value={values[f.name]} oninput={edited} placeholder={f.placeholder}
								aria-invalid={(failed && invalid === f.name) || undefined} autocomplete="off" spellcheck="false"
								inputmode={f.kind === 'int' ? 'numeric' : 'text'} />
						</label>
					{/each}
					<button type="submit" class="btn primary">Run</button>
					<p class="error t-error-msg" role="alert">{error}</p>
				</form>
			</div>
		</div>
	</div>
</section>

<style>
	.cases { margin: 0 0 20px; }
	.head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px; }
	.label, .group-label {
		font: 11px var(--anatomy-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--anatomy-muted);
	}
	.note { font: 11px var(--anatomy-mono); color: var(--anatomy-lo); }
	.groups { display: grid; gap: 10px; outline: none; }
	.group { display: grid; grid-template-columns: 168px 1fr; gap: 24px; align-items: start; }
	.group-label { padding-top: 7px; }
	.chips { display: flex; flex-wrap: wrap; gap: 6px; }
	.chip {
		min-height: 30px; padding: 0 12px; border-radius: 99px; cursor: pointer;
		font: 12px var(--font-sans); color: var(--anatomy-text);
		background: transparent; border: 1px solid var(--anatomy-faint);
		transition: border-color var(--duration-quick) var(--ease-smooth-out), color var(--duration-quick) var(--ease-smooth-out);
	}
	.chip:hover { border-color: var(--anatomy-mid); color: var(--anatomy-strong); }
	.chip[aria-checked='true'] { background: var(--anatomy-strong); border-color: var(--anatomy-strong); color: var(--anatomy-card); }
	.custom { border-style: dashed; }
	.chip.custom[aria-checked='true'] { border-style: solid; }

	/* Padding on the inner panel (never the grid track) keeps focus rings and the shake from being clipped. */
	.t-acc-panel-inner { padding: 8px; margin: -8px; }
	form.custom { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; margin: 14px 0 0 192px; border: 0; }
	.field { display: grid; gap: 4px; }
	.field span { font: 11px var(--anatomy-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--anatomy-muted); }
	input {
		min-height: 34px; width: 200px; padding: 0 10px; border-radius: 6px;
		font: 13px var(--anatomy-mono); color: var(--anatomy-strong);
		background: var(--anatomy-card); border: 1px solid var(--anatomy-faint);
	}
	input:hover { border-color: var(--anatomy-mid); }
	input::placeholder { color: var(--anatomy-lo); }
	input[aria-invalid='true'] { border-color: var(--anatomy-red); }
	.error { flex-basis: 100%; margin: 0; font-size: 13px; color: var(--anatomy-red); }
	.error:empty { display: none; }

	@media (max-width: 640px) {
		.group { grid-template-columns: 1fr; gap: 6px; }
		form.custom { margin-left: 0; }
	}
</style>
