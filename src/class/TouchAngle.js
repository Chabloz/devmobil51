import { TAU } from '/utils/math.js';

export default class TouchAngle {

  constructor({
    domElement = window,
    reverse = true,
  } = {}) {
    domElement.addEventListener('touchstart', evt => this.#onTouchStart(evt));
    domElement.addEventListener('touchmove', evt => this.#onTouchMove(evt), {passive: false});
    domElement.addEventListener('touchend', evt => this.#onTouchEnd(evt));
    this.startX = 0;
    this.startY = 0;
    this.angle = false;
    this.reverse = reverse;
  }

  getAngle() {
    return this.angle;
  }

  #onTouchStart(event) {
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  }

  #onTouchMove(event) {
    event.preventDefault();
    const endX = event.touches[0].clientX;
    const endY = event.touches[0].clientY;
    const diffX = endX - this.startX;
    const diffY = endY - this.startY;
    this.angle = Math.atan2(diffY, diffX);
    if (this.reverse) {
      this.angle = (this.angle + Math.PI) % (TAU);
    };
  }

  #onTouchEnd(event) {
    this.angle = false;
  }
}