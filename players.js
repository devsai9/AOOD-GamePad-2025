import { Keyboard } from "./keyboard.js";
import { Vec2 } from "./vector.js";
import { State } from "./state.js";
import { cubicBezier, cubicBezierTangent } from "./track.js";

/** @typedef {{ update: (self: Player, delta: number) => void }} InputMethod */
/** @typedef {{ vel: (self: Player) => Vec2 }} RawInputSource */

const TURN_THRESHOLD = 0.003;

const playerOffsets = [1, -1, 3, -3];

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
            if (!actual) return;
            const x = actual.axes[0];
            const y = actual.axes[1];
            // console.log("Gamepad", x, y);

            const diffX = delta * x * .00001;
            const diffY = delta * y * .00001;

            self.velocity[0] += diffX;
            self.velocity[1] += diffY;

            self.calculateDir();
        },
    }),
    /** @type { (inputSrc: RawInputSource) => InputMethod } */
    fromMachine: (inputSrc) => ({
        /**
         * @param { Player } self 
         */
        update(self, delta) {
            const v = inputSrc.vel(self);
            self.velocity[0] = v[0] * delta;
            self.velocity[1] = v[1] * delta;
            self.calculateDir();
        },
    }),
};

function playSfx() {
    const audio = new Audio("sound.mp3");
    audio.play();
}

let playerCount = 0;
const PLAYER_BEGIN = 0.06;

export class Player {
    color = "#f826b9";
    id = -1;

    position = [0, -0.6];
    velocity = [0, 0];

    colliding = false;
    speedMultiplier = 1;
    frictionLess = false;
    activePowerups = {};

    pendingCheckpoint = -1;
    committedCheckpoint = 0;

    laps = 0;

    /**
     * @param { InputMethod } inputMethod
     */
    constructor(inputMethod, id) {
        this.id = id;
        this.inputMethod = inputMethod;
        this.weight = 0.02;
        this.direction = Math.PI;
        this.color = "#" + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, "0");
        //this.position[1] -= playerCount * .07;
        const pins = State.track.pins;
        const tangents = State.track.tangents;
        const basePosition = cubicBezier(
            PLAYER_BEGIN,
            pins[0],
            Vec2.sum(pins[0], tangents[0]),
            Vec2.diff(pins[1], tangents[1]),
            pins[1]
        );
        const offset = Vec2.perp(Vec2.norm(cubicBezierTangent(
            PLAYER_BEGIN,
            pins[0],
            Vec2.sum(pins[0], tangents[0]),
            Vec2.diff(pins[1], tangents[1]),
            pins[1]
        )));

        this.position = Vec2.sum(basePosition, Vec2.scale(offset, playerOffsets[playerCount] * 0.03));

        playerCount++;
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
        if (State.status !== "running") return;
        this.position[0] += this.velocity[0] * this.speedMultiplier;
        this.position[1] += this.velocity[1] * this.speedMultiplier;
        this.processCheckpoint();
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

        // punish them somehow, other than this
        this.velocity = [0, 0];

        setTimeout(() => {
            this.colliding = false;
        }, 1500);
    }

    activatePowerup(type, duration) {
        playSfx();
        if (this.activePowerups[type]) {
            clearTimeout(this.activePowerups[type].timeoutId);
            this.extendPowerup(type, duration);
        } else {
            this.startPowerup(type, duration);
        }
    }

    startPowerup(type, duration) {
        switch (type) {
            case "speed":
                this.speedMultiplier *= 2;
                this.activePowerups[type] = {
                    timeoutId: setTimeout(() => {
                        this.speedMultiplier /= 2;
                        delete this.activePowerups[type];
                    }, duration * 1000),
                    endTime: Date.now() + duration * 1000
                };
                break;
            case "shield":
                this.colliding = true;
                this.activePowerups[type] = {
                    timeoutId: setTimeout(() => {
                        this.colliding = false;
                        delete this.activePowerups[type];
                    }, duration * 1000),
                    endTime: Date.now() + duration * 1000
                };
                break;
            case "frictionless":
                this.frictionLess = true;
                this.activePowerups[type] = {
                    timeoutId: setTimeout(() => {
                        this.frictionLess = false;
                        delete this.activePowerups[type];
                    }, duration * 1000),
                    endTime: Date.now() + duration * 1000
                };
                break;
            default:
                break;
        }
    }

    extendPowerup(type, duration) {
        const remainingTime = this.activePowerups[type].endTime - Date.now();
        const newDuration = remainingTime / 1000 + duration; // Calculate new total duration

        switch (type) {
            case "speed":
                clearTimeout(this.activePowerups[type].timeoutId);
                this.activePowerups[type] = {
                    timeoutId: setTimeout(() => {
                        this.speedMultiplier /= 2;
                        delete this.activePowerups[type];
                    }, newDuration * 1000),
                    endTime: Date.now() + newDuration * 1000
                };
                break;
            case "shield":
                clearTimeout(this.activePowerups[type].timeoutId);
                this.activePowerups[type] = {
                    timeoutId: setTimeout(() => {
                        this.colliding = false;
                        delete this.activePowerups[type];
                    }, newDuration * 1000),
                    endTime: Date.now() + newDuration * 1000
                };
                break;
            case "frictionless":
                clearTimeout(this.activePowerups[type].timeoutId);
                this.activePowerups[type] = {
                    timeoutId: setTimeout(() => {
                        this.frictionLess = false;
                        delete this.activePowerups[type];
                    }, newDuration * 1000),
                    endTime: Date.now() + newDuration * 1000
                };
                break;
            default:
                break;
        }
    }

    verifyCheckpoint(checkOld, checkNew) {
        console.log("checking")
        if (checkOld === State.track.pins.length - 1) {
            this.laps++;
            if (this.laps === 2) {
                State.gameOver();
            }
            console.log("next lap");
            return checkNew === 0;
        }
        return checkNew === checkOld + 1;
    }

    processCheckpoint() {
        const checkpoint = State.track.queryCheckpoint(this.position);
        //console.log(checkpoint);
        if (checkpoint === -1) {
            if (this.pendingCheckpoint === -1) return;
            // Successfully collected a checkpoint
            const checkNew = this.pendingCheckpoint;
            State.track.status[checkNew] = 1;
            this.pendingCheckpoint = -1;
            if (this.verifyCheckpoint(this.committedCheckpoint, checkNew)) {
                this.committedCheckpoint = checkNew;
            }
            else {
                console.log("failure")
                this.committedCheckpoint = 0;
            }
            State.scoreboard.updateScores();
        }
        else {
            this.pendingCheckpoint = checkpoint;
        }

    }


    passedCheckpoint(number) {
        //console.log("Congratutaliatnos! You passed the checkpoint, of the number " + number);
    }
}
