class MenuView {
    DOMContentLoaded() {
        document.getElementById('createLobby').addEventListener('click', lobbyView.createLobby);
        document.getElementById('joinLobby').addEventListener('click', lobbyView.joinLobby);

        document.getElementById('activateOverlay').addEventListener('click', function() {
            steam.openGamePage();
        });
    }
}