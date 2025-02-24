import * as G from "./graphics.js";
import { Input, Player } from "./players.js";
import { Track } from "./track.js";
import { State } from "./state.js";
import { Vec2 } from "./vector.js";
import { CollisionBody, Powerup } from "./collisionBody.js";


let nonGamepadPlayers = 0;
// players.push(new Player(Input.fromMachine({
//     vel(self) {
//         return [0.001, 0];
//     }
// })));
const wsadPlayer = new Player(Input.fromKeys("KeyW", "KeyA", "KeyS", "KeyD"));
const arrowPlayer = new Player(Input.fromKeys("ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"));
State.players.push(wsadPlayer);
State.players.push(arrowPlayer);
State.registerCollider(wsadPlayer);
State.registerCollider(arrowPlayer);
nonGamepadPlayers += 2;


window.addEventListener("gamepadconnected", (e) => {
    let newPlayer = new Player(Input.fromGamepad(e.gamepad), e.gamepad.index)
    State.players.push(newPlayer);
    State.registerCollider(newPlayer)
});
window.addEventListener("gamepaddisconnected", (e) => {
    for (let i = 0; i++; i < State.players.length()) {
        const player = State.players[i + nonGamepadPlayers];
        if (player.getIndex() == e.gamepad.index) {
            // remove player from player array
            State.players = State.players.splice(i, 1);
            
        }
    }
});


function draw() {
    G.clear("#d9b962");

    G.setLineCap(G.CapStyle.ROUND);

    // drawRoad([[0.5, 0], [0.5, 0.5], [1.0, 0.5]]);
    State.track.draw();


    for (const collisionBody of State.collisionBodies) {
        G.setFill(collisionBody.color);
        drawBox(collisionBody.position, collisionBody.height, collisionBody.width, 0);
    }


    for (const player of State.players) {
        // create a square and get the players positions
        G.setFill(player.color);
        drawBox(player.position, 0.1 * 0.75, 0.05 * 0.75, player.direction);
        G.setFill("#ff0000");
        G.fillCircle(Vec2.sum(player.position, Vec2.rotate([0.05, 0], player.direction)), 0.01);
        G.setFill("#00ffff");
        G.fillCircle(Vec2.sum(player.position, Vec2.scale(player.velocity, 10)), 0.01);
        //G.fillRect([player.getX() - 0.025, player.getY() - 0.025], 0.05, 0.05);
    }

    G.maskEdge();
}

// new CollisionBody([0, -.4], 0.2, 0.2);
new Powerup([.2, -.5], 0.2, 0.2, "frictionless", 5);
new Powerup([-.2, -.5], 0.2, 0.2, "speed", 5);


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

// const track = new Track(
//     [ [-1.2, -0.5], /* [0, -0.5], */ [1.2, -0.5], [1.2, 0.5], /* [0, 0.5], */ [-1.2, 0.5] ], // pins
//     [ [0.25, -0.25], /* [0.25, 0], */ [0.25, 0.25], [-0.25, 0.25], /* [-0.25, 0], */ [-0.25, -0.25] ] // tangents
// );

State.track = Track.parse(
    `-3.43	-4.1
-7.3	-1.84
-7.47	4.06
0.13	2.7
7.52	1.76
7.57	-1.83
3.42	-4.51`,
    `-7.28	-4.44
-6.29	-0.18
-5.65	4.87
2.83	7.37
3.34	-0.17
9.1	-2.62
0.85	-3`
);


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

    for (const player of State.players) {
        player.update(delta);
    }
    State.checkCollisions();
    lastTime = timestamp;
    draw();
    requestAnimationFrame(updateGame);
}



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
