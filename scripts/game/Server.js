class Server {
    write = {

    };
    constructor(path = '') {
        this.updateServer = new UpdateServer(path);
    }
    setKey(key, value) {
        this[key] = value
        this.writeData(key);
    }
    writeData(key) {
        let value = this.write[key] ? this.write[key](this[key]) : this[key];
        this.updateServer.setData(key, value);
    }
}