class TutorialView extends View {
    init() {

    }
    DOMContentLoaded() {
        document.getElementById('backToMenu').addEventListener('click', this.backToMenu);
    }

    backToMenu() {
        pages.switchPage(pages.pages.menu);
    }
}