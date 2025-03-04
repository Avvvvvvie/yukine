class LobbyView {
    DOMContentLoaded() {
        document.getElementById('leaveLobby').addEventListener('click', this.leaveLobby);

        document.getElementById('startGame').addEventListener('click', steam.startGame);

        document.getElementById('name').innerText = steam.playerName;

        windows.hideElement(document.getElementById('startGame'));

        document.getElementById('cardStyleSelect').addEventListener('change', (event) => {
            steam.lobbyServer.setKey('cardStyle',event.target.value);
        });

        document.getElementById('botAmount').addEventListener('change', (event) => {
            steam.lobbyServer.setBotAmount(parseInt(event.target.value));
        });

        document.getElementById('sendChat').addEventListener('click', () => {
            let chatInput = document.getElementById('lobbyChatInput');
            steam.lobbyClient.addChatMessage(chatInput.value);
            chatInput.value = '';
        });
    }

    showLobby = (lobby) => {
        windows.setWindow(windows.windows.lobby);
        document.getElementById('lobbyIDDisplay').innerText = steam.lobbyIDToCode(lobby.id);

        steam.lobbyClient.chat.subscribeRead((oldValue, newValue) => {
            document.getElementById('lobbyChat').innerText = newValue;
        });

        let players = steam.lobbyClient.getPlayers();
        players.subscribeRead((oldValue, newValue) => {
            document.getElementById('lobbyMembers').innerText = "Members: " + newValue.map(member => member.name).join(', ');
        });
        if(steam.isHost) {
            windows.showElement(document.getElementById('startGame'));
        }
    }

    leaveLobby() {
        steam.leaveLobby();
        windows.setWindow(windows.windows.menu);
    }
}