import WSServerPubSub from '../websocket/WSServerPubSub.mjs';


const wsServer = new WSServerPubSub({
  port: 8887,
  origins: 'http://localhost:5173',
});

wsServer.addChannel('circle-sync');

wsServer.start();
