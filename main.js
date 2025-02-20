import * as G from "./graphics.js";
import { Input, Player } from "./players.js";

/*

- Palette for different biomes -
[Plains]
bg: #8de645

[Desert]
bg: #d9b962

*/

/*
{
    type: GAMEPAD || KEYBOARD
    object: gamepadIndex || key bindings
}



    player.update() {
    if input.type == GAMEPAD {
    //
    }
    elif
    }

    */

/** @type { Player[] } */
const players = [];

window.addEventListener("gamepadconnected", (e) => {
    players.push(new Player(Input.fromGamepad(e.gamepad), e.gamepad.index));
});

players.push(new Player(Input.fromKeys("KeyW", "KeyA", "KeyS", "KeyD")));


function draw() {
    G.clear("#d9b962");

    G.setLineCap(G.CapStyle.ROUND);

    drawRoad([[0.5, 0], [0.5, 0.5], [1.0, 0.5]]);

    // Squares
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

    for (const player of players) {
        // create a square and get the players positions
        G.setFill(player.color);
        G.fillRect([player.getX(), player.getY()], 0.1, 0.1);
    }

    G.maskEdge();
}

function drawRoad(points) {
    // Black road
    G.beginPath();
    G._ctx().setLineDash([]);
    G.setStroke("#000000");
    G.setLineWidth(0.1);
    G.moveTo([0, 0]);
    G.bezierTo(...points);
    G.stroke();

    // Yellow dashes
    G.beginPath();
    G._ctx().setLineDash([10, 20]);
    G.setStroke("#ffff00");
    G.setLineWidth(0.008);
    G.moveTo([0, 0]);
    G.bezierTo(...points);
    G.stroke();
}

draw();
window.addEventListener("resize", draw);





let lastTime;
requestAnimationFrame(updateGame);


function updateGame(timestamp) {
    if (!lastTime) {
        lastTime = timestamp;
    }
    const delta = timestamp - lastTime;

    for (const player of players) {
        player.update(delta);
    }
    lastTime = timestamp;
    draw();
    requestAnimationFrame(updateGame);
}
