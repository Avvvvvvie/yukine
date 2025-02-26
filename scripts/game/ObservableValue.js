class ObservableValue {
    constructor(value) {
        this.value = value;
        this.listeners = [];
    }
    addListener(callback) {
        this.listeners.push(callback);
    }
    setValue(value) {
        let oldValue = this.value;
        this.value = value;
        for(let listener of this.listeners) {
            listener(oldValue, value);
        }
    }
}