class LobbyView extends View {
    DOMContentLoaded() {
        document.getElementById('leaveLobby').addEventListener('click', this.leaveLobby);

        document.getElementById('startGame').addEventListener('click', yukine.startGame);

        hideElement(document.getElementById('startGame'));

        document.getElementById('cardStyleSelect').addEventListener('change', this.setCardStyle.bind(this));

        document.getElementById('botAmount').addEventListener('change', this.setBotAmount.bind(this));

        document.getElementById('sendChat').addEventListener('click', this.sendChat.bind(this));

        document.getElementById('lobbyChatInput').addEventListener('keydown', (event) => {
            if(event.key === 'Enter' || event.keyCode === 13) {
                document.getElementById('sendChat').click();
            }
        });

        document.getElementById('lobbyIDCopy').addEventListener('click', this.copyLobbyID.bind(this));
    }

    setCardStyle(event) {
        this.lobbyClient.setCardStyle(event.target.value);
    }

    setBotAmount(event) {
        this.lobbyClient.setBotAmount(event.target.value);
    }

    copyLobbyID() {
        let code = Yukine.lobbyIDToCode(this.lobbyClient.lobby.id);
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

    init(lobbyClient) {
        this.lobbyClient = lobbyClient;
        pages.switchPage(pages.pages.lobby);
        document.getElementById('lobbyIDDisplay').innerText = Yukine.lobbyIDToCode(this.lobbyClient.lobby.id);

        this.lobbyClient.chat.subscribeRead((oldValue, newValue) => {
            document.getElementById('lobbyChat').innerText = newValue;
            document.getElementById('lobbyChatInput').value = '';
        });

        let players = this.lobbyClient.getPlayers();
        players.subscribeRead((oldValue, newValue) => {
            document.getElementById('lobbyMembers').innerText = "Members: " + newValue.map(member => member.name).join(', ');
        });
        if(yukine.isHost) {
            showElement(document.getElementById('startGame'));
        }
    }

    leaveLobby() {
        yukine.leaveLobby();
        pages.switchPage(pages.pages.menu);
    }
}