export default class Keyboard {

  constructor({
    useCode = true,
    caseSensitive = true,
    domElement = window,
  } = {}) {
    domElement.addEventListener('keydown', evt => this.#onKeyDown(evt));
    domElement.addEventListener('keyup', evt => this.#onKeyUp(evt));
    this.keysPressed = new Set();
    this.caseSensitive = caseSensitive;
    this.codeOrKey = useCode ? 'code' : 'key';
  }

  #onKeyDown(evt) {
    let key = evt[this.codeOrKey];
    if (!this.caseSensitive) key = key.toUpperCase();
    this.keysPressed.add(key);
  }

  #onKeyUp(evt) {
    let key = evt[this.codeOrKey];
    if (!this.caseSensitive) key = key.toUpperCase();
    this.keysPressed.delete(key);
  }

  isKeyDown(key) {
    if (!this.caseSensitive) key = key.toUpperCase();
    return this.keysPressed.has(key);
  }

  isKeysDown(...keys) {
    return keys.every(key => this.isKeyDown(key));
  }

}