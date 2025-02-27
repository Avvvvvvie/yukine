class ObservableValue {
    constructor(value) {
        this.value = value;
        this.observers = [];
    }
    subscribe(callback) {
        this.observers.push(callback);
    }
    setValue(value) {
        let oldValue = this.value;
        this.value = value;
        for(let observer of this.observers) {
            observer(oldValue, value);
        }
    }
}