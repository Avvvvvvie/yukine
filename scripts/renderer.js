
const steam = new Steam();
const windows = new Window();
const menuView = new MenuView();
const lobbyView = new LobbyView();
const gameView = new GameView();

document.addEventListener('DOMContentLoaded', function() {
    windows.DOMContentLoaded();
    menuView.DOMContentLoaded();
    lobbyView.DOMContentLoaded();
});

/*
(async () => {
    const lobby = await client.matchmaking.createLobby(client.matchmaking.LobbyType.Private, 8)
    console.log(lobby.id)

    lobby.setData('batata', '1')
    lobby.mergeFullData({
        'hello': 'world',
        'batata': '2'
    })
    console.log(lobby.getFullData())

    console.log("=====")
    console.log(lobby.getData('batata'))

    lobby.leave();

    console.log("=====")
    const lobbies = await client.matchmaking.getLobbies()
    console.log(lobbies.map(lobby => lobby.id))

    const lobbyWithMorePeople = await lobbies.sort((a, b) => Number(b.getMemberCount() - a.getMemberCount()))[1].join()
    console.log("Joined at " + lobbyWithMorePeople.id + " with " + lobbyWithMorePeople.getMemberCount() + " members:")
    console.log(lobbyWithMorePeople.getMembers())
})();*/