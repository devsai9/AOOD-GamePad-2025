import { Keyboard } from "./keyboard.js";

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
   }
};

export class Player {
   inputInfo;
   color = "#f826b9";
   position = [0, 0];
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


      // let lastTime = Date.now();
      // setInterval(() => {
      //    const now = Date.now();
      //    const dt = now - lastTime;
      //    lastTime = now;

      //    const speed = 0.001 * dt;

      //    console.log(this.gamepad.axes);

      // }, 200);
   }

   update(delta) {
      let diffX = delta * this.inputInfo.x() * .001;
      let diffY = delta * this.inputInfo.y() * .001;
      this.position[0] += diffX;
      this.position[1] += diffY;
      if (this.position[0] > 1.5) {
         this.vibrate();
         this.position[0] = 1.5;
      }
      if (this.position[0] < -1.5) {
         this.vibrate();
         this.position[0] = -1.5;
      }
      if (this.position[1] > .5) {
         this.vibrate();
         this.position[1] = .5;
      }
      if (this.position[1] < -.5) {
         this.vibrate();
         this.position[1] = -.5;
      }
   }

   vibrate() {
      // fix this
      const gamepad = this.inputInfo.toGamepad();
      if (gamepad === null) return;
      gamepad.vibrationActuator.playEffect("dual-rumble", {
         startDelay: 0,
         duration: 100,
         weakMagnitude: 1.0,
         strongMagnitude: 0.0,
      });
   }

   getX() {
      return this.position[0];
   }

   getY() {
      return this.position[1];
   }
}