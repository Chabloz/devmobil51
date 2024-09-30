import { TAU } from "/utils/math.js";

export default class Circle {

  constructor({x, y, r, speed = 0, dir = 0, color}) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.speed = speed;
    this.dir = dir; // radian
  }

  getRadius() {
    return this.r;
  }

  setSpeed(speed){
    this.speed = speed;
  }

  setColor(color){
    this.color = color;
  }

  setDir(dir){
    this.dir = dir;
  }

  compareTo(otherCircle) {
    // test instanceof ?
    return this.getRadius() - otherCircle.getRadius();
  }

  distanceTo({x , y}) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx*dx + dy*dy);
  }

  isInside({x, y}) {
    return this.distanceTo({x, y}) < this.r;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, TAU);
    ctx.closePath();
    ctx.fill();
  }

  move(deltaT) {
    const distX = this.speed * deltaT * Math.cos(this.dir);
    const distY = this.speed * deltaT * Math.sin(this.dir);
    this.x += distX;
    this.y += distY;
  }

}