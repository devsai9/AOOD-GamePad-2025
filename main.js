import * as G from "./graphics.js";
import { Input, Player } from "./players.js";

/*

- Palette for different biomes -
[Plains]
bg: #8de645

[Desert]
bg: #d9b962

*/

/** @type { Player[] } */
const players = [];

window.addEventListener("gamepadconnected", (e) => {
    players.push(new Player(e.gamepad.index, {}));
});


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
    draw();
    requestAnimationFrame(updateGame);
}

// testGamepadInput();

// function testGamepadInput() {
//     console.log("attempting to connect to gamepad...");
//     window.addEventListener("gamepadconnected", (e) => {
//     console.log(
//         "Gamepad connected at index %d: %s. %d buttons, %d axes.",
//         e.gamepad.index,
//         e.gamepad.id,
//         e.gamepad.buttons.length,
//         e.gamepad.axes.length,
//     );
//     });
// }

// function GamepadTest() {
// 	const self = this;

// 	let pads = [];

//     pads = [...navigator.getGamepads()]
//         .filter(p => p)
//         .map(pad => ({
//             index: pad.index,
//             id: pad.id,
//             mapping: pad.mapping,
//             axes: pad.axes,
//             buttons: [...pad.buttons].map(b => ({
//                 pressed: b.pressed,
//                 touched: b.touched,
//                 value: b.value
//             })),
//             vibrationActuator: pad.vibrationActuator
//         }))
//         ;
//     console.log(`updated: ${new Date()}\n${JSON.stringify(pads, null, 2)}`);
//     if (pads.length > 0) {
//         const p0 = pads[0];
//         if (p0.buttons[2].pressed) {
//             p0.vibrationActuator.playEffect('dual-rumble', {
//                 startDelay: 0,
//                 duration: 100,
//                 weakMagnitude: 0.0,
//                 strongMagnitude: 1.0,
//             });
//         }
//         if (p0.buttons[3].pressed) {
//             p0.vibrationActuator.playEffect('dual-rumble', {
//                 startDelay: 0,
//                 duration: 100,
//                 weakMagnitude: 1.0,
//                 strongMagnitude: 0.0,
//             });
//         }
//     }
// }

// setInterval(GamepadTest, 20);