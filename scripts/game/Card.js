class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
    }
    toString() {
        return this.value + ':' + this.suit;
    }
    static fromString(string) {
        if(string === '') return null;
        let parts = string.split(':');
        return new Card(parseInt(parts[0]), parseInt(parts[1]));
    }
}