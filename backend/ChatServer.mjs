import WSServerPubSub from '../lib/websocket/WSServerPubSub.mjs';
import WSServerError from '../lib/websocket/WSServerError.mjs';

const server = new WSServerPubSub({
  port: 8887,
  origins: 'http://localhost:5173',
});

server.addChannel('chat');

server.addRpc('hello', (data, client, wsServer) => {
  if (!data?.name) throw new WSServerError('Name is required');
  return `Hello ${data.name} user ${client.id}`;
});

server.start();