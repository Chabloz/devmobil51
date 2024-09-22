import { getRandomInt } from "/utils/math.js";
import { randomHSL } from "./utils/color.js";
import Circle from "/class/CircleInFlatTorus.js";
import TouchAngle from "./class/TouchAngle.js";
import KeyboardAngle from "./class/KeyboardAngle.js";

const ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = ctx.canvas.clientWidth;
ctx.canvas.height = ctx.canvas.clientHeight;

const keyboardAngle  = new KeyboardAngle();
const touchAngle = new TouchAngle();

const circles = [];
// the number of circles is depedenent on the canvas size
// the bigger the canvas, the more circles we will have
const nbCircles = Math.max(ctx.canvas.height/100 * ctx.canvas.width/100, 80);
for (let i = 0; i < nbCircles; i++) {
  const r = getRandomInt(3, Math.min(Math.max(i/2, 3), 80));
  circles.push(new Circle({
    x: getRandomInt(0, ctx.canvas.width),
    y: getRandomInt(0, ctx.canvas.height),
    speed: r / 100, // [pixel / ms] (pixel is not a very good choice for a unit, but this will be ok for our first animation)
    r,
    dir: 0, // radian
    color: randomHSL('65%', '50%'),
  }));
}

circles.sort((c1, c2) => c1.compareTo(c2));

let lastTime = 0;

function tick(time) {
  requestAnimationFrame(tick);

  const dt = time - lastTime;
  lastTime = time;

  // if dt is too high, we skip the world update and rendering for now
  // Hopefully, we will catch up on the next tick call
  if (dt >= 1000/30) return;

  // User inputs management
  let angle = keyboardAngle.getAngle();
  if (angle === false) angle = touchAngle.getAngle();

  // World update
  if (angle !== false) {
    circles.forEach(c => c.setDir(angle));
    circles.forEach(c => c.move(dt, ctx.canvas.width, ctx.canvas.height));
  }

  // Clean all
  ctx.canvas.width = ctx.canvas.clientWidth;
  ctx.canvas.height = ctx.canvas.clientHeight;

  circles.forEach(c => c.draw(ctx));
}

requestAnimationFrame(tick);