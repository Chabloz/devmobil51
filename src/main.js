import { randomHSL } from "./utils/color.js";
import MainLoop from "./utils/mainLoop.js";
import Circle from "./class/Circle.js";
import Tweens, {easings} from './class/Tweens.js'

const ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = ctx.canvas.clientWidth;
ctx.canvas.height = ctx.canvas.clientHeight;

const tweens = new Tweens();
const tweenOpts = {from: 120, to: 420, duration: 2000, loop: true, yoyo: true};

const nbParticles = easings.length;
let particles = new Array(nbParticles);
for (let i = 0; i < particles.length; i++) {
  particles[i] = new Circle({
    x: 20 + i * 60,
    y: 20,
    r: 20,
    color: randomHSL(),
  });
  console.log(easings[i]);
  tweens.create({...tweenOpts, ease: easings[i], animate: progress => {
    particles[i].y = progress;
  }})
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