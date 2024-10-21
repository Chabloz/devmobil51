import EventMixins from '../mixin/Event.js';

export default class WSClient {

  constructor(url = null) {
    if (url === null) {
      const hostname = window.location.hostname;
      const mustBeSecure = window.location.protocol == 'https:';
      const port = mustBeSecure ? 443 : 80;
      this.url = `${mustBeSecure ? 'wss' : 'ws'}://${hostname}:${port}`;
    } else {
      this.url = url
    }
    this.wsClient = null;
    this.rpcId = 0;

    Object.assign(this, EventMixins);
    this.mixinEvent();
  }

  connect() {
    this.wsClient = new WebSocket(this.url);
    this.wsClient.addEventListener('message', (event) => this.onMessage(event));

    return new Promise((resolve, reject) => {
      this.once('ws:auth:sucess', () => resolve());
      this.once('ws:auth:failed', () => reject(new Error('WS auth failed')));
      this.wsClient.addEventListener('error', () => reject(new Error('WS connection error')));
      this.wsClient.addEventListener('close', () => {
        this.close();
        reject(new Error('WS connection closed.'));
      });
    });
  }

  close() {
    if (this.wsClient === null) return;
    this.wsClient.close();
    this.wsClient = null;
  }

  onMessage(event) {
    const data = JSON.parse(event.data);

    if (data.action === 'pub') {
      this.emit(`ws:chan:${data.chan}`, data.msg);
      return;
    }

    if (data.action === 'rpc') {
      this.emit(`ws:rpc:${data.name}`, {
        response: data.response,
        id: data.id,
      });
      return;
    }

    if (data.action === 'error') {
      throw new Error('WS error: ' + data.msg);
      return;
    }

    if (data.action === 'auth-failed') {
      this.emit('ws:auth:failed');
      this.close();
      return;
    }

    if (data.action === 'auth-success') {
      this.emit('ws:auth:sucess');
      return;
    }
  }

  rpc(name, data = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const id = this.rpcId++;

      const timer = setTimeout(() => {
        this.off(`ws:rpc:${name}`, callback);
        reject(new Error('WS RPC Timeout for ' + name));
      }, timeout);

      const callback = (resp) => {
        if (resp.id !== id) return;
        clearTimeout(timer);
        this.off(`ws:rpc:${name}`, callback);
        resp.response ? resolve(resp.response) : reject(new Error('WS RPC error for ' + name));
      };

      this.on(`ws:rpc:${name}`, callback);
      this.wsClient.send(JSON.stringify({action: 'rpc', name, data, id}));
    });
  }

  pub(chan, msg) {
    this.wsClient.send(JSON.stringify({
      action: 'pub',
      chan,
      msg,
    }));
  }

  sub(chan, callback) {
    if (!this.hasListener(chan)) {
      this.wsClient.send(JSON.stringify({
        action: 'sub',
        chan,
      }));
    }
    this.on(`ws:chan:${chan}`, callback);
    return () => this.unsub(chan, callback);
  }

  unsub(chan, callback = null) {
    if (callback !== null) {
      this.off(`ws:chan:${chan}`, callback);
    } else {
      this.clear(`ws:chan:${chan}`);
    }
    if (!this.hasListener(`ws:chan:${chan}`)) {
      this.wsClient.send(JSON.stringify({
        action: 'unsub',
        chan,
      }));
    }
  }

}