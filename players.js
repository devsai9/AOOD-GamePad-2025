import { Keyboard } from "./keyboard.js";
import { Vec2 } from "./vector.js";
import { State } from "./state.js";

/**
 * @typedef {{ x: () => number, y: () => number, toGamepad: () => Gamepad }} InputInfo
 */

export const Input = {
   fromKeys(up, left, down, right) {
      return {
         x() {
            const dirLeft = Keyboard.pressed(left) ? -1 : 0;
            const dirRight = Keyboard.pressed(right) ? 1 : 0;
            return dirLeft + dirRight;
         },
         y() {
            const dirUp = Keyboard.pressed(up) ? -1 : 0;
            const dirDown = Keyboard.pressed(down) ? 1 : 0;
            return dirUp + dirDown;
         },
         toGamepad() {
            return null;
         }
      };
   },
   /** @param { Gamepad } gamepad */
   fromGamepad(gamepad) {
      const index = gamepad.index;
      return {
         x: () => navigator.getGamepads()[index].axes[0],
         y: () => navigator.getGamepads()[index].axes[1],
         toGamepad: () => navigator.getGamepads()[index]
      };
   },
   fromMachine(x, y) {
      return {
         x: () => x,
         y: () => y,
         toGamepad: () => null
      };
   }
};

function shortAngleDist(start, end) {
   const cycle = 2 * Math.PI;
   const a = (end - start) % cycle;
   return 2 * a % cycle - a;
} 

function cap(x, limit) {
   limit = Math.abs(limit);
   return Math.min(limit, Math.max(x, -limit));
}

export class Player {
   inputInfo;
   color = "#f826b9";
   position = [0, -0.7];
   velocity = [0, 0];
   gamepadIndex;

   /**
    * @param { InputInfo } inputInfo
    */
   // constructor(inputInfo) {
   //    this.inputInfo = inputInfo;
   // }
   constructor(inputInfo, gamepadIndex) {
      this.gamepadIndex = gamepadIndex;
      this.inputInfo = inputInfo;
      this.weight = 0.02;
      this.direction = 0;
      this.color = "#" + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, "0");
   }

   getIndex() {
      return this.gamepadIndex;
   }

   applyFriction() {
      if (Vec2.len(this.velocity) === 0) return;
      const dir = this.velocity;//Vec2.norm(this.velocity);
      const friction = Vec2.scale(dir, this.weight * (State.track.isOnTrack(this.position) ? 1 : 5));
      if (Vec2.len(friction) > Vec2.len(this.velocity)) {
         this.velocity[0] = 0;
         this.velocity[1] = 0;
         return;
      }
      this.velocity[0] -= friction[0];
      this.velocity[1] -= friction[1];
   }

   update(delta) {
      let diffX = delta * this.inputInfo.x() * .00001;
      let diffY = delta * this.inputInfo.y() * .00001;

      this.position[0] += this.velocity[0];
      this.position[1] += this.velocity[1];

      this.velocity[0] += diffX;
      this.velocity[1] += diffY;

      this.applyFriction();

      const v = this.velocity;
      const dirNew = Math.atan2(v[1], v[0]);
      this.direction += cap(shortAngleDist(dirNew, this.direction), 0.05);
      
      this.avoidBorders();
   }

   avoidBorders() {
      if (this.position[0] > 16/9) {
         this.vibrate();
         this.position[0] = 16/9;
      }
      if (this.position[0] < -16/9) {
         this.vibrate();
         this.position[0] = -16/9;
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

   /**
    * 
    */
   vibrate() {
      // fix this
      const gamepad = this.inputInfo.toGamepad();
      if (gamepad === null) return;
      if (gamepad.vibrationActuator === undefined || gamepad.vibrationActuator === null) return;
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
}

export class MachinePlayer extends Player {
   constructor() {
      super(null, null);
      setInterval(() => {
         console.log("AI Player Engaged")
      }, 10);
   }

   update(delta) {
      // add fake user input
      super.update(delta);
   }
}