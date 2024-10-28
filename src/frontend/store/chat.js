import WSClient from "../../websocket/WSClient.js";

const wsClient = new WSClient('ws://localhost:8887');
wsClient.on('ws:error', console.error);
await wsClient.connect().catch(console.error);

export default wsClient;