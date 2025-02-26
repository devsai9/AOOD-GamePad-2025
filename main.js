import * as G from "./graphics.js";
import { Input, Player } from "./players.js";
import { Track } from "./track.js";
import { State, Scoreboard, Stopwatch } from "./state.js";
import { Vec2 } from "./vector.js";
import { CollisionBody, Powerup, powerupTypes } from "./collisionBody.js";

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

let nonGamepadPlayers = 0;

// let machinePlayer = new Player(Input.fromMachine({
//     vel(self) {
//         const targetPoint = State.track.getNearestPoint(self.position);
//         const directionToTarget = Vec2.norm(Vec2.diff(targetPoint, self.position));
//         const forwardVelocity = Vec2.scale(directionToTarget, 0.1);
//         return forwardVelocity;
//     }
// }));
// State.players.push(machinePlayer);

let scoreboardElement = document.querySelector(".scoreboard");
let scoreboard = new Scoreboard(scoreboardElement);
State.registerScoreboard(scoreboard);

let stopwatchElement = document.querySelector(".stopwatch");
let stopwatch = new Stopwatch(stopwatchElement);
State.stopwatch = stopwatch;

const readyButton = document.querySelector(".ready");
readyButton.addEventListener("click", function() {
    if (State.players.length === 0) {
        alert("You need at least one player to start");
        return;
    }
    State.status = "running";
    this.style.display = "none";
    init();
});

const keyboardPlayers = {};

document.body.addEventListener("keydown", (e) => {
    if (State.status !== "pending") return;
    const key = e.code;
    switch (key) {
        case "KeyW":
        case "KeyA":
        case "KeyS":
        case "KeyD":
            if (keyboardPlayers.wasd) return;
            console.log("wasd")
            keyboardPlayers.wasd = new Player(Input.fromKeys("KeyW", "KeyA", "KeyS", "KeyD"), 0);
            State.players.push(keyboardPlayers.wasd);
            State.registerCollider(keyboardPlayers.wasd);
            break;
        case "ArrowUp":
        case "ArrowLeft":
        case "ArrowDown":
        case "ArrowRight":
            if (keyboardPlayers.arrow) return;
            keyboardPlayers.arrow = new Player(Input.fromKeys("ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"), 0);
            State.players.push(keyboardPlayers.arrow);
            State.registerCollider(keyboardPlayers.arrow);
            break;
    }
});

function init() {
    State.scoreboard.players = null;
    State.scoreboard.updateScores();
    nonGamepadPlayers += 2;

    State.powerupInterval = window.setInterval(generatePowerup, 4000);
    stopwatch.start();
}

window.addEventListener("gamepadconnected", (e) => {
    if (State.status !== "pending") return;
    let newPlayer = new Player(Input.fromGamepad(e.gamepad), e.gamepad.index + nonGamepadPlayers);
    State.players.push(newPlayer);
    State.registerCollider(newPlayer);
    State.scoreboard.players = null;
    State.scoreboard.updateScores();
});

window.addEventListener("gamepaddisconnected", (e) => {
    State.unregisterCollider(State.players[e.gamepad.index + nonGamepadPlayers]);
    State.players.splice(e.gamepad.index + nonGamepadPlayers, 1);
    for (let i = 0; i < State.players.length; i++) {
        State.players[i].id = i;
    }
    State.scoreboard.players = null;
    State.scoreboard.updateScores();
});

function generatePowerup() {
    if (Math.random() < 1/4) {
        new Powerup(
            State.track.getNearestPoint([Math.random() * 2 - 1, Math.random() * 2 - 1]), 
            0.1, 0.1, 
            powerupTypes[Math.floor(Math.random() * powerupTypes.length)], 
            3, 1, 4);
    }
}

/**
 * Draws everything
 * *(CALLED EVERY FRAME)*
 */
function draw() {
    G.clear("#d9b962");

    G.setLineCap("round");

    // drawRoad([[0.5, 0], [0.5, 0.5], [1.0, 0.5]]);
    State.track.draw();

    for (const collisionBody of State.collisionBodies) {
        if (collisionBody.shape == "square") {
            G.setFill(collisionBody.color);
            drawBox(collisionBody.position, collisionBody.height, collisionBody.width, 0);
        }
        // else if (collisionBody.shape == "circle") {
        //     G.setFill("#f2b4fa66");
        //     G.fillCircle(collisionBody.position, collisionBody.radius);
        // }
    }

    for (const player of State.players) {
        // create a square and get the players positions
        G.setFill(player.color);
        drawBox(player.position, 0.1 * 0.75, 0.05 * 0.75, player.direction);
        // G.setFill("#ff0000");
        // G.fillCircle(Vec2.sum(player.position, Vec2.rotate([0.05, 0], player.direction)), 0.01);
        // G.setFill("#00ffff");
        // G.fillCircle(Vec2.sum(player.position, Vec2.scale(player.velocity, 10)), 0.01);
        //G.fillRect([player.getX() - 0.025, player.getY() - 0.025], 0.05, 0.05);
    }

    State.track.drawCheckpoints();

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

// const track = new Track(
//     [ [-1.2, -0.5], /* [0, -0.5], */ [1.2, -0.5], [1.2, 0.5], /* [0, 0.5], */ [-1.2, 0.5] ], // pins
//     [ [0.25, -0.25], /* [0.25, 0], */ [0.25, 0.25], [-0.25, 0.25], /* [-0.25, 0], */ [-0.25, -0.25] ] // tangents
// );

draw();
window.addEventListener("resize", draw);

let lastTime;
requestAnimationFrame(updateGame);

function updateGame(timestamp) {
    if (!lastTime) {
        lastTime = timestamp;
    }
    const delta = timestamp - lastTime;

    State.track.update(delta);
    for (const player of State.players) {
        player.update(delta);
    }
    State.checkCollisions();
    lastTime = timestamp;
    draw();

    stopwatch.update();    requestAnimationFrame(updateGame);
}

