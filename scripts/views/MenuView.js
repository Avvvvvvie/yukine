class MenuView extends View {
    DOMContentLoaded() {
        document.getElementById('createLobby').addEventListener('click', this.createLobby.bind(this));
        document.getElementById('joinLobby').addEventListener('click', this.joinLobby.bind(this));
        document.getElementById('showTutorial').addEventListener('click', this.showTutorial.bind(this));
    }

    init() {

    }

    joinLobby() {
        const lobbyIDString = document.getElementById('lobbyID').value;
        if(!lobbyIDString) return;
        const lobbyID = Yukine.CodeToLobbyID(lobbyIDString);
        document.getElementById('joinLobby').classList.add('loading');
        yukine.joinLobby(lobbyID).catch((error) => {
            pages.showError(error.message);
        }).finally(() => {
            document.getElementById('joinLobby').classList.remove('loading');
        });
    }

    showTutorial() {
        pages.switchPage(pages.pages.tutorial);
    }

    /**
     * Private = 0,
     * FriendsOnly = 1,
     * Public = 2,
     * Invisible = 3
     */
    createLobby() {
        document.getElementById('createLobby').classList.add('loading');
        yukine.createLobby(0, 8).catch((error) => {
            pages.showError(error.message);
        }).finally(() => {
            document.getElementById('createLobby').classList.remove('loading');
        });
    }
}