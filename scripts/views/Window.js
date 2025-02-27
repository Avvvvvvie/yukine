class Window {
    windows = {
        menu: "menu",
        lobby: "lobby",
        game: "game"
    };
    DOMContentLoaded() {
        for(let window in this.windows) {
            this.hideWindow(window);
        }
        this.setWindow(this.windows.menu);
    }
    setWindow (window) {
        if(this.currentWindow) this.hideWindow(this.currentWindow);
        this.currentWindow = window;
        this.showWindow(window);
    }
    hideWindow(window) {
        this.hideElement(document.getElementById(window));
    }
    showWindow(window) {
        this.showElement(document.getElementById(window));
    }
    hideElement(element) {
        element.style.display = "none";
    }
    showElement(element) {
        element.style.display = "block";
    }
}