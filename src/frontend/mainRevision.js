import Circle from "../class/Circle.js";
import MainLoop from "/utils/mainLoop.js";
import WsClient from "../websocket/WSClient.js";
import { randomHSL } from "../utils/color.js";

const ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = ctx.canvas.clientWidth;
ctx.canvas.height = ctx.canvas.clientHeight;

const color = randomHSL();

const wsClient = new WsClient('ws://localhost:8887');
await wsClient.connect();

wsClient.sub('circle-sync', pos => {
    const {x, y, color} = pos;
    circles.push(new Circle({x, y, r: 10, color}));
});


const circles = [];

// handle click on canvas element
ctx.canvas.addEventListener('click', e => {
    const data = {x: e.clientX, y: e.clientY, color};
    wsClient.pub('circle-sync', data);
});


function updateWorld(dt){
    
}

function drawWorld(){
    ctx.canvas.width = ctx.canvas.clientWidth;
    ctx.canvas.height = ctx.canvas.clientHeight;
    for (const c of circles) {
        c.draw(ctx);
    }
}

MainLoop.setSimulationTimestep(1000/1);
MainLoop.setUpdate(updateWorld);
MainLoop.setDraw(drawWorld);
MainLoop.setEnd((fps, panic) => {
  if (!panic) return;
  console.error('panic');
  MainLoop.resetFrameDelta();
})
MainLoop.start();

