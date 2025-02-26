/** @type {import('steamworks.js')} */
const { init, SteamCallback } = require('steamworks.js');

class Yukine {
    currentPlayer = 0;
    deck = Pile.createDeck();
    discardPile = new Pile();
    round = 0;
    saveableLoosers = 1;
    winner = null;
    constructor(players) {
        this.players = players;
        this.deck.shuffle();
        this.distributeCards(8);
    }
    distributeCards(amount) {
        for(let player of this.players) {
            for(let i = 0; i < amount; i++) {
                this.giveCardToPlayer(player);
            }
        }
    }
    getTurn() {
        return this.players[this.currentPlayer];
    }
    nextTurn() {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        if(this.currentPlayer === 0) {
            let winner = this.findRoundWinner();
            if(winner) {
                for(let player of this.players) {
                    for(let card of player.played.cards) {
                        winner.hand.addCard(card);
                    }
                }
            }
            this.findRoundLoosers();
            let totalWinner = this.findTotalWinner();
            if(totalWinner) {
                this.winner = totalWinner;
                return null;
            }
            this.round++;
            this.markEligiblePlayers();
        }
    }
    markEligiblePlayers() {
        for(let player1 of this.players) {
            for(let player2 of this.players) {
                if(player1 === player2) continue;
                if(player2.eligible === true && player1.eligible === true) continue;
                if(player1.lastPlayedCard().value + 1 > player2.lastPlayedCard().value && player1.lastPlayedCard().value - 1 < player2.lastPlayedCard().value) {
                    player1.eligible = true;
                    player2.eligible = true;
                    break;
                }
            }
        }
    }
    findRoundLoosers() {
        for(let player of this.players) {
            if(player.hand.size() === 0) {
                if(this.saveableLoosers > 0) {
                    this.saveableLoosers--;
                    this.giveCardToPlayer(player);
                } else {
                    player.lost = true;
                }
            }
        }
    }
    findTotalWinner() {
        let notLostCount = 0;
        let winner = null;
        for(let player of this.players) {
            if(player.lost === false) {
                notLostCount++;
                winner = player;
            }
        }
        if(notLostCount === 1) {
            return winner;
        }
    }
    giveCardToPlayer(player) {
        player.hand.addCard(this.deck.drawCard());
    }
    findRoundWinner() {
        let sortedPlayers = this.players.filter(player => player.eligible).sort((a, b) => a.lastPlayedCard().value - b.lastPlayedCard().value);
        // todo: check if everyone has the same card
        for(let i = 0; i < this.players.length - 1; i++) {
            if(!(sortedPlayers[sortedPlayers.length - i - 2] + 1 >= sortedPlayers[sortedPlayers.length - i - 1])){
                return sortedPlayers[sortedPlayers.length - i - 1];
            }
        }
        return null;
    }
    useTry(player) {
        player.tries--;
        this.giveCardToPlayer(player);
    }
    cancelTry(player) {
        player.tryCanceled = true;
    }
}
class Player {
    hand = new Pile();
    played = new Pile();
    tries = 3;
    eligible = true;
    lost = false;
    tryCanceled = false;
    constructor(name) {
        this.name = name;
    }
    lastPlayedCard() {
        return this.played.cards[this.played.cards.length - 1];
    }
    playCard(card) {
        this.hand.cards.splice(this.hand.cards.indexOf(card), 1);
        this.played.addCard(card);
    }
}

class Pile {
    constructor() {
        this.cards = [];
    }
    size() {
        return this.cards.length;
    }
    addCard(card) {
        this.cards.push(card);
    }
    shuffle() {
        this.cards.sort(() => Math.random() - 0.5);
    }
    drawCard() {
        return this.cards.pop();
    }
    static createDeck() {
        let deck = new Pile();
        for(let value = 1; value <= 13; value++) {
            for(let suit = 0; suit < 4; suit++) {
                deck.addCard(new Card(value, suit));
            }
        }
        return deck;
    }
}

class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
    }
}

class Steam  {
    client = init(480);
    lobby = null;
    playerName = this.client.localplayer.getName();
    isHost = false;
    game = null;
    gamePlayer = null;

    joinLobby(lobbyID) {
        let promise = this.client.matchmaking.joinLobby(lobbyID)
        promise.then((lobby) => {
            this.addChatMessage(steam.playerName + ' joined the lobby');
            this.addPlayerInfo();
            steam.lobby = lobby;
        });
        return promise;
    }
    addChatMessage(message) {
        this.lobby.setData('chat', this.lobby.getData('chat') + ',' + message);
    }
    addPlayerInfo() {
        this.lobby.setData(this.client.localplayer.getSteamId().accountId.toString(), this.client.localplayer.getName());
    }
    setHost() {
        this.isHost = true;
        this.lobby.setData('host', this.client.localplayer.getSteamId().accountId.toString());
    }
    createLobby(type, maxMembers) {
        let promise = this.client.matchmaking.createLobby(0, 8);
        promise.then((lobby) => {
            steam.lobby = lobby;
            this.addChatMessage(steam.playerName + ' created the lobby');
            this.addPlayerInfo();
            this.setHost();
            console.log('ishost1', this.isHost);
        });
        return promise;
    }
    leaveLobby() {
        if(this.lobby) {
            this.lobby.leave();
            this.lobby = null;
            this.isHost = false;
        }
    }
    openGamePage() {
        this.client.overlay.activateToWebPage('https://www.example.com/');
    }

    lobbyIDToCode(lobbyID) {
        let code = '';
        while(lobbyID > 0) {
            code = (lobbyID % BigInt(36)).toString(36) + code;
            lobbyID = lobbyID / BigInt(36);
        }
        return code.toUpperCase();
    }

    CodeToLobbyID(code) {
        code = code.toLowerCase();
        return [...code.toString()]
            .reduce((r, v) => r * BigInt(36) + BigInt(parseInt(v, 36)), 0n);
    }

    startGame() {
        this.game = new Yukine(this.lobby.getMembers().map(member => new Player(this.lobby.getData(member.accountId.toString()))));
        for(let player of steam.game.players) {
            if(player.name === steam.playerName) {
                this.gamePlayer = player;
                break;
            }
        }
    }
}
const steam = new Steam();


class Window {
    windows = {
        menu: "menu",
        lobby: "lobby",
        game: "game"
    };
    DOMContentLoaded() {
        for(let window in this.windows) {
            this.hideWindow(window);
        }
        this.setWindow(this.windows.menu);
    }
    setWindow (window) {
        if(this.currentWindow) this.hideWindow(this.currentWindow);
        this.currentWindow = window;
        this.showWindow(window);
    }
    hideWindow(window) {
        this.hideElement(document.getElementById(window));
    }
    showWindow(window) {
        this.showElement(document.getElementById(window));
    }
    hideElement(element) {
        element.style.display = "none";
    }
    showElement(element) {
        element.style.display = "block";
    }
}
const windows = new Window();

class MenuView {
    DOMContentLoaded() {
        document.getElementById('createLobby').addEventListener('click', lobbyView.createLobby);
        document.getElementById('joinLobby').addEventListener('click', lobbyView.joinLobby);

        document.getElementById('activateOverlay').addEventListener('click', function() {
            steam.openGamePage();
        });
    }
}
const menuView = new MenuView();



class LobbyView {
    DOMContentLoaded() {
        document.getElementById('createLobby').addEventListener('click', this.createLobby);

        document.getElementById('leaveLobby').addEventListener('click', this.leaveLobby);

        document.getElementById('startGame').addEventListener('click', gameView.startGame);

        document.getElementById('name').innerText = steam.playerName;

        windows.hideElement(document.getElementById('startGame'));

        const callback1 = steam.client.callback.register(SteamCallback.LobbyDataUpdate, (data) => {
            console.log('LobbyDataUpdate', data);
        });

        const callback2 = steam.client.callback.register(SteamCallback.LobbyChatUpdate, (data) => {
            console.log('LobbyChatUpdate', data);
        });

        setTimeout(() => {
            callback1.disconnect()
            callback2.disconnect()
        }, 5000);
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
const lobbyView = new LobbyView();












/*
(async () => {
    const lobby = await client.matchmaking.createLobby(client.matchmaking.LobbyType.Private, 8)
    console.log(lobby.id)

    lobby.setData('batata', '1')
    lobby.mergeFullData({
        'hello': 'world',
        'batata': '2'
    })
    console.log(lobby.getFullData())

    console.log("=====")
    console.log(lobby.getData('batata'))

    lobby.leave();

    console.log("=====")
    const lobbies = await client.matchmaking.getLobbies()
    console.log(lobbies.map(lobby => lobby.id))

    const lobbyWithMorePeople = await lobbies.sort((a, b) => Number(b.getMemberCount() - a.getMemberCount()))[1].join()
    console.log("Joined at " + lobbyWithMorePeople.id + " with " + lobbyWithMorePeople.getMemberCount() + " members:")
    console.log(lobbyWithMorePeople.getMembers())
})();*/

class GameView {
    test = 1;
    startGame() {
        windows.setWindow(windows.windows.game);
        steam.startGame();
        gameView.loadPlayerHand();
        gameView.loadPlayers();

    }
    loadPlayers() {
        let players = steam.game.players;
        let playerList = document.getElementById('playerList');
        playerList.innerHTML = '';
        for(let player of players) {
            let playerElement = document.createElement('div');
            playerElement.innerText = player.name;
            playerList.appendChild(playerElement);
        }
    }

    loadPlayerHand() {
        let playerHand = document.getElementById('playerHand');
        playerHand.innerHTML = '';
        for(let card of steam.gamePlayer.hand.cards) {
            let cardElement = document.createElement('div');
            cardElement.innerText = card.value + ' ' + card.suit;
            cardElement.addEventListener('click', () => {
                this.playCard(card);
            });
            playerHand.appendChild(cardElement);
        }
    }
    playCard(card) {
        console.log(card);
    }
}
const gameView = new GameView();

document.addEventListener('DOMContentLoaded', function() {
    windows.DOMContentLoaded();
    menuView.DOMContentLoaded();
    lobbyView.DOMContentLoaded();
});