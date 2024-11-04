import Circle from '../class/Circle.js';
import MainLoop from "../utils/mainLoop.js";
import WsClient from "../websocket/WSClient.js";
import { randomHSL } from "../utils/color.js";

const wsClient = new WsClient('ws://localhost:8887');
await wsClient.connect();

const ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = ctx.canvas.clientWidth;
ctx.canvas.height = ctx.canvas.clientHeight;

const color = randomHSL('65%', '50%');
const circles = [];
const circle = new Circle({x: 100, y: 100, r: 50, color: 'red'});
circles.push(circle);

wsClient.sub('circle-sync', (data) => {
    const {x, y, color} = data;
    circles.push(new Circle({x, y, r: 10, color}));
});

// add click handler on DOM canvas
ctx.canvas.addEventListener('click', e => {    
    const x = e.clientX;
    const y = e.clientY;    
    
    wsClient.pub('circle-sync', {x, y, color});
});

function updateWorld(dt) {
    for (const c of circles) {
        c.move(dt);
    }
}


function drawWorld() {
    ctx.canvas.width = ctx.canvas.clientWidth;
    ctx.canvas.height = ctx.canvas.clientHeight;
    for (const c of circles) {
        c.draw(ctx);
    }
}


MainLoop.setSimulationTimestep(1000/24);
MainLoop.setUpdate(updateWorld);
MainLoop.setDraw(drawWorld);
MainLoop.setEnd((fps, panic) => {
  if (!panic) return;
  console.error('panic');
  MainLoop.resetFrameDelta();
})
MainLoop.start();