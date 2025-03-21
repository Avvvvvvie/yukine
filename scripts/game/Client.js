class Client {
    playerAccountId = yukine.playerAccountId;
    read = {

    }
    constructor(lobby, path = '') {
        this.path = path;
        this.lobby = lobby;
        this.observers = [];

        this.updates = new Set();

        yukine.steamCallback.subscribe(SteamCallback.LobbyDataUpdate, () => {
            for(let observer of this.observers) {
                this.readUpdates(observer);
            }
        });

    }

    initObservables() {
        for(let key in this.read) {
            this[key] = new ObservableValue();
        }
        this.readAll();
        this.startSubscription();
    }
    readAll() {
        for(let key in this.read) {
            this.updateKey(key, this.lobby.getData(this.path + Yukine.delimiters.path + key))
        }
    }

    startSubscription() {
        this.subscribe(this.updateKey.bind(this));
    }
    updateKey(key, value) {
        if(this.read[key] === undefined) {
            console.error("Key " + key + " is not defined in class " + this.constructor.name);
        }
        this[key].setValue(this.read[key] ? this.read[key](value) : value);
        console.log(key + ": " + value);
    }

    subscribe(callback) {
        this.observers.push(callback);
        this.readUpdates(callback);
    }
    // read only for this player
    readUpdates(callback) {
        let updates = this.lobby.getData(this.playerAccountId + Yukine.delimiters.updateTarget + this.path + 'updates');
        if(updates === '') return;
        if(updates === undefined) return;
        if(updates === null) return;
        let updateList = updates.split(Yukine.delimiters.update);
        for(let key of updateList) {
            callback(key, this.lobby.getData(this.path + Yukine.delimiters.path + key));
        }
        this.lobby.setData(this.playerAccountId + Yukine.delimiters.updateTarget + this.path + 'updates', '');
    }

    // update action value of this player

    sendAction(key, value) {
        this.lobby.setData(this.playerAccountId + Yukine.delimiters.player + this.path + Yukine.delimiters.action + key, value);
        if(!this.updates.has(key)) {
            this.updates.add(key);
            asyncTimeout(1).then(() => this.sendUpdate());
        }
    }

    // tell server the action has updated

    sendUpdate = () => {
        return new Promise((resolve) => {
            const wait = () => {
                if(this.lobby.getData(this.playerAccountId + Yukine.delimiters.updateTarget + this.path + 'actionupdates')) {
                    asyncTimeout(1000).then(() => wait());
                } else {
                    let updateString = "";
                    for(let value of this.updates.values()) {
                        updateString += value + Yukine.delimiters.update;
                    }
                    updateString = updateString.substring(0, updateString.length - Yukine.delimiters.update.length);
                    this.lobby.setData(this.playerAccountId + Yukine.delimiters.updateTarget + this.path + 'actionupdates', updateString);
                    this.updates.clear();
                    resolve();
                }
            }
            wait();
        });
    }
}