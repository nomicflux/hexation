'use strict';

$(function() {
    var brain = _brain(_const);
    var board = _board(_const, brain);
    var game  = _game(_const, board, brain);

    $("#change").click(changeBoard);
    $("#reset").click(resetAll);
    $("#donemaking").click(board.madeBoard);
    $("#changePlayers").click(game.changePlayers);
    $("#watchThinking").click(game.toggleThought);

    function resetAll() {
        board.resetBoard();
        game.resetPlayers(board.getMaxSize());
    }

    function changeBoard() {
        board.changeBoard();
        game.resetPlayers(board.getMaxSize());
    }

    var playerSelects = $('.playertype-select');
    var fragment = $(document.createDocumentFragment());
    for(var i = 0, s = game.playerTypes.length; i < s; i++) {
        var type = game.playerTypes[i];
        fragment.append('<option value="'+type.value+'"'+(i==0?" SELECTED":"")+'>'+type.name+'</option>"');
    };
    playerSelects.append(fragment);

//    game.resetPlayers(board.getMaxSize());
    board.initialBoard();
    game.playBoard();
    resetAll();
    game.checkVictor();
    board.redraw();
    setTimeout(game.computerPlayer(), 1);
});

// How to pass message to reset players?
// What sort of object to make board, game, brain?
