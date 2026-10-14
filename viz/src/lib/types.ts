// Shapes shared by every problem. A problem's `problem.ts` exports a `Problem`.

/** One test case, exported from the Python EXAMPLES + CASES by `main.py`. */
export type Case<Args = unknown[], Result = unknown> = { id: string; args: Args; expected: Result };

/** One snapshot of the algorithm: whatever state the figure needs, plus why and where. */
export type BaseStep = {
	msg: string; // one sentence: why this move happens
	line?: number; // 1-based line of the core-loop code that this step runs
};

/** A row in the variables table. */
export type Var = { name: string; value: number | string; note?: string };

/**
 * A Custom input field. `from` reads its value back out of a case's args.
 * list: comma-separated whole numbers. int: one whole number. string: the raw text, spaces kept.
 * strings: comma-separated words, or JSON-quoted ("a, b", "c") when a word holds a comma.
 */
export type Field<Args> = {
	name: string;
	kind: 'list' | 'int' | 'string' | 'strings';
	from: (args: Args) => number | number[] | string | string[];
	placeholder?: string;
};

export type Problem<Args extends unknown[] = any[], Step extends BaseStep = any, Result = any> = {
	fields: Field<Args>[];
	/** Build args from Custom input; throw Error("message") to reject it. */
	toArgs: (values: Record<string, any>) => Args;
	trace: (args: Args) => Step[];
	vars: (step: Step) => Var[];
	/** The answer at the last step, in the same shape as `expected`. */
	result: (last: Step) => Result;
	/** Defaults to JSON equality; override when any valid answer is accepted. */
	check?: (result: Result, expected: Result) => boolean;
	/** Whether a case is small enough to draw. */
	fits?: (args: Args) => boolean;
};

/** Shown in the page header. Difficulty and pattern live on the Python Solution class (see ProblemInfo). */
export type Meta = {
	/** One serif sentence that brings the whole approach back. */
	lede: string;
};

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/** Written by main.py from the Python Solution classes. */
export type ProblemInfo = {
	number: number;
	title: string;
	url: string;
	stem: string;
	difficulty: Difficulty;
	/** "Family · detail"; the index filters by the family before " · ". */
	pattern: string;
	/** Section in the study plan, or null when the problem is not in it. */
	section: string | null;
};

/** The study plan, as `uv run leetcode.py plan <slug>` fetched it; copied by main.py. */
export type StudyPlan = {
	slug: string;
	name: string;
	url: string;
	sections: {
		name: string;
		problems: { number: number; title: string; slug: string; difficulty: Difficulty }[];
	}[];
};

export const patternFamily = (pattern: string) => pattern.split(' · ')[0];

export function defaultFits(args: unknown[]) {
	const lists = args.filter(Array.isArray) as unknown[][];
	const nums = [...lists.flat(), ...args.filter((a) => typeof a === 'number')] as number[];
	const strings = [...lists.flat(), ...args].filter((a) => typeof a === 'string') as string[];
	return (
		lists.every((l) => l.length <= 12) &&
		lists.flat().length <= 18 &&
		nums.every((n) => typeof n !== 'number' || Math.abs(n) < 1000) &&
		strings.every((s) => s.length <= 24)
	);
}

export const sameJSON = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** JSON with a space after each list comma, for reading; commas inside strings are left alone. */
export const fmt = (v: unknown): string =>
	Array.isArray(v) ? `[${v.map(fmt).join(', ')}]` : (JSON.stringify(v) ?? String(v));
