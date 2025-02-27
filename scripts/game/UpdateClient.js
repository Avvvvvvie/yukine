class UpdateClient {
    constructor(path) {
        this.path = path;
        this.observers = [];

        this.updates = new Set();

        steam.steamCallback.subscribe(SteamCallback.LobbyDataUpdate, () => {
            for(let observer of this.observers) {
                this.readUpdates(observer);
            }
        });
    }
    subscribe(callback) {
        this.observers.push(callback);
        this.readUpdates(callback);
    }
    // read only for this player
    readUpdates(callback) {
        let updates = steam.lobby.getData(steam.playerAccountId + Yukine.delimiters.updateTarget + this.path + 'updates');
        if(updates === '') return;
        if(updates === undefined) return;
        if(updates === null) return;
        let updateList = updates.split(Yukine.delimiters.update);
        for(let key of updateList) {
            callback(key, steam.lobby.getData(this.path + Yukine.delimiters.path + key));
        }
        steam.lobby.setData(steam.playerAccountId + Yukine.delimiters.updateTarget + this.path + 'updates', '');
    }

    // update action value of this player

    setAction(key, value) {
        steam.lobby.setData(steam.playerAccountId + Yukine.delimiters.player + this.path + Yukine.delimiters.action + key, value);
        if(!this.updates.has(key)) {
            this.updates.add(key);
            asyncTimeout(1).then(() => this.sendAction());
        }
    }

    // tell server the action has updated

    sendAction = () => {
        return new Promise((resolve) => {
            const wait = () => {
                if(steam.lobby.getData(steam.playerAccountId + Yukine.delimiters.updateTarget + this.path + 'actionupdates')) {
                    asyncTimeout(1000).then(() => wait());
                } else {
                    let updateString = "";
                    for(let value of this.updates.values()) {
                        updateString += value + Yukine.delimiters.update;
                    }
                    updateString = updateString.substring(0, updateString.length - Yukine.delimiters.update.length);
                    steam.lobby.setData(steam.playerAccountId + Yukine.delimiters.updateTarget + this.path + 'actionupdates', updateString);
                    this.updates.clear();
                    resolve();
                }
            }
            wait();
        });
    }
}