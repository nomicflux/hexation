var size = NUMHEXES;
var MIDDLESIZE = 4;
var offset = Math.floor((size-1)/2);

function Brain() {
}

var input = [];
var output = [];
var memlayers = {"upleft": [], "downright": [], "upright": [], "downleft": [], "left": [], "right": []};
var outputlayers = {"upleft": [], "downright": [], "upright": [], "downleft": [], "left": [], "right": []};
var w = {"upleft": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "downright": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "upright": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "downleft": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "left": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "right": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "playerOutput": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
	 "middleOutput": [],
	 "finalOutput": []}

function inputVals() {
    for(var q = 0; q < size; q++) {
	for(var p = 0 - Math.floor(q/2); p < size - 1 - Math.floor(q/2); p++) {
//	    var pos = boardNum(rgbCoord(p,q));
	    var val = boardVal([p,-(p+q),q]);
	    if(val == EMPTY || val > POSSIBLESHIFT) { input[p + offset][q] = 1; } else {input[p + offset][q] = 0;}
	}
    }
}

function loadWeights(weights) {
    index = 0;
    w.upleft.input = weights[index++];
    w.upleft.inputgate = weights[index++];
    w.upleft.forgetgateone  = weights[index++];
    w.upleft.recurone = weights[index++];
    w.upleft.forgetgatetwo = weights[index++];
    w.upleft.recurtwo = weights[index++];
    w.upleft.memoutput = weights[index++];
    w.upleft.outputgate = weights[index++];
    
    w.downright.input = weights[index++];
    w.downright.inputgate = weights[index++];
    w.downright.forgetgateone  = weights[index++];
    w.downright.recurone = weights[index++];
    w.downright.forgetgatetwo = weights[index++];
    w.downright.recurtwo = weights[index++];
    w.downright.memoutput = weights[index++];
    w.downright.outputgate = weights[index++];
    
    w.upright.input = weights[index++];
    w.upright.inputgate = weights[index++];
    w.upright.forgetgateone  = weights[index++];
    w.upright.recurone = weights[index++];
    w.upright.forgetgatetwo = weights[index++];
    w.upright.recurtwo = weights[index++];
    w.upright.memoutput = weights[index++];
    w.upright.outputgate = weights[index++];
    
    w.downleft.input = weights[index++];
    w.downleft.inputgate = weights[index++];
    w.downleft.forgetgateone  = weights[index++];
    w.downleft.recurone = weights[index++];
    w.downleft.forgetgatetwo = weights[index++];
    w.downleft.recurtwo = weights[index++];
    w.downleft.memoutput = weights[index++];
    w.downleft.outputgate = weights[index++];
    
    w.left.input = weights[index++];
    w.left.inputgate = weights[index++];
    w.left.forgetgateone  = weights[index++];
    w.left.recurone = weights[index++];
    w.left.forgetgatetwo = weights[index++];
    w.left.recurtwo = weights[index++];
    w.left.memoutput = weights[index++];
    w.left.outputgate = weights[index++];
    
    w.right.input = weights[index++];
    w.right.inputgate = weights[index++];
    w.right.forgetgateone  = weights[index++];
    w.right.recurone = weights[index++];
    w.right.forgetgatetwo = weights[index++];
    w.right.recurtwo = weights[index++];
    w.right.memoutput = weights[index++];
    w.right.outputgate = weights[index++];

    for(var i = 0; i < 6; i++) {
	for(var j = 0; j < 3; j++) {
	    w.playerOutput[i][j] = weights[index++];
	}
    }

    for(var i = 0; i < MIDDLESIZE; i++) {
	for(var j = 0; j < 6; j++) {
	    w.middleOutput[i][j] = weights[index++];
	}
    }

    for(var i = 0; i < MIDDLESIZE; i++) {
	w.finalOutput[i] = weights[index++];
    }
    console.log("Index: ", index, "Total weights: ", weights.length);
}
function f(val) {
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
}

function g(val) {
    if(val < -45) {
	return 0.0;
    } else if(val > 45) {
	return 1.0;
    } else {
	return 1 / (1.0 + Math.exp(-val));
    }
}

function setupLayers() {
    input = [];
    output = [];
    memlayers = {"upleft": [], "downright": [], "upright": [], "downleft": [], "left": [], "right": []};
    outputlayers = {"upleft": [], "downright": [], "upright": [], "downleft": [], "left": [], "right": []};
    w = {"upleft": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "downright": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "upright": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "downleft": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "left": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "right": {"input": 0, "inputgate": 0, "forgetgateone": 0, "recurone": 0, "forgetgatetwo": 0, "recurtwo": 0, "memoutput": 0, "outputgate": 0},
	 "playerOutput": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
	 "middleOutput": [],
	 "finalOutput": []}

    for(var x = 0; x < size + offset; x++) {    
	memlayers.upleft.push([]);
	memlayers.downright.push([]);
	memlayers.upright.push([]);
	memlayers.downleft.push([]);
	memlayers.left.push([]);
	memlayers.right.push([]);
	
	outputlayers.upleft.push([]);
	outputlayers.downright.push([]);
	outputlayers.upright.push([]);
	outputlayers.downleft.push([]);
	outputlayers.left.push([]);
	outputlayers.right.push([]);
	
	input.push([]);
	output.push([]);
	
	for(var y = 0; y < size; y++) {
	    memlayers.upleft[x][y] = 0;
	    memlayers.downright[x][y] = 0;
	    memlayers.upright[x][y] = 0;
	    memlayers.downleft[x][y] = 0;
	    memlayers.left[x][y] = 0;
	    memlayers.right[x][y] = 0;
	    
	    outputlayers.upleft[x][y] = 0;
	    outputlayers.downright[x][y] = 0;
	    outputlayers.upright[x][y] = 0;
	    outputlayers.downleft[x][y] = 0;
	    outputlayers.left[x][y] = 0;
	    outputlayers.right[x][y] = 0;
	    
	    input[x][y] = 0;
	    
	    output[x][y] = 0;
	    output[x][y] = 0;
	    output[x][y] = 0;
	}
    }

    for(var i = 0; i < MIDDLESIZE; i++) {
	w.middleOutput.push([0,0,0,0,0,0]);
	w.finalOutput.push(0);
    }
}

function getOutputs(colour) {
    var weightRotate = [];
    /*
    if(colour == RED) {
	weightRotate = ["upleft", "downright", "upright", "downleft", "left", "right"];
    } else if (colour == GREEN) {
	weightRotate = ["downleft", "upright", "left", "right", "downright", "upleft"];
    } else if (colour == BLUE) {
	weightRotate = ["left", "right", "upleft", "downright", "downleft", "upright"];
    }*/
    weightRotate = ["upleft", "downright", "upright", "downleft", "left", "right"];
    console.log(weightRotate);
    var invert = size - 1;
    var p,q,memvecone,memvectwo, mem;
    for(var x = 0; x < size; x++) {
	for(var y = 0; y < size; y++) {
	    q = y;
	    p = x + offset - Math.floor(q/2);
	    i = input[p][q];
	    weight = w[weightRotate[0]];
	    if(q-1 >= 0) { memvecone = memlayers.upleft[p][q-1]; } else { memvecone = 0.0; }
	    if(p-1 >= 0) { memvectwo = memlayers.upleft[p-1][q]; } else { memvectwo = 0.0; }
	    mem = f(i * weight.input) * g(i*weight.inputgate) 
		+ memvecone * g(i*weight.forgetgateone + memvecone * weight.recurone) 
		+ memvectwo * g(i*weight.forgetgatetwo + memvectwo * weight.recurtwo);
	    memlayers.upleft[p][q] = mem;
	    outputlayers.upleft[p][q] = f(mem*weight.memoutput)*g(i*weight.outputgate);
	    
	    q = invert - y;
	    p = (invert - x) + offset - Math.floor(q/2);
	    i = input[p][q];
	    weight = w[weightRotate[1]];
	    if(q+1 < size) { memvecone = memlayers.downright[p][q+1]; } else { memvecone = 0; }
	    if(p+1 < size) { memvectwo = memlayers.downright[p+1][q]; } else { memvectwo = 0; }
	    mem = f(i * weight.input) * g(i*weight.inputgate) + memvecone * g(i*weight.forgetgateone + memvecone * weight.recurone) + memvectwo * g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    memlayers.downright[p][q] = mem;
	    outputlayers.downright[p][q] = f(mem*weight.memoutput)*g(i*weight.outputgate);
	    
	    q = invert - y;
	    p = x + offset - Math.floor(q/2);
	    i = input[p][q];
	    weight = w[weightRotate[2]];
	    if(p-1 >= 0) { memvectwo = memlayers.upright[p-1][q]; } else { memvectwo = 0; }
	    if(q+1 < size && p-1 >= 0) { memvecone = memlayers.upright[p-1][q+1]; } else { memvecone = 0; }
	    mem = f(i * weight.input) * g(i*weight.inputgate) + memvecone * g(i*weight.forgetgateone + memvecone * weight.recurone) + memvectwo * g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    memlayers.upright[p][q] = mem;
	    outputlayers.upright[p][q] = f(mem*weight.memoutput)*g(i*weight.outputgate);
	    
	    q = y;
	    p = (invert - x) + offset - Math.floor(q/2);
	    i = input[p][q];
	    weight = w[weightRotate[3]];
	    if(p+1 < size && q-1 >= 0) { memvecone = memlayers.downleft[p+1][q-1]; } else { memvecone = 0; }
	    if(p+1 < size) { memvectwo = memlayers.downleft[p+1][q]; } else { memvectwo = 0; }
	    mem = f(i * weight.input) * g(i*weight.inputgate) + memvecone * g(i*weight.forgetgateone + memvecone * weight.recurone) + memvectwo * g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    memlayers.downleft[p][q] = mem;
	    outputlayers.downleft[p][q] = f(mem*weight.memoutput)*g(i*weight.outputgate);
	    
	    q = y;
	    p = (invert - x) + offset - Math.floor(q/2);
	    i = input[p][q];
	    weight = w[weightRotate[4]];
	    if(p+1 < size && q-1 >= 0) { memvecone = memlayers.left[p+1][q-1]; } else { memvecone = 0; }
	    if(q-1 >= 0) { memvectwo = memlayers.left[p][q-1]; } else { memvectwo = 0; }
	    mem = f(i * weight.input) * g(i*weight.inputgate) + memvecone * g(i*weight.forgetgateone + memvecone * weight.recurone) + memvectwo * g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    memlayers.left[p][q] = mem;
	    outputlayers.left[p][q] = f(mem*weight.memoutput)*g(i*weight.outputgate);
	    
	    q = invert - y;
	    p = x + offset - Math.floor(q/2);
	    i = input[p][q];
	    weight = w[weightRotate[5]];
	    if(p-1 >= 0 && q+1 < size) { memvectwo = memlayers.right[p-1][q+1]; } else { memvectwo = 0; }
	    if(q+1 < size) { memvecone = memlayers.right[p][q+1]; } else { memvecone = 0; }
	    mem = f(i * weight.input) * g(i*weight.inputgate) + memvecone * g(i*weight.forgetgateone + memvecone * weight.recurone) + memvectwo * g(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	    memlayers.right[p][q] = mem;
	    outputlayers.right[p][q] = f(mem*weight.memoutput)*g(i*weight.outputgate);
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
    for(var q = 0; q < size; q++) {	
	for(var p = offset - Math.floor(q/2); p < size - 1 + offset - Math.floor(q/2); p++) {
//	    console.log("Player weights: ", w.playerOutput);
//	    console.log("Middle weights: ", w.middleOutput);
//	    console.log("Final weights: ", w.finalOutput);
	    var processed = [g(outputlayers.upleft[p][q]) * dot(w.playerOutput[0], player),
			     g(outputlayers.downright[p][q]) * dot(w.playerOutput[1], player),
			     g(outputlayers.upright[p][q]) * dot(w.playerOutput[2], player),
			     g(outputlayers.downleft[p][q]) * dot(w.playerOutput[3], player),
			     g(outputlayers.left[p][q]) * dot(w.playerOutput[4], player),
			     g(outputlayers.right[p][q]) * dot(w.playerOutput[5], player)];
	    
	    var middle = [];
	    for(var i = 0; i < MIDDLESIZE; i++) {
		middle.push(f( dot(processed, 
				   w.middleOutput[i])));
	    }	    
	    output[p][q] = g(dot(middle, w.finalOutput));
	}
    }
    
    console.log("NNet Outputs: ", output);
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

function straightNNVal(colour) {
    var max, coordp, coordq;
    var coordq = -1;
    var prob = 1 / (Math.sqrt(NUMHEXES));
    for(var q = 0; q < size; q++) {
	for(var p = 0 - Math.floor(q/2); p < size -1- Math.floor(q/2); p++) {
	    var val = output[p+offset][q];
	    var coord = [p,-(p+q), q];
	    if(checkOpen(coord, colour)) {
		if(coordq == -1 || val > max || (val == max && Math.random() > prob)) {
		    max = val;
		    coordp = p;
		    coordq = q;
		}
	    }
	}
    }
    return [coordp,-(coordp+coordq),coordq];
}

function probNNVal(colour) {
    var val, max, coordp, coordq;
    coordq = -1;
    var vals = [];
    for(var q = 0; q < size; q++) {
	for(var p = 0 - Math.floor(q/2); p < size - 1 - Math.floor(q/2); p++) {
	    var val = output[p+offset][q];
	    var pos = [p, -(p+q), q];
	    if(checkOpen(pos, colour)) {
		vals.push({"pref": val, "coord": pos});
		if(coordq == -1 || val > max) { max = val; }
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

function startupNN(weights) {
    setupLayers();
    loadWeights(weights);
}

function playNN(colour) {
    inputVals();
    getOutputs(colour);
    return straightNNVal(colour);
}
