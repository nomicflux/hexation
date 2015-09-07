'use strict';

var _game = function(_c, board, brain) {
    var playerTypes = [
        {value: "human", name: "Human"},
        {value: "igundwane", name: "Gundwane"},
        {value: "indlovu", name: "Ndlovu"},
//        {value: "ibhubesi", name: "Bhubesi"},
        {value: "candide", name: "CandideBot"},
        {value: "timid", name: "TimidBot"},
        {value: "balanced", name: "BalancedBot"},
        {value: "jerk", name: "JerkBot"},
        {value: "montecristo", name:"MonteCristoBot"},
        {value: "helpful", name: "HelpfulBot"},
        {value: "misere", name: "Mis&egrave;reBot"},
        {value: "random", name: "RandoBot"}];

    var currPlayer;

    var activePlayers = [];
    var compWeights = [];
    compWeights[_c.RED] = {"help": 1, "hurt": 1};
    compWeights[_c.GREEN] = {"help": 1, "hurt": 1};
    compWeights[_c.BLUE] = {"help": 1, "hurt": 1};

    var humanPlayers = [];
    humanPlayers[_c.RED] = true;
    humanPlayers[_c.GREEN] = true;
    humanPlayers[_c.BLUE] = true;

    var nnPlayers = [];
    nnPlayers[_c.RED] = null;
    nnPlayers[_c.GREEN] = null;
    nnPlayers[_c.BLUE] = null;

    var watchThinking = false;

    var prevmoves = [[],[],[],[]];

    function toggleThought() {
        watchThinking = !watchThinking;
        console.log("Toggling thought", watchThinking);
    }

    function resetPlayers(maxhexes) {
        if(typeof maxhexes === 'undefined' || maxhexes === null) {
            throw "Undefined argument";
        }
        console.log("Maxhexes: ", maxhexes);
        currPlayer = _c.RED;
        d3.select("#player" + _c.RED).style("padding-left","15px");
        d3.select("#player" + _c.RED).style("font-weight","bold");
        d3.select("#player" + _c.GREEN).style("padding-left",null);
        d3.select("#player" + _c.GREEN).style("font-weight",null);
        d3.select("#player" + _c.BLUE).style("padding-left",null);
        d3.select("#player" + _c.BLUE).style("font-weight",null);
        reactivatePlayer(_c.RED);
        reactivatePlayer(_c.GREEN);
        reactivatePlayer(_c.BLUE);
        d3.select("#win" + _c.RED).style("display","none");
        d3.select("#win" + _c.GREEN).style("display","none");
        d3.select("#win" + _c.BLUE).style("display","none");

        for(var i = 0; i<= maxhexes; i++) {
	    prevmoves[_c.RED][i] = {"red": 0, "green": 0, "blue": 0};
	    prevmoves[_c.GREEN][i] = {"red": 0, "green": 0, "blue": 0};
	    prevmoves[_c.BLUE][i] = {"red": 0, "green": 0, "blue": 0};
        }
        for(var i = 0; i<= maxhexes; i++) {
	    prevmoves[_c.RED][i] = {"red": 0, "green": 0, "blue": 0};
	    prevmoves[_c.GREEN][i] = {"red": 0, "green": 0, "blue": 0};
	    prevmoves[_c.BLUE][i] = {"red": 0, "green": 0, "blue": 0};
        }
    }

    function checkVictor() {
        checkPlayer(_c.RED);
        checkPlayer(_c.GREEN);
        checkPlayer(_c.BLUE);
        if((activePlayers[_c.RED] || currPlayer == _c.RED) && !activePlayers[_c.GREEN] && !activePlayers[_c.BLUE]) {
	    d3.select("#win" + _c.RED).style("display","block");
	    return true;
        } else if(!activePlayers[_c.RED] && (activePlayers[_c.GREEN] || currPlayer == _c.GREEN) && !activePlayers[_c.BLUE]) {
	    d3.select("#win" + _c.GREEN).style("display","block");
	    return true;
        } else if(!activePlayers[_c.RED] && !activePlayers[_c.GREEN] && (activePlayers[_c.BLUE] || currPlayer == _c.BLUE)) {
	    d3.select("#win" + _c.BLUE).style("display","block");
	    return true;
        } else if(!activePlayers[_c.RED] && !activePlayers[_c.GREEN] && !activePlayers[_c.BLUE]) {
	    alert("Everyone lost!");
	    return true;
        } else {
	    return false;
        }
    }

    function checkPlayer(colour) {
        if(!activePlayers[colour]) { return false; }
        var boardRes = board.checkBoardPositions(colour);
        if(boardRes === true) {
            return true;
        }
        deactivatePlayer(colour);
        return false;
    }

    function deactivatePlayer(colour) {
        d3.select("#player" + colour).style("text-decoration","line-through");
        activePlayers[colour] = false;
    }

    function reactivatePlayer(colour) {
        d3.select("#player" + colour).style("text-decoration",null);
        activePlayers[colour] = true;
    }

    function playerRotate() {
        var won = checkVictor();
        var playerStr = "#player" + currPlayer;
        d3.select(playerStr).style("padding-left",null);
        d3.select(playerStr).style("font-weight",null);
        if(!won) {
	    if (currPlayer == _c.RED) {
	        if(activePlayers[_c.GREEN]) {
	            currPlayer = _c.GREEN;
	        } else if(activePlayers[_c.BLUE]){
		    currPlayer = _c.BLUE;
	        }
	    } else if (currPlayer == _c.GREEN) {
	        if(activePlayers[_c.BLUE]) {
		    currPlayer = _c.BLUE;
	        } else if (activePlayers[_c.RED]){
	            currPlayer = _c.RED;
	        }
	    } else if (currPlayer == _c.BLUE) {
	        if(activePlayers[_c.RED]) {
		    currPlayer = _c.RED;
	        } else if(activePlayers[_c.GREEN]){
		    currPlayer = _c.GREEN;
	        }
	    }
        } else {
	    if(activePlayers[_c.RED]) { 
                currPlayer = _c.RED; 
            } else if(activePlayers[_c.GREEN]) { 
                currPlayer = _c.GREEN; 
            } else if(activePlayers[_c.BLUE]) { 
                currPlayer = _c.BLUE; 
           } 
        }

        var newPlayerStr = "#player" + currPlayer;
        d3.select(newPlayerStr).style("padding-left","15px");
        d3.select(newPlayerStr).style("font-weight","bold");

        setTimeout(computerPlayer, _c.COMP_WAIT);
    }

    function computerPlayer() {
        //    var spot = miniMax();
        if(!checkVictor() && !humanPlayers[currPlayer]) {
	    board.redraw();
	    board.svg.on("mousemove",null).on("mousedown",null);
	    var spot;
	    if(nnPlayers[currPlayer] == null) {
	        if(compWeights[currPlayer].help != 0 || compWeights[currPlayer].hurt != 0) {
		    spot = miniMax();
	        } else {
		    spot = findRandom();
	        }
	    } else {
	        spot = nnPlayers[currPlayer].playNN(currPlayer, board, watchThinking);
	    }
	    if(watchThinking) {
	        setTimeout(function() { humanPlacePiece([spot[0], spot[1], spot[2]]); playBoard(); }, 250);
	    } else {
	        humanPlacePiece([spot[0], spot[1], spot[2]]);
	        playBoard();
	    }
        }
    }

    function humanPlacePiece(coord, colour) {
        if(!colour) { colour = currPlayer; }
        if(board.checkOpen(coord, colour) || 
           board.checkPossible(coord, colour)) {
            board.fullPlacePiece(coord, currPlayer);
//	    clearShaded();
//	    board.placePiece(coord);
//	    redraw();
	    setTimeout(playerRotate(),1);
        } else {
            //	alert(coord);
        }
    }

    function processVals(values, colour) {
        var val = 0;
        if(colour == _c.RED) { 
	    val += compWeights[colour].help*values.red;
	    val -= compWeights[colour].hurt*values.green;
	    val -= compWeights[colour].hurt*values.blue;
        } else if(colour == _c.GREEN) { 
	    val -= compWeights[colour].hurt*values.red;
	    val += compWeights[colour].help*values.green;
	    val -= compWeights[colour].hurt*values.blue;
        } else if(colour == _c.BLUE) { 
	    val -= compWeights[colour].hurt*values.red;
	    val -= compWeights[colour].hurt*values.green;
	    val += compWeights[colour].help*values.blue;
        }

        return val;
    }

    function maxVal(valCoords, colour) {
        if(humanPlayers[colour] 
           || (compWeights[colour].help == 0 && compWeights[colour].hurt == 0) ) { 
            return probMaxVal(valCoords, colour); 
        } 
        else { 
            return straightMaxVal(valCoords, colour); 
        }
    }

    function straightMaxVal(valCoords, colour) {
        var max = processVals(valCoords[0].state, colour);
        var state = valCoords[0].state;
        var coord = valCoords[0].coord;
        var numhexes = board.getSize();
        for(var i = 0; i < valCoords.length; i++) {
	    var val = processVals(valCoords[i].state,colour);
	    if(val > max || (val == max && Math.random() > (1/numhexes))) {
		max = val;
		state = valCoords[i].state;
		coord = valCoords[i].coord;
	    }
        }
        return {"state": state, "coord": coord};
    }

    function probMaxVal(valCoords, colour) {
        var val = processVals(valCoords[0].state, colour);
        var state = valCoords[0].state;
        var coord = valCoords[0].coord;
        var vals = [];
        vals.push([val,state,coord]);
        var max = 0;
        for(var i = 0; i < valCoords.length; i++) {
	    val = processVals(valCoords[i].state,colour);
	    state = valCoords[i].state;
	    coord = valCoords[i].coord;
	    vals.push([val, state, coord]);
	    if(val > max) { max = val; }
        }
        var total = 0;
        for(var i = 0; i < vals.length; i++) {
	    total += (max - vals[i][0]);
        }
        val = Math.random() * total;
        var i = vals.length - 1;
        var curr = total;
        while (curr > val && i >= 0) {
	    curr -= (max - vals[i][0]);
	    i--;
        }
        if (i >= vals.length) { i = vals.length - 1; } else if(i < 0) { i = 0; }
        return {"state": vals[i][1], "coord": vals[i][2]};
    }
    
    function miniMax() {
        var players = [];
        var numhexes = board.getSize();
        players[0] = currPlayer;
        players[1] = (currPlayer) % 3 + 1;
        players[2] = (currPlayer + 1) % 3 + 1;
	
        if(activePlayers[players[0]] || activePlayers[players[1]] || activePlayers[players[2]]) {
	    do {
	        if(!activePlayers[players[1]]) {
		    players[1] = players[2];
		    players[2] = players[0];
	        }
	        
	        if(!activePlayers[players[2]]) {
		    players[2] = players[0];
	        }
	    } while(!activePlayers[players[0]] || !activePlayers[players[1]] || !activePlayers[players[2]]);
        } else {
	    return [0,0,0];
        }

        var boardVals = [];
        /* Go through first player's positions */
        boardVals[0] = [];
        for(var ifirst = 0; ifirst < numhexes; ifirst++) {
	    for(var jfirst = -Math.floor(ifirst / 2), _jfirsts = numhexes - Math.floor(ifirst / 2); jfirst < _jfirsts; jfirst++) {
	        
	        var coordfirst = [jfirst, -(jfirst+ifirst), ifirst];
	        if(board.checkOpen(coordfirst, currPlayer)) { 
		    var place = board.boardNum(coordfirst);
		    board.placePiece(coordfirst, currPlayer);
		    var state = board.boardState(currPlayer);
		    var gradient = minusStates(state, prevmoves[currPlayer][place]);
                    /* Attempt to improve play by looking at derivatives of how board has been changing.
                       So far, seems to worsen play. */
                    //		var gradient2 = minusStates(prevmoves[0][place],prevmoves[1][place]);
                    //		var gradient3 = minusStates(prevmoves[1][place],prevmoves[2][place]);
                    //		var curve = minusStates(gradient, gradient2);
                    //		var curve2 = minusStates(gradient2, gradient3);
                    //		var inflect = minusStates(curve, curve2);
		    boardVals[0].push({"state": tangent(state, gradient), "coord": coordfirst});
                    //		boardVals[0].push({"state": taylorthird(state, gradient, curve, inflect), "coord": coordfirst});
		    board.removePiece(coordfirst, currPlayer);
                    //		prevmoves[2][place] = prevmoves[1][place];
                    //		prevmoves[1][place] = prevmoves[0][place];
		    prevmoves[currPlayer][place] = state;
	        }
	    }
        }
        if(boardVals[0].length > 0) {
	    return maxVal(boardVals[0],players[0]).coord;
        } else {
	    alert("No moves!");
	    return [0,0,0];
        }
    }

    function tangent(x,y,z) {
        return {"red": x.red + y.red,
	        "green": x.green + y.green,
	        "blue": x.blue + y.blue}
    }

    function taylorthird(x,y,z,w) {
        if(currPlayer == _c.RED) {
            /*	return {"red": x.red,
		"green": x.green + y.green + z.green/2 + w.green / 6,
		"blue": x.blue + 2*y.blue + 2*z.blue/2 + 4*w.blue / 3}*/

	    return x;
        } else if (currPlayer == _c.GREEN) {
            /*	return {"red": x.red + 2*y.red + 2*z.red + 4*w.red/3,
		"green": x.green,
		"blue": x.blue + y.blue + z.blue/2 + w.blue/6}*/
            /*	return {"red": (7*x.red + 3*y.red + 6*z.red - 10*w.red) / 6,
		"green": (7*x.green + 3*y.green + 6*z.green - 10*w.green) / 6,
		"blue": (7*x.blue + 3*y.blue + 6*z.blue - 10*w.blue) / 6}*/
	    return {"red": (5*x.red - 2*y.red - z.red) / 2,
		    "green": (5*x.green - 2*y.green - z.green) / 2,
		    "blue": (5*x.blue - 2*y.blue - z.blue) / 2}
        } else {
            /*	return {"red": x.red + y.red + z.red/2 + w.red/6,
		"green": x.green + 2*y.green + 2*z.green + 4*w.green/3,
		"blue": x.blue} */

	    return x;
        }
    }

    function taylor(x,y,z) {
        return {"red": x.red + y.red + z.red/2,
	        "green": x.green + y.green + z.green/2,
	        "blue": x.blue + y.blue + z.blue/2}
    }

    function halveState(x) {
        return {"red": x.red / 2, "green": x.green / 2, "blue": x.blue / 2}
    }

    function addStates(x, y) {
        return {"red": x.red + y.red, "green": x.green + y.green, "blue": x.blue + y.blue}
    }

    function minusStates(x, y) {
        return {"red": x.red - y.red, "green": x.green - y.green, "blue": x.blue - y.blue}
    }

    function findRandom() {
        var moves = [];
        var numhexes = board.getSize();
        for(var i = 0; i < numhexes; i++) {
	    for(var j = -Math.floor(i / 2), _js = numhexes - Math.floor(i / 2); j < _js; j++) {
	        var coord = [j, -(j+i), i];
	        if(board.checkOpen(coord, currPlayer)) {
		    moves.push(coord);
	        }
	    }
        } 
        var rand = Math.floor(Math.random()*moves.length);
        return moves[rand];
    }

    function changePlayers() {
        var type = [];
        nnPlayers = [null, null, null];
        type[_c.RED] = redplayer.value;
        type[_c.GREEN] = greenplayer.value;
        type[_c.BLUE] = blueplayer.value;
        for(var i = _c.RED; i <= _c.BLUE; i++) {
	    if(type[i] == "human") {
	        humanPlayers[i] = true;
	        compWeights[i] = {"help": 1, "hurt": 1};
	    } else {
	        humanPlayers[i] = false;
	        if(type[i] == "candide") {
		    compWeights[i] = {"help": 5 + Math.random()*0.1, "hurt": Math.random()*0.1};
	        } else if(type[i] == "jerk") {
		    compWeights[i] = {"help": 1 + Math.random()*0.1, "hurt": 2 + Math.random()*0.1};
	        } else if(type[i] == "timid") {
		    compWeights[i] = {"help": 2 + Math.random()*0.1, "hurt": 1 + Math.random()*0.1};
	        } else if(type[i] == "montecristo") {
		    compWeights[i] = {"help": Math.random()*0.1, "hurt": 5 + Math.random()*0.1};
	        } else if(type[i] == "helpful") {
		    compWeights[i] = {"help": 0, "hurt": -1 + Math.random()*0.1};
	        } else if(type[i] == "misere") {
		    compWeights[i] = {"help": -2 + Math.random()*0.1, "hurt": -1 + Math.random()*0.1};
	        } else if(type[i] == "random") {
		    compWeights[i] = {"help": 0, "hurt": 0};
	        } else if(type[i] == "igundwane") {
                    nnPlayers[i] = new brain.Brain(4, "igundwane");		      
	        } else if(type[i] == "indlovu") {
                    nnPlayers[i] = new brain.Brain(4, "indlovu", true);
	        } else {
		    compWeights[i] = {"help": 0, "hurt": 0};
	        }
	    }
        }
        setTimeout(computerPlayer(),100);
    }

    function getPlayer() {
        return currPlayer;
    }

    function playBoard() {
        board.svg.on("mousemove", function() { board.shadeTiles(board.pointToCoord(d3.mouse(this)),
                                                                getPlayer());})
	    .on("mousedown", function() { humanPlacePiece(board.pointToCoord(d3.mouse(this))); });
        if(board.tiles) { 
            checkVictor(); 
        }
    }

    return {
        playerTypes: playerTypes,
        resetPlayers: resetPlayers,
        checkVictor: checkVictor,
        changePlayers: changePlayers,
        computerPlayer: computerPlayer,
        humanPlacePiece: humanPlacePiece,
        playBoard: playBoard,
        toggleThought: toggleThought,
        getPlayer: getPlayer
    };
};
