import MainLoop from "./utils/mainLoop.js";
import Circle from "./class/Circle.js";
import Tweens, { easings } from './class/Tweens.js'
import { getRandomInt } from "./utils/math.js";

const ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = ctx.canvas.clientWidth;
ctx.canvas.height = ctx.canvas.clientHeight;

const tweens = new Tweens();
const opts = {from: 120, to: 420, dur: 2000, loop: true, yoyo: true};

const nbParticles = easings.length;
const particles = new Array(nbParticles);
for (let i = 0; i < particles.length; i++) {
  particles[i] = new Circle({x: 30 + i * 45, y: 120, r:15});

  tweens.create({...opts, ease: easings[i], animate: progress => {
    particles[i].y = progress;
  }});

  const hue = getRandomInt(0, 360);
  tweens.create({...opts, dur: 4000, from: hue, to: hue + 360, animate: progress => {
    particles[i].color = `hsl(${progress}, 65%, 50%)`;
  }});
}

MainLoop.setUpdate(dt => tweens.update(dt));
MainLoop.setDraw(() => {
  ctx.canvas.width = ctx.canvas.clientWidth;
  ctx.canvas.height = ctx.canvas.clientHeight;
  particles.forEach(particle => particle.draw(ctx));
});
MainLoop.setEnd((fps, panic) => {
  if (!panic) return;
  MainLoop.resetFrameDelta();
});
MainLoop.start();