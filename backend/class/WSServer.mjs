import WebSocketServerOrigin from "./WebSocketServerOrigin.mjs";
import WebSocket from 'ws';
import crypto from 'crypto';

export default class WSServer {

  /**
   * Constructor for setting up the server with specific options.
   *
   * @param {Object} options - Configuration options.
   * @param {number} [options.port=8887] - The port number to run the server on.
   * @param {number} [options.maxNbOfClients=1000] - Maximum number of allowed clients.
   * @param {boolean} [options.verbose=true] - Enable or disable verbose logging.
   * @param {string} [options.origins='http://localhost:5173'] - Allowed origins.
   * @param {number} [options.pingTimeout=30000] - The timeout in milliseconds for ping responses.
   * @param {Function} [options.authCallback=headers => {}] - A callback function to authenticate new clients.
   * The function receives the headers of the client's request. It MUST return an object to store in client metadata
   * or false to reject the connection. For example, you can return {isAdmin: true} to store this information
   * in the client metadata. Return {} if you don't need to store any additional information.
   */
  constructor({
    port = 8887,
    maxNbOfClients = 1000,
    verbose = true,
    origins = 'http://localhost:5173',
    pingTimeout = 30000,
    authCallback = (headers, socket) => {},
  } = {}) {
    this.port = port;
    this.maxNbOfClients = maxNbOfClients;
    this.verbose = verbose;
    this.origins = origins;
    this.pingTimeout = pingTimeout;
    this.pingInterval = null;
    this.authCallback = authCallback;
    this.clients = new Map();
    this.server = null;
  }

  start() {
    this.server = new WebSocketServerOrigin({
      port: this.port,
      origins: this.origins,
      maxNbOfClients: this.maxNbOfClients,
      verbose: this.verbose,
    });
    this.server.on('connection', (client, request) => this.onConnection(client, request));
    this.server.on('close', () => this.close());
    this.pingInterval = setInterval(() => this.pingManagement(), this.pingTimeout);
    this.log(`WebSocket Server started on port ${this.port}`);
  }

  pingManagement() {
    for (const [client, metadata] of this.clients.entries()) {
      if (metadata.isAlive === false) {
        this.log(`Client ${metadata.id} is dead`);
        client.terminate();
        this.clients.delete(client);
      } else {
        metadata.isAlive = false;
        client.ping();
      }
    }
  }

  close() {
    if (this.server === null) return;
    clearInterval(this.pingInterval);
    this.log(`WebSocket Server closed on port ${this.port}`);
    this.clients.clear();
    this.server.close();
    this.server = null;
  }

  createClientMetadata(client, customMetadata) {
    this.clients.set(client, {
      ...customMetadata,
      id: crypto.randomUUID(),
      isAlive: true,
    });
  }

  log(message) {
    this.server.log(message);
  }

  onConnection(client, request) {
    const customMetadata = this.authCallback(request.headers);
    if (customMetadata === false) {
      this.sendAuthFailed(client);
      client.close();
      return;
    }

    this.createClientMetadata(client, customMetadata);
    this.log(`New client connected: ${this.clients.get(client).id}`);
    this.sendAuthSuccess(client);

    client.on('error', (error) => this.onError(client, error));
    client.on('message', (message) => this.onMessage(client, message));
    client.on('close', () => this.onClose(client));
    client.on('pong', () => this.onPong(client));
  }

  onPong(client) {
    this.clients.get(client).isAlive = true;
  }

  onClose(client) {
    this.log(`Client disconnected: ${this.clients.get(client).id}`);
    this.clients.delete(client);
  }

  onError(client, error) {
    this.log(`Client ${this.clients.get(client).id} error: ${error?.message}`);
    client.close();
  }

  // to override
  onMessage(client, message) {
    message = message.toString();
    this.broadcast(message);
  }

  broadcast(message) {
    for (const client of this.clients.keys()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  broadcastOthers(client, message) {
    for (const otherClient of this.clients.keys()) {
      if (otherClient !== client && otherClient.readyState === WebSocket.OPEN) {
        otherClient.send(message);
      }
    }
  }

  send(client, message) {
    if (client.readyState !== WebSocket.OPEN) return;
    client.send(message);
  }

  sendAuthFailed(client) {
    this.send(client, 'auth-failed');
  }

  sendAuthSuccess(client) {
    this.send(client, 'auth-success');
  }

}