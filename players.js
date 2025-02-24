import { Keyboard } from "./keyboard.js";
import { Vec2 } from "./vector.js";
import { State } from "./state.js";

/** @typedef {{ update: (self: Player, delta: number) => void }} InputMethod */
/** @typedef {{ vel: (self: Player) => Vec2 }} RawInputSource */

const TURN_THRESHOLD = 0.003;

export const Input = {
    /** @type { (up: string, left: string, down: string, right: string) => InputMethod } */
    fromKeys: (up, left, down, right) => ({
        update(self, delta) {
            const x = (Keyboard.pressed(left) ? -1 : 0) +
                (Keyboard.pressed(right) ? 1 : 0);
            const y = (Keyboard.pressed(up) ? 1 : 0) +
                (Keyboard.pressed(down) ? -1 : 0);

            const len = Vec2.len(self.velocity);

            const [axialX, axialY] = Vec2.rotate(
                [0.00001 * y, 0],
                self.direction,
            );
            const [rotateX, rotateY] = Vec2.rotate([
                0.0000075 * x *
                (len > TURN_THRESHOLD ? 1 : ((len / TURN_THRESHOLD) ** 2)),
                0,
            ], self.direction + Math.PI / 2);

            self.velocity[0] += (axialX + rotateX) * delta;
            self.velocity[1] += (axialY + rotateY) * delta;

            const vel = self.velocity;
            if (Vec2.len(vel) === 0) return;
            const dir = Vec2.dir(self.direction);
            const align = Vec2.dot(dir, vel);
            self.calculateDir();
            if (align < 0) self.direction += Math.PI;
        },
    }),
    /** @type { (gamepad: Gamepad) => InputMethod } */
    fromGamepad: (gamepad) => ({
        index: gamepad.index,
        update(self, delta) {
            const actual = navigator.getGamepads()[this.index];
            const x = actual.axes[0];
            const y = actual.axes[1];
            console.log("Gamepad", x, y);

            const diffX = delta * x * .00001;
            const diffY = delta * y * .00001;

            self.velocity[0] += diffX;
            self.velocity[1] += diffY;

            self.calculateDir();
        },
    }),
    /** @type { (inputSrc: RawInputSource) => InputMethod } */
    fromMachine: (inputSrc) => ({
        update(self, delta) {
            const v = inputSrc.vel(self);
            self.velocity[0] = v.x * delta;
            self.velocity[1] = v.y * delta;
            self.calculateDir();
        },
    }),
};

let playerCount = 0;

export class Player {
    color = "#f826b9";

    position = [0, -0.6];
    velocity = [0, 0];

    colliding = false;
    speedMultiplier = 1;
    frictionLess = false;

    /**
     * @param { InputMethod } inputMethod
     */
    constructor(inputMethod) {
        playerCount++;
        this.inputMethod = inputMethod;
        this.weight = 0.02;
        this.direction = 0;
        this.color = "#" +
            (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, "0");
        this.position[1] -= playerCount * .07;
    }

    applyFriction() {
        if (Vec2.len(this.velocity) === 0) return;
        const dir = this.velocity; //Vec2.norm(this.velocity);
        const friction = Vec2.scale(
            dir,
            this.weight * (State.track.isOnTrack(this.position) ? 1 : (!this.frictionLess ? 5 : 1)),
        );
        if (Vec2.len(friction) > Vec2.len(this.velocity)) {
            this.velocity[0] = 0;
            this.velocity[1] = 0;
            return;
        }
        this.velocity[0] -= friction[0];
        this.velocity[1] -= friction[1];
    }

    calculateDir() {
        if (Vec2.len(this.velocity) === 0) return;
        this.direction = Math.atan2(this.velocity[1], this.velocity[0]);
    }

    update(delta) {
        this.position[0] += this.velocity[0] * this.speedMultiplier;
        this.position[1] += this.velocity[1] * this.speedMultiplier;
        this.inputMethod.update(this, delta);
        this.applyFriction();
        //this.direction += cap(shortAngleDist(dirNew, this.direction), 0.05);

        this.avoidBorders();
    }

    avoidBorders() {
        if (this.position[0] > 16 / 9) {
            this.vibrate();
            this.position[0] = 16 / 9;
        }
        if (this.position[0] < -16 / 9) {
            this.vibrate();
            this.position[0] = -16 / 9;
        }
        if (this.position[1] > 1) {
            this.vibrate();
            this.position[1] = 1;
        }
        if (this.position[1] < -1) {
            this.vibrate();
            this.position[1] = -1;
        }
    }

    /** */
    vibrate() {
        // fix this
        return;
        const gamepad = this.inputInfo.toGamepad();
        if (gamepad === null) return;
        if (
            gamepad.vibrationActuator === undefined ||
            gamepad.vibrationActuator === null
        ) return;
        gamepad.vibrationActuator.playEffect("dual-rumble", {
            startDelay: 0,
            duration: 200,
            weakMagnitude: 0.0,
            strongMagnitude: 1.0,
        });
    }

    getX() {
        return this.position[0];
    }

    getY() {
        return this.position[1];
    }

    isColliding() {
        return this.colliding;
    }

    handleCollision(otherCar) {
        if (this.colliding) return;
        this.colliding = true;
        console.log("collided");

        // punish them somehow, other than this
        this.velocity = [0, 0];

        setTimeout(() => {
            this.colliding = false;
        }, 1500);
    }

    activatePowerup(type, duration) {
        switch (type) {
            case "speed":
                this.speedMultiplier *= 2;
                setTimeout(() => {
                    console.log("speed powerup removed");
                    this.speedMultiplier /= 2;
                }, duration * 1000);
                break;
            case "shield":
                this.colliding = true;
                setTimeout(() => {
                    console.log("shield powerup removed");
                    this.colliding = false;
                }, duration * 1000);
                break;
            case "frictionless":
                this.frictionLess = true;
                setTimeout(() => {
                    console.log("frictionless powerup removed");
                    this.frictionLess = false;
                }, duration * 1000);
                break;
            default:
                console.log("powerup has no valid type");
                break;
        }
    }
}