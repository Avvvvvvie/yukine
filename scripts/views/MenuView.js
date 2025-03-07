class MenuView {
    DOMContentLoaded() {
        document.getElementById('createLobby').addEventListener('click', menuView.createLobby);
        document.getElementById('joinLobby').addEventListener('click', menuView.joinLobby);
    }

    joinLobby() {
        const lobbyIDString = document.getElementById('lobbyID').value;
        if(!lobbyIDString) return;
        const lobbyID = steam.CodeToLobbyID(lobbyIDString);
        document.getElementById('joinLobby').classList.add('loading');
        steam.joinLobby(lobbyID).finally(() => {
            document.getElementById('joinLobby').classList.remove('loading');
        });
    }

    /**
     * Private = 0,
     * FriendsOnly = 1,
     * Public = 2,
     * Invisible = 3
     */
    createLobby() {
        document.getElementById('createLobby').classList.add('loading');
        steam.createLobby(0, 8).finally(() => {
            document.getElementById('createLobby').classList.remove('loading');
        });
    }
}