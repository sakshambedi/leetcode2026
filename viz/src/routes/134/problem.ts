// 134. Gas Station: when the tank goes negative, every station since start is ruled out; restart after it.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Medium',
	pattern: 'Greedy · reset the start',
	lede: 'If the tank runs dry at station i, no station from start to i can be the start, so restart at i + 1; a start exists exactly when total gas covers total cost.'
};

type Args = [gas: number[], cost: number[]];
export type Step = BaseStep & {
	gas: number[];
	cost: number[];
	i: number | null; // the station just driven from
	start: number;
	tank: number;
	total: number;
	lit: number | null; // index into gas
	done?: boolean;
};

export const problem: Problem<Args, Step, number> = {
	fields: [
		{ name: 'gas', kind: 'list', from: ([gas]) => gas, placeholder: '1, 2, 3, 4, 5' },
		{ name: 'cost', kind: 'list', from: ([, cost]) => cost, placeholder: '3, 4, 5, 1, 2' }
	],
	toArgs({ gas, cost }) {
		if (gas.length === 0) throw new Error('There must be at least one station.');
		if (gas.length !== cost.length) throw new Error('gas and cost must have the same length.');
		if ([...gas, ...cost].some((v: number) => v < 0 || v > 10000)) throw new Error('Values must be between 0 and 10000.');
		return [gas, cost];
	},

	trace([gas, cost]) {
		let start = 0, tank = 0, total = 0;
		const base = { gas, cost };
		const out: Step[] = [{
			...base, i: null, start, tank, total, lit: null, line: 1,
			msg: 'Try station 0 as the start with an empty tank. total will sum every gas[i] − cost[i] around the loop.'
		}];
		for (let i = 0; i < gas.length; i++) {
			const net = gas[i] - cost[i];
			tank += net; total += net;
			const sign = net >= 0 ? `+${net}` : `${net}`;
			out.push({
				...base, i, start, tank, total, lit: i, line: 3,
				msg: tank >= 0
					? `Fill ${gas[i]} at station ${i}, burn ${cost[i]} to reach the next: ${sign}. tank = ${tank} ≥ 0, so start ${start} still works.`
					: `Fill ${gas[i]} at station ${i}, burn ${cost[i]} to reach the next: ${sign}. tank = ${tank} < 0, so start ${start} can't reach station ${i + 1}.`
			});
			if (tank < 0) {
				const from = start;
				start = i + 1; tank = 0;
				out.push({
					...base, i, start, tank, total, lit: null, line: 6,
					msg: from === i
						? `Station ${i} can't even reach the next one. Rule it out and try start = ${start} with an empty tank.`
						: `Every station ${from}..${i} arrives with tank ≥ 0 yet still runs dry here, so none can start. Rule them out: start = ${start}.`
				});
			}
		}
		const answer = total >= 0 ? start : -1;
		out.push({
			...out.at(-1)!, i: null, lit: null, done: true, line: 7,
			msg: total >= 0
				? `total = ${total} ≥ 0: the loop has enough gas overall, and start ${start} never ran dry to the end, so it covers the wrap-around too. Return ${answer}.`
				: `total = ${total} < 0: the loop burns more gas than it holds, so no start works. Return -1.`
		});
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.i ?? '–', note: 'station just left' },
		{ name: 'start', value: s.start, note: 'candidate start' },
		{ name: 'gas[i]-cost[i]', value: s.i == null ? '–' : s.gas[s.i] - s.cost[s.i], note: 'net gain at i' },
		{ name: 'tank', value: s.tank, note: 'gas left since start' },
		{ name: 'total', value: s.total, note: 'net gain of the loop so far' }
	],

	result: (s) => (s.total >= 0 ? s.start : -1)
};
