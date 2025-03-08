class PlayerClient extends Client {
    read = {
        hand: (value) => Pile.fromString(value),
        played: (value) => Pile.fromString(value),
        tries: (value) => {
            if(value) {
                return value.split(',');
            }
            return [];
        },
        tryCanceled: (value) => value === "true",
        turn: (value) => parseInt(value),
        isBot: (value) => value === "true",
        eligible: (value) => value === "true",
        name: (value) => value,
        state: (value) => value
    }
    constructor(lobby, accountId) {
        super(lobby, accountId);
        this.accountId = accountId;
        this.initObservables();
    }
}