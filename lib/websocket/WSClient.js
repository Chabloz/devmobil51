import EventMixins from './Event.js';
import { bytesBase64Encode } from './string.js';

export default class WSClient {
/**
 *  A WebSocket PubSub client to interact with the WS PubSub server.
 *
 * @param {string} [url=null] - The WebSocket server URL.
 * If null, the URL will be determined based on the current page URL.
 * @example
 * const wsClient = new WSClient('ws://localhost:8001');
 */
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

  /**
   * Connect to the WebSocket server.
   *
   * @param {string} [token=null] - The authentication token.
   * @returns {Promise} - A promise that resolves when the connection is established or rejects if an error occurs.
   * @example
   * await wsClient.connect('secret').catch(console.error);
   */
  connect(token = null) {
    // Leverage the subprotocol to pass the authentication token
    if (token != null && typeof token != 'string') {
      return Promise.reject(new Error('The auth token must be a string.'));
    }
    const subprotocols = ['im.pubsub'];
    if (typeof token === 'string') {
      subprotocols.push(bytesBase64Encode(token));
    }

    this.wsClient = new WebSocket(this.url, subprotocols);

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
        type: data.type,
        id: data.id,
      });
      return;
    }

    if (data.action === 'error') {
      this.emit(`ws:error`, data.msg);
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

  /**
   * Call a remote procedure.
   *
   * @param {string} name - The name of the remote procedure.
   * @param {object} [data={}] - The data to send to the remote procedure.
   * @param {number} [timeout=5000] - The timeout in milliseconds.
   * @returns {Promise} - A promise that resolves with the response or rejects if an error occurs.
   * @example
   * await wsClient.rpc('get-user', {id: 1}).catch(console.error);
   */
  rpc(name, data = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const id = this.rpcId++;

      const timer = setTimeout(() => {
        this.off(`ws:rpc:${name}`, callback);
        reject(new Error('WS RPC Timeout for ' + name + ' (rpc id: ' + id + ')'));
      }, timeout);

      const callback = (resp) => {
        if (resp.id !== id) return;
        clearTimeout(timer);
        this.off(`ws:rpc:${name}`, callback);
        if (resp.type === 'success') {
          resolve(resp.response)
        } else {
          reject(new Error(resp.response));
        }
      };

      this.on(`ws:rpc:${name}`, callback);
      this.wsClient.send(JSON.stringify({action: 'rpc', name, data, id}));
    });
  }

  /**
   * Publish a message to a channel.
   *
   * @param {string} chan - The channel name.
   * @param {object} msg - The message to publish.
   * @example
   * wsClient.pub('chat', {message: 'Hello, World!'});
   */
  pub(chan, msg) {
    this.wsClient.send(JSON.stringify({
      action: 'pub',
      chan,
      msg,
    }));
  }

  /**
   * Subscribe to a channel.
   *
   * @param {string} chan - The channel name.
   * @param {function} callback - The callback to call when a message is received.
   * @returns {function} - A function to call to unsubscribe.
   * @example
   * const unsub = wsClient.sub('chat', (msg) => console.log(msg));
   */
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

  /**
   * Unsubscribe from a channel.
   *
   * @param {string} chan - The channel name.
   * @param {function} [callback=null] - The callback to remove or null to remove all callbacks.
   * @example
   * wsClient.unsub('chat');
   */
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