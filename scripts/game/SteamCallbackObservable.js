class SteamCallbackObservable {
    callbackObservers = {};
    constructor() {
        this.unsubscribeAll();

        this.callback = Yukine.client.callback.register(SteamCallback.LobbyDataUpdate, (data) => {
            for(let observer of this.callbackObservers[SteamCallback.LobbyDataUpdate]) {
                observer(data);
            }
        });
        this.callback = Yukine.client.callback.register(SteamCallback.GameLobbyJoinRequested, (data) => {
            for(let observer of this.callbackObservers[SteamCallback.GameLobbyJoinRequested]) {
                observer(data);
            }
        });
    }
    subscribe(SteamCallback, callback) {
        this.callbackObservers[SteamCallback].push(callback);
    }
    unsubscribe(SteamCallback, callback) {
        this.callbackObservers[SteamCallback].splice(this.callbackObservers[SteamCallback].indexOf(callback), 1);
    }

    unsubscribeAll() {
        this.callbackObservers[SteamCallback.LobbyDataUpdate] = [];
        this.callbackObservers[SteamCallback.GameLobbyJoinRequested] = [];
    }
}