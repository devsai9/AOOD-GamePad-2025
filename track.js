import * as G from "./graphics.js";
import { Vec2 } from "./vector.js";
import { Checkpoint } from "./collisionBody.js";

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

const FINISH_SPAN = 0.04;
const FINISH_COUNT_X = 3;
const FINISH_COUNT_Y = 7;

/**
 * @param { number } num 
 * @returns { string }
 */
function toNibble(num) {
    return num.toString(16).padStart(2, "0");
}

function parseColor(hex) {
    const n = Number.parseInt(hex.slice(1), 16);
    let r = n >> 16;
    let g = (n >> 8) % 0x100;
    let b = n % 0x100;
    return [r, g, b];
}

function hexify(r, g, b) {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    return `#${toNibble(r)}${toNibble(g)}${toNibble(b)}`;
}

/**
 * @param { string } hex 
 */
function darker(hex, k = 0.2) {
    const [r, g, b] = parseColor(hex);
    return hexify(r * k, g * k, b * k);
}

function mix(c1, c2, t) {
    const [r1, g1, b1] = parseColor(c1);
    const [r2, g2, b2] = parseColor(c2);

    return hexify(
        r1 * (1 - t) + r2 * t,
        g1 * (1 - t) + g2 * t,
        b1 * (1 - t) + b2 * t
    );
}

/**
 * 
 * @param { Track } self 
 * @param { Vec2 } pin 
 * @param { Vec2 } tangent 
 */
function drawFinish(self, pin, tangent) {
    const stepX = FINISH_SPAN / FINISH_COUNT_X;
    const beginX = -stepX * FINISH_COUNT_X / 2;
    const stepY = self.width / FINISH_COUNT_Y;
    const beginY = -stepY * FINISH_COUNT_Y / 2;
    const dir = Math.atan2(tangent[1], tangent[0]);
    for (let x = 0; x < FINISH_COUNT_X; x++) {
        for (let y = 0; y < FINISH_COUNT_Y; y++) {
            G.setFill((x + y) % 2 === 0 ? mix("#000000", "#ffffff", self.status[0]) : "#fff");
            const pos = Vec2.rotate([beginX + stepX * x, beginY + stepY * y], dir);
            G.fillRect(Vec2.sum(pos, pin), stepX, stepY, dir);
        }
    }
}

const flagVertices = {
    x: [0, 0.6, -0.4, -0.4, -0.5, -0.5, 0.6],
    y: [0.5, 0.1, 0.1, -1, -1, 0.9, 0.9]
};
const flagPalette = [
    "#a83232",
    "#d1883f",
    //"#d1d13f",
    "#70d13f",
    "#3fd1b9",
    "#3f3fd1",
    "#d13fd1",
    "#d13f88"
];

/**
 * 
 * @param { Track } self 
 * @param { Vec2 } pin 
 * @param { Vec2 } tangent 
 * @param { number } id 
 */
function drawCheckpoint(self, pin, tangent, id) {
    const offset = Vec2.perp(Vec2.norm(tangent));
    const pos = Vec2.sum(Vec2.scale(offset, -0.125), pin);

    const color = flagPalette[id - 1];
    const outer = darker(color, 0.5);
    const fill = mix(color, "#ffffff", self.status[id]);
    const stroke = mix(outer, "#ffffff", self.status[id]);
    G.setFill(fill);
    G.setLineDash([]);
    G.setStroke(stroke);
    G.setLineWidth(0.015);
    G.setLineJoin("round");

    //G.fillRect(pos, 0.1, 0.1);

    G.beginPath();
    for (let i = 0; i < flagVertices.x.length; i++) {
        const p = [(flagVertices.x[i] + 0.5), -(flagVertices.y[i] + 1)];
        const vert = Vec2.sum(pos, Vec2.scale(p, 0.08));
        if (i === 0) G.moveTo(vert);
        else G.lineTo(vert);
    }
    G.closePath();
    G.stroke();

    G.beginPath();
    for (let i = 0; i < flagVertices.x.length; i++) {
        const p = [(flagVertices.x[i] + 0.5), -(flagVertices.y[i] + 1)];
        const vert = Vec2.sum(pos, Vec2.scale(p, 0.08));
        if (i === 0) G.moveTo(vert);
        else G.lineTo(vert);
    }
    G.fill();    
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

export function cubicBezier(t, p1, p2, p3, p4) {
    const c1 = Vec2.scale(p1, (1 - t) ** 3);
    const c2 = Vec2.scale(p2, 3 * (1 - t) ** 2 * t);
    const c3 = Vec2.scale(p3, 3 * (1 - t) * (t ** 2));
    const c4 = Vec2.scale(p4, t ** 3);
    return Vec2.total(c1, c2, c3, c4);
}

export function cubicBezierTangent(t, p1, p2, p3, p4) {
    const c1 = Vec2.scale(p1, -3 * (1 - t) ** 2);
    const c2 = Vec2.scale(p2, 3 * (-2 * (1 - t) * t + (1 - t) ** 2));
    const c3 = Vec2.scale(p3, 3 * (2 * t * (1 - t) - t ** 2));
    const c4 = Vec2.scale(p4, 3 * t ** 2);
    return Vec2.total(c1, c2, c3, c4);
}

const CHECKPOINT_SIZE = ROAD_SCALE * 1.4 * 0.1;

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
        this.status = Array(pins.length).fill(0);

        for (let i = 1; i < this.pins.length; i++) {
            drawCheckpoint(this, this.pins[i], this.tangents[i], i);
        }
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

        // for (const [i, p] of this.pins.entries()) {
        //     if (i === 0) G.setFill("#40d291");
        //     else G.setFill("#f0f0ff");
        //     G.fillCircle(p, CHECKPOINT_SIZE);
        // }

        const finishPos = cubicBezier(
            0.03,
            this.pins[0],
            Vec2.sum(this.pins[0], this.tangents[0]),
            Vec2.diff(this.pins[1], this.tangents[1]),
            this.pins[1]
        );
        const finishDir = cubicBezierTangent(
            0.03,
            this.pins[0],
            Vec2.sum(this.pins[0], this.tangents[0]),
            Vec2.diff(this.pins[1], this.tangents[1]),
            this.pins[1]
        );

        drawFinish(this, finishPos, finishDir);
    }

    drawCheckpoints() {
        for (let i = 1; i < this.pins.length; i++) {
            drawCheckpoint(this, this.pins[i], this.tangents[i], i);
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

    getNearestPoint(point) {
        let min = Infinity;
        let found = null;
        for (let i = 0; i < this.pins.length; i++) {
            const start = this.pins[i];
            const ctrl1 = Vec2.sum(start, this.tangents[i]);
            const end = this.pins[i + 1] || this.pins[0];
            const ctrl2 = Vec2.diff(end, this.tangents[i + 1] || this.tangents[0]);
            
            const pt = this.findNearestPoint(point, start, ctrl1, ctrl2, end);
            const dis = Vec2.dist(pt, point);
            if (dis < min) {
                min = dis;
                found = pt;
            }
        }
        
        return found;
    }

    queryCheckpoint(pos) {
        for (const [i, checkpoint] of this.pins.entries()) {
            if (Vec2.dist(checkpoint, pos) < CHECKPOINT_SIZE) return i;
        }
        return -1;
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

    update(delta) {
        for (let i = 0; i < this.status.length; i++) {
            this.status[i] -= delta * 0.003;
            this.status[i] = Math.max(0, this.status[i]);
        }
    }
}
