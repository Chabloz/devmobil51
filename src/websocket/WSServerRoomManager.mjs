import WSServerPubSub from "./WSServerPubSub.mjs";
import WSServerError from "./WSServerError.mjs";
import crypto from 'crypto';

// TODO: clients state, world state
// TODO: lock, unlock room
// Nice TO HAVE TODO: patch world state (and broadcast)

export default class WSServerRoomManager extends WSServerPubSub {
  rooms = new Map();
  prefix = '__room-';
  actionsRoom = ['pub-room'];
  syncModes = ['immediate', 'immediate-other', 'patch'];

  constructor({
    maxPlayersByRoom = 10, // TODO: make this configurable by room

    usersCanCreateRoom = true,
    usersCanNameRoom = true,

    hookCreateRoom = (roomName, msg, clientMeta, client, wsServer) => ({}),
    hookLeaveRoom = (roomMeta, clientMeta, client, wsServer) => {},
    hookDeleteRoom = (roomMeta, wsServer) => {},
    hookJoinRoom = (msg, roomMeta, clientMeta, client, wsServer) => ({}),
    hookMsgRoom = (msg, roomMeta, clientMeta, client, wsServer) => msg,
    hookSendClientMeta = (meta) => meta,
    hooksendRoomMeta = (meta) => meta,

    autoJoinCreatedRoom = true,
    autoDeleteEmptyRoom = true,

    syncMode = null,

    port = 8887,
    maxNbOfClients = 1000,
    maxInputSize = 1000000,
    verbose = true,
    origins = 'http://localhost:5173',
    pingTimeout = 30000,
    authCallback = (headers, wsServer) => {},
  } = {}) {
    super({ port, maxNbOfClients, maxInputSize, verbose, origins, pingTimeout, authCallback });

    this.maxPlayersByRoom = maxPlayersByRoom;

    this.usersCanCreateRoom = usersCanCreateRoom;
    this.usersCanNameRoom = usersCanNameRoom;

    this.hookCreateRoom = hookCreateRoom;
    this.hookJoinRoom = hookJoinRoom;
    this.hookLeaveRoom = hookLeaveRoom;
    this.hookDeleteRoom = hookDeleteRoom;
    this.hookMsgRoom = hookMsgRoom;
    this.hookSendClientMeta = hookSendClientMeta;
    this.hooksendRoomMeta = hooksendRoomMeta;

    this.autoJoinCreatedRoom = autoJoinCreatedRoom;
    this.autoDeleteEmptyRoom = autoDeleteEmptyRoom;

    if (syncMode === null) syncMode = this.syncModes[0];
    if (!this.syncModes.includes(syncMode)) throw new Error('Invalid sync mode');
    this.syncMode = syncMode;

    if (this.usersCanCreateRoom) {
      this.clientCreateRoom = this.clientCreateRoom.bind(this);
      this.addRpc(this.prefix + 'create', this.clientCreateRoom);
    }

    this.clientJoinRoom = this.clientJoinRoom.bind(this);
    this.addRpc(this.prefix + 'join', this.clientJoinRoom);

    this.clientCreateOrJoinRoom = this.clientCreateOrJoinRoom.bind(this);
    this.addRpc(this.prefix + 'createOrJoin', this.clientCreateOrJoinRoom);

    this.clientLeaveRoom = this.clientLeaveRoom.bind(this);
    this.addRpc(this.prefix + 'leave', this.clientLeaveRoom);
  }

  isActionValid(action) {
    return super.isActionValid(action) || this.actionsRoom.includes(action);
  }

  onMessage(client, message) {
    const data = super.onMessage(client, message);
    if (typeof data === 'boolean') return data;
    if (this.actionsRoom.includes(data.action)) {
      return this.manageRoomActions(client, data);
    }
    return data;
  }

  manageRoomActions(client, data) {
    if (data.action === 'pub-room') {
      if (typeof data?.msg === 'undefined') return this.sendError(client, 'Invalid message');
      if (typeof data?.room !== 'string') return this.sendError(client, 'Invalid room');
      if (!this.rooms.has(data.room)) return this.sendError(client, 'Unknown room');

      const room = this.rooms.get(data.room);
      if (!room.chan.clients.has(client)) return this.sendError(client, 'Client not in room');

      const clientMeta = this.clients.get(client);
      try {
        var msg = this.hookMsgRoom(data.msg, room.meta, clientMeta, client, this);
      } catch (e) {
        if (!(e instanceof WSServerError)) this.log(e.name + ': ' + e.message);
        const response = e instanceof WSServerError ? e.message : 'Server error';
        return this.sendError(client, response);
      }

      if (this.syncMode === 'immediate') {
        return this.broadcastRoom(room, msg, client);
      }
      if (this.syncMode === 'immediate-other') {
        return this.broadcastOtherRoom(room, msg, client);
      }
      if (this.syncMode === 'patch') {
        this.log('TODO: patch world state');
        return true;
      }
    }
    return false;
  }

  clientLeaveRoom(data, clientMeta, client) {
    if (!data.name || typeof data.name !== 'string') throw new WSServerError('Invalid room name');
    data.name = data.name.trim();
    if (!this.rooms.has(data.name)) throw new WSServerError('Room not found');

    const room = this.rooms.get(data.name);
    if (!room.chan.clients.has(client)) throw new WSServerError('Client not in room');

    return this.removeClientFromRoom(data.name, client);
  }

  clientCreateOrJoinRoom(data, clientMeta, client) {
    if (this.usersCanCreateRoom && typeof data?.name === 'string' && this.rooms.has(data.name)) {
      return this.clientJoinRoom(data, clientMeta, client);
    }
    return this.clientCreateRoom(data, clientMeta, client);
  }

  clientJoinRoom(data, clientMeta, client) {
    if (!data.name || typeof data.name !== 'string') throw new WSServerError('Invalid room name');
    data.name = data.name.trim();
    if (!this.rooms.has(data.name)) throw new WSServerError('Room not found');
    const room = this.rooms.get(data.name);
    if (room.chan.clients.size >= room.maxPlayers) throw new WSServerError('Room is full');
    if (room.chan.clients.has(client)) throw new WSServerError('Client already in room');

    try {
      var meta = this.hookJoinRoom(data.msg, room.meta, clientMeta, client, this);
    } catch (e) {
      if (!(e instanceof WSServerError)) this.log(e.name + ': ' + e.message);
      const response = e instanceof WSServerError ? e.message : 'Server error';
      throw new WSServerError(response);
    }

    if (meta === false) throw new WSServerError('Room join aborted');
    if (typeof meta !== 'object') meta = {};

    Object.assign(clientMeta, meta);

    this.addClientToRoom(data.name, clientMeta, client);

    let roomMeta = {};
    try {
      roomMeta = this.hooksendRoomMeta(room.meta);
      if (typeof roomMeta !== 'object') roomMeta = {};
    } catch (e) {
      this.log(e.name + ': ' + e.message);
    }

    return { name: room.name, meta: roomMeta };
  }

  clientCreateRoom(data, clientMeta, client) {
    if (this.usersCanNameRoom && data?.name) {
      if (typeof data.name !== 'string') throw new WSServerError('Invalid room name');
      data.name = data.name.trim();
      if (this.rooms.has(data.name)) throw new WSServerError('Room already exists');
    } else {
      data.name = null;
    }

    try {
      var meta = this.hookCreateRoom(data.name, data.msg, clientMeta, client, this);
    } catch (e) {
      if (!(e instanceof WSServerError)) this.log(e.name + ': ' + e.message);
      const response = e instanceof WSServerError ? e.message : 'Server error';
      throw new WSServerError(response);
    }

    if (meta === false) throw new WSServerError('Room creation aborted');
    if (typeof meta !== 'object') meta = {};

    const roomName = this.createRoom(data.name ?? null);
    const room = this.rooms.get(roomName);
    Object.assign(room.meta, meta);

    if (this.autoJoinCreatedRoom) {
      try {
        var metaUser = this.hookJoinRoom(data.msg, room.meta, clientMeta, client, this);
      } catch (e) {
        if (!(e instanceof WSServerError)) this.log(e.name + ': ' + e.message);
        const response = e instanceof WSServerError ? e.message : 'Server error';
        this.deleteRoom(roomName);
        throw new WSServerError(response);
      }

      if (metaUser === false) {
        this.deleteRoom(roomName);
        throw new WSServerError('Room join aborted');
      }
      if (typeof metaUser !== 'object') meta = {};

      Object.assign(clientMeta, meta);

      this.addClientToRoom(roomName, clientMeta, client);
    }

    let roomMeta = {};
    try {
      roomMeta = this.hooksendRoomMeta(room.meta);
      if (typeof roomMeta !== 'object') roomMeta = {};
    } catch (e) {
      this.log(e.name + ': ' + e.message);
    }

    return { name: roomName, meta: roomMeta };
  }

  addClientToRoom(roomName, clientMeta, client) {
    const room = this.rooms.get(roomName);
    const chan = room.chan;
    this.log('Client ' + clientMeta.id + ' joined room ' + roomName);
    chan.clients.add(client);
  }

  removeClientFromRoom(roomName, client) {
    if (!this.rooms.has(roomName)) return false;
    const room = this.rooms.get(roomName);
    const chan = room.chan;
    if (!chan.clients.has(client)) return false;

    const clientMeta = this.clients.get(client);
    try {
      this.hookLeaveRoom(room.meta, clientMeta, client, this);
    } catch (e) {
      this.log(e.name + ': ' + e.message);
    }

    this.log('Client ' + clientMeta.id + ' left room ' + roomName);
    chan.clients.delete(client);
    if (!this.autoDeleteEmptyRoom || chan.clients.size > 0) return true;
    return this.deleteRoom(roomName);
  }

  deleteRoom(roomName) {
    if (!this.rooms.has(roomName)) return false;
    const room = this.rooms.get(roomName);

    try {
      this.hookDeleteRoom(room.meta, this);
    } catch (e) {
      this.log(e.name + ': ' + e.message);
    }

    this.log('Room deleted: ' + roomName);
    this.rooms.delete(roomName);
    return this.channels.delete(this.prefix + roomName);
  }

  createRoom(roomName = null, withHook = false) {
    roomName = roomName ?? crypto.randomUUID();
    if (this.rooms.has(roomName)) return false;

    let meta = {};
    if (withHook) {
      try {
        meta = this.hookCreateRoom(roomName, null, null, null, this);
      } catch (e) {
        meta = false;
      }
      if (meta === false) {
        this.log('Room creation aborted');
        return false;
      }
      if (typeof meta !== 'object') meta = {};
    }

    const chanName = this.prefix + roomName;
    this.log('Room created: ' + roomName);
    this.addChannel(chanName, { usersCanPub: false, usersCanSub: false });
    this.rooms.set(roomName, {
      name: roomName,
      chan: this.channels.get(chanName),
      maxPlayers: this.maxPlayersByRoom,
      meta: { name: roomName, ...meta },
    });
    return roomName;
  }

  onClose(client) {
    for (const room of this.rooms.values()) {
      this.removeClientFromRoom(room.name, client);
    }
    super.onClose(client);
  }

  prepareBroadcastMessage(room, client, msg) {
    let clientMeta = {};
    try {
      clientMeta = this.hookSendClientMeta(this.clients.get(client));
      if (typeof clientMeta !== 'object') clientMeta = {};
    } catch (e) {
      this.log(e.name + ': ' + e.message);
    }

    return JSON.stringify({
      action: 'pub',
      chan: this.prefix + room.name,
      msg: {
        client: clientMeta,
        data: msg,
      },
    });
  }

  broadcastRoom(room, msg, client) {
    const message = this.prepareBroadcastMessage(room, client, msg);
    for (const other of room.chan.clients) {
      this.send(other, message);
    }
    return true;
  }

  broadcastOtherRoom(room, msg, client) {
    const message = this.prepareBroadcastMessage(room, client, msg);
    for (const other of room.chan.clients) {
      if (other === client) continue;
      this.send(other, message);
    }
    return true;
  }

}