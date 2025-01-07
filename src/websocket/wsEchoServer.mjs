import WSServerRoomManager from './WSServerRoomManager.mjs';
import WSServerError from './WSServerError.mjs';

function hookCreateRoom(name, msg, clientMeta, client, wsServer) {
  if (name === 'bad-words') throw new WSServerError('Bad words are not allowed');
  console.log(`[HOOK]: client ${clientMeta.id} created room ${name}`);
  return { msg };
}

function hookJoinRoom(msg, roomMeta, clientMeta, client, wsServer) {
  console.log(`[HOOK]: client ${clientMeta.id} joined room ${roomMeta.name}`);
  return { msg };
}

function hookLeaveRoom(roomMeta, clientMeta, client, wsServer) {
  console.log(`[HOOK]: client ${clientMeta.id} left room ${roomMeta.name}`);
}

function hookDeleteRoom(roomMeta, wsServer) {
  console.log(`[HOOK]: room ${roomMeta.name} deleted`);
}

function hookMsgRoom(msg, roomMeta, clientMeta, client, wsServer) {
  if (msg === 'bad-words') throw new WSServerError('Invalid client data');
  console.log(`[HOOK]: client ${clientMeta.id} sent message to room ${roomMeta.name}: ${msg}`);
  return {msg, foo: 'bar'};
}

function hookSendClientMeta(meta) {
  return {...meta, 'addSomeMetaHere': 'someValue'};
}

function hooksendRoomMeta(meta) {
  return {...meta, 'addSomeMetaHere': 'someValueForRoom'};
}

const wsServer = new WSServerRoomManager({
  port: 8887,
  origins: 'http://localhost:5173',
  hookCreateRoom,
  hookJoinRoom,
  hookLeaveRoom,
  hookDeleteRoom,
  hookMsgRoom,
  hookSendClientMeta,
  hooksendRoomMeta,
});

wsServer.addChannel('chat');
wsServer.addRpc('time', () => new Date().toISOString());

wsServer.start();