import WSClientRoom from "./lib/synnecs/websocket/WSClientRoom.js";
import * as Dom from "./lib/synnecs/utils/Dom.js";

export const ws = new WSClientRoom('ws://localhost:8887');

ws.on('close', () => console.log('Connection closed'));

await ws.connect();

console.log('Connected');

ws.sub('chat', msg => console.log('Message from server:', msg));
Dom.on('#send', 'click', () => ws.pub('chat', 'Hello World'));
Dom.on('#create-bad-room', 'click', () => ws.roomCreate('bad-words'));
Dom.on('#rpc-time', 'click', async () => console.log(await ws.rpc('time')));

const room = await ws.roomCreateOrJoin('test', {foo: 'bar'});
room.onMessage(resp => console.log('Message from room:', resp));
Dom.on('#send-room', 'click', () => room.send('Hello from Client'));
Dom.on('#leave-room', 'click', () => room.leave());