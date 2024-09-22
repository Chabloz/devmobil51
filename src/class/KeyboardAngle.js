import Keyboard from "./Keyboard.js";

export default class KeyboardAngle extends Keyboard {

  getAngle() {
    if (this.isKeysDown('KeyA', 'KeyW')) return Math.PI * 0.25;
    if (this.isKeysDown('KeyA', 'KeyS')) return Math.PI * 1.75;
    if (this.isKeysDown('KeyD', 'KeyW')) return Math.PI * 0.75;
    if (this.isKeysDown('KeyD', 'KeyS')) return Math.PI * 1.25;
    if (this.isKeyDown('KeyS')) return Math.PI * 1.5;
    if (this.isKeyDown('KeyD')) return Math.PI;
    if (this.isKeyDown('KeyW')) return Math.PI * 0.5;
    if (this.isKeyDown('KeyA')) return 0;
    return false;
  }

}