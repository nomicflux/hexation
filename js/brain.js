var brainThinking = false;

var brainConfig = {
    size: NUMHEXES,
    offset:  Math.floor((NUMHEXES-1)/2),
    f: function(val) {
	if(val < -45) {
	    return -1.0;
	} else if(val > 45) {
	    return 1.0;
	} else {
	    sinh = Math.exp(val) - Math.exp(-val);
	    cosh = Math.exp(val) + Math.exp(-val);
	    return sinh / cosh;
	}
	//    return Math.tanh(val);
    },
    g: function(val) {
	if(val < -45) {
	    return 0.0;
	} else if(val > 45) {
	    return 1.0;
	} else {
	    return 1 / (1.0 + Math.exp(-val));
	}
    },
    resetVals: function(val) {
	this.size = val;
	this.offset = Math.floor((val - 1) / 2);
    }
};

function Brain(ms, weights, rotate) {
    this.middlesize = ms;
    this.input = [];
    this.output = [];
    if(rotate) { this.rotate = rotate; } else { this.rotate = false; }
    this.memlayers = {"upleft": [], "downright": [], "upright": [], "downleft": [], "left": [], "right": []};
    this.outputlayers = {"upleft": [], "downright": [], "upright": [], "downleft": [], "left": [], "right": []};
    this.w = {"upleft": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "downright": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "upright": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "downleft": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "left": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "right": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "playerOutput": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
	 "middleOutput": [],
	 "finalOutput": []}

    // Setup layers
    for(var x = 0; x < brainConfig.size + brainConfig.offset; x++) {    
	this.memlayers.upleft.push([]);
	this.memlayers.downright.push([]);
	this.memlayers.upright.push([]);
	this.memlayers.downleft.push([]);
	this.memlayers.left.push([]);
	this.memlayers.right.push([]);
	
	this.outputlayers.upleft.push([]);
	this.outputlayers.downright.push([]);
	this.outputlayers.upright.push([]);
	this.outputlayers.downleft.push([]);
	this.outputlayers.left.push([]);
	this.outputlayers.right.push([]);
	
	this.input.push([]);
	this.output.push([]);
	
	for(var y = 0; y < brainConfig.size; y++) {
	    this.memlayers.upleft[x][y] = 0;
	    this.memlayers.downright[x][y] = 0;
	    this.memlayers.upright[x][y] = 0;
	    this.memlayers.downleft[x][y] = 0;
	    this.memlayers.left[x][y] = 0;
	    this.memlayers.right[x][y] = 0;
	    
	    this.outputlayers.upleft[x][y] = 0;
	    this.outputlayers.downright[x][y] = 0;
	    this.outputlayers.upright[x][y] = 0;
	    this.outputlayers.downleft[x][y] = 0;
	    this.outputlayers.left[x][y] = 0;
	    this.outputlayers.right[x][y] = 0;
	    
	    this.input[x][y] = 0;
	    
	    this.output[x][y] = 0;
	    this.output[x][y] = 0;
	    this.output[x][y] = 0;
	}
    }

    for(var i = 0; i < this.middlesize; i++) {
	this.w.middleOutput.push([0,0,0,0,0,0]);
	this.w.finalOutput.push(0);
    }

    this.loadWeights(weights);

//    alert(this.weightsToArray());
}

Brain.prototype.inputVals = function() {
    for(var q = 0; q < brainConfig.size; q++) {
	for(var p = 0 - Math.floor(q/2); p < brainConfig.size - 1 - Math.floor(q/2); p++) {
//	    var pos = boardNum(rgbCoord(p,q));
	    var val = boardVal([p,-(p+q),q]);
	    if(val == EMPTY || val > POSSIBLESHIFT) { 
		this.input[p + brainConfig.offset][q] = 1; 
	    } else { 
		this.input[p + brainConfig.offset][q] = 0;
	    }
	}
    }
};

Brain.prototype.loadWeights = function(weights) {
    index = 0;
    this.w.upleft.input = weights[index++];
    this.w.upleft.inputgate = weights[index++];
    this.w.upleft.forgetgateone  = weights[index++];
    this.w.upleft.recurone = weights[index++];
    this.w.upleft.forgetgatetwo = weights[index++];
    this.w.upleft.recurtwo = weights[index++];
    this.w.upleft.memoutput = weights[index++];
    this.w.upleft.outputgate = weights[index++];
    
    this.w.downright.input = weights[index++];
    this.w.downright.inputgate = weights[index++];
    this.w.downright.forgetgateone  = weights[index++];
    this.w.downright.recurone = weights[index++];
    this.w.downright.forgetgatetwo = weights[index++];
    this.w.downright.recurtwo = weights[index++];
    this.w.downright.memoutput = weights[index++];
    this.w.downright.outputgate = weights[index++];
    
    this.w.upright.input = weights[index++];
    this.w.upright.inputgate = weights[index++];
    this.w.upright.forgetgateone  = weights[index++];
    this.w.upright.recurone = weights[index++];
    this.w.upright.forgetgatetwo = weights[index++];
    this.w.upright.recurtwo = weights[index++];
    this.w.upright.memoutput = weights[index++];
    this.w.upright.outputgate = weights[index++];
    
    this.w.downleft.input = weights[index++];
    this.w.downleft.inputgate = weights[index++];
    this.w.downleft.forgetgateone  = weights[index++];
    this.w.downleft.recurone = weights[index++];
    this.w.downleft.forgetgatetwo = weights[index++];
    this.w.downleft.recurtwo = weights[index++];
    this.w.downleft.memoutput = weights[index++];
    this.w.downleft.outputgate = weights[index++];
    
    this.w.left.input = weights[index++];
    this.w.left.inputgate = weights[index++];
    this.w.left.forgetgateone  = weights[index++];
    this.w.left.recurone = weights[index++];
    this.w.left.forgetgatetwo = weights[index++];
    this.w.left.recurtwo = weights[index++];
    this.w.left.memoutput = weights[index++];
    this.w.left.outputgate = weights[index++];
    
    this.w.right.input = weights[index++];
    this.w.right.inputgate = weights[index++];
    this.w.right.forgetgateone  = weights[index++];
    this.w.right.recurone = weights[index++];
    this.w.right.forgetgatetwo = weights[index++];
    this.w.right.recurtwo = weights[index++];
    this.w.right.memoutput = weights[index++];
    this.w.right.outputgate = weights[index++];
    
    for(var i = 0; i < 6; i++) {
	for(var j = 0; j < 3; j++) {
	    this.w.playerOutput[i][j] = weights[index++];
	}
    }

    for(var i = 0; i < this.middlesize; i++) {
	for(var j = 0; j < 6; j++) {
	    this.w.middleOutput[i][j] = weights[index++];
	}
    }

    for(var i = 0; i < this.middlesize; i++) {
	this.w.finalOutput[i] = weights[index++];
    }

    console.log("Index: ", index, "Total weights: ", weights.length);
};

Brain.prototype.weightsToArray = function() {
    var weights = [];
    weights.push(this.w.upleft.input);
    weights.push(this.w.upleft.inputgate);
    weights.push(this.w.upleft.forgetgateone);
    weights.push(this.w.upleft.recurone);
    weights.push(this.w.upleft.forgetgatetwo);
    weights.push(this.w.upleft.recurtwo);
    weights.push(this.w.upleft.memoutput);
    weights.push(this.w.upleft.outputgate);
    
    weights.push(this.w.downright.input);
    weights.push(this.w.downright.inputgate);
    weights.push(this.w.downright.forgetgateone);
    weights.push(this.w.downright.recurone);
    weights.push(this.w.downright.forgetgatetwo);
    weights.push(this.w.downright.recurtwo);
    weights.push(this.w.downright.memoutput);
    weights.push(this.w.downright.outputgate);
    
    weights.push(this.w.upright.input);
    weights.push(this.w.upright.inputgate);
    weights.push(this.w.upright.forgetgateone);
    weights.push(this.w.upright.recurone);
    weights.push(this.w.upright.forgetgatetwo);
    weights.push(this.w.upright.recurtwo);
    weights.push(this.w.upright.memoutput);
    weights.push(this.w.upright.outputgate);
    
    weights.push(this.w.downleft.input);
    weights.push(this.w.downleft.inputgate);
    weights.push(this.w.downleft.forgetgateone);
    weights.push(this.w.downleft.recurone);
    weights.push(this.w.downleft.forgetgatetwo);
    weights.push(this.w.downleft.recurtwo);
    weights.push(this.w.downleft.memoutput);
    weights.push(this.w.downleft.outputgate);
    
    weights.push(this.w.left.input);
    weights.push(this.w.left.inputgate);
    weights.push(this.w.left.forgetgateone);
    weights.push(this.w.left.recurone);
    weights.push(this.w.left.forgetgatetwo);
    weights.push(this.w.left.recurtwo);
    weights.push(this.w.left.memoutput);
    weights.push(this.w.left.outputgate);
    
    weights.push(this.w.right.input);
    weights.push(this.w.right.inputgate);
    weights.push(this.w.right.forgetgateone);
    weights.push(this.w.right.recurone);
    weights.push(this.w.right.forgetgatetwo);
    weights.push(this.w.right.recurtwo);
    weights.push(this.w.right.memoutput);
    weights.push(this.w.right.outputgate);
    
    for(var i = 0; i < 6; i++) {
	for(var j = 0; j < 3; j++) {
	    weights.push(this.w.playerOutput[i][j]);
	}
    }

    for(var i = 0; i < this.middlesize; i++) {
	for(var j = 0; j < 6; j++) {
	    weights.push(this.w.middleOutput[i][j]);
	}
    }

    for(var i = 0; i < this.middlesize; i++) {
	weights.push(this.w.finalOutput[i]);
    }
    return weights;
};

Brain.prototype.getOutputs = function(colour) {
    var weightRotate = [];
    if(this.rotate) {
	if(colour == RED) {
	    weightRotate = ["upleft", "downright", "upright", "downleft", "left", "right"];
	} else if (colour == GREEN) {
	    weightRotate = ["downleft", "upright", "left", "right", "downright", "upleft"];
	} else if (colour == BLUE) {
	    weightRotate = ["left", "right", "upleft", "downright", "downleft", "upright"];
	}
    } else {
	weightRotate = ["upleft", "downright", "upright", "downleft", "left", "right"];
    }
//    console.log(weightRotate);
    var invert = brainConfig.size - 1;
    var p,q,memvecone,memvectwo, mem;
    for(var x = 0; x < brainConfig.size; x++) {
	for(var y = 0; y < brainConfig.size; y++) {
	    q = y;
	    p = x + brainConfig.offset - Math.floor(q/2);
	    i = this.input[p][q];
	    weight = this.w[weightRotate[0]];
	    if(q-1 >= 0) { memvecone = this.memlayers.upleft[p][q-1]; } else { memvecone = 0.0; }
	    if(p-1 >= 0) { memvectwo = this.memlayers.upleft[p-1][q]; } else { memvectwo = 0.0; }
	    mem = brainConfig.f(i * weight.input) * brainConfig.g(i*weight.inputgate) 
		+ memvecone * brainConfig.g(i*weight.forgetgateone + memvecone * weight.recurone) 
		+ memvectwo * brainConfig.g(i*weight.forgetgatetwo + memvectwo * weight.recurtwo);
	    this.memlayers.upleft[p][q] = mem;
	    this.outputlayers.upleft[p][q] = brainConfig.f(mem*weight.memoutput) * brainConfig.g(i*weight.outputgate);
	    
	    q = invert - y;
	    p = (invert - x) + brainConfig.offset - Math.floor(q/2);
	    i = this.input[p][q];
	    weight = this.w[weightRotate[1]];
	    if(q+1 < brainConfig.size) { memvecone = this.memlayers.downright[p][q+1]; } else { memvecone = 0; }
	    if(p+1 < brainConfig.size) { memvectwo = this.memlayers.downright[p+1][q]; } else { memvectwo = 0; }
	    mem = brainConfig.f(i * weight.input) * brainConfig.g(i*weight.inputgate) 
		+ memvecone * brainConfig.g(i*weight.forgetgateone + memvecone * weight.recurone) 
		+ memvectwo * brainConfig.g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    this.memlayers.downright[p][q] = mem;
	    this.outputlayers.downright[p][q] = brainConfig.f(mem*weight.memoutput) * brainConfig.g(i*weight.outputgate);
	    
	    q = invert - y;
	    p = x + brainConfig.offset - Math.floor(q/2);
	    i = this.input[p][q];
	    weight = this.w[weightRotate[2]];
	    if(p-1 >= 0) { memvectwo = this.memlayers.upright[p-1][q]; } else { memvectwo = 0; }
	    if(q+1 < brainConfig.size && p-1 >= 0) { memvecone = this.memlayers.upright[p-1][q+1]; } else { memvecone = 0; }
	    mem = brainConfig.f(i * weight.input) * brainConfig.g(i*weight.inputgate) 
		+ memvecone * brainConfig.g(i*weight.forgetgateone + memvecone * weight.recurone) 
		+ memvectwo * brainConfig.g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    this.memlayers.upright[p][q] = mem;
	    this.outputlayers.upright[p][q] = brainConfig.f(mem*weight.memoutput) * brainConfig.g(i*weight.outputgate);
	    
	    q = y;
	    p = (invert - x) + brainConfig.offset - Math.floor(q/2);
	    i = this.input[p][q];
	    weight = this.w[weightRotate[3]];
	    if(p+1 < brainConfig.size && q-1 >= 0) { memvecone = this.memlayers.downleft[p+1][q-1]; } else { memvecone = 0; }
	    if(p+1 < brainConfig.size) { memvectwo = this.memlayers.downleft[p+1][q]; } else { memvectwo = 0; }
	    mem = brainConfig.f(i * weight.input) * brainConfig.g(i*weight.inputgate) 
		+ memvecone * brainConfig.g(i*weight.forgetgateone + memvecone * weight.recurone) 
		+ memvectwo * brainConfig.g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    this.memlayers.downleft[p][q] = mem;
	    this.outputlayers.downleft[p][q] = brainConfig.f(mem*weight.memoutput) * brainConfig.g(i*weight.outputgate);
	    
	    q = y;
	    p = (invert - x) + brainConfig.offset - Math.floor(q/2);
	    i = this.input[p][q];
	    weight = this.w[weightRotate[4]];
	    if(p+1 < brainConfig.size && q-1 >= 0) { memvecone = this.memlayers.left[p+1][q-1]; } else { memvecone = 0; }
	    if(q-1 >= 0) { memvectwo = this.memlayers.left[p][q-1]; } else { memvectwo = 0; }
	    mem = brainConfig.f(i * weight.input) * brainConfig.g(i*weight.inputgate) 
		+ memvecone * brainConfig.g(i*weight.forgetgateone + memvecone * weight.recurone) 
		+ memvectwo * brainConfig.g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    this.memlayers.left[p][q] = mem;
	    this.outputlayers.left[p][q] = brainConfig.f(mem*weight.memoutput) * brainConfig.g(i*weight.outputgate);
	    
	    q = invert - y;
	    p = x + brainConfig.offset - Math.floor(q/2);
	    i = this.input[p][q];
	    weight = this.w[weightRotate[5]];
	    if(p-1 >= 0 && q+1 < brainConfig.size) { memvectwo = this.memlayers.right[p-1][q+1]; } else { memvectwo = 0; }
	    if(q+1 < brainConfig.size) { memvecone = this.memlayers.right[p][q+1]; } else { memvecone = 0; }
	    mem = brainConfig.f(i * weight.input) * brainConfig.g(i*weight.inputgate) 
		+ memvecone * brainConfig.g(i*weight.forgetgateone + memvecone * weight.recurone) 
		+ memvectwo * brainConfig.g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    this.memlayers.right[p][q] = mem;
	    this.outputlayers.right[p][q] = brainConfig.f(mem*weight.memoutput) * brainConfig.g(i*weight.outputgate);
	}
    }

    var player;
    if(colour == RED) {
	player = [1,0,0];
    } else if(colour == GREEN) {
	player = [0,1,0];
    } else {
	player = [0,0,1];
    }
    for(var q = 0; q < brainConfig.size; q++) {	
	for(var p = brainConfig.offset - Math.floor(q/2); p < brainConfig.size + brainConfig.offset - Math.floor(q/2); p++) {
//	    console.log("Player weights: ", w.playerOutput);
//	    console.log("Middle weights: ", w.middleOutput);
//	    console.log("Final weights: ", w.finalOutput);
	    var processed = [brainConfig.g(this.outputlayers.upleft[p][q]) * dot(this.w.playerOutput[0], player),
			     brainConfig.g(this.outputlayers.downright[p][q]) * dot(this.w.playerOutput[1], player),
			     brainConfig.g(this.outputlayers.upright[p][q]) * dot(this.w.playerOutput[2], player),
			     brainConfig.g(this.outputlayers.downleft[p][q]) * dot(this.w.playerOutput[3], player),
			     brainConfig.g(this.outputlayers.left[p][q]) * dot(this.w.playerOutput[4], player),
			     brainConfig.g(this.outputlayers.right[p][q]) * dot(this.w.playerOutput[5], player)];
	    
	    var middle = [];
	    for(var i = 0; i < this.middlesize; i++) {
		middle.push(brainConfig.f( dot(processed, 
					       this.w.middleOutput[i])));
	    }	    
	    this.output[p][q] = brainConfig.g(dot(middle, this.w.finalOutput));
	}
    }
    
//    console.log("NNet Outputs: ", this.output);
}

function dot(vec1, vec2) {
    var s = vec1.length;
    var acc = 0;
    for(var i = 0; i < s; i++) {
	acc += vec1[i]*vec2[i];
    }
//    console.log("Vec1: ", vec1, ", Vec2: ", vec2, ", Result: ", acc);
    return acc;
}

Brain.prototype.showThought = function() {
    var max = 0;
    var min = 1;
    for(var q = 0; q < brainConfig.size; q++) {
	for(var p = 0 - Math.floor(q/2); p < brainConfig.size - Math.floor(q/2); p++) {
	    var coord = [p, -(p+q), q];
	    var pos = boardNum(coord);
	    if(pos < tiles.length && tiles[pos].type == 0) {
		max = Math.max(max, this.output[p+brainConfig.offset][q]);
		min = Math.min(min, this.output[p+brainConfig.offset][q]);
	    }
	}
    }
    if(max == min) { min -= 0.01; }
    for(var q = 0; q < brainConfig.size; q++) {
	for(var p = 0 - Math.floor(q/2); p < brainConfig.size - Math.floor(q/2); p++) {
	    var coord = [p, -(p+q), q];
	    var normedOutput = (this.output[p+brainConfig.offset][q] -min) / (max-min);
	    if(normedOutput < 0) { normedOutput = 0; }
	    else if(normedOutput > 1) { normedOutput = 1; }
	    var pos = boardNum(coord);
//	    console.log("Coord: ", coord, " at number ", pos);
	    if(pos < tiles.length) {
		tiles[boardNum(coord)].tint = normedOutput;
	    }
	}
    }
//    clearShaded();
    brainThinking = true;
    redraw();
    setTimeout('clearThought()', 1249);
};

function clearThought() {
   for(var q = 0; q < brainConfig.size; q++) {
	for(var p = 0 - Math.floor(q/2); p < brainConfig.size - Math.floor(q/2); p++) {
	    var coord = [p, -(p+q), q];
	    var pos = boardNum(coord);
//	    console.log("Coord: ", coord, " at number ", pos);
	    if(pos < tiles.length) {
		tiles[boardNum(coord)].tint = null;
	    }
	}
    }
//    console.log("Clearing thought");
    redraw();
    brainThinking = false;
}

Brain.prototype.straightNNVal = function(colour) {
    var coordp, coordq;
    var max = -1;
    var prob = 1 / (Math.sqrt(brainConfig.size));
    for(var q = 0; q < brainConfig.size; q++) {
	for(var p = 0 - Math.floor(q/2); p < brainConfig.size - Math.floor(q/2); p++) {
	    var val = this.output[p+brainConfig.offset][q];
	    var coord = [p,-(p+q), q];
	    if(val > max || (val === max && Math.random() > prob)) {
		if(checkOpen(coord, colour)) {
		    max = val;
		    coordp = p;
		    coordq = q;
//		    console.log("Got a max ", max, " for ", colour, " at ", p, q, " or ", p+brainConfig.offset, q);
		} else {
//		    console.log("Can't place at ", p, q, " for ", colour, " with value ", val);
		} 
	    }
	}
    }
//    console.log("Colour " + colour + ": ", max, coordp, coordq, this.output[coordp + brainConfig.offset][coordq], this.output);
    return [coordp,-(coordp+coordq),coordq];
}

Brain.prototype.probNNVal = function(colour) {
    var val, max, coordp, coordq;
    coordq = -1;
    var vals = [];
    for(var q = 0; q < brainConfig.size; q++) {
	for(var p = 0 - Math.floor(q/2); p < brainConfig.size - Math.floor(q/2); p++) {
	    var val = this.output[p+brainConfig.offset][q];
	    var pos = [p, -(p+q), q];
	    if(checkOpen(pos, colour)) {
		vals.push({"pref": val, "coord": pos});
		if(coordq == -1 || val > max) { max = val; coordq = 0; }
	    }
	}
    }

    var total = 0;
    for(var i = 0; i < vals.length; i++) {
	total += (max - vals[i].pref);
    }

    val = Math.random() * total;
    var i = vals.length - 1;
    var curr = total;
    while (curr > val) {
	curr -= (max - vals[i].pref);
	i--;
    }
    if (i >= vals.length) { i = vals.length - 1; } else if(i < 0) { i = 0; }
    return vals[i].coord
}

Brain.prototype.playNN = function(colour) {
    this.inputVals();
    this.getOutputs(colour);
    if(watchThinking) {
	this.showThought();
    }
    return this.straightNNVal(colour);
}
