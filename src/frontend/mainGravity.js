import { getRandomInt, clamp} from "/utils/math.js";
import { randomHSL } from "/utils/color.js";
import MainLoop from "/utils/mainLoop.js";
import Circle from "/class/CircleVerlet.js";
import Rope from "/class/RopeVerlet.js";

const timestep = 1000/120;
const isMobile = window.matchMedia('(pointer: coarse)').matches;
const ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = ctx.canvas.clientWidth;
ctx.canvas.height = ctx.canvas.clientHeight;

const ropes = [];
ropes.push(new Rope({
  x1: 20,
  y1: 20,
  x2: ctx.canvas.width / 2,
  y2: ctx.canvas.height / 4,
  color: 'tomato',
}));
ropes.push(new Rope({
  x1: ctx.canvas.width - 20,
  y1: 20,
  x2: ctx.canvas.width / 2,
  y2: ctx.canvas.height / 3,
  color: 'cyan',
}));
ropes.push(new Rope({
  x1: clamp(ctx.canvas.width / 2 - 300, 20, ctx.canvas.width),
  y1: ctx.canvas.height / 2,
  x2:  clamp(ctx.canvas.width / 2 + 300, 20, ctx.canvas.width),
  y2: ctx.canvas.height / 2,
  color: 'gold',
}));

const circles = [];
const nbCircles = Math.max(ctx.canvas.height / 90 * ctx.canvas.width / 90, 50);
for (let i = 0; i < nbCircles; i++) {
  const r = getRandomInt(5, 30);
  circles.push(new Circle({
    x: getRandomInt(r, ctx.canvas.width - r),
    y: getRandomInt(r, ctx.canvas.height - r),
    r,
    color: randomHSL(),
  }));
}

document.addEventListener('click', e => {
  if (isMobile) {
    document.documentElement.requestFullscreen();
    screen.orientation.lock('portrait');
  }
  const pos = {x: e.clientX, y: e.clientY};
  for (const c of circles) {
    if (c.isInside(pos)) {
      c.applyForceY(-0.3);
      return;
    };
  }
  const r = getRandomInt(5, 30);
  circles.push(new Circle({...pos, r, color: randomHSL()}));
});

function updateWorld(dt) {
  for (const c of circles) {
    c.boxConstraint(ctx.canvas.width, ctx.canvas.height);
    c.move(dt);
    c.applyForceY(0.002); // simulate gravity
  }

  for (const rope of ropes) {
    rope.update(dt);
    rope.applyForceY(0.002);
  }

  for (let i = 0; i < circles.length; i++) {
    const c1 = circles[i];
    for (const rope of ropes) rope.circleCollision(c1);
    for (let j = i + 1; j < circles.length; j++) {
      const c2 = circles[j];
      c1.circleCollision(c2);
    }
  }
}

function drawWorld() {
  ctx.canvas.width = ctx.canvas.clientWidth;
  ctx.canvas.height = ctx.canvas.clientHeight;
  for (const c of circles) c.draw(ctx);
  for (const rope of ropes) rope.draw(ctx);
}

MainLoop.setSimulationTimestep(timestep);
MainLoop.setUpdate(updateWorld);
MainLoop.setDraw(drawWorld);
MainLoop.setEnd((fps, panic) => {
  if (!panic) return;
  console.error('panic');
  MainLoop.resetFrameDelta();
})
MainLoop.start();