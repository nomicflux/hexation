var RED = 1;
var GREEN = 2;
var BLUE = 3;
var POSSIBLESHIFT = 3;
var REDPOSSIBLE = RED + POSSIBLESHIFT;
var GREENPOSSIBLE = GREEN + POSSIBLESHIFT;
var BLUEPOSSIBLE = BLUE + POSSIBLESHIFT;
var EMPTY = 0;
var NONBOARD = -1;
var NONEXISTENT = -2;

var SQRTTHREE = Math.sqrt(3);

var WIDTH = 400;
var HEIGHT = 400;
var NUMHEXES = 12;
var MAXHEXES = (NUMHEXES * NUMHEXES) - 1;
var HEXLENGTH = Math.floor(Math.min(WIDTH,HEIGHT) / (NUMHEXES+1));

var LONGSIDE = HEXLENGTH / 2;
var SHORTSIDE = LONGSIDE / SQRTTHREE;
var SIDE = 2*SHORTSIDE;

var ORIGIN = [SHORTSIDE + SIDE/2, HEXLENGTH / 2];
var PBASIS = [0, HEXLENGTH];
var QBASIS = [SHORTSIDE + SIDE, HEXLENGTH / 2];

var DET = PBASIS[0]*QBASIS[1] - QBASIS[0]*PBASIS[1];
var XBASIS = [QBASIS[1] / DET, -PBASIS[1] / DET];
var YBASIS = [-QBASIS[0] / DET, PBASIS[0] / DET];

var currPlayer;

var activePlayers = [];

var shadedTiles = [];

var tiles = [];

var prevmoves = [[],[],[],[]];

var indlovu = [7.26850611262,4.65248766517,4.38686066398,-3.10676600241,-1.79324970335,-3.01330837647,-0.788017605896,-0.614612476607,6.36240498564,1.14652579315,0.886724551594,-2.76846990157,-0.168322194008,-1.576856634,-3.95364758163,-1.11268788743,5.36250427099,2.73814248038,3.1489061359,-2.87710430672,1.02937889085,-2.57721900168,-0.623218077824,-0.272542419998,-7.04810566739,1.12256326701,-5.51521926215,5.35052075354,2.47634701116,2.52573319337,4.62198252052,-0.137427082397,-0.754663315439,-3.96220418547,0.370876802533,9.99383285401,1.75482247593,-6.24911181463,0.0461757831369,3.64803663117,-1.9222230527,1.33974967846,-1.55251837218,2.82321613388,-1.58142014074,1.33336560109,1.12473198971,4.18646902492,-0.309975951889,2.34313060192,1.17635180247,5.78520035947,-1.62208616512,-0.747118198218,5.04189582825,0.438589393749,5.3639542119,5.37567706272,1.70672278608,0.570713953664,0.657932454068,-2.8762924009,-0.796145627522,2.45250339778,-2.30599213269,-2.38029188576,-0.239742501425,-0.168182494323,-1.16039087414,1.15174637217,-2.94523008413,6.77840408718,3.44150142571,2.57096374228,-3.02888170426,-2.76732258802,0.338186277699,0.816365831187,-1.17825181475,6.38912680579,-2.07327187323,-4.44935407715,-1.21114616751,-2.39686200194,2.35978514243,3.35821600353,0.300758219199,5.292772495,2.2842442342,-1.05087584805,1.30267042602,7.42361476448,0.272334286918,-0.283149671578];

var indlovu2 = [1.93814411425,3.1071367475,-2.49177657489,-1.57362816311,2.57798172085,-3.30270569,-0.383581129866,-0.6960233955,-2.46199676515,-1.29718128968,-3.58929034028,3.12855225687,-2.73402964537,5.85173439255,-0.914558534838,-1.05682360953,1.57882070515,1.8800897381,-2.29922027427,-0.0080544188115,3.81106843025,6.46226198653,-3.6655548851,-0.866882544394,4.45860313627,-6.3572616562,0.431920511433,1.14512692254,-0.88683469357,0.40699366201,-1.02137022681,2.42014521942,0.704049881939,2.89366358696,4.8077684441,-4.40397566106,0.815358988293,-1.72832953199,1.35912137426,2.61737696097,1.38478498272,-0.886186483937,-0.162812335212,2.48609067822,-3.77546516115,1.24042858893,-8.50435057871,2.46522084854,0.999809923761,-1.56733959262,-2.38309626652,0.149692554995,-3.18177872454,0.097716515445,-3.96695804894,1.69174855648,-0.453265291699,-5.94543808621,-0.0291662638506,-4.22940298193,-1.24041530271,2.91111997902,-1.02023534175,-0.828018200091,-1.36644339585,-0.591182682013,3.52638107626,1.06544164952,3.13281925605,-0.375778036983,-2.39742365765,1.44399175181,3.03448352562,-2.40490367181,-1.15404267328,-1.55919187033,3.27596528847,2.75823395185,-2.70242167408,-0.578911873624,0.687900854563,0.522656786,-0.772406494155,0.650550735191,-0.894295628169,0.412807470909,3.79501156063,-2.16010018007,-1.00148061916,-0.896098541846,-0.558032116391,-0.811419197979,2.08529082292,1.62301356848];

var ibhubesi = [4.64398098531,-0.0379372662009,2.27150885914,-4.33409884877,0.791696981627,-2.31917190556,2.01662499747,7.21883124478,-0.525113454579,4.05696618891,-2.96703461163,6.9085309014,-1.57415761733,-1.14249352819,1.36896123137,-2.47651959621,0.0577699370006,-9.18904169827,-5.13459438194,4.0114605572,1.56328246106,-6.39064914464,7.17002859716,1.21235242,2.60849321841,-3.5901732842,4.63990828832,-0.939349347298,-1.91666795344,3.09167495203,1.09948996137,-12.3627069592,-0.0264533316803,-7.54220608183,2.79797823934,-3.2564826473,-2.90468693001,2.27667635142,-1.13155900457,1.10064737118,1.18022469474,-5.22802355365,-2.78775178379,-1.38506034492,1.32197164768,2.56149829406,0.374992660816,-2.14556559459,2.1042688315,3.37110979791,4.38253075414,1.60224180737,5.20793840217,-6.30902733497,2.84991049667,8.75961668079,0.221831979959,-11.1516176619,-1.36195308683,-4.02573392118,1.95121372488,-10.0891062357,-1.02286116442,-2.07501850802,14.2091613547,3.39624135192,1.43406157374,-0.996884252647,-4.15439145164,0.272042535406,-5.12180255125,4.45584840151,-2.96814394665,4.68529241951,-1.04888541719,-5.52221516244,-9.22621453208,-7.55144417499,-6.92315423703,1.89550051132,-5.63298072435,-8.54866123907,7.45931435809,-4.36695884525,2.25084231592,3.03104058808,-1.84619815939,-5.98196522084,-5.99576894617,-6.2397891586,14.077520831,-4.6412074617,-1.92472907205,2.75142712907];

var ibhubesi2 = [7.60148368514,0.349928863026,1.14269948739,-16.6982325981,4.88336109671,-18.471019538,3.41282424587,-2.25489274859,-0.663667919987,42.2311197227,-26.8279310759,-38.0102538659,-7.26862504128,-1.13651790225,-17.2655655421,-9.45633226192,-6.96441430182,-46.812999032,14.6341521072,17.7716728296,-6.41555984077,-16.9553596731,-5.28203692097,32.362299483,24.5302226385,-22.3444761102,-20.2141448844,-18.4266626475,7.88690070337,5.55967610108,-2.05505715275,3.82874570321,-10.0230632367,16.5319661325,-3.77798528137,-12.735810309,-20.9610092905,23.2033099173,-1.06345535685,-21.7897319095,10.623320797,-13.9846077906,-12.5448157127,35.3836879676,-17.1167358408,4.98817240489,13.0164553193,31.2303488865,17.8861236904,4.1811003304,5.93170243393,7.29448634535,-14.6544378173,9.36502417323,1.41517077637,2.38506538276,-6.64510633155,-16.0325079672,-12.1676034204,16.3241433822,9.72664927494,-9.36737351788,4.40340710664,16.1841859655,17.9641589389,0.959922082823,-0.195326835991,-14.4947375246,8.83628357291,27.3232996238,-15.3122976377,10.7273953654,-10.0247265748,16.1561754731,2.30410658491,-1.23707962162,-5.50177612365,-20.3161990167,-21.5054260133,-13.3266791353,2.31838589479,-14.1627899671,7.71475085317,-5.21713548435,-1.38453727647,11.3492228405,-11.9529524994,-5.67586649322,-5.55663004016,-29.8164217666,2.10374728822,1.8336910047,-7.26878282481,-14.5241171077];

var igundwane = [1.31645572328,1.87518988969,-2.02630179073,-2.8050136191,1.88646145419,-3.03798189395,1.08653821203,4.29470329008,-1.43760517287,2.78769973546,0.735424735803,2.97085698009,-2.84723786724,3.62013280424,0.756930211349,-1.61423752193,-1.81922826644,-0.351988262777,2.98391334582,4.68429194208,1.36111938793,2.55559944529,3.58596908105,1.17507022456,-1.2495934657,-3.28378273604,0.0682714348585,2.09532218136,1.00712600402,-0.786710701327,0.0271046917806,-1.72320655242,3.9872536385,0.947448031167,2.90131927736,-0.618493884714,0.186748909284,-0.15915713666,-1.58551336271,-2.42287980185,-5.11515148317,4.4664797165,2.53397675286,2.63059422587,-3.13700385923,2.10211999659,1.24966243087,-2.94198388395,-3.90216552682,-1.4819585772,-2.69423384333,-1.42057629741,3.12754544535,1.92264678768,0.114150263048,0.534880185776,1.67282137513,1.92541737447,-0.443540097651,-1.62640897173,-2.61491781607,0.436273618293,-0.158946885139,0.540795039304,0.664856668487,0.717616545863,-0.205649151061,-2.7634586842,-1.46173834105,-1.32040150413,-1.81340831998,1.16367921755,-0.0928519361217,0.500211383591,-2.77104357295,0.0229389860504,4.55720346995,-2.96007783171,0.30239027273,1.83266456087,0.575824722724,-1.86666059282,-1.66239072827,4.26620947014,2.59349271628,2.62176850466,-1.55956674378,-2.22841807294,1.74800546781,-1.14209319027,0.896451160387,1.88179946547,-1.91554490907,-1.57699325802];

var ndlovu = [1.31645572328,1.87518988969,-2.02630179073,-2.8050136191,1.88646145419,-3.03798189395,1.08653821203,4.29470329008,-1.43760517287,2.78769973546,0.735424735803,2.97085698009,-2.84723786724,3.62013280424,0.756930211349,-1.61423752193,-1.81922826644,-0.351988262777,2.98391334582,4.68429194208,1.36111938793,2.55559944529,3.58596908105,1.17507022456,-1.2495934657,-3.28378273604,0.0682714348585,2.09532218136,1.00712600402,-0.786710701327,0.0271046917806,-1.72320655242,3.9872536385,0.947448031167,2.90131927736,-0.618493884714,0.186748909284,-0.15915713666,-1.58551336271,-2.42287980185,-5.11515148317,4.4664797165,2.53397675286,2.63059422587,-3.13700385923,2.10211999659,1.24966243087,-2.94198388395,1.90228159706,-0.38498668189,2.42503436746,-3.30257136226,1.60850152397,-3.43654824878,-9.32521178996,2.66268203318,-0.526363394636,0.0232008964969,-0.0818853939367,0.808328009261,-0.404466891809,-1.59014391095,-0.745015037728,1.92130845743,-2.05760503311,1.69370840071,-0.312411424692,-1.61379849028,0.568049973238,0.928919822081,0.175785834964,0.935807616226,-2.94871893038,-0.0530556186814,0.939154434836,-4.80580693813,0.159435901444,1.91573767638,5.9350801652,0.762195278982,-0.80880777994,0.522776781204,1.31764923771,-1.66491602348,-3.90216552682,-1.4819585772,-2.69423384333,-1.42057629741,3.12754544535,1.92264678768,0.114150263048,0.534880185776,1.67282137513,1.92541737447,-0.443540097651,-1.62640897173,-2.61491781607,0.436273618293,-0.158946885139,0.540795039304,0.664856668487,0.717616545863,-0.205649151061,-2.7634586842,-1.46173834105,-1.32040150413,-1.81340831998,1.16367921755,-0.0928519361217,0.500211383591,-2.77104357295,0.0229389860504,4.55720346995,-2.96007783171,0.30239027273,1.83266456087,0.575824722724,-1.86666059282,-1.66239072827,4.26620947014,2.59349271628,2.62176850466,-1.55956674378,-2.22841807294,1.74800546781,-1.14209319027,0.896451160387,1.88179946547,-1.91554490907,-1.57699325802];

var old_ndlovu = [-5.74624623519,7.4060549759,3.20553898761,8.63044656107,3.23310843494,11.4554588833,-2.13003254824,2.5920282669,-1.6132075225,-7.05026102729,-10.0892926855,8.00011512875,-3.38909164198,-2.31833685238,-6.16551189451,-4.79635887791,0.170522291864,-9.31241932353,-2.93763131246,1.44821779218,-7.38246157418,-0.833644288945,-1.1434699565,-1.43462036059,-1.41836629802,-3.76388947566,-10.3239602586,2.81822167098,5.86289253554,-6.21345819501,-1.78170354426,-9.19169942714,2.02006172772,1.66158572545,-0.731524654918,0.618506741667,9.20013820543,1.64970342194,-7.22493298232,8.69260447793,2.59688572904,5.40859573768,-3.07345713914,-2.49605563146,-7.63248279684,-1.12767424131,1.89721497046,-10.9975221069,1.72506092884,0.344650007178,6.33168356686,1.45438452091,-6.34712898313,9.32089152556,2.6892250462,1.5477248412,-2.93490523471,4.32485871953,9.26278137633,4.73103718673,-2.08290624731,-5.01195195437,1.81298302423,1.02907389244,2.51069594369,-3.45878828787];

var ancient_ndlovu = [12.4274522527,15.9096653199,31.2501993308,-27.3202015614,-7.70505600508,-37.8070059994,-4.08964718318,30.0344815966,5.72322562303,-16.3395880388,6.883120893,-3.47613259119,7.57787752566,9.12130166772,-25.4214279335,-4.74342802215,-9.48284499991,1.60279240263,-1.49958975959,-30.3290464145,20.7490979613,-2.72164340638,28.5377928345,-14.8159160569,7.70717969636,6.40997492954,20.9014377795,-15.9112459075,-12.5488330435,-17.9010214871,-7.32694964504,6.31478610019,-15.3573618895,-26.5531623561,-5.49115873015,30.928515785,-9.98110422523,-22.4670257561,5.89590492018,-18.7029914685,7.34654292704,24.8457563484,25.6443855555,13.8292244131,-6.75172092111,-18.021444242,-7.63532075056,-4.69816818546,-13.6549131244,9.60841533378,27.1565985823,-5.25909425494,16.541022643,-21.6554690775,-7.67195384237,-9.75126792019,-29.7180585417,-10.1686515529,3.9362717239,6.89479401715,-19.283958249,-9.08121092591,7.43085262584,-29.2221731829,13.6536414361,17.4819186403];

function setSize(n) {
    NUMHEXES = n;
    brainConfig.resetVals(n);

    MAXHEXES = (NUMHEXES * NUMHEXES) - 1;
    HEXLENGTH = Math.floor(Math.min(WIDTH,HEIGHT) / (NUMHEXES+1));

    LONGSIDE = HEXLENGTH / 2;
    SHORTSIDE = LONGSIDE / SQRTTHREE;
    SIDE = 2*SHORTSIDE;

    ORIGIN = [SHORTSIDE + SIDE/2, HEXLENGTH / 2];
    PBASIS = [0, HEXLENGTH];
    QBASIS = [SHORTSIDE + SIDE, HEXLENGTH / 2];

    DET = PBASIS[0]*QBASIS[1] - QBASIS[0]*PBASIS[1];
    XBASIS = [QBASIS[1] / DET, -PBASIS[1] / DET];
    YBASIS = [-QBASIS[0] / DET, PBASIS[0] / DET];

    for(var i = 0; i<= MAXHEXES; i++) {
	prevmoves[RED][i] = {"red": 0, "green": 0, "blue": 0};
	prevmoves[GREEN][i] = {"red": 0, "green": 0, "blue": 0};
	prevmoves[BLUE][i] = {"red": 0, "green": 0, "blue": 0};
    }
}

function emptyBoard(n) {
    setSize(n);
    tiles = d3.range(NUMHEXES*NUMHEXES).map(function(d) {
	var i = d % NUMHEXES;
	var j = Math.floor(d / NUMHEXES) - Math.floor(i/2);
	return {"coord": coordToPoint([j,i]), "type": NONEXISTENT};
    });
}

function makeBoard(n,val) {
    setSize(n);
    tiles = d3.range(NUMHEXES*NUMHEXES).map(function(d) {
	var i = d % NUMHEXES;
	var j = Math.floor(d / NUMHEXES) - Math.floor(i/2);
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
	if(tiles[i].type == NONBOARD) { tiles[i].type = NONEXISTENT; }
    }
    redraw();
    playBoard();
}

function resetPlayers() {
    currPlayer = RED;
    d3.select("#player" + RED).style("padding-left","15px");
    d3.select("#player" + RED).style("font-weight","bold");
    d3.select("#player" + GREEN).style("padding-left",null);
    d3.select("#player" + GREEN).style("font-weight",null);
    d3.select("#player" + BLUE).style("padding-left",null);
    d3.select("#player" + BLUE).style("font-weight",null);
    reactivatePlayer(RED);
    reactivatePlayer(GREEN);
    reactivatePlayer(BLUE);
    d3.select("#win" + RED).style("display","none");
    d3.select("#win" + GREEN).style("display","none");
    d3.select("#win" + BLUE).style("display","none");

    for(var i = 0; i<= MAXHEXES; i++) {
	prevmoves[RED][i] = {"red": 0, "green": 0, "blue": 0};
	prevmoves[GREEN][i] = {"red": 0, "green": 0, "blue": 0};
	prevmoves[BLUE][i] = {"red": 0, "green": 0, "blue": 0};
    }

}

function resetBoard() {
    resetPlayers();
    for(var i = 0; i < tiles.length; i++) {
	if(tiles[i].type > EMPTY) { tiles[i].type = EMPTY; }
    }
    redraw();
    setTimeout(computerPlayer(),1);
}

function randomBoard(n) {
    setSize(n);
    tiles = d3.range(NUMHEXES*NUMHEXES).map(function(d) {
	var i = d % NUMHEXES;
	var j = Math.floor(d / NUMHEXES) - Math.floor(i/2);
	if (Math.random()*5 > 2) {
	    return {"coord": coordToPoint([j,i]), "type": EMPTY};
	} else {
	    return {"coord": coordToPoint([j,i]), "type": NONBOARD};
	}
    });
}

function rhombusBoard(n) {
    var bottom = 2*n-1;
    var leftover = Math.ceil(n/2)
    emptyBoard(bottom-leftover+1);
    for(var i = 0; i<n; i++) {
	for(var j = 0; j<n; j++) {
	    tiles[boardNum(rgbCoord([(bottom-leftover) - j - i,i]))].type = EMPTY;
	}
    }
}

function triangleBoard(n) {
    emptyBoard(n);

    var p = 0;
    var q = 0;
    
    tiles[boardNum(rgbCoord([p,q]))].type = EMPTY;

    for(var j = 0; j < n; j++) {
	for(var k = 0; k < n; k++) {
	    if(j + k < n) {
		tiles[boardNum(rgbCoord([p + j,q + k]))].type = EMPTY; 
		tiles[boardNum(rgbCoord([p + k,q + j]))].type = EMPTY;
	    }
	}
    }

}

function hexagonBoard(n) {
    emptyBoard((n-1)*2+1);

    var p = Math.floor(n/2);
    var q = n -1;
    
    tiles[boardNum(rgbCoord([p,q]))].type = EMPTY;
    
    for(var j = 0; j < n; j++) {
	for(var k = 0; k < n; k++) {
/*	    if(k-j <= n) { 
		tiles[boardNum(rgbCoord([p - j,q + k]))].type = EMPTY; 
		tiles[boardNum(rgbCoord([p + k,q - j]))].type = EMPTY;
	    } */ 
	    if(j - k <= n) {
		tiles[boardNum(rgbCoord([p + j,q - k]))].type = EMPTY; 
		tiles[boardNum(rgbCoord([p - k,q + j]))].type = EMPTY;
	    }

	    if(j + k < n) {
		tiles[boardNum(rgbCoord([p + j,q + k]))].type = EMPTY; 
		tiles[boardNum(rgbCoord([p + k,q + j]))].type = EMPTY;
	    }
	    if(-j - k > -n) {
		tiles[boardNum(rgbCoord([p - j,q - k]))].type = EMPTY; 
		tiles[boardNum(rgbCoord([p - k,q - j]))].type = EMPTY;
	    }
	}
    }
}

function coordToPoint(coord) {
    return [ORIGIN[0] + coord[0]*PBASIS[0] + coord[1]*QBASIS[0], ORIGIN[1] + coord[0]*PBASIS[1] + coord[1]*QBASIS[1]];
}

function pointToCoord(point) {
    var p = point[0] - ORIGIN[0];
    var q = point[1] - ORIGIN[1];
    var x = p*XBASIS[0] + q*YBASIS[0];
    var y = p*XBASIS[1] + q*YBASIS[1];

    return rgbCoord(neighbourCheck(x,y));
//    return rgbCoord([Math.round(x),Math.round(y)]);
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

function rgbCoord(axial) {
    return [axial[0],-(axial[1]+axial[0]),axial[1]];
}

function axialCoord(rgb) {
    return [rgb[0],rgb[2]];
}

function checkVictor() {
    checkPlayer(RED);
    checkPlayer(GREEN);
    checkPlayer(BLUE);
    if((activePlayers[RED] || currPlayer == RED) && !activePlayers[GREEN] && !activePlayers[BLUE]) {
	d3.select("#win" + RED).style("display","block");
	return true;
    } else if(!activePlayers[RED] && (activePlayers[GREEN] || currPlayer == GREEN) && !activePlayers[BLUE]) {
	d3.select("#win" + GREEN).style("display","block");
	return true;
    } else if(!activePlayers[RED] && !activePlayers[GREEN] && (activePlayers[BLUE] || currPlayer == BLUE)) {
	d3.select("#win" + BLUE).style("display","block");
	return true;
    } else if(!activePlayers[RED] && !activePlayers[GREEN] && !activePlayers[BLUE]) {
	alert("Everyone lost!");
	return true;
    } else {
	return false;
    }
}

function clearShaded(coord) {
    if( shadedTiles[0]) {
	for(var i = 0; i < shadedTiles.length; i++) {
	    tiles[shadedTiles[i]].type = EMPTY;
	}
	shadedTiles = [];
	redraw();
    }
}

function checkPlayer(colour) {
    if(!activePlayers[colour]) { return false; }
    for(var k=0; k < tiles.length; k++) {
	if (tiles[k].type == EMPTY && checkOpen(pointToCoord(tiles[k].coord), colour)) {
	    return true;
	}
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
    d3.select("#player" + currPlayer).style("padding-left",null);
    d3.select("#player" + currPlayer).style("font-weight",null);
    if(!won) {
	if (currPlayer == RED) {
	    if(activePlayers[GREEN]) {
	       currPlayer = GREEN;
	    } else if(activePlayers[BLUE]){
		currPlayer = BLUE;
	    }
	} else if (currPlayer == GREEN) {
	    if(activePlayers[BLUE]) {
		currPlayer = BLUE;
	    } else if (activePlayers[RED]){
	       currPlayer = RED;
	    }
	} else if (currPlayer == BLUE) {
	    if(activePlayers[RED]) {
		currPlayer = RED;
	    } else if(activePlayers[GREEN]){
		currPlayer = GREEN;
	    }
	}
    } else {
	if(activePlayers[RED]) { currPlayer = RED; } else if(activePlayers[GREEN]) { currPlayer = GREEN; } else if(activePlayers[BLUE]) { currPlayer = BLUE; }
    }

    d3.select("#player" + currPlayer).style("padding-left","15px");
    d3.select("#player" + currPlayer).style("font-weight","bold");

    setTimeout(computerPlayer, 1000);
}

function computerPlayer() {
//    var spot = miniMax();
    if(!checkVictor() && !humanPlayers[currPlayer]) {
	redraw();
	svg.on("mousemove",null).on("mousedown",null);
	var spot;
	if(nnPlayers[currPlayer] == null) {
	    if(compWeights[currPlayer].help != 0 || compWeights[currPlayer].hurt != 0) {
		spot = miniMax();
	    } else {
		spot = findRandom();
	    }
	} else {
	    spot = nnPlayers[currPlayer].playNN(currPlayer);
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
    if(checkOpen(coord, colour) || checkPossible(coord, colour)) {
	clearShaded();
	placePiece(coord);
	redraw();
	setTimeout(playerRotate(),1);
    } else {
//	alert(coord);
    }
}

function placePiece(coord,colour) {
    if(!colour) { colour = currPlayer; }
//    if(checkOpen(coord) || checkPossible(coord)) {
	var pos1 = boardNum(coord);
    var pos2 = boardNum(nextTile(coord, colour));
    tiles[pos1].type = colour;
    tiles[pos2].type = colour;
  //  }
}

function removePiece(coord, colour) {
    if(checkValue(coord,colour,colour)) {
	var pos1 = boardNum(coord);
	var pos2 = boardNum(nextTile(coord, colour));
	tiles[pos1].type = EMPTY;
	tiles[pos2].type = EMPTY;
    }
}


