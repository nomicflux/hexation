'use strict';

var _brain = function(_c) {
    var brainThinking = false;

    var size, offset;

    var nnets = {
        indlovu: [7.26850611262,4.65248766517,4.38686066398,-3.10676600241,-1.79324970335,-3.01330837647,-0.788017605896,-0.614612476607,6.36240498564,1.14652579315,0.886724551594,-2.76846990157,-0.168322194008,-1.576856634,-3.95364758163,-1.11268788743,5.36250427099,2.73814248038,3.1489061359,-2.87710430672,1.02937889085,-2.57721900168,-0.623218077824,-0.272542419998,-7.04810566739,1.12256326701,-5.51521926215,5.35052075354,2.47634701116,2.52573319337,4.62198252052,-0.137427082397,-0.754663315439,-3.96220418547,0.370876802533,9.99383285401,1.75482247593,-6.24911181463,0.0461757831369,3.64803663117,-1.9222230527,1.33974967846,-1.55251837218,2.82321613388,-1.58142014074,1.33336560109,1.12473198971,4.18646902492,-0.309975951889,2.34313060192,1.17635180247,5.78520035947,-1.62208616512,-0.747118198218,5.04189582825,0.438589393749,5.3639542119,5.37567706272,1.70672278608,0.570713953664,0.657932454068,-2.8762924009,-0.796145627522,2.45250339778,-2.30599213269,-2.38029188576,-0.239742501425,-0.168182494323,-1.16039087414,1.15174637217,-2.94523008413,6.77840408718,3.44150142571,2.57096374228,-3.02888170426,-2.76732258802,0.338186277699,0.816365831187,-1.17825181475,6.38912680579,-2.07327187323,-4.44935407715,-1.21114616751,-2.39686200194,2.35978514243,3.35821600353,0.300758219199,5.292772495,2.2842442342,-1.05087584805,1.30267042602,7.42361476448,0.272334286918,-0.283149671578],

        igundwane: [1.31645572328,1.87518988969,-2.02630179073,-2.8050136191,1.88646145419,-3.03798189395,1.08653821203,4.29470329008,-1.43760517287,2.78769973546,0.735424735803,2.97085698009,-2.84723786724,3.62013280424,0.756930211349,-1.61423752193,-1.81922826644,-0.351988262777,2.98391334582,4.68429194208,1.36111938793,2.55559944529,3.58596908105,1.17507022456,-1.2495934657,-3.28378273604,0.0682714348585,2.09532218136,1.00712600402,-0.786710701327,0.0271046917806,-1.72320655242,3.9872536385,0.947448031167,2.90131927736,-0.618493884714,0.186748909284,-0.15915713666,-1.58551336271,-2.42287980185,-5.11515148317,4.4664797165,2.53397675286,2.63059422587,-3.13700385923,2.10211999659,1.24966243087,-2.94198388395,-3.90216552682,-1.4819585772,-2.69423384333,-1.42057629741,3.12754544535,1.92264678768,0.114150263048,0.534880185776,1.67282137513,1.92541737447,-0.443540097651,-1.62640897173,-2.61491781607,0.436273618293,-0.158946885139,0.540795039304,0.664856668487,0.717616545863,-0.205649151061,-2.7634586842,-1.46173834105,-1.32040150413,-1.81340831998,1.16367921755,-0.0928519361217,0.500211383591,-2.77104357295,0.0229389860504,4.55720346995,-2.96007783171,0.30239027273,1.83266456087,0.575824722724,-1.86666059282,-1.66239072827,4.26620947014,2.59349271628,2.62176850466,-1.55956674378,-2.22841807294,1.74800546781,-1.14209319027,0.896451160387,1.88179946547,-1.91554490907,-1.57699325802]
    };

    function dot(vec1, vec2) {
        var s = vec1.length;
        var acc = 0;
        for(var i = 0; i < s; i++) {
	    acc += vec1[i]*vec2[i];
        }
        //    console.log("Vec1: ", vec1, ", Vec2: ", vec2, ", Result: ", acc);
        return acc;
    }

    function negPosSigmoid(val) {
	if(val < -45) {
	    return -1.0;
	} else if(val > 45) {
	    return 1.0;
	} else {
	    var sinh = Math.exp(val) - Math.exp(-val);
	    var cosh = Math.exp(val) + Math.exp(-val);
	    return sinh / cosh;
	}
	//    return Math.tanh(val);
    }

    function zeroPosSigmoid(val) {
	if(val < -45) {
	    return 0.0;
	} else if(val > 45) {
	    return 1.0;
	} else {
	    return 1 / (1.0 + Math.exp(-val));
	}
    }

    function resetVals(val) {
	size = val;
	offset = Math.floor((val - 1) / 2);
    }

    function Brain(ms, weights, rotate) {
//        this.size = size;
//        this.offset = Math.floor((this.size - 1) / 2);
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
        for(var x = 0; x < size + offset; x++) {    
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
	    
	    for(var y = 0; y < size; y++) {
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
        return this;
    };

    Brain.prototype = {
        clearThought: function(board) {
            for(var q = 0; q < size; q++) {
	        for(var p = 0 - Math.floor(q/2), _ps = size - Math.floor(q/2); p < _ps; p++) {
	            var coord = [p, -(p+q), q];
	            var pos = board.boardNum(coord);
                    //	    console.log("Coord: ", coord, " at number ", pos);
	            if(pos < board.getMaxSize()) {
                        board.changeTint(coord, null);
//		        tiles[boardNum(coord)].tint = null;
	            }
	        }
            }
            //    console.log("Clearing thought");
            board.redraw();
            brainThinking = false;
        },

        inputVals: function(board) {
            for(var q = 0; q < size; q++) {
	        for(var p = 0 - Math.floor(q/2), _ps = size - 1 - Math.floor(q/2); p < _ps; p++) {
	            var val = board.boardVal([p,-(p+q),q]);
	            if(val == _c.EMPTY || val > _c.POSSIBLESHIFT) { 
		        this.input[p + offset][q] = 1; 
	            } else { 
		        this.input[p + offset][q] = 0;
	            }
	        }
            }
        },

        loadWeights: function(w) {
            var weights = typeof w == "string" ? nnets[w] : w;
            var index = 0;
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
        },

        weightsToArray: function() {
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
        },

        getOutputs: function(colour) {
            var weightRotate = [];
            if(this.rotate) {
	        if(colour == _c.RED) {
	            weightRotate = ["upleft", "downright", "upright", "downleft", "left", "right"];
	        } else if (colour == _c.GREEN) {
	            weightRotate = ["downleft", "upright", "left", "right", "downright", "upleft"];
	        } else if (colour == _c.BLUE) {
	            weightRotate = ["left", "right", "upleft", "downright", "downleft", "upright"];
	        }
            } else {
	        weightRotate = ["upleft", "downright", "upright", "downleft", "left", "right"];
            }
            //    console.log(weightRotate);
            var invert = size - 1;
            var p,q,memvecone,memvectwo, mem, weight;
            for(var x = 0; x < size; x++) {
	        for(var y = 0; y < size; y++) {
	            q = y;
	            p = x + offset - Math.floor(q/2);
	            i = this.input[p][q];
	            weight = this.w[weightRotate[0]];
	            if(q-1 >= 0) { memvecone = this.memlayers.upleft[p][q-1]; } else { memvecone = 0.0; }
	            if(p-1 >= 0) { memvectwo = this.memlayers.upleft[p-1][q]; } else { memvectwo = 0.0; }
	            mem = negPosSigmoid(i * weight.input) * zeroPosSigmoid(i*weight.inputgate) 
		        + memvecone * zeroPosSigmoid(i*weight.forgetgateone + memvecone * weight.recurone) 
		        + memvectwo * zeroPosSigmoid(i*weight.forgetgatetwo + memvectwo * weight.recurtwo);
	            this.memlayers.upleft[p][q] = mem;
	            this.outputlayers.upleft[p][q] = negPosSigmoid(mem*weight.memoutput) * zeroPosSigmoid(i*weight.outputgate);
	            
	            q = invert - y;
	            p = (invert - x) + offset - Math.floor(q/2);
	            i = this.input[p][q];
	            weight = this.w[weightRotate[1]];
	            if(q+1 < size) { memvecone = this.memlayers.downright[p][q+1]; } else { memvecone = 0; }
	            if(p+1 < size) { memvectwo = this.memlayers.downright[p+1][q]; } else { memvectwo = 0; }
	            mem = negPosSigmoid(i * weight.input) * zeroPosSigmoid(i*weight.inputgate) 
		        + memvecone * zeroPosSigmoid(i*weight.forgetgateone + memvecone * weight.recurone) 
		        + memvectwo * zeroPosSigmoid(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	            this.memlayers.downright[p][q] = mem;
	            this.outputlayers.downright[p][q] = negPosSigmoid(mem*weight.memoutput) * zeroPosSigmoid(i*weight.outputgate);
	            
	            q = invert - y;
	            p = x + offset - Math.floor(q/2);
	            i = this.input[p][q];
	            weight = this.w[weightRotate[2]];
	            if(p-1 >= 0) { memvectwo = this.memlayers.upright[p-1][q]; } else { memvectwo = 0; }
	            if(q+1 < size && p-1 >= 0) { memvecone = this.memlayers.upright[p-1][q+1]; } else { memvecone = 0; }
	            mem = negPosSigmoid(i * weight.input) * zeroPosSigmoid(i*weight.inputgate) 
		        + memvecone * zeroPosSigmoid(i*weight.forgetgateone + memvecone * weight.recurone) 
		        + memvectwo * zeroPosSigmoid(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	            this.memlayers.upright[p][q] = mem;
	            this.outputlayers.upright[p][q] = negPosSigmoid(mem*weight.memoutput) * zeroPosSigmoid(i*weight.outputgate);
	            
	            q = y;
	            p = (invert - x) + offset - Math.floor(q/2);
	            i = this.input[p][q];
	            weight = this.w[weightRotate[3]];
	            if(p+1 < size && q-1 >= 0) { memvecone = this.memlayers.downleft[p+1][q-1]; } else { memvecone = 0; }
	            if(p+1 < size) { memvectwo = this.memlayers.downleft[p+1][q]; } else { memvectwo = 0; }
	            mem = negPosSigmoid(i * weight.input) * zeroPosSigmoid(i*weight.inputgate) 
		        + memvecone * zeroPosSigmoid(i*weight.forgetgateone + memvecone * weight.recurone) 
		        + memvectwo * zeroPosSigmoid(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	            this.memlayers.downleft[p][q] = mem;
	            this.outputlayers.downleft[p][q] = negPosSigmoid(mem*weight.memoutput) * zeroPosSigmoid(i*weight.outputgate);
	            
	            q = y;
	            p = (invert - x) + offset - Math.floor(q/2);
	            i = this.input[p][q];
	            weight = this.w[weightRotate[4]];
	            if(p+1 < size && q-1 >= 0) { memvecone = this.memlayers.left[p+1][q-1]; } else { memvecone = 0; }
	            if(q-1 >= 0) { memvectwo = this.memlayers.left[p][q-1]; } else { memvectwo = 0; }
	            mem = negPosSigmoid(i * weight.input) * zeroPosSigmoid(i*weight.inputgate) 
		        + memvecone * zeroPosSigmoid(i*weight.forgetgateone + memvecone * weight.recurone) 
		        + memvectwo * zeroPosSigmoid(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	            this.memlayers.left[p][q] = mem;
	            this.outputlayers.left[p][q] = negPosSigmoid(mem*weight.memoutput) * zeroPosSigmoid(i*weight.outputgate);
	            
	            q = invert - y;
	            p = x + offset - Math.floor(q/2);
	            i = this.input[p][q];
	            weight = this.w[weightRotate[5]];
	            if(p-1 >= 0 && q+1 < size) { memvectwo = this.memlayers.right[p-1][q+1]; } else { memvectwo = 0; }
	            if(q+1 < size) { memvecone = this.memlayers.right[p][q+1]; } else { memvecone = 0; }
	            mem = negPosSigmoid(i * weight.input) * zeroPosSigmoid(i*weight.inputgate) 
		        + memvecone * zeroPosSigmoid(i*weight.forgetgateone + memvecone * weight.recurone) 
		        + memvectwo * zeroPosSigmoid(i*weight.forgetgatetwo + memvectwo*weight.recurtwo);
	            this.memlayers.right[p][q] = mem;
	            this.outputlayers.right[p][q] = negPosSigmoid(mem*weight.memoutput) * zeroPosSigmoid(i*weight.outputgate);
	        }
            }

            var player;
            if(colour == _c.RED) {
	        player = [1,0,0];
            } else if(colour == _c.GREEN) {
	        player = [0,1,0];
            } else {
	        player = [0,0,1];
            }
            for(var q = 0; q < size; q++) {	
	        for(var p = offset - Math.floor(q/2), _ps = size + offset - Math.floor(q/2); p < _ps; p++) {
                    //	    console.log("Player weights: ", w.playerOutput);
                    //	    console.log("Middle weights: ", w.middleOutput);
                    //	    console.log("Final weights: ", w.finalOutput);
	            var processed = [zeroPosSigmoid(this.outputlayers.upleft[p][q]) * dot(this.w.playerOutput[0], player),
			             zeroPosSigmoid(this.outputlayers.downright[p][q]) * dot(this.w.playerOutput[1], player),
			             zeroPosSigmoid(this.outputlayers.upright[p][q]) * dot(this.w.playerOutput[2], player),
			             zeroPosSigmoid(this.outputlayers.downleft[p][q]) * dot(this.w.playerOutput[3], player),
			             zeroPosSigmoid(this.outputlayers.left[p][q]) * dot(this.w.playerOutput[4], player),
			             zeroPosSigmoid(this.outputlayers.right[p][q]) * dot(this.w.playerOutput[5], player)];
	            
	            var middle = [];
	            for(var i = 0; i < this.middlesize; i++) {
		        middle.push(negPosSigmoid(dot(processed, 
					               this.w.middleOutput[i])));
	            }	    
	            this.output[p][q] = zeroPosSigmoid(dot(middle, this.w.finalOutput));
	        }
            }
            
            //    console.log("NNet Outputs: ", this.output);
        },

        showThought: function(board) {
            var max = 0;
            var min = 1;
            var maxSize = board.getMaxSize();
            brainThinking = true;
            for(var q = 0; q < size; q++) {
	        for(var p = 0 - Math.floor(q/2), _ps = size - Math.floor(q/2); p < _ps; p++) {
	            var coord = [p, -(p+q), q];
	            var pos = board.boardNum(coord);
	            if(board.validTile(pos)) {
		        max = Math.max(max, this.output[p+offset][q]);
		        min = Math.min(min, this.output[p+offset][q]);
	            }
	        }
            }
            if(max == min) { min -= 0.01; }
            for(var q = 0; q < size; q++) {
	        for(var p = 0 - Math.floor(q/2), _ps =  size - Math.floor(q/2); p < _ps; p++) {
	            var coord = [p, -(p+q), q];
	            var normedOutput = (this.output[p+offset][q] -min) / (max-min);
	            if(normedOutput < 0) { normedOutput = 0; }
	            else if(normedOutput > 1) { normedOutput = 1; }
//	            var pos = board.boardNum(coord);
                    //	    console.log("Coord: ", coord, " at number ", pos);
//	            if(pos < tiles.length) {
  //                  if(pos < maxSize) {
                        board.changeTint(coord, normedOutput);
//	            }
	        }
            }
            //    clearShaded();
            board.redraw();
            setTimeout((function($this) {
                return function() { $this.clearThought(board);}
            })(this), 1249);
        },

        straightNNVal: function(board, colour) {
            var coordp, coordq;
            var max = -1;
            var prob = 1 / (Math.sqrt(size));
            for(var q = 0; q < size; q++) {
	        for(var p = 0 - Math.floor(q/2), _ps = size - Math.floor(q/2); p < _ps; p++) {
	            var val = this.output[p+offset][q];
	            var coord = [p,-(p+q), q];
	            if(val > max || (val === max && Math.random() > prob)) {
		        if(board.checkOpen(coord, colour)) {
		            max = val;
		            coordp = p;
		            coordq = q;
		        }
	            }
	        }
            }
            return [coordp,-(coordp+coordq),coordq];
        },

        probNNVal: function(board, colour) {
            var val, max, coordp, coordq;
            coordq = -1;
            var vals = [];
            for(var q = 0; q < size; q++) {
	        for(var p = 0 - Math.floor(q/2), _ps = size - Math.floor(q/2); p < _ps; p++) {
	            var val = this.output[p+offset][q];
	            var pos = [p, -(p+q), q];
	            if(board, checkOpen(pos, colour)) {
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
        },

        playNN: function(colour, board, watchThinking) {
            this.inputVals(board);
            this.getOutputs(colour);
            if(watchThinking) {
	        this.showThought(board);
            }
            return this.straightNNVal(board, colour);
        }
    };
    function getBrainThinking() {
        return brainThinking;
    }
    return {
        Brain: Brain, 
        nnets: nnets,
        getBrainThinking: getBrainThinking,
        resetVals: resetVals
    };
};
