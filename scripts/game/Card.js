class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
        this.suitString = Card.getSuitLetter(suit);
        this.valueString = Card.getValueLetter(value);
        this.suitStringShort = Card.getSuitLetterShort(suit);
        this.valueStringShort = Card.getValueLetterShort(value);
    }
    static getSuitLetter(suit) {
        switch(suit) {
            case 0:
                return 'Hearts';
            case 1:
                return 'Diamonds'; // Diamonds
            case 2:
                return 'Clubs'; // Clubs
            case 3:
                return 'Spades'; // Spades
        }
    }
    static getSuitLetterShort(suit) {
        switch (suit) {
            case 0:
                return 'H';
            case 1:
                return 'D'; // Diamonds
            case 2:
                return 'C'; // Clubs
            case 3:
                return 'S'; // Spades
        }
    }
    static getValueLetter(value) {
        switch(value) {
            case 14:
                return 'Ace';
            case 11:
                return 'Jack';
            case 12:
                return 'Queen';
            case 13:
                return 'King';
            default:
                return value.toString();
        }
    }
    static getValueLetterShort(value) {
        switch(value) {
            case 14:
                return 'A';
            case 11:
                return 'J';
            case 12:
                return 'Q';
            case 13:
                return 'K';
            default:
                return value.toString();
        }
    }
    toString() {
        return this.value + Yukine.delimiters.card + this.suit;
    }
    toText() {
        return this.valueString + ' of ' + this.suitString;
    }
    static fromString(string) {
        if(string === '') return null;
        let parts = string.split(Yukine.delimiters.card);
        return new Card(parseInt(parts[0]), parseInt(parts[1]));
    }
}