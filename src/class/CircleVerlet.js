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
    speed = 0,
    sticky = false,
  }) {
    super({x, y, r, dir, speed, color});
    this.lastX = x;
    this.lastY = y;
    this.dir = this.dir - TAU / 2;
    super.move(-dt);
    this.accelX = 0;
    this.accelY = 0;
    this.sticky = sticky;
  }

  move(dt) {
    if (this.sticky) return;
    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;

    this.lastX = this.x;
    this.lastY = this.y;

    this.y += dy + this.accelY * dt * dt;
    this.x += dx + this.accelX * dt * dt;

    this.accelX = 0;
    this.accelY = 0;
  }

  applyForceX(forceX) {
    this.accelX += forceX;
  }

  applyForceY(forceY) {
    this.accelY += forceY;
  }

  circleCollision(c) {
    const distance = this.distanceTo(c);
    if (distance > this.r + c.r) return;

    const angle = Math.atan2(c.y - this.y, c.x - this.x);
    const overlap = this.r + c.r - distance;
    const dx = Math.cos(angle) * overlap / 2;
    const dy = Math.sin(angle) * overlap / 2;

    if (!this.sticky) {
      this.x -= dx;
      this.y -= dy;
    }
    if (!c.sticky) {
      c.x += dx;
      c.y += dy;
    }
  }

  boxConstraint(width, height) {
    const vX = Math.min(this.x - this.lastX, 1);
    const vY = Math.min(this.y - this.lastY, 1);

    if (this.y + this.r > height) {
      this.y = height - this.r ;
      this.lastY = this.y + vY;
    } else if (this.y - this.r < 0) {
      this.y = this.r;
      this.lastY = this.y + vY;
    }

    if (this.x + this.r > width) {
      this.x = width - this.r;
      this.lastX = this.x + vX;
    } else if (this.x - this.r < 0) {
      this.x = this.r;
      this.lastX = this.x + vX;
    }
  }

}