// Isometric geometry for the figures, after Anatomy (skills.wheresryan.sh/anatomy).
// World units: x runs along a row, y runs toward the viewer, z is up.
// Everything here is pure: it returns numbers and SVG path strings for components to draw.

export type Point = [number, number, number?];
export type Box = { x: number; y: number; w: number; d: number; r?: number };

export type Camera = {
	p: (pt: Point) => [number, number];
	faces: (normal: [number, number]) => boolean;
	light: (normal: [number, number]) => number;
	plane: (pt: Point) => string;
};

const RAD = Math.PI / 180;
const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** House view: square to the reader. Rows run level and tiles show top and front faces. */
export function camera({ azimuth = 90, elevation = 38, scale = 1.8 } = {}): Camera {
	const sa = Math.sin(azimuth * RAD), ca = Math.cos(azimuth * RAD);
	const se = Math.sin(elevation * RAD), ce = Math.cos(elevation * RAD);
	const p = ([x, y, z = 0]: Point): [number, number] => [
		(x * sa - y * ca) * scale,
		((x * ca + y * sa) * se - z * ce) * scale
	];
	return {
		p,
		faces: ([nx, ny]) => nx * ca + ny * sa > 1e-9,
		light: ([nx, ny]) => (nx * -sa + ny * ca + 1) / 2,
		// Maps flat text onto the plane at height z so labels look engraved.
		plane([x, y, z = 0]) {
			const [ox, oy] = p([x, y, z]), [ux, uy] = p([x + 1, y, z]), [vx, vy] = p([x, y + 1, z]);
			return `matrix(${[ux - ox, uy - oy, vx - ox, vy - oy, ox, oy].map(n1).join(' ')})`;
		}
	};
}

export const path = (pts: [number, number][], close = true) =>
	pts.map(([x, y], i) => `${i ? 'L' : 'M'}${n1(x)} ${n1(y)}`).join('') + (close ? 'Z' : '');

/** Rounded-rectangle footprint, counter-clockwise in world space. */
export function footprint({ x, y, w, d, r = 3 }: Box, seg = 4): [number, number][] {
	r = Math.max(0, Math.min(r, w / 2, d / 2));
	const corners = [[x + w - r, y + r, -90], [x + w - r, y + d - r, 0], [x + r, y + d - r, 90], [x + r, y + r, 180]];
	const pts: [number, number][] = [];
	for (const [cx, cy, a0] of corners)
		for (let s = 0; s <= seg; s++) {
			const a = (a0 + (90 * s) / seg) * RAD;
			pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
		}
	return pts;
}

function hull(pts: [number, number][]) {
	const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
	const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const half = (list: [number, number][]) => {
		const out: [number, number][] = [];
		for (const q of list) {
			while (out.length >= 2 && cross(out.at(-2)!, out.at(-1)!, q) <= 0) out.pop();
			out.push(q);
		}
		return out.slice(0, -1);
	};
	return [...half(s), ...half([...s].reverse())];
}

export function ground(cam: Camera, box: Box) {
	return path(footprint(box).map(([x, y]) => cam.p([x, y, 0])));
}

/** Paths for an extruded tile: silhouette, visible sides with shade buckets 0..3, and top. */
export function solid(cam: Camera, box: Box, h: number, z = 0) {
	const base = footprint(box);
	const top = base.map(([x, y]) => cam.p([x, y, z + h]));
	const bottom = base.map(([x, y]) => cam.p([x, y, z]));
	const sides: { d: string; shade: number }[] = [];
	if (h > 0.2) {
		for (let i = 0; i < base.length; i++) {
			const j = (i + 1) % base.length;
			const [ax, ay] = base[i], [bx, by] = base[j];
			const len = Math.hypot(bx - ax, by - ay) || 1;
			const normal: [number, number] = [(by - ay) / len, -(bx - ax) / len];
			if (!cam.faces(normal)) continue;
			const shade = Math.min(3, Math.max(0, Math.floor(cam.light(normal) * 4)));
			sides.push({ d: path([top[i], top[j], bottom[j], bottom[i]]), shade });
		}
	}
	return { outline: path(hull([...top, ...bottom])), sides, top: path(top) };
}

/** Projected bounds of world points; minWidth keeps small figures at a steady scale. */
export function viewBox(cam: Camera, points: Point[], { pad = 16, minWidth = 640 } = {}) {
	const xy = points.map(cam.p);
	const xs = xy.map((q) => q[0]), ys = xy.map((q) => q[1]);
	let x = Math.min(...xs) - pad, w = Math.max(...xs) + pad - x;
	const y = Math.min(...ys) - pad, h = Math.max(...ys) + pad - y;
	if (w < minWidth) { x -= (minWidth - w) / 2; w = minWidth; }
	return [x, y, w, h].map(n1).join(' ');
}

export const fmt = n1;
