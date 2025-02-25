import { Vec2 } from "./vector.js";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.textContent = "Your ancient browser doesn't support canvas";

/*

             -1
             ^
             |
             |
-16/9 <------+------> +16/9
             |
             |
             v
             +1

Origin at center of screen
*/

/**
 * @typedef { "bevel" | "miter" | "round" } LineJoin
 * @typedef { "butt" | "round" | "square" } LineCap
 */

const ScreenProxy = {
    offsetX: 0,
    offsetY: 0,
    scale: 1
};
const RATIO = 16 / 9;

function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    ScreenProxy.offsetX = canvas.width / 2;
    ScreenProxy.offsetY = canvas.height / 2;
    ScreenProxy.scale = ((width / height >= RATIO) ? canvas.height : canvas.width / RATIO) * 0.5;
}

handleResize();
window.addEventListener("resize", handleResize);
document.body.appendChild(canvas);

/**
 * Transform logical X coordinate to screen X coordinate
 * @param { number } x 
 * @returns { number }
 */
function transformX(x) {
    return x * ScreenProxy.scale + ScreenProxy.offsetX;
}

/**
 * Transform logical Y coordinate to screen Y coordinate
 * @param { number } y 
 * @returns { number }
 */
function transformY(y) {
    return y * ScreenProxy.scale + ScreenProxy.offsetY;
}

/**
 * Transform logical length to screen length
 * @param { number } k
 * @returns { number }
 */
function transformK(k) {
    return k * ScreenProxy.scale;
}

// Exports

/**
 * @param { ImageBitmap } image
 * @param { number } x
 * @param { number } y
 */
export function drawImage(image, [x, y]) {
    ctx.drawImage(
        image,
        transformX(x),
        transformY(y),
        transformK(image.width),
        transformK(image.height)
    );
}

export function fillRect([x, y], w, h, angle = 0) {
    if (angle === 0) ctx.fillRect(
        transformX(x),
        transformY(y),
        transformK(w),
        transformK(h)
    );
    else {
        const verts = [
            [0, 0],
            [w, 0],
            [w, h],
            [0, h]
        ].map(v => Vec2.rotate(v, angle));
        beginPath();
        for (let i = 0; i < 4; i++) {
            const vert = Vec2.sum(verts[i], [x, y]);
            if (i === 0) moveTo(vert);
            else lineTo(vert);
        }
        fill();
    }
}

export function setFill(color) {
    ctx.fillStyle = color;
}

export function setStroke(color) {
    ctx.strokeStyle = color;
}

export function clear(color="#000000") {
    const old = ctx.fillStyle;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = old;
}

export function width() { return canvas.width; }
export function height() { return canvas.height; }

export function _ctx() {
    return ctx;
}

export function ratio() {
    return RATIO;
}

export function maskEdge() {
    const currentRatio = canvas.width / canvas.height;
    ctx.fillStyle = "#000000";
    if (currentRatio > RATIO) {
        // Too wide
        const edge = -RATIO * ScreenProxy.scale + ScreenProxy.offsetX;
        ctx.fillRect(0, 0, edge, canvas.height);
        ctx.fillRect(canvas.width - edge, 0, edge, canvas.height);
    }
    else {
        // Too tall
        const edge = -ScreenProxy.scale + ScreenProxy.offsetY;
        ctx.fillRect(0, 0, canvas.width, edge);
        ctx.fillRect(0, canvas.height - edge, canvas.width, edge);
    }
}

export function beginPath() {
    ctx.beginPath();
}

export function closePath() {
    ctx.closePath();
}

export function moveTo([x, y]) {
    ctx.moveTo(
        transformX(x),
        transformY(y)
    );
}

export function lineTo([x, y]) {
    ctx.lineTo(
        transformX(x),
        transformY(y)
    );
}

export function bezierTo([cx1, cy1], [cx2, cy2], [x, y]) {
    ctx.bezierCurveTo(
        transformX(cx1),
        transformY(cy1),
        transformX(cx2),
        transformY(cy2),
        transformX(x),
        transformY(y)
    );
}

export function stroke() {
    ctx.stroke();
}

export function fill() {
    ctx.fill();
}

let c = 0;
export function setLineWidth(w) {

    // if (c < 2) {
    //     console.log("setting line width", transformK(w))
    // }
    ctx.lineWidth = transformK(w);
    // if (c < 2) {
    //     console.log("got line width", ctx.lineWidth)
    // }
    c++;
}

/**
 * @param { LineCap } s 
 */
export function setLineCap(s) {
    ctx.lineCap = s;
}

/**
 * 
 * @param { LineJoin } s 
 */
export function setLineJoin(s) {
    ctx.lineJoin = s;
}

export function setLineDash(d) {
    ctx.setLineDash(d.map(transformK));
}

export function fillCircle([x, y], r) {
    ctx.beginPath();
    ctx.arc(transformX(x), transformY(y), transformK(r), 0, 2 * Math.PI);
    ctx.fill();
}