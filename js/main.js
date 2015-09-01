$(function() {
    var playerSelects = $('.playertype-select');
    console.log("All types: ", playerTypes);
    for(var i = 0; i < playerTypes.length; i++) {
        var type = playerTypes[i];
        playerSelects.append('<option value="'+type.value+'"'+(i==0?" SELECTED":"")+'>'+type.name+'</option>"');
    };

    resetPlayers();
    playBoard();
    hexagonBoard(7);
    resetBoard();
    checkVictor();
    redraw();
    setTimeout(computerPlayer(), 1);
});

