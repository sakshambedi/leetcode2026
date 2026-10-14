// 122. Best Time to Buy and Sell Stock II: add up every positive day-to-day rise.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	lede: 'Any long climb is just its daily steps added up, so collect every day the price rises and skip every day it falls.'
};

type Args = [prices: number[]];
export type Step = BaseStep & {
	a: number[];
	rise: number[]; // rise[i - 1] = prices[i] - prices[i - 1]
	i: number | null; // the day just read
	profit: number;
	lit: number | null; // index into rise
	done?: boolean;
};

export const problem: Problem<Args, Step, number> = {
	fields: [{ name: 'prices', kind: 'list', from: ([prices]) => prices, placeholder: '7, 1, 5, 3, 6, 4' }],
	toArgs({ prices }) {
		if (prices.length === 0) throw new Error('prices needs at least one day.');
		if (prices.some((p: number) => p < 0 || p > 10000)) throw new Error('Each price must be between 0 and 10000.');
		return [prices];
	},

	trace([prices]) {
		const a = prices;
		const rise = a.slice(1).map((p, x) => p - a[x]);
		let profit = 0;
		const out: Step[] = [{
			a, rise, i: null, profit, lit: null, line: 1,
			msg: 'profit starts at 0. Walk the days in pairs: each rise from one day to the next is a trade worth taking.'
		}];
		for (let i = 1; i < a.length; i++) {
			const d = a[i] - a[i - 1];
			let msg: string, line: number, lit: number | null = null;
			if (d > 0) {
				profit += d; lit = i - 1; line = 4;
				msg = `${a[i - 1]} → ${a[i]} rises by ${d}: buy on day ${i - 1}, sell on day ${i}. profit = ${profit}.`;
			} else {
				line = 3;
				msg = d === 0
					? `${a[i - 1]} → ${a[i]} is flat, nothing to gain. Skip it.`
					: `${a[i - 1]} → ${a[i]} falls by ${-d}. Holding through it only loses, so skip it.`;
			}
			out.push({ a, rise, i, profit, lit, msg, line });
		}
		out.push({
			...out.at(-1)!, i: null, lit: null, done: true, line: 5,
			msg: profit > 0
				? `Every day pair is read. The standing rises add up to the answer: return profit = ${profit}.`
				: 'Prices never rise from one day to the next, so no trade makes money. Return 0.'
		});
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.i ?? '–', note: 'day just read' },
		{ name: 'prices[i-1]', value: s.i == null ? '–' : s.a[s.i - 1], note: 'yesterday' },
		{ name: 'prices[i]', value: s.i == null ? '–' : s.a[s.i], note: 'today' },
		{ name: 'rise', value: s.i == null ? '–' : s.rise[s.i - 1], note: 'prices[i] − prices[i − 1]' },
		{ name: 'profit', value: s.profit, note: 'sum of rises kept so far' }
	],

	result: (s) => s.profit
};
