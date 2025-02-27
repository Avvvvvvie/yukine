class SettingsClient extends Client {
    cardStyle = new ObservableValue('default');
    constructor() {
        super('settings');
        this.startSubscription();
    }
}