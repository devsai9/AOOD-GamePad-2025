import * as G from "./graphics.js";

/*

- Palette for different biomes -
[Plains]
bg: #8de645

[Desert]
bg: #d9b962

*/

function draw() {
    G.clear("#d9b962");

    G.setLineCap(G.CapStyle.ROUND);

    G.beginPath();
    G.setLineWidth(0.1);
    G.moveTo([0, 0]);
    G.bezierTo([0.5, 0], [0.5, 0.5], [1.0, 0.5]);
    G.stroke();

    G.beginPath();
    G._ctx().setLineDash([10, 20]);
    G.setStroke("#ffff00");
    G.setLineWidth(0.008);
    G.moveTo([0, 0]);
    G.bezierTo([0.5, 0], [0.5, 0.5], [1.0, 0.5]);
    G.stroke();

    G.setFill("#075577");
    G.fillRect([-0.1, -0.1], 0.2, 0.2);
    
    G.setFill("#33ffdd");
    G.fillRect([-0.09, -0.09], 0.18, 0.18);

    // const ctx = G._ctx();

    // ctx.lineWidth = 50;
    // ctx.lineCap = "round";
    // ctx.moveTo(0, 0);
    // ctx.bezierCurveTo(500, 0, 500, 500, 1000, 500);

    // ctx.stroke();
    G.maskEdge();
}

draw();
window.addEventListener("resize", draw);