import WSClient from "./class/WSClient.js";

const wsClient = new WSClient('ws://localhost:8887');
await wsClient.connect().catch(console.error);
wsClient.sub('chat', (message) => console.log(message));
wsClient.pub('chat', 'hello world');
wsClient.rpc('hello', {name: 'world'}).then(res => console.log(res));