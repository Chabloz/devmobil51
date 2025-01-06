import WSClient from './WSClient.js';

export default class WSClientRoom extends WSClient {
  prefix = '__room-';

  roomCreateOrJoin(name, data = {}, timeout = this.defaultTimeout) {
    return this.rpc(this.prefix + 'createOrJoin', { name, msg: data }, timeout)
      .then(resp => new Room(resp.name, resp.meta, this));
  }

  roomCreate(name = null, data = {}, timeout = this.defaultTimeout) {
    return this.rpc(this.prefix + 'create', { name, msg: data }, timeout)
      .then(resp => new Room(resp.name, resp.meta, this));
  }

  roomJoin(name, data = {}, timeout = this.defaultTimeout) {
    return this.rpc(this.prefix + 'join', { name, msg: data }, timeout)
      .then(resp => new Room(resp.name, resp.meta, this));
  }

  roomLeave(name, timeout = this.defaultTimeout) {
    return this.rpc(this.prefix + 'leave', { name }, timeout);
  }

  roomSend(name, data = {}) {
    this.wsClient.send(JSON.stringify({action: 'pub-room', room: name, msg: data}));
  }

  roomOnMessage(name, callback) {
    return this.on(`ws:chan:${this.prefix + name}`, callback);
  }

}

class Room {

  constructor(name, meta, wsClient) {
    this.name = name;
    this.wsClient = wsClient;
    this.meta = meta;
  }

  send(data) {
    this.wsClient.roomSend(this.name, data);
  }

  leave() {
    this.wsClient.roomLeave(this.name);
  }

  onMessage(callback) {
    return this.wsClient.roomOnMessage(this.name, callback);
  }

}