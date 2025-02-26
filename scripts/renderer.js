
const steam = new Steam();
const windows = new Window();
const menuView = new MenuView();
const lobbyView = new LobbyView();
const gameView = new GameView();

document.addEventListener('DOMContentLoaded', function() {
    windows.DOMContentLoaded();
    menuView.DOMContentLoaded();
    lobbyView.DOMContentLoaded();
});