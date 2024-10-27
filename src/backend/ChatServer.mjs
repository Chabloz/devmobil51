import WSServerPubSub from '../websocket/WSServerPubSub.mjs';
import WSServerError from '../websocket/WSServerError.mjs';

const server = new WSServerPubSub({
  port: 8887,
  origins: 'http://localhost:5173',
});

server.addChannel('chat', {
  hookPub: (msg, client, wsServer) => {
    if (msg === 'badword') throw new WSServerError('Bad word');
    return {msg, time: Date.now(), user: client.id};
  },
});

server.addRpc('hello', (data, client, wsServer) => {
  if (!data?.name) throw new WSServerError('Name is required');
  return `Hello from WS server ${data.name}`;
});

server.start();