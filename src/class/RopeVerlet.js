import Circle from './CircleVerlet.js';
import Link from './LinkVerlet.js';
import { randomHSL } from '../utils/color.js';
import { clamp } from '../utils/math.js';

export default class RopeVerlet {

  constructor({
    x1,
    y1,
    x2,
    y2,
    r = 10,
    strength = 1,
    color = 'random',
    endIsSticky = true,
    linkIsVisible = false,
  }) {
    this.circles = [];
    this.length = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);
    const nbCircles = Math.max(this.length / (r * 2) - 4, 2);
    this.color = color;
    for (let i = 0; i < nbCircles; i++) {
      const x = x1 + (x2 - x1) * i / (nbCircles + 1);
      const y = y1 + (y2 - y1) * i / (nbCircles + 1);
      const color = this.color === 'random' ? randomHSL() : this.color;
      this.circles.push(new Circle({x, y, r, color}));
    }
    this.circles[0].sticky = true;
    this.circles[this.circles.length - 1].sticky = endIsSticky;

    this.strength = clamp(strength, 0, 2 * r);
    this.links = [];
    for (let i = 0; i < this.circles.length - 1; i++) {
      this.links.push(new Link({
        obj1: this.circles[i],
        obj2: this.circles[i + 1],
        distance: 2 * r - this.strength,
        visible: linkIsVisible,
      }));
    }
  }

  applyForceY(forceY) {
    for (const c of this.circles) c.applyForceY(forceY);
  }

  applyForceX(forceX) {
    for (const c of this.circles) c.applyForceX(forceX);
  }

  circleCollision(otherCircle) {
    for (const c of this.circles) c.circleCollision(otherCircle);
  }

  update(dt) {
    for (const c of this.circles) c.move(dt);
    for (const l of this.links) l.update(dt);
  }

  draw(ctx) {
    for (const c of this.circles) c.draw(ctx);
    for (const l of this.links) l.draw(ctx);
  }

}