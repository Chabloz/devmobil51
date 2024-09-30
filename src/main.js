import { getRandomInt, clamp, TAU } from "/utils/math.js";
import { randomHSL } from "./utils/color.js";
import MainLoop from "/utils/mainLoop.js";
import Circle from "/class/CircleVerlet.js";

const timestep = 1000/120;
const isMobile = window.matchMedia('(pointer: coarse)').matches;

const ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = ctx.canvas.clientWidth;
ctx.canvas.height = ctx.canvas.clientHeight;

const circles = [];
const nbCircles = Math.max(ctx.canvas.height/90 * ctx.canvas.width/90, 50);
for (let i = 0; i < nbCircles; i++) {
  const r = getRandomInt(3, clamp(i/(nbCircles/60), 3, 40));
  circles.push(new Circle({
    x: getRandomInt(r, ctx.canvas.width - r),
    y: getRandomInt(r, ctx.canvas.height - r),
    r,
    speed: 0.3,
    dir: Math.random() * TAU,
    color: randomHSL('65%', '50%'),
    dt: timestep,
  }));
}

document.addEventListener('click', e => {
  // fullscreen on mobile detected with media query
  if (isMobile) {
    document.documentElement.requestFullscreen();
    screen.orientation.lock('portrait');
  }
  const mousPos = {x: e.clientX, y: e.clientY};
  for (const c of circles) {
    if (c.isInside(mousPos)) {
      c.applyAccelY(-0.3);
      break;
    };
  }
});

function updateWorld(dt) {
  for (const c of circles) {
    c.boxConstraint(ctx.canvas.width, ctx.canvas.height);
    c.move(dt);
    c.applyAccelY(0.002); // simulate gravity
  }

  for (let i = 0; i < circles.length; i++) {
    const c1 = circles[i];
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

