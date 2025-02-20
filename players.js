/**
 * @typedef {{ forward: () => number, reverse: () => number, left: () => number, right: () => number }}
 */


function keyMask(keys) {
   eturn
}
export const Input = {
   fromKeys(up, left, down, right) {
      return {
         forward: () => {

         }
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
   constructor(gamepadIndex, inputInfo) {
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
      let gamepad = navigator.getGamepads()[this.gamepadIndex];
      if (this.axes != gamepad.axes) {
         console.log(gamepad.axes);
      }
      let diffX = delta * gamepad.axes[0] * .000005;
      let diffY = delta * gamepad.axes[1] * .000005;
      this.position[0] += diffX;
      this.position[1] += diffY;
      if (this.position[0] > 1.5) {
         vibrate();
         this.position[0] = 1.5;
      }
      if (this.position[0] < -1.5) {
         vibrate();
         this.position[0] = -1.5;
      }
      if (this.position[1] > .5) {
         vibrate();
         this.position[1] = .5;
      }
      if (this.position[1] < -.5) {
         vibrate();
         this.position[1] = -.5;
      }
      this.axes = gamepad.axes;
   }

   vibrate() {
      navigator.getGamepads()[this.gamepadIndex].vibrationActuator.playEffect('dual-rumble', {
                      startDelay: 0,
                      duration: 100,
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