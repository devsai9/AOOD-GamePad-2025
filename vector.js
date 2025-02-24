/** @typedef { [number, number] } Vec2 */
export const Vec2 = {
    /** @type { (a: Vec2, b: Vec2) => Vec2 }*/
    sum: ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2],
    /** @type { (a: Vec2, b: Vec2) => Vec2 }*/
    diff: ([x1, y1], [x2, y2]) => [x1 - x2, y1 - y2],
    /** @type { (v: Vec2, k: number) => Vec2 }*/
    scale: ([x, y], k) => [x * k, y * k],
    /** @type { (v: Vec2) => number }*/
    len: ([x, y]) => Math.sqrt(x * x + y * y),
    /** @type { (v: Vec2) => Vec2 }*/
    norm: (v) => Vec2.scale(v, 1 / Vec2.len(v)),
    /** @type { (v: Vec2) => Vec2 } */
    perp: ([x, y]) => [-y, x], 
    /** @type { (a: Vec2, b: Vec2) => number } */
    dot: ([x1, y1], [x2, y2]) => x1 * x2 + y1 * y2,
    /** @type { (v: Vec2, basis: Vec2) => Vec2 } */
    cast: (v, basis) => Vec2.scale(basis, Vec2.dot(v, basis)),
    /** @type { (v: Vec2, basis: Vec2) => [Vec2, Vec2] } */
    split: (v, basis) => [Vec2.cast(v, basis), Vec2.cast(v, Vec2.perp(basis))],
    /** @type { (v1: Vec2, v2: Vec2, t: number) => Vec2 } */
    lerp: ([x1, y1], [x2, y2], t) => [x1 * (1 - t) + x2 * t, y1 * (1 - t) + y2 * t],
    dist: (v1, v2) => Vec2.len(Vec2.diff(v1, v2)),
    rotate: ([x, y], angle) => {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        return [cos * x - sin * y, sin * x + cos * y];
    },
    /** @type { (arr: Vec2[]) => Vec2 } */
    total: (...arr) => {
        let xt = 0;
        let yt = 0;
        for (let i = 0; i < arr.length; i++) {
            xt += arr[i][0];
            yt += arr[i][1];
        }
        return [xt, yt];
    },
    dir: (theta) => [Math.cos(theta), Math.sin(theta)]
};