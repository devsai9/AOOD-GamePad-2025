import * as G from "./graphics.js";
import { Vec2 } from "./vector.js";

/**
 * @typedef { import("./vector.js").Vec2 } Vec2
 */

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
        this.width = 0.15;
    }

    draw() {
        G.beginPath();
        G.setLineDash([]);
        G.setStroke(this.style.outline);
        G.setLineWidth(this.width);
        drawRaw(this.pins, this.tangents);

        G.beginPath();
        G.setStroke(this.style.main);
        G.setLineWidth(this.width - 0.03);
        drawRaw(this.pins, this.tangents);
        
        G.beginPath();
        G.setLineDash([0.04, 0.08]);
        G.setStroke(this.style.dash);
        G.setLineWidth(0.01);
        drawRaw(this.pins, this.tangents);
    }

    drawRaw() {
        const len = this.pins.length;
        for (let i = 0; i < len; i++) {
            const start = this.pins[i];
            const ctrl1 = Vec2.sum(start, this.tangents[i]);
            const end = this.pins[i + 1] || this.pins[0];
            const ctrl2 = Vec2.diff(end, this.tangents[i + 1] || this.tangents[0]);
            G.moveTo(start);
            G.bezierTo(ctrl1, ctrl2, end);
            G.stroke();
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
