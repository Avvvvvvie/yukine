class MenuView {
    DOMContentLoaded() {
        document.getElementById('createLobby').addEventListener('click', menuView.createLobby);
        document.getElementById('joinLobby').addEventListener('click', menuView.joinLobby);

        document.getElementById('activateOverlay').addEventListener('click', function() {
            steam.openGamePage();
        });
    }

    joinLobby() {
        const lobbyIDString = document.getElementById('lobbyID').value;
        if(!lobbyIDString) return;
        const lobbyID = steam.CodeToLobbyID(lobbyIDString);
        steam.joinLobby(lobbyID);
    }

    /**
     * Private = 0,
     * FriendsOnly = 1,
     * Public = 2,
     * Invisible = 3
     */
    createLobby() {
        steam.createLobby(0, 8);
    }
}