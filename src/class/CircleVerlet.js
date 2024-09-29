import Circle from './Circle.js';
import { TAU } from '../utils/math.js';

export default class CircleVerlet extends Circle {

  constructor({
    x,
    y,
    r,
    color,
    dir = 0,
    dt = 1000/60,
    speed = 1,
  }) {
    super({x, y, r, dir, speed, color});
    this.lastX = x;
    this.lastY = y;
    this.dir = this.dir - TAU / 2;
    super.move(-dt);
    this.accelX = 0;
    this.accelY = 0;
  }

  move(dt) {
    // verlet integration fomrula : x = x + x - lastX + forceX * dt * dt

    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;

    this.lastX = this.x;
    this.lastY = this.y;

    this.y += dy + this.accelY * dt * dt;
    this.x += dx + this.accelX * dt * dt;

    this.accelX = 0;
    this.accelY = 0;
  }

  applyAccelX(forceX) {
    this.accelX += forceX;
  }

  applyAccelY(forceY) {
    this.accelY += forceY;
  }

  circleCollision(c) {
    const distance = this.distanceTo(c);
    if (distance > this.r + c.r) return;

    const angle = Math.atan2(c.y - this.y, c.x - this.x);
    const overlap = this.r + c.r - distance;
    const dx = Math.cos(angle) * overlap / 2;
    const dy = Math.sin(angle) * overlap / 2;
    this.x -= dx;
    this.y -= dy;
    c.x += dx;
    c.y += dy;
  }

  boxConstraint(width, height) {
    if (this.y + this.r > height) {
      const dy = this.y - this.lastY;
      this.y = height - this.r ;
      this.lastY = this.y + dy;
    } else if (this.y - this.r < 0) {
      const dy = this.y - this.lastY;
      this.y = this.r;
      this.lastY = this.y + dy;
    }

    if (this.x + this.r > width) {
      const dx = this.x - this.lastX;
      this.x = width - this.r;
      this.lastX = this.x + dx;
    } else if (this.x - this.r < 0) {
      const dx = this.x - this.lastX;
      this.x = this.r;
      this.lastX = this.x + dx;
    }
  }

}