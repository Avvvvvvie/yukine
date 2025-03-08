class PlayerServer extends Server {
    write = {
        hand: (value) => value.toString(),
        played: (value) => value.toString(),
        tries: (value) => value.join(','),
        tryCanceled: (value) => value.toString(),
        turn: (value) => value.toString(),
        isBot: (value) => value.toString(),
        eligible: (value) => value.toString()
    }
    constructor(lobby, accountId, name, turn, isBot) {
        super(lobby, accountId);
        this.accountId = accountId;
        this.setKey('hand', new Pile());
        this.setKey('played', new Pile());
        this.setKey('tries', Yukine.tries);
        this.setKey('tryCanceled', false);
        this.setKey('name', name);
        this.setEligible(true);
        this.setKey('state', Yukine.playerState.NONE);
        this.setKey('turn', turn);
        this.setKey('isBot', isBot);
    }
    setState(status) {
        this.setKey('state', status);
    }
    setEligible(value) {
        this.setKey('eligible', value);
    }
    lastPlayedCard() {
        return this.played.cards[this.played.cards.length - 1];
    }
    playCard(card) {
        this.hand.cards.splice(this.hand.cards.indexOf(card), 1);
        this.played.addCard(card);
        this.writeData('played');
        this.writeData('hand');
    }

    useTry(tryName) {
        if(this.tries.indexOf(tryName) === -1) return false;
        this.tries.splice(this.tries.indexOf(tryName), 1);
        this.writeData('tries');
        return true;
    }
    giveCards(pile) {
        pile.cards.forEach(card => this.hand.addCard(card));
        pile.clear();
        this.writeData('hand');
    }
    giveCard(card) {
        this.hand.addCard(card);
        this.writeData('hand');
    }
    clearPlayed() {
        this.played.clear();
        this.writeData('played');
    }
    retakeCards() {
        this.hand.cards = this.hand.cards.concat(this.played.cards);
        this.played.clear();
        this.writeData('played');
        this.writeData('hand');
    }
}