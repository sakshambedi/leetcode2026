// 121. Best Time to Buy and Sell Stock: one pass, keep the cheapest day so far and the best sale against it.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Easy',
	pattern: 'One pass · running minimum',
	lede: 'The best sale on day i buys at the cheapest day before it, so walk once keeping that cheapest day and the best gap.'
};

type Args = [prices: number[]];
export type Step = BaseStep & {
	a: number[];
	i: number | null; // the day just read
	buy: number; // index of the lowest price so far
	best: number;
	trade: [number, number] | null; // the buy and sell days of best
	lit: number | null;
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
		let buy = 0, best = 0;
		let trade: [number, number] | null = null;
		const out: Step[] = [{
			a, i: null, buy, best, trade, lit: null, line: 1,
			msg: `Day 0 is the only day seen, so it is the cheapest: buy = 0 at ${a[0]}. No sale yet, best = 0.`
		}];
		for (let i = 1; i < a.length; i++) {
			let msg: string, line: number, lit: number | null = null;
			if (a[i] < a[buy]) {
				msg = `${a[i]} < ${a[buy]}, a new lowest price. Any later sale does better buying here, so buy moves to day ${i}.`;
				buy = i; lit = i; line = 4;
			} else {
				const gain = a[i] - a[buy];
				line = 6;
				if (gain > best) {
					msg = `Selling at ${a[i]} after buying at ${a[buy]} earns ${gain}, more than ${best}. best = ${gain}.`;
					best = gain; trade = [buy, i]; lit = i;
				} else {
					msg = `Selling at ${a[i]} after buying at ${a[buy]} earns ${gain}, not more than best = ${best}. Keep going.`;
				}
			}
			out.push({ a, i, buy, best, trade, lit, msg, line });
		}
		out.push({
			...out.at(-1)!, i: null, lit: null, done: true, line: 7,
			msg: trade
				? `Every day was a sell candidate. Return best = ${best}: buy on day ${trade[0]} at ${a[trade[0]]}, sell on day ${trade[1]} at ${a[trade[1]]}.`
				: 'Prices never rose above an earlier day, so no sale makes money. Return 0.'
		});
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.i ?? '–', note: 'day to sell on' },
		{ name: 'buy', value: s.buy, note: 'cheapest day so far' },
		{ name: 'prices[buy]', value: s.a[s.buy], note: 'lowest price so far' },
		{ name: 'gain', value: s.i == null ? '–' : s.a[s.i] - s.a[s.buy], note: 'prices[i] − prices[buy]' },
		{ name: 'best', value: s.best, note: 'best profit so far' }
	],

	result: (s) => s.best
};
