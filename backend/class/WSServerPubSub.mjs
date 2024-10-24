import WSServer from "./WSServer.mjs";

export default class WSServerPubSub extends WSServer {
  channels = new Map();
  rpcs = new Map();

  addChannel(chan, {
    usersCanPub = true,
    usersCanSub = true,
    validateMsg = () => true,
  } = {}) {
    if (this.channels.has(chan)) return false;
    this.channels.set(chan, {
      usersCanPub,
      usersCanSub,
      validateMsg,
      clients: new Set(),
    });
    return true;
  }

  addRpc(name, callback) {
    if (this.rpcs.has(name)) return false;
    this.rpcs.set(name, callback);
    return true;
  }

  removeChannel(chan) {
    if (!this.channels.has(chan)) return false;
    this.channels.delete(chan);
    return true;
  }

  removeRpc(name) {
    if (!this.rpcs.has(name)) return false;
    this.rpcs.delete(name);
    return true;
  }

  onMessage(client, message) {
    message = message.toString();
    let data;
    try{
      data = JSON.parse(message)
    } catch(e) {
      return this.sendError(client, 'Invalid data');
    }

    if (data.action != 'sub' && data.action != 'pub' && data.action != 'unsub' && data.action != 'rpc') {
      return this.sendError(client, 'Invalid action');
    }

    if (data.action === 'rpc') {
      return this.manageRpc(client, data);
    } else {
      return this.managePubSub(client, data, message);
    }
  }

  managePubSub(client, data, message) {
    if (!data?.chan) {
      return this.sendError(client, 'Chan is required');
    }
    if (typeof data.chan !== 'string') {
      return this.sendError(client, 'Invalid chan');
    }
    if (!this.channels.has(data.chan)) {
      return this.sendError(client, 'Unknown chan');
    };

    const chan = this.channels.get(data.chan);

    if (data.action === 'unsub') {
      chan.clients.delete(client);
      return true;
    }

    if (data.action === 'sub') {
      if (!chan.usersCanSub) {
        return this.sendError(client, 'Users cannot sub on this chan');
      }
      chan.clients.add(client);
      return true;
    }

    if (data.action === 'pub') {
      if (!chan.usersCanPub) {
        return this.sendError(client, 'Users cannot pub on this chan');
      }
      if (!chan.validateMsg(data.msg, this.clients.get(client))) {
        return this.sendError(client, 'Invalid message');
      };
      this.pub(chan, message);
      return true;
    }
  }

  manageRpc(client, data) {
    if (typeof data?.name !== 'string') {
      return this.sendError(client, 'Invalid rpc name');
    }
    if (!data?.data) {
      return this.sendError(client, 'Data is required');
    }
    if (typeof data?.id !== 'number') {
      return this.sendError(client, 'Invalid rpc id');
    }

    const rpc = this.rpcs.get(data.name);

    if (!rpc) {
      return this.sendError(client, 'Unknown rpc');
    }

    let response
    try {
      response = rpc(data.data, this.clients.get(client));
    } catch (e) {
      return this.sendError(client, 'Error in rpc call');
    }

    this.send(client, JSON.stringify({
      action: 'rpc',
      name: data.name,
      response,
      id: data.id,
    }));
  }

  pub(chan, message) {
    for (const client of chan.clients) {
      this.send(client, message);
    }
  }

  onClose(client) {
    for (const chan of this.channels.values()) {
      chan.clients.delete(client);
    }
    super.onClose(client);
  }

  sendError(client, msg) {
    this.send(client, JSON.stringify({action: 'error', msg}));
    return false;
  }

  sendAuthFailed(client) {
    this.send(client, JSON.stringify({action: 'auth-failed'}));
  }

  sendAuthSuccess(client) {
    this.send(client, JSON.stringify({action: 'auth-success'}));
  }

}