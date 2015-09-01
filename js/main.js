$(function() {
    var playerSelects = $('.playertype-select');
    var fragment = $(document.createDocumentFragment());
    for(var i = 0, s = playerTypes.length; i < s; i++) {
        var type = playerTypes[i];
        fragment.append('<option value="'+type.value+'"'+(i==0?" SELECTED":"")+'>'+type.name+'</option>"');
    };
    playerSelects.append(fragment);
    resetPlayers();
    playBoard();
    hexagonBoard(7);
    resetBoard();
    checkVictor();
    redraw();
    setTimeout(computerPlayer(), 1);
});

