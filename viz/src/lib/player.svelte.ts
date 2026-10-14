// Playback state for a traced algorithm: which step is showing, play/pause, speed.
import type { BaseStep } from './types.ts';

export class Player<Step extends BaseStep> {
	steps = $state<Step[]>([]);
	at = $state(0);
	speed = $state(1);
	playing = $state(false);
	/** Bumped on every load so figures can restart their animations from scratch. */
	run = $state(0);

	step = $derived(this.steps[this.at]);
	prev = $derived(this.at > 0 ? this.steps[this.at - 1] : undefined);
	first = $derived(this.at === 0);
	last = $derived(this.at === this.steps.length - 1);

	#timer: ReturnType<typeof setInterval> | undefined;

	load(steps: Step[]) {
		this.pause();
		this.steps = steps;
		this.at = 0;
		this.run++;
	}

	go(i: number) {
		this.at = Math.max(0, Math.min(this.steps.length - 1, i));
	}

	next = () => { this.pause(); this.go(this.at + 1); };
	back = () => { this.pause(); this.go(this.at - 1); };
	restart = () => { this.pause(); this.go(0); };
	end = () => { this.pause(); this.go(this.steps.length - 1); };

	toggle = () => {
		if (this.playing) return this.pause();
		if (this.last) this.at = 0;
		this.playing = true;
		this.#tick();
	};

	pause = () => {
		clearInterval(this.#timer);
		this.playing = false;
	};

	setSpeed = (s: number) => {
		this.speed = s;
		if (this.playing) this.#tick();
	};

	#tick() {
		clearInterval(this.#timer);
		this.#timer = setInterval(() => {
			this.go(this.at + 1);
			if (this.last) this.pause();
		}, 1000 / this.speed);
	}
}
