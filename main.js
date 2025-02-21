import * as G from "./graphics.js";
import { Input, Player, MachinePlayer } from "./players.js";
import { Track } from "./track.js";
import { State } from "./state.js";
import { Vec2 } from "./vector.js";

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
let  players = [];
let nonGamepadPlayers = 0;
// players.push(new MachinePlayer());

players.push(new Player(Input.fromKeys("KeyW", "KeyA", "KeyS", "KeyD")));
players.push(new Player(Input.fromKeys("ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight")));
nonGamepadPlayers += 2;


window.addEventListener("gamepadconnected", (e) => {
    console.log(e.gamepad);
    players.push(new Player(Input.fromGamepad(e.gamepad), e.gamepad.index));
});
window.addEventListener("gamepaddisconnected", (e) => {
    console.log(players)
    for (let i = 0; i++; i < players.length()) {
        const player = players[i + noneGamepadPlayers];
        if (player.getIndex() == e.gamepad.index) {
            // remove player from player array
            players = players.splice(i, 1);
            
        }
    }
    console.log(players)
    console.log("a player left");
    // location.reload();
});



function draw() {
    G.clear("#d9b962");

    G.setLineCap(G.CapStyle.ROUND);

    // drawRoad([[0.5, 0], [0.5, 0.5], [1.0, 0.5]]);
    track.draw();

    for (const player of players) {
        // create a square and get the players positions
        G.setFill(player.color);
        drawBox(player.position, 0.1, 0.05, player.direction);
        //G.fillRect([player.getX() - 0.025, player.getY() - 0.025], 0.05, 0.05);
    }

    G.maskEdge();
}

function drawBox([x, y], w, h, dir) {
    G.beginPath();
    const verts = [
        [w / 2, -h / 2],
        [-w / 2, -h / 2],
        [-w / 2, h / 2],
        [w / 2, h / 2]
    ].map(v => Vec2.sum(Vec2.rotate(v, dir), [x, y]));
    G.moveTo(verts[0]);
    G.lineTo(verts[1]);
    G.lineTo(verts[2]);
    G.lineTo(verts[3]);
    G.fill();
}

const track = new Track(
    [ [-1.2, -0.5], /* [0, -0.5], */ [1.2, -0.5], [1.2, 0.5], /* [0, 0.5], */ [-1.2, 0.5] ], // pins
    [ [0.25, -0.25], /* [0.25, 0], */ [0.25, 0.25], [-0.25, 0.25], /* [-0.25, 0], */ [-0.25, -0.25] ] // tangents
);

State.track = track;

function drawRoad(points) {
    // Black road
    G.beginPath();
    G.setLineDash([]);

    G.setStroke("#16161a");
    G.setLineWidth(0.1);
    G.moveTo([0, 0]);
    G.bezierTo(...points);
    G.stroke();

    G.setStroke("#272747");
    G.setLineWidth(0.08);
    G.moveTo([0, 0]);
    G.bezierTo(...points);
    G.stroke();

    

    // Yellow dashes
    G.beginPath();
    G.setLineDash([0.02, 0.04]);
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
