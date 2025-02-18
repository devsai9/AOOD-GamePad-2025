import * as G from "./graphics.js";

function draw() {
    G.clear("#ff0000");
}

draw();
window.addEventListener("resize", draw);