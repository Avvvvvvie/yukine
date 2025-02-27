class LobbyView {
    DOMContentLoaded() {
        document.getElementById('createLobby').addEventListener('click', this.createLobby);

        document.getElementById('leaveLobby').addEventListener('click', this.leaveLobby);

        document.getElementById('startGame').addEventListener('click', gameView.startGame);

        document.getElementById('name').innerText = steam.playerName;

        windows.hideElement(document.getElementById('startGame'));

        document.getElementById('cardStyleSelect').addEventListener('change', (event) => {
            let select = event.target;
            steam.settingsServer.setKey('cardStyle',select.options[select.selectedIndex].value);
        });
    }

    showLobby = (lobby) => {
        windows.setWindow(windows.windows.lobby);
        document.getElementById('lobbyIDDisplay').innerText = steam.lobbyIDToCode(lobby.id);

        document.getElementById('lobbyChat').innerText = lobby.getData('chat') || ""
        let players = lobby.getMembers();
        document.getElementById('lobbyMembers').innerText = "Members: " + players.map(player => player.accountId).join(', ');
        console.log(players);
        console.log("ishost", steam.isHost);
        if(steam.isHost) {
            windows.showElement(document.getElementById('startGame'));
        }
    }

    createLobby() {
        steam.createLobby(0, 8).then((lobby)=>{
            lobbyView.showLobby(lobby);
        });
    }

    joinLobby() {
        const lobbyIDString = document.getElementById('lobbyID').value;
        if(!lobbyIDString) return;
        const lobbyID = steam.CodeToLobbyID(lobbyIDString);

        steam.joinLobby(lobbyID).then((lobby)=> {
            lobbyView.showLobby(lobby);
        });
    }

    leaveLobby() {
        steam.leaveLobby();
        windows.setWindow(windows.windows.menu);
    }
}