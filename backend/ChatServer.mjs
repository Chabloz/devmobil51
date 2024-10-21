import WSServerPubSub from './class/WSServerPubSub.mjs';

function authCallback(token, request, wsServer) {
  return {
    username: 'anonymous',
  }
}

function filterMsg(msg, client, wsServer) {
  if (typeof msg !== 'string' || msg.length < 1) return false;
  const timestamp = new Date().getTime();
  return {msg, timestamp, username: client.username};
}

const wsServer = new WSServerPubSub({
  port: 8887,
  origins: 'http://localhost:5173',
  authCallback,
});

wsServer.addChannel('chat', { filterMsg });
wsServer.start();