export const State = {
    /** @type { import("./track.js").Track } */
    track: null,
    collisionBodies: [],
    /** @type { import("./players.js").Player[] } */
    players: [],
    colliders: [],

    registerCollisionBody(body) {
        this.collisionBodies.push(body);
    },

    unregisterCollisionBody(body) {
        this.collisionBodies.splice(this.collisionBodies.indexOf(body), 1);
    },

    registerCollider(collider) {
        this.colliders.push(collider);
    },

    unregisterCollider(collider) {
        console.log(this.colliders)
        this.colliders.splice(this.colliders.indexOf(collider), 1);
        console.log(this.colliders)
    },

    checkCollisions() {
        const colliderWidth = 0.1 * 0.75;
        const colliderHeight = 0.05 * 0.75;

        // collider = player
        for (const collider of this.colliders) {
            for (const collisionBody of this.collisionBodies) {
                if (collisionBody.getEnabled && !collisionBody.getEnabled()) continue;
                if (
                    collisionBody.shape == "square" &&
                    rectanglesColliding(
                        collider.position,
                        colliderWidth,
                        colliderHeight,
                        collisionBody.position,
                        collisionBody.width,
                        collisionBody.height,
                    )
                ) {
                    collisionBody.handleCollision(collider);
                } else if (
                    collisionBody.shape == "circle" &&
                    rectangleCircleColliding(
                        collider.position,
                        colliderWidth,
                        colliderHeight,
                        collisionBody.position,
                        collisionBody.radius,
                    )
                ) {
                    collisionBody.handleCollision(collider);
                }
            }
        }
        // check player-player collisions
        const checkedPlayers = [];
        for (const collider of this.colliders) {
            checkedPlayers.push(collider);
            for (const otherCollider of this.colliders) {
                if (checkedPlayers.includes(otherCollider)) continue;
                if (collider === otherCollider) continue;

                if (
                    rectanglesColliding(
                        collider.position,
                        colliderWidth,
                        colliderHeight,
                        otherCollider.position,
                        colliderWidth,
                        colliderHeight,
                    )
                ) {
                    // this is on a timer set in handleCollision
                    if (!collider.isColliding()) {
                        collider.handleCollision(otherCollider);
                        otherCollider.handleCollision(collider);
                    }
                }

                checkedPlayers.push(otherCollider);
            }
        }
    },

    registerScoreboard(scoreboard) {
        this.scoreboard = scoreboard;
        scoreboard.updateScores();
    }
};

function rectanglesColliding([x1, y1], w1, h1, [x2, y2], w2, h2) {
    return (
        x1 - w1 / 2 <= x2 + w2 / 2 &&
        x1 + w1 / 2 >= x2 - w2 / 2 &&
        y1 - h1 / 2 <= y2 + h2 / 2 &&
        y1 + h1 / 2 >= y2 - h2 / 2
    );
}

function rectangleCircleColliding([rectX, rectY], rectW, rectH, [circleX, circleY], radius) {
    let cx = circleX - radius;
    let cy = circleY - radius;
    let rx = rectX - rectW / 2;
    let ry = rectY - rectH / 2;

    let testX = cx;
    let testY = cy;

    if (cx < rx) testX = rx; // left edge
    else if (cx > rx + rectW) testX = rx + rectW; // right edge
    if (cy < ry) testY = ry; // top edge
    else if (cy > ry + rectH) testY = ry + rectH; // bottom edge


    // calc hypotenuse
    let distX = cx - testX;
    let distY = cy - testY;
    let distance = Math.sqrt((distX * distX) + (distY * distY));

    if (distance <= radius) {
        return true;
    }
    return false;
}


export class Scoreboard {
    constructor(element) {
        this.element = element;
    }

    updateScores() {
        let output = "";
        for (const player of State.colliders) {
            output += `<span style="background-color: ${player.color}">Score: ${player.laps}</span><br>`;
        }
        this.element.innerHTML = output;
    }
}