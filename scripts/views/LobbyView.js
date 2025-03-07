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

        document.getElementById('sendChat').addEventListener('click', this.sendChat.bind(this));

        document.getElementById('lobbyChatInput').addEventListener('keydown', (event) => {
            if(event.key === 'Enter' || event.keyCode === 13) {
                document.getElementById('sendChat').click();
            }
        });

        document.getElementById('lobbyIDCopy').addEventListener('click', this.copyLobbyID.bind(this));
    }

    copyLobbyID() {
        let code = steam.lobbyIDToCode(steam.lobbyClient.lobby.id);
        navigator.clipboard.writeText(code).then(() => {
            pages.openToast('Lobby ID copied to clipboard');
        });
    }

    sendChat() {
        let chatInput = document.getElementById('lobbyChatInput');
        if(chatInput.value) {
            this.lobbyClient.addChatMessage(chatInput.value);
        }
    }

    showLobby = (lobbyClient) => {
        this.lobbyClient = lobbyClient;
        pages.switchPage(pages.pages.lobby);
        document.getElementById('lobbyIDDisplay').innerText = steam.lobbyIDToCode(this.lobbyClient.lobby.id);

        this.lobbyClient.chat.subscribeRead((oldValue, newValue) => {
            document.getElementById('lobbyChat').innerText = newValue;
            document.getElementById('lobbyChatInput').value = '';
        });

        let players = this.lobbyClient.getPlayers();
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