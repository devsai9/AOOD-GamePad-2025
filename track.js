import * as G from "./graphics.js";
import { Vec2 } from "./vector.js";

/**
 * @typedef { import("./vector.js").Vec2 } Vec2
 */

const ROAD_SCALE = 0.75;
const DOTS = [0.04, 0.08].map(x => x * ROAD_SCALE);

function drawRaw(pins, tangents) {
    const len = pins.length;
    for (let i = 0; i < len; i++) {
        const start = pins[i];
        const ctrl1 = Vec2.sum(start, tangents[i]);
        const end = pins[i + 1] || pins[0];
        const ctrl2 = Vec2.diff(end, tangents[i + 1] || tangents[0]);
        G.moveTo(start);
        G.bezierTo(ctrl1, ctrl2, end);
        G.stroke();
    }
}

const FINISH_SPAN = 0.1;
const FINISH_COUNT_X = 2;
const FINISH_COUNT_Y = 5;

function drawFinish(pin, tangent) {
    const squares = [];
    for (let x = 0; x < FINISH_COUNT_X; x++) {
        for (let y = 0; y < FINISH_COUNT_Y; y++) {
            squares.push([FINISH_SPAN / FINISH_COUNT_X]);
        }
    }
}

/**
 * 
 * @param { string } l 
 * @return { Vec2[] }
 */
function transformDesmosData(l) {
    return l.split("\n")
        .map(v => v.split("\t")
        .map(n => Number.parseFloat(n) * 1.6 / 9))
        .map(([x, y]) => [x, -y]);
}

function cubicBezier(t, p1, p2, p3, p4) {
    const c1 = Vec2.scale(p1, (1 - t) ** 3);
    const c2 = Vec2.scale(p2, 3 * (1 - t) ** 2 * t);
    const c3 = Vec2.scale(p3, 3 * (1 - t) * (t ** 2));
    const c4 = Vec2.scale(p4, t ** 3);
    return Vec2.total(c1, c2, c3, c4);
}

export class Track {
    /**
     * Create a track with the specified pins and tangents
     * @param { Vec2[] } pins 
     * @param { Vec2[] } tangents 
     */
    constructor(pins, tangents) {
        this.pins = pins;
        this.tangents = tangents;
        this.style = {
            outline: "#16161a",
            main: "#272747",
            dash: "#ffff00"
        };
        this.width = 0.15 * ROAD_SCALE;
    }

    /**
     * @param { string } pins 
     * @param { string } tangents 
     * @returns 
     */
    static parse(pins, tangents) {
        const p = transformDesmosData(pins);
        const t = transformDesmosData(tangents).map((tangent, i) => Vec2.diff(tangent, p[i]));
        return new Track(p, t);
    }

    draw() {
        G.beginPath();
        G.setLineDash([]);
        G.setStroke(this.style.outline);
        G.setLineWidth(this.width);
        drawRaw(this.pins, this.tangents);

        G.beginPath();
        G.setStroke(this.style.main);
        G.setLineWidth(this.width - 0.03 * ROAD_SCALE);
        drawRaw(this.pins, this.tangents);
        
        G.beginPath();
        G.setLineDash(DOTS);
        G.setStroke(this.style.dash);
        G.setLineWidth(0.01);
        drawRaw(this.pins, this.tangents);

        G.setFill("#f0f0ff");
        for (const p of this.pins) {
            G.fillCircle(p, 0.05);
        }
    }

    isOnTrack(point) {
        for (let i = 0; i < this.pins.length; i++) {
            const start = this.pins[i];
            const ctrl1 = Vec2.sum(start, this.tangents[i]);
            const end = this.pins[i + 1] || this.pins[0];
            const ctrl2 = Vec2.diff(end, this.tangents[i + 1] || this.tangents[0]);
            
            if (Vec2.dist(this.findNearestPoint(point, start, ctrl1, ctrl2, end), point) <= this.width / 2) return true;
        }
        
        return false;
    }

    findNearestPoint(point, start, ctrl1, ctrl2, end) {
        const ITER_COUNT = 50;

        let minDist = Infinity;
        let nearestPoint = null;

        for (let i = 0; i <= ITER_COUNT; i++) {
            const t = i / ITER_COUNT;
            const dist = Vec2.dist(cubicBezier(t, start, ctrl1, ctrl2, end), point);

            if (dist < minDist) {
                minDist = dist;
                nearestPoint = cubicBezier(t, start, ctrl1, ctrl2, end);
            }
        }

        return nearestPoint;
    }
}
