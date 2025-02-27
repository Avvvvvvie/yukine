class SteamCallbackObservable {
    callbackObservers = {};
    constructor() {
        this.callbackObservers[SteamCallback.LobbyDataUpdate] = [];
        this.callbackObservers[SteamCallback.GameLobbyJoinRequested] = [];

        this.callback = Steam.client.callback.register(SteamCallback.LobbyDataUpdate, (data) => {
            for(let observer of this.callbackObservers[SteamCallback.LobbyDataUpdate]) {
                observer(data);
            }
        });
        this.callback = Steam.client.callback.register(SteamCallback.GameLobbyJoinRequested, (data) => {
            for(let observer of this.callbackObservers[SteamCallback.GameLobbyJoinRequested]) {
                observer(data);
            }
        });
    }
    subscribe(SteamCallback, callback) {
        this.callbackObservers[SteamCallback].push(callback);
    }
}