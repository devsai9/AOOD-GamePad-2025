import { State } from "./state.js";

export class CollisionBody {
    shape = "square";
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

    x() {
        return this.position.x;
    }

    y() {
        return this.position.y;
    }
}

export class Checkpoint extends CollisionBody {
    constructor(position, radius, checkpointNumber) {
        super(position, radius * 2, radius * 2);
        this.shape = "circle";
        this.radius = radius;
        this.checkpointNumber = checkpointNumber;
    }

    handleCollision(player) {
        player.passedCheckpoint(this.checkpointNumber);
    }
}

export const powerupTypes = ["speed", "shield", "frictionless"];

export class Powerup extends CollisionBody {
    /** 
     * @param {Vec2} position
     * @param {number} width
     * @param {number} height
     * @param {string} type
     * @param {number} durationSeconds
     * @param {number} usageTimes
     * @param {number} regenerateTimeSeconds
    */
    constructor(position, width, height, type, durationSeconds, usageTimes, regenerateTimeSeconds) {
        super(position, width, height);
        this.type = type;
        this.durationSeconds = durationSeconds;
        this.usageTimes = usageTimes;
        this.regenerateTimeSeconds = regenerateTimeSeconds;
        this.enabled = true;

        this.determineColor();
    }

    handleCollision(player) {
        player.activatePowerup(this.type, this.durationSeconds);
        this.usageTimes--;
        if (this.usageTimes == 0) super.remove();
        this.enabled = false;
        this.color = "#00000000";
        setTimeout(() => {
            this.enabled = true;
            this.determineColor();
        }, this.regenerateTimeSeconds * 1000)
    }

    getEnabled() {
        return this.enabled;
    }

    determineColor() {
        if (this.type === "speed") {
            this.color = "green";
        } else if (this.type === "shield") {
            this.color = "blue";
        } else if (this.type === "frictionless") {
            this.color = "yellow";
        }
    }
}