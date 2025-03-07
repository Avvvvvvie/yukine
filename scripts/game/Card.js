class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
        this.suitString = Card.getSuitLetter(suit);
        this.valueString = Card.getValueLetter(value);
    }
    static getSuitLetter(suit) {
        switch(suit) {
            case 0:
                return 'H'; // Hearts
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
    static fromString(string) {
        if(string === '') return null;
        let parts = string.split(Yukine.delimiters.card);
        return new Card(parseInt(parts[0]), parseInt(parts[1]));
    }
}