import WSClient from "./class/WSClient.js";

const wsClient = new WSClient('ws://localhost:8887');
wsClient.on('ws:error', console.error);

await wsClient.connect().catch(console.error);

wsClient.sub('chat', (message) => console.log(message));

wsClient.pub('chat', 'Hello World');

wsClient.rpc('hello', {nme: 'Anonymous'}).then(res => console.log(res));