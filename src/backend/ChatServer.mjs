import WSServerPubSub from '../websocket/WSServerPubSub.mjs';
import { getRandomInt } from '../utils/math.js';

function authCallback(token, request, wsServer) {
  const id = getRandomInt(1, 9999);
  const clients = wsServer.geClientsData();
  while (clients.some(client => client.id === id)) {
    id = getRandomInt(1, 9999);
  }
  return {id, username: 'Anonymous-' + id};
}

function hookPub(msg, client, wsServer) {
  if (typeof msg !== 'string' || msg.length < 1) return false;
  const timestamp = new Date().getTime();
  return {msg, timestamp, username: client.username};
}

const wsServer = new WSServerPubSub({
  port: 8887,
  origins: 'http://localhost:5173',
  authCallback,
});

wsServer.addChannel('chat', { hookPub });
wsServer.start();