import WSClient from "../class/WSClient.js";

const wsClient = new WSClient('ws://localhost:8887');
await wsClient.connect().catch(console.error);

export default wsClient;