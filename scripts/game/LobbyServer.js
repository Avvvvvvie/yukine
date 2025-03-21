class LobbyServer extends Server {
    write = {
        botAmount: (value) => value.toString(),
        players: (value) => JSON.stringify(value.map(player => ({accountId: player.accountId, name: player.name})))
    };

    constructor(lobby) {
        super(lobby, 'settings');
        this.bots = [];
        this.botClients = [];

        this.setKey('botAmount', 0);
        this.setKey('players', []);
        this.setKey('cardStyle', 'default');
        this.setKey('chat', ' ');
        this.setKey('host', yukine.playerAccountId);
        this.setKey('state', Yukine.lobbyState.WAITING);

        this.subscribe((accountId, key, value) => {
            switch (key) {
                case 'join':
                    this.players.push({
                        accountId: accountId,
                        name: value,
                        isBot: false
                    });
                    this.writeData('players');
                    Server.clients.setValue(this.players);
                    this.addChatMessage(value + ' joined the lobby');
                    break;
                case 'chat':
                    this.addChatMessage(this.players.find(p => p.accountId === accountId).name + ': ' + value);
                    break;
                case 'cardStyle':
                    if(accountId === this.host) {
                        this.setKey('cardStyle', value);
                    }
                    break;
                case 'botAmount':
                    if(accountId === this.host) {
                        this.setBotAmount(parseInt(value));
                    }
                    break;
            }
        });
    }

    startGame() {
        this.yukineServer = new YukineServer(this.lobby);
        this.setKey('state', Yukine.lobbyState.INGAME);
        for(let bot of this.bots) {
            this.botClients.push(new BotYukineClient(this.lobby, bot.name));
        }
    }

    getPlayers() {
        return this.players;
    }

    addBot() {
        let bot = {
            accountId: "Bot" + (this.bots.length + 1),
            name: "Bot" + (this.bots.length + 1),
            isBot: true
        }
        this.bots.push(bot);
        this.players.push(bot);
        Server.clients.setValue(this.players);
        this.writeData('players');
    }

    removeBot() {
        this.bots.pop();
        this.players.pop();
        Server.clients.setValue(this.players);
        this.writeData('players');
    }

    addChatMessage(message) {
        this.setKey('chat', this.chat + message + '\n');
    }

    setBotAmount(number) {
        let oldAmount = this.bots.length;
        if(number > oldAmount) {
            for(let i = oldAmount; i < number; i++) {
                this.addBot();
            }
        } else if(number < oldAmount) {
            for(let i = oldAmount; i > number; i--) {
                this.removeBot();
            }
        }
        this.setKey('botAmount', number);
    }
}