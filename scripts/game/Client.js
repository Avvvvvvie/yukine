class Client {
    playerAccountId = steam.playerAccountId;
    read = {

    }
    constructor(lobby, path = '') {
        this.path = path;
        this.lobby = lobby;
        this.observers = [];

        this.updates = new Set();

        steam.steamCallback.subscribe(SteamCallback.LobbyDataUpdate, () => {
            for(let observer of this.observers) {
                this.readUpdates(observer);
            }
        });

    }
    startSubscription() {
        this.subscribe(this.updateKey.bind(this));
    }
    updateKey(key, value) {
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