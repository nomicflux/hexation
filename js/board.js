var _board = function(_c, brain) {
    var numhexes = _c.BASE_NUMHEXES;
    // var maxhexes = (numhexes * numhexes) - 1;
    // var hexlength = Math.floor(Math.min(_c.WIDTH,_c.HEIGHT) / (numhexes+1));
    
    // var longside = hexlength / 2;
    // var shortside = longside / _c.SQRTTHREE;
    // var side = 2*shortside;
    
    // var origin = [shortside + side/2, hexlength / 2];
    // var pbasis = [0, hexlength];
    // var qbasis = [shortside + side, hexlength / 2];
    
    // var det = pbasis[0]*qbasis[1] - qbasis[0]*pbasis[1];
    // var xbasis = [qbasis[1] / det, -pbasis[1] / det];
    // var ybasis = [-qbasis[0] / det, pbasis[0] / det];

    var shadedTiles = [];
    var tiles = [];
    var maxhexes, hexlength, longside, shortside, side, origin, pbasis, qbasis, det, xbasis, ybasis;

    var svg = d3.select("#game").append("svg")
        .attr("width", _c.WIDTH)
        .attr("height",_c.HEIGHT)
        .attr("style","margin: 10px; padding: 10px; float: left; ");

    var path = svg.append("g").selectAll("path");

    function getSize() {
        return numhexes;
    };

    function getMaxSize() {
        return maxhexes;
    };

    function initialBoard() {
        hexagonBoard(7);
    };

    function setSize(n) {
        numhexes = n;
        brain.resetVals(n);

        maxhexes = (numhexes * numhexes) - 1;
        hexlength = Math.floor(Math.min(_c.WIDTH,_c.HEIGHT) / (numhexes+1));

        longside = hexlength / 2;
        shortside = longside / _c.SQRTTHREE;
        side = 2*shortside;

        origin = [shortside + side/2, hexlength / 2];
        pbasis = [0, hexlength];
        qbasis = [shortside + side, hexlength / 2];

        det = pbasis[0]*qbasis[1] - qbasis[0]*pbasis[1];
        xbasis = [qbasis[1] / det, -pbasis[1] / det];
        ybasis = [-qbasis[0] / det, pbasis[0] / det];
    }

    function emptyBoard(n) {
        setSize(n);
        tiles = d3.range(numhexes*numhexes).map(function(d) {
	    var i = d % numhexes;
	    var j = Math.floor(d / numhexes) - Math.floor(i/2);
	    return {"coord": coordToPoint([j,i]), "type": _c.NONEXISTENT};
        });
    }

    function makeBoard(n,val) {
        setSize(n);
        tiles = d3.range(numhexes*numhexes).map(function(d) {
	    var i = d % numhexes;
	    var j = Math.floor(d / numhexes) - Math.floor(i/2);
	    return {"coord": coordToPoint([j,i]), "type": val};
        });
        alterBoard();
        d3.select("#donemaking").attr("style","display: show");
        d3.select("#change").attr("style","display: none");
        d3.select("#reset").attr("style","display: none");
    }

    function madeBoard() {
        d3.select("#donemaking").attr("style","display: none");
        d3.select("#change").attr("style","display: show");
        d3.select("#reset").attr("style","display: show");
        for(var i = 0; i < tiles.length; i++) {
	    if(tiles[i].type == _c.NONBOARD) { tiles[i].type = _c.NONEXISTENT; }
        }
        redraw();
        playBoard();
    }

    function resetBoard() {
        //resetPlayers();
        for(var i = 0; i < tiles.length; i++) {
	    if(tiles[i].type > _c.EMPTY) { tiles[i].type = _c.EMPTY; }
        }
        redraw();
//        setTimeout(computerPlayer(),1);
    }

    function randomBoard(n) {
        setSize(n);
        tiles = d3.range(numhexes*numhexes).map(function(d) {
	    var i = d % numhexes;
	    var j = Math.floor(d / numhexes) - Math.floor(i/2);
	    if (Math.random()*5 > 2) {
	        return {"coord": coordToPoint([j,i]), "type": _c.EMPTY};
	    } else {
	        return {"coord": coordToPoint([j,i]), "type": _c.NONBOARD};
	    }
        });
    }

    function rhombusBoard(n) {
        var bottom = 2*n-1;
        var leftover = Math.ceil(n/2)
        emptyBoard(bottom-leftover+1);
        for(var i = 0; i<n; i++) {
	    for(var j = 0; j<n; j++) {
	        tiles[boardNum(rgbCoord([(bottom-leftover) - j - i,i]))].type = _c.EMPTY;
	    }
        }
    }

    function triangleBoard(n) {
        emptyBoard(n);

        var p = 0;
        var q = 0;
        
        tiles[boardNum(rgbCoord([p,q]))].type = _c.EMPTY;

        for(var j = 0; j < n; j++) {
	    for(var k = 0; k < n; k++) {
	        if(j + k < n) {
		    tiles[boardNum(rgbCoord([p + j,q + k]))].type = _c.EMPTY; 
		    tiles[boardNum(rgbCoord([p + k,q + j]))].type = _c.EMPTY;
	        }
	    }
        }

    }

    function hexagonBoard(n) {
        emptyBoard((n-1)*2+1);

        var p = Math.floor(n/2);
        var q = n -1;
        
        tiles[boardNum(rgbCoord([p,q]))].type = _c.EMPTY;
        
        for(var j = 0; j < n; j++) {
	    for(var k = 0; k < n; k++) {
                /*	    if(k-j <= n) { 
		            tiles[boardNum(rgbCoord([p - j,q + k]))].type = _c.EMPTY; 
		            tiles[boardNum(rgbCoord([p + k,q - j]))].type = _c.EMPTY;
	                    } */ 
	        if(j - k <= n) {
		    tiles[boardNum(rgbCoord([p + j,q - k]))].type = _c.EMPTY; 
		    tiles[boardNum(rgbCoord([p - k,q + j]))].type = _c.EMPTY;
	        }

	        if(j + k < n) {
		    tiles[boardNum(rgbCoord([p + j,q + k]))].type = _c.EMPTY; 
		    tiles[boardNum(rgbCoord([p + k,q + j]))].type = _c.EMPTY;
	        }
	        if(-j - k > -n) {
		    tiles[boardNum(rgbCoord([p - j,q - k]))].type = _c.EMPTY; 
		    tiles[boardNum(rgbCoord([p - k,q - j]))].type = _c.EMPTY;
	        }
	    }
        }
    }

    function coordToPoint(coord) {
        return [origin[0] + coord[0]*pbasis[0] + coord[1]*qbasis[0], origin[1] + coord[0]*pbasis[1] + coord[1]*qbasis[1]];
    }

    function pointToCoord(point) {
        var p = point[0] - origin[0];
        var q = point[1] - origin[1];
        var x = p*xbasis[0] + q*ybasis[0];
        var y = p*xbasis[1] + q*ybasis[1];

        return rgbCoord(neighbourCheck(x,y));
    }

    function rgbCoord(axial) {
        return [axial[0],-(axial[1]+axial[0]),axial[1]];
    }

    function axialCoord(rgb) {
        return [rgb[0],rgb[2]];
    }

    function clearShaded(coord) {
        if( shadedTiles[0]) {
	    for(var i = 0; i < shadedTiles.length; i++) {
	        tiles[shadedTiles[i]].type = _c.EMPTY;
	    }
	    shadedTiles = [];
	    redraw();
        }
    }

    function fullPlacePiece(coord, colour) {
	clearShaded();
	placePiece(coord, colour);
	redraw();
    }

    function placePiece(coord,colour) {
//        if(!colour) { colour = currPlayer; }  // Make sure this never happens;
        if(!colour) { colour = null; }
	var pos1 = boardNum(coord);
        var pos2 = boardNum(nextTile(coord, colour));
        tiles[pos1].type = colour;
        tiles[pos2].type = colour;
    }

    function removePiece(coord, colour) {
        if(checkValue(coord,colour,colour)) {
	    var pos1 = boardNum(coord);
	    var pos2 = boardNum(nextTile(coord, colour));
	    tiles[pos1].type = _c.EMPTY;
	    tiles[pos2].type = _c.EMPTY;
        }
    }


    function neighbourCheck(x,y) {
        var roundCoordX = Math.round(x);
        var roundCoordY = Math.round(y);
        var alts = [[roundCoordX,roundCoordY],
		    [roundCoordX, roundCoordY - 1],
		    [roundCoordX, roundCoordY + 1],
		    [roundCoordX - 1, roundCoordY],
		    [roundCoordX - 1, roundCoordY + 1],
		    [roundCoordX +1, roundCoordY + 1],
		    [roundCoordX +1, roundCoordY]];
        var min = Math.pow(x-alts[0][0],2) + Math.pow(y-alts[0][1],2);
        var newX = roundCoordX;
        var newY = roundCoordY;
        for(var i = 1; i<7; i++) {
	    var norm = Math.pow(x-alts[i][0],2) + Math.pow(y-alts[i][1],2);
	    if (norm < min) {
	        min = norm;
	        newX = alts[i][0];
	        newY = alts[i][1];
	    }
        }
        return [newX,newY];
    }

    function redraw() {
        path = path
	    .data(tiles, hexagon);
        
        path.exit().remove();

        path.enter().append("path")
	    .attr("d",hexagon);

        if (brain.getBrainThinking()){
            path.attr("class", function(d,i) {
                if(d.type == 0) {
	            return "tile0-tint";
                } else { 
	            return "tile" + d.type;
                }
            })
	        .transition()
                .attr("opacity", function(d,i) { 
//                    console.log("D", d, d.tint);
	            if(d.tint !== null) {
	                console.log(d);
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
        var start = [centre.x - (shortside+side/2), centre.y]
        var path = [[shortside,longside],
		    [side, 0], 
		    [shortside, -longside],
		    [-shortside, -longside],
		    [-side, 0], 
		    [-shortside, longside] ];
	
        return "M" + start + "l "+ path.join("l") +" z";
    }

    function boardNum(rgbpt) {
        return rgbpt[2] + (rgbpt[0] +  Math.floor(rgbpt[2]/2))*numhexes;
    }

    function changeTint(coord, val) {
        if(boardNum(coord) < maxhexes) {
	    tiles[boardNum(coord)].tint = val;
        }
    }

    function boardVal(rgbpt) {
        var num = boardNum(rgbpt);
        if (num < 0 || num > maxhexes) {
	    return _c.NONBOARD;
        } else {
	    return tiles[num].type;
        }
    }

    function legitCoord(coord) {
	return (coord[2] >= 0 && coord[2] < numhexes && coord[0] >= (0 - Math.floor(coord[2]/2)) && coord[0] < (numhexes - Math.floor(coord[2]/2)));
    }

    function nextTile(coord,colour) {
//        if (!colour) {  colour = currPlayer;   }
        if (!colour) {  colour = null;   }
        //    alert(coord);
        var newCoord;
        if (colour == _c.RED) {
	    newCoord = [coord[0],coord[1]+1,coord[2]-1];
        } else if (colour == _c.GREEN) {
	    newCoord = [coord[0]-1,coord[1],coord[2]+1];
        } else if (colour == _c.BLUE) {
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
        return checkValue(coord, colour, _c.EMPTY);
    }

    function checkPossible(coord,colour) {
        if(!colour) { colour = currPlayer; }
        return checkValue(coord,colour, (colour + _c.POSSIBLESHIFT));
    }

    function shadeTiles(coord, currPlayer) {
        clearShaded();
        if (checkOpen(coord, currPlayer)) {
	    var pos1 = boardNum(coord);
	    var pos2 = boardNum(nextTile(coord, currPlayer));
	    tiles[pos1].type = currPlayer + _c.POSSIBLESHIFT;
	    tiles[pos2].type = currPlayer + _c.POSSIBLESHIFT;
	    shadedTiles.push(pos1);
	    shadedTiles.push(pos2);
        } 
        redraw();
    }

    function toggleSpot(rgbpt) {
        if(boardVal(rgbpt) == _c.EMPTY) { tiles[boardNum(rgbpt)].type = _c.NONBOARD; } else { tiles[boardNum(rgbpt)].type = _c.EMPTY; }
        redraw();
    }

    function alterBoard() {
        svg.on("mousemove",null)
	    .on("mousedown",function() { toggleSpot(pointToCoord(d3.mouse(this)));  });
    }

    function changeBoard() {
        clearShaded();
        tiles = [];
        var size = Number(bdsize.value);
        var type = bdtype.value;
        if(type == "hex") {
            hexagonBoard(size);
        } else if (type == "tri") {
	    triangleBoard(size);
        } else if (type == "rhom") {
	    rhombusBoard(size);
        } else if (type == "makefull") {
	    makeBoard(size,_c.EMPTY);
        } else if (type == "makeempty") {
	    makeBoard(size,NONBOARD);
        } else {
	    randomBoard(size);
        }
//        resetPlayers();
        redraw();
    }

    function checkBoardPositions(colour) {
        for(var k=0; k < tiles.length; k++) {
 	    if (tiles[k].type == _c.EMPTY && 
                checkOpen(pointToCoord(tiles[k].coord), colour)) {
	        return true;
	    }
        }
        return false;
    }

    function boardState() {
        //    clearShaded();
        var num = 0;
        var playerVals = {"red": 0, "green": 0, "blue": 0}
        for(var i = 0; i < numhexes; i++) {
	    for(var j = -Math.floor(i / 2); j < numhexes - Math.floor(i / 2); j++) {
	        var midval = -(j+i)
                //	    if(checkOpen([j, -(j+i), i], _c.RED)) { playerVals.red++; }
                //	    if(checkOpen([j, -(j+i), i], _c.GREEN)) { playerVals.green++; }
                //	    if(checkOpen([j, -(j+i), i], _c.BLUE)) { playerVals.blue++; }
	        if(boardVal([j,midval, i]) == _c.EMPTY) {
		    if(boardVal([j,midval+1,i-1]) == _c.EMPTY) { playerVals.red++; }
		    if(boardVal([j-1,midval,i+1]) == _c.EMPTY) { playerVals.green++; }
		    if(boardVal([j-1,midval+1,i]) == _c.EMPTY) { playerVals.blue++; }
	        }
	    }
        }
        return playerVals;
    }

    function validTile(pos) {
        return pos < tiles.length && tiles[pos].type == _c.EMPTY;
    }

    return {
        removePiece: removePiece,
        getSize: getSize,
        getMaxSize: getMaxSize,
        resetBoard: resetBoard,
        changeBoard: changeBoard,
        shadeTiles: shadeTiles,
        placePiece: placePiece,
        fullPlacePiece: fullPlacePiece,
        redraw: redraw,
        initialBoard: initialBoard,
        boardVal: boardVal,
        boardNum: boardNum,
        boardState: boardState,
        validTile: validTile,
        changeTint: changeTint,
        checkBoardPositions: checkBoardPositions,
        pointToCoord: pointToCoord,
        checkOpen: checkOpen,
        checkPossible: checkPossible,
        svg: svg
    };
};
