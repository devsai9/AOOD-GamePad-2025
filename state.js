export const State = {
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


    checkCollisions() {
        const colliderWidth = 0.1 * 0.75;
        const colliderHeight = 0.05 * 0.75;

        for (const collider of this.colliders) {
            for (const collisionBody of this.collisionBodies) {                
                if (boxColliding(collider.position, colliderWidth, colliderHeight, collisionBody.position, collisionBody.width, collisionBody.height)) {
                    console.log("player-item collision detected");
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


                if (boxColliding(collider.position, colliderWidth, colliderHeight, otherCollider.position, colliderWidth, colliderHeight)) {
                    console.log("player-player collision detected");
                    // this is on a timer set in handleCollision
                    if (!collider.isColliding()) {
                        collider.handleCollision(otherCollider);
                        otherCollider.handleCollision(collider);
                    }
                }

                checkedPlayers.push(otherCollider);
            }
        }
    }
};

function boxColliding([x1, y1], w1, h1, [x2, y2], w2, h2) {
    return (
        x1 - w1 / 2 <= x2 + w2 / 2 &&
        x1 + w1 / 2 >= x2 - w2 / 2 &&
        y1 - h1 / 2 <= y2 + h2 / 2 &&
        y1 + h1 / 2 >= y2 - h2 / 2
    )
}