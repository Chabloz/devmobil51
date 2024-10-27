import WSClient from "../websocket/WSClient.js";

const wsClient = new WSClient('ws://localhost:8887');
wsClient.on('ws:error', console.error);

await wsClient.connect().catch(console.error);

wsClient.sub('chat', (message) => console.log(message))
  .then(console.log)
  .catch(console.error);

wsClient.pub('chat', 'Hello World')
  .then(console.log)
  .catch(console.error);

wsClient.pub('chat', 'badword')
  .then(console.log)
  .catch(console.error);

wsClient.pub('cht', 'Hello')
  .then(console.log)
  .catch(console.error);

wsClient.rpc('hello', {name: 'Anonymous'})
  .then(console.log)
  .catch(console.error);