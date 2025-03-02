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
    clear() {
        this.cards = [];
    }
    static createDeck() {
        let deck = new Pile();
        for(let value = 2; value <= 14; value++) {
            for(let suit = 0; suit < 4; suit++) {
                deck.addCard(new Card(value, suit));
            }
        }
        return deck;
    }
    toString() {
        let string = '';
        for(let card of this.cards) {
            string += card.toString() + Yukine.delimiters.pile;
        }
        return string.substring(0, string.length - Yukine.delimiters.pile.length);
    }
    static fromString(string) {
        if(string === null) return new Pile();
        if(string === undefined) return new Pile();
        if(string === '') return new Pile();
        let pile = new Pile();
        let cards = string.split(Yukine.delimiters.pile);
        for(let card of cards) {
            pile.addCard(Card.fromString(card));
        }
        return pile;
    }
}