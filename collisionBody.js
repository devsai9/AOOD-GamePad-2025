import { State } from "./state.js";

export class CollisionBody {
    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
        // collisionBodies.push(this);
        State.registerCollisionBody(this);
    }

    handleCollision(player) {
        console.log("player " + player + " has collided with self")
    }
    
    remove() {
        // collisionBodies.splice(collisionBodies.indexOf(this), 1);
        State.unregisterCollisionBody(this);
    }
}

export class Powerup extends CollisionBody {
    constructor(position, width, height, type, durationSeconds) {
        super(position, width, height);
        this.type = type;
        this.durationSeconds = durationSeconds;

        if (type === "speed") {
            this.color = "green";
        } else if (type === "shield") {
            this.color = "blue";
        } else if (type === "frictionless") {
            this.color = "yellow";
        }
    }

    handleCollision(player) {
        player.activatePowerup(this.type, this.durationSeconds);
        super.remove();
    }
}