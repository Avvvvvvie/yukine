class LobbyView {
    DOMContentLoaded() {
        document.getElementById('leaveLobby').addEventListener('click', this.leaveLobby);

        document.getElementById('startGame').addEventListener('click', steam.startGame);

        hideElement(document.getElementById('startGame'));

        document.getElementById('cardStyleSelect').addEventListener('change', (event) => {
            steam.lobbyServer.setKey('cardStyle',event.target.value);
        });

        document.getElementById('botAmount').addEventListener('change', (event) => {
            steam.lobbyServer.setBotAmount(parseInt(event.target.value));
        });

        document.getElementById('sendChat').addEventListener('click', () => {
            let chatInput = document.getElementById('lobbyChatInput');
            if(chatInput.value) steam.lobbyClient.addChatMessage(chatInput.value);
        });

        document.getElementById('lobbyChatInput').addEventListener('keydown', (event) => {
            if(event.key === 'Enter' || event.keyCode === 13) {
                document.getElementById('sendChat').click();
            }
        });
    }

    showLobby = (lobby) => {
        pages.switchPage(pages.pages.lobby);
        document.getElementById('lobbyIDDisplay').innerText = steam.lobbyIDToCode(lobby.id);

        steam.lobbyClient.chat.subscribeRead((oldValue, newValue) => {
            document.getElementById('lobbyChat').innerText = newValue;
            document.getElementById('lobbyChatInput').value = '';
        });

        let players = steam.lobbyClient.getPlayers();
        players.subscribeRead((oldValue, newValue) => {
            document.getElementById('lobbyMembers').innerText = "Members: " + newValue.map(member => member.name).join(', ');
        });
        if(steam.isHost) {
            showElement(document.getElementById('startGame'));
        }
    }

    leaveLobby() {
        steam.leaveLobby();
        pages.switchPage(pages.pages.menu);
    }
}