class Pages {
    pages = {
        menu: "menu",
        lobby: "lobby",
        game: "game",
        tutorial: "tutorial"
    };
    views = {
        menu: new MenuView(),
        lobby: new LobbyView(),
        game: new GameView(),
        tutorial: new TutorialView()
    };
    DOMContentLoaded() {
        this.hideAllPages();

        this.switchPage(this.pages.menu);

        // on error
        window.addEventListener('error', (error) => {
            pages.openPopup('Error', error.message, 'error');
        });
        let popupContainer = document.getElementById('popups');
        popupContainer.addEventListener('click', (e) => {
            if(popupContainer.children.length) {
                popupContainer.children[0].getElementsByClassName('popupClose')[0].click();
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        });

        const updateOnlineStatus = () => {
            if(!navigator.onLine) {
                pages.openToast('You are offline', 'Please check your internet connection', 'error');
            }
        }

        navigator.connection.onchange = updateOnlineStatus

        updateOnlineStatus();

        for(let view in this.views) {
            this.views[view].DOMContentLoaded();
        }
    }
    hideAllPages() {
        for(let window in this.pages) {
            this.hidePage(window);
        }
    }
    switchPage (page) {
        if(this.currentWindow) this.hidePage(this.currentWindow);
        this.currentWindow = page;
        this.showPage(page);
    }
    hidePage(window) {
        hideElement(document.getElementById(window));
    }
    showPage(window) {
        showElement(document.getElementById(window));
    }
    openPopup(title, message = '', type = 'info') {
        let popupContainer = document.getElementById('popups');
        let popup = createDiv('popup', type);
        let popupTitle = createDiv('popupTitle');
        let popupMessage = createDiv('popupMessage');
        let popupClose = createDiv('popupClose');
        popupTitle.innerText = title;
        popupMessage.innerText = message;
        popupClose.innerText = 'X';
        showElement(popupContainer);
        popupClose.addEventListener('click', (e) => {
            popupContainer.removeChild(popup);
            if(popupContainer.children.length === 0) {
                hideElement(popupContainer);
            }
            e.preventDefault();
            e.stopImmediatePropagation();
        });
        popup.appendChild(popupTitle);
        popup.appendChild(popupMessage);
        popup.appendChild(popupClose);
        popupContainer.prepend(popup);
        return popup;
    }

    closePopup(popup) {
        popup.getElementsByClassName('popupClose')[0].click();
    }

    openToast(title, message = '', type = 'info') {
        let popup = this.openPopup(title, message, type);
        popup.classList.add('toast');
        setTimeout(() => {
            if(popup.parentNode !== null) {
                pages.closePopup(popup);
            }
        }, 3000);
    }
    showError(message) {
        pages.openPopup('Error', message,'error');
    }
}