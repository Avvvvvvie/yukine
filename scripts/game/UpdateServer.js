const asyncTimeout = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
class UpdateServer {
    constructor(path) {
        this.path = path;

        this.observers = [];
        this.players = steam.players;

        this.updates = {};
        for(let player of this.players) {
            this.updates[player.accountId] = new Set();
        }

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

    // read updates from each player
    readUpdates(callback) {
        for(let player of this.players) {
            let updates = steam.lobby.getData(player.accountId + Yukine.delimiters.updateTarget + this.path + 'actionupdates');
            if(updates === '') return;
            if(updates === undefined) return;
            if(updates === null) return;
            let updateList = updates.split(Yukine.delimiters.update);

            for(let key of updateList) {
                callback(player.accountId, key, steam.lobby.getData(player.accountId + Yukine.delimiters.player + this.path + Yukine.delimiters.action + key));
            }
            steam.lobby.setData(player.accountId + Yukine.delimiters.updateTarget + this.path + 'actionupdates', '');
        }
    }

    // update value

    setData(key, value) {
        steam.lobby.setData(this.path + Yukine.delimiters.path + key, value);
        for(let player of this.players) {
            let playerUpdates = this.updates[player.accountId];
            if(!playerUpdates.has(key)) {
                playerUpdates.add(key);
                asyncTimeout(1).then(() => this.sendUpdate(player));
            }
        }
    }

    // tell each player the value has updated

    sendUpdate = (player) => {
        return new Promise((resolve) => {
            const wait = () => {
                if(steam.lobby.getData(player.accountId + Yukine.delimiters.updateTarget + this.path + 'updates')) {
                    asyncTimeout(1000).then(() => wait());
                } else {
                    let updateString = "";
                    for(let value of this.updates[player.accountId].values()) {
                        updateString += value + Yukine.delimiters.update;
                    }
                    updateString = updateString.substring(0, updateString.length - Yukine.delimiters.update.length);
                    steam.lobby.setData(player.accountId + Yukine.delimiters.updateTarget + this.path + 'updates', updateString);
                    this.updates[player.accountId].clear();
                    resolve();
                }
            }
            wait();
        });
    }
}