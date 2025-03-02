class Server {
    write = {

    };
    static clients = new ObservableValue([]);
    constructor(lobby, path = '') {
        this.lobby = lobby;
        if(Server.clients.value.length === 0) {
            Server.clients.setValue(lobby.getMembers());
        }
        Server.clients.subscribe(this.updateUpdates.bind(this));

        this.path = path;

        this.observers = [];

        this.updates = {};
        for(let client of Server.clients.value) {
            this.updates[client.accountId] = new Set();
        }

        steam.steamCallback.subscribe(SteamCallback.LobbyDataUpdate, () => {
            for(let observer of this.observers) {
                this.readUpdates(observer);
            }
        });
    }
    updateUpdates() {
        let oldUpdates = this.updates;
        for(let client of Server.clients.value) {
            this.updates[client.accountId] = new Set();
            for(let key of oldUpdates[client.accountId].values()) {
                this.updates[client.accountId].add(key);
            }
        }
    }
    setKey(key, value) {
        this[key] = value
        this.writeData(key);
    }
    writeData(key) {
        let value = this.write[key] ? this.write[key](this[key]) : this[key];
        this.sendData(key, value);
    }

    subscribe(callback) {
        this.observers.push(callback);
        this.readUpdates(callback);
    }

    // read updates from each player
    readUpdates(callback) {
        for(let i = 0; i < Server.clients.value.length; i++) {
            let client = Server.clients.value[i];
            let updates = this.lobby.getData(client.accountId.toString() + Yukine.delimiters.updateTarget + this.path + 'actionupdates');
            if(updates === '') continue;
            if(updates === undefined) continue;
            if(updates === null) continue;
            let updateList = updates.split(Yukine.delimiters.update);

            for(let key of updateList) {
                callback(client.accountId.toString(), key, this.lobby.getData(client.accountId.toString() + Yukine.delimiters.player + this.path + Yukine.delimiters.action + key));
                this.lobby.setData(this.lobby.getData(client.accountId.toString() + Yukine.delimiters.player + this.path + Yukine.delimiters.action + key), '');
            }
            this.lobby.setData(client.accountId.toString() + Yukine.delimiters.updateTarget + this.path + 'actionupdates', '');
        }
    }

    // update value

    sendData(key, value) {
        this.lobby.setData(this.path + Yukine.delimiters.path + key, value);
        for(let client of Server.clients.value) {
            let playerUpdates = this.updates[client.accountId.toString()];
            if(!playerUpdates.has(key)) {
                playerUpdates.add(key);
                asyncTimeout(1).then(() => this.sendUpdate(client));
            }
        }
    }

    // tell each player the value has updated

    sendUpdate = (client) => {
        return new Promise((resolve) => {
            const wait = () => {
                if(this.lobby.getData(client.accountId.toString() + Yukine.delimiters.updateTarget + this.path + 'updates')) {
                    asyncTimeout(1000).then(() => wait());
                } else {
                    let updateString = "";
                    for(let value of this.updates[client.accountId.toString()].values()) {
                        updateString += value + Yukine.delimiters.update;
                    }
                    updateString = updateString.substring(0, updateString.length - Yukine.delimiters.update.length);
                    this.lobby.setData(client.accountId.toString() + Yukine.delimiters.updateTarget + this.path + 'updates', updateString);
                    this.updates[client.accountId.toString()].clear();
                    resolve();
                }
            }
            wait();
        });
    }
}