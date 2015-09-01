var playerTypes = [
    {value: "human", name: "Humane"},
    {value: "igundwane", name: "Gundwane"},
    {value: "indlovu", name: "Ndlovu"},
    {value: "ibhubesi", name: "Bhubesi"},
    {value: "candide", name: "CandideBot"},
    {value: "timid", name: "TimidBot"},
    {value: "balanced", name: "BalancedBot"},
    {value: "jerk", name: "JerkBot"},
    {value: "montecristo", name:"MonteCristoBot"},
    {value: "helpful", name: "HelpfulBot"},
    {value: "misere", name: "Mis&egrave;reBot"},
    {value: "random", name: "RandoBot"}];

var svg = d3.select("#game").append("svg")
    .attr("width", WIDTH)
    .attr("height",HEIGHT)
    .attr("style","margin: 10px; padding: 10px; float: left; ");

var path = svg.append("g").selectAll("path");

var compWeights = [];
compWeights[RED] = {"help": 1, "hurt": 1};
compWeights[GREEN] = {"help": 1, "hurt": 1};
compWeights[BLUE] = {"help": 1, "hurt": 1};

var humanPlayers = [];
humanPlayers[RED] = true;
humanPlayers[GREEN] = true;
humanPlayers[BLUE] = true;

var nnPlayers = [];
nnPlayers[RED] = null;
nnPlayers[GREEN] = null;
nnPlayers[BLUE] = null;

var watchThinking = false;

function toggleThought() {
  watchThinking = !watchThinking;
}

function redraw() {
    path = path
	.data(tiles, hexagon);
    
    path.exit().remove();

    path.enter().append("path")
	.attr("d",hexagon);


  if (brainThinking){
    path.attr("class", function(d,i) {
      if(d.type == 0) {
	return "tile0-tint";
      } else { 
	return "tile" + d.type;
      }
    })
	.transition()
 .attr("opacity", function(d,i) { 
	if(d.tint != null) {
	  //	    console.log(d);
	  return d.tint;
	} else {
	  return 1.0;
	} 
      });
  } else {
    path.attr("class", function(d,i) {
      return "tile" + d.type;
    });
  } 
  
    return true;
}

function hexagon(d) {
    var centre = {"x": d.coord[0], "y": d.coord[1] };
    var start = [centre.x - (SHORTSIDE+SIDE/2), centre.y]
    var path = [[SHORTSIDE,LONGSIDE],
		[SIDE, 0], 
		[SHORTSIDE, -LONGSIDE],
		[-SHORTSIDE, -LONGSIDE],
		[-SIDE, 0], 
		[-SHORTSIDE, LONGSIDE] ];
		
    return "M" + start + "l "+ path.join("l") +" z";
}

function boardNum(rgbpt) {
    return rgbpt[2] + (rgbpt[0] +  Math.floor(rgbpt[2]/2))*NUMHEXES;
}

function boardVal(rgbpt) {
    var num = boardNum(rgbpt);
    if (num < 0 || num > MAXHEXES) {
	return NONBOARD;
    } else {
	return tiles[num].type;
    }
}

function legitCoord(coord) {
	return (coord[2] >= 0 && coord[2] < NUMHEXES && coord[0] >= (0 - Math.floor(coord[2]/2)) && coord[0] < (NUMHEXES - Math.floor(coord[2]/2)));
}

function nextTile(coord,colour) {
    if (!colour) {
	colour = currPlayer;
    }
//    alert(coord);
    var newCoord;
    if (colour == RED) {
	newCoord = [coord[0],coord[1]+1,coord[2]-1];
    } else if (colour == GREEN) {
	newCoord = [coord[0]-1,coord[1],coord[2]+1];
    } else if (colour == BLUE) {
	newCoord = [coord[0]-1,coord[1]+1,coord[2]];
    } 
//    if(newCoord[2] < 0 || newCoord[2] >= NUMHEXES || newCoord[0] < (0 - Math.floor(newCoord[2]/2)) || newCoord[0] >= (NUMHEXES - Math.floor(newCoord[2]/2))) {
//    if(!legitCoord(newCoord)) {
//	newCoord = [-NUMHEXES,0,-NUMHEXES];
//    }
    return newCoord;
}

function checkValue(coord, colour, val) {
    if(legitCoord(coord) && boardVal(coord) == val) {
//    if(boardVal(coord) == val) {
	var next = nextTile(coord, colour);
	return (legitCoord(next) && boardVal(next) == val);
    } else {
	return false;
    }
}

function checkOpen(coord, colour) {
    if(!colour) { colour = currPlayer; }
    return checkValue(coord, colour, EMPTY);
}

function checkPossible(coord,colour) {
    if(!colour) { colour = currPlayer; }
    return checkValue(coord,colour, (colour + POSSIBLESHIFT));
}

function shadeTiles(coord) {
    clearShaded();
    if (checkOpen(coord, currPlayer)) {
	var pos1 = boardNum(coord);
	var pos2 = boardNum(nextTile(coord));
	tiles[pos1].type = currPlayer + POSSIBLESHIFT;
	tiles[pos2].type = currPlayer + POSSIBLESHIFT;
	shadedTiles.push(pos1);
	shadedTiles.push(pos2);
    } 
    redraw();
}

function toggleSpot(rgbpt) {
    if(boardVal(rgbpt) == EMPTY) { tiles[boardNum(rgbpt)].type = NONBOARD; } else { tiles[boardNum(rgbpt)].type = EMPTY; }
    redraw();
}

function alterBoard() {
    svg.on("mousemove",null)
	.on("mousedown",function() { toggleSpot(pointToCoord(d3.mouse(this)));  });
}

function playBoard() {
     svg.on("mousemove", function() { shadeTiles(pointToCoord(d3.mouse(this)));})
	.on("mousedown", function() { humanPlacePiece(pointToCoord(d3.mouse(this))); });
    if(tiles) { checkVictor(); }
}

function changePlayers() {
    var type = [];
  nnPlayers = [null, null, null];
    type[RED] = redplayer.value;
    type[GREEN] = greenplayer.value;
    type[BLUE] = blueplayer.value;
    for(i = RED; i <= BLUE; i++) {
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
                nnPlayers[i] = new Brain(4, igundwane);		      
	    } else if(type[i] == "ibhubesi") {
                nnPlayers[i] = new Brain(4, ibhubesi2);
	    } else if(type[i] == "indlovu") {
                nnPlayers[i] = new Brain(4, indlovu, true);
	    } else {
//		compWeights[i] = {"help": Math.random(), "hurt": Math.random()};
		compWeights[i] = {"help": 0, "hurt": 0};
	    }
	}
    }
    setTimeout(computerPlayer(),1);
}


function changeBoard() {
    clearShaded();
    tiles = [];
    var size = Number(bdsize.value);
    var type = bdtype.value;
/*    if((size > 10 || (type == "hex" && size > 5) || (type == "rhom" && size > 8))
       && !confirm("That board will take a while for computer players to play.  Continue?")) {
	return;
    }*/
    if(type == "hex") {
        hexagonBoard(size);
    } else if (type == "tri") {
	triangleBoard(size);
    } else if (type == "rhom") {
	rhombusBoard(size);
    } else if (type == "makefull") {
	makeBoard(size,EMPTY);
    } else if (type == "makeempty") {
	makeBoard(size,NONBOARD);
    } else {
	randomBoard(size);
    }
    resetPlayers();
    redraw();
}

function boardState() {
//    clearShaded();
    var num = 0;
    var playerVals = {"red": 0, "green": 0, "blue": 0}
    for(var i = 0; i < NUMHEXES; i++) {
	for(var j = -Math.floor(i / 2); j < NUMHEXES - Math.floor(i / 2); j++) {
	    var midval = -(j+i)
//	    if(checkOpen([j, -(j+i), i], RED)) { playerVals.red++; }
//	    if(checkOpen([j, -(j+i), i], GREEN)) { playerVals.green++; }
//	    if(checkOpen([j, -(j+i), i], BLUE)) { playerVals.blue++; }
	    if(boardVal([j,midval, i]) == EMPTY) {
		if(boardVal([j,midval+1,i-1]) == EMPTY) { playerVals.red++; }
		if(boardVal([j-1,midval,i+1]) == EMPTY) { playerVals.green++; }
		if(boardVal([j-1,midval+1,i]) == EMPTY) { playerVals.blue++; }
	    }
	}
    }
    return playerVals;
}

function processVals(values, colour) {
    var val = 0;
    if(colour == RED) { 
	val += compWeights[colour].help*values.red;
	val -= compWeights[colour].hurt*values.green;
	val -= compWeights[colour].hurt*values.blue;
    } else if(colour == GREEN) { 
	val -= compWeights[colour].hurt*values.red;
	val += compWeights[colour].help*values.green;
	val -= compWeights[colour].hurt*values.blue;
    } else if(colour == BLUE) { 
	val -= compWeights[colour].hurt*values.red;
	val -= compWeights[colour].hurt*values.green;
	val += compWeights[colour].help*values.blue;
    }

    return val;
}

function maxVal(valCoords, colour) {
    if(humanPlayers[colour] || (compWeights[colour].help == 0 && compWeights[colour].hurt == 0) ) { return probMaxVal(valCoords, colour); } 
    else { return straightMaxVal(valCoords, colour); }

//    if(compWeights[colour].help == 0 && compWeights[colour].hurt == 0) { return probMaxVal(valCoords, colour); } 
//    else { return straightMaxVal(valCoords, colour); }p
}

function straightMaxVal(valCoords, colour) {
    var max = processVals(valCoords[0].state, colour);
    var state = valCoords[0].state;
    var coord = valCoords[0].coord;
    for(var i = 0; i < valCoords.length; i++) {
	var val = processVals(valCoords[i].state,colour);
		if(val > max || (val == max && Math.random() > (1/NUMHEXES))) {
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
    var players = []
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
    for(var ifirst = 0; ifirst < NUMHEXES; ifirst++) {
	for(var jfirst = -Math.floor(ifirst / 2); jfirst < NUMHEXES - Math.floor(ifirst / 2); jfirst++) {
	    
	    var coordfirst = [jfirst, -(jfirst+ifirst), ifirst];
	    if(checkOpen(coordfirst, currPlayer)) { 
		var place = boardNum(coordfirst);
		placePiece(coordfirst, currPlayer);
		var state = boardState(currPlayer);
		var gradient = minusStates(state, prevmoves[currPlayer][place]);
//		var gradient2 = minusStates(prevmoves[0][place],prevmoves[1][place]);
//		var gradient3 = minusStates(prevmoves[1][place],prevmoves[2][place]);
//		var curve = minusStates(gradient, gradient2);
//		var curve2 = minusStates(gradient2, gradient3);
//		var inflect = minusStates(curve, curve2);
		boardVals[0].push({"state": tangent(state, gradient), "coord": coordfirst});
//		boardVals[0].push({"state": taylorthird(state, gradient, curve, inflect), "coord": coordfirst});
		removePiece(coordfirst, currPlayer);
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
    if(currPlayer == RED) {
/*	return {"red": x.red,
		"green": x.green + y.green + z.green/2 + w.green / 6,
		"blue": x.blue + 2*y.blue + 2*z.blue/2 + 4*w.blue / 3}*/

	return x;
    } else if (currPlayer == GREEN) {
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
    for(var i = 0; i < NUMHEXES; i++) {
	for(var j = -Math.floor(i / 2); j < NUMHEXES - Math.floor(i / 2); j++) {
	    var coord = [j, -(j+i), i];
	    if(checkOpen(coord, currPlayer)) {
		moves.push(coord);
	    }
	}
    } 
    var rand = Math.floor(Math.random()*moves.length);
    return moves[rand];
}