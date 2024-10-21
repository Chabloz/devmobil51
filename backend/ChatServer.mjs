import WSServerPubSub from './class/WSServerPubSub.mjs';

const server = new WSServerPubSub({
  port: 8887,
  origins: 'http://localhost:5173',
});
server.addChannel('chat');
server.addRpc('hello', (data, client) => `Hello ${data.name} user ${client.id}`);
server.start();