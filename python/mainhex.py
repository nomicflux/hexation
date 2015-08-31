#!/usr/bin/env python

from numpy import std, average
from cmaes import *
from doublebrain import *
from postbrain import *
from hexboard import *
from time import time
import getopt
import sys
import multiprocessing as mp

def main():
    global fits

    global size
    global inputsize
    global outputsize
    
    global gamesper
    global sigma
    global botpercentage

    global trainIllegal
    global trainMO
    global switchBots
    global resetBest
    global resetPath
    global doubleBot
    global postBot 
    global normal
    
    global botfrequency
    global changebotfreq
    global agenttype
    global gens
    
    global fitness
    global againstBotsOnly
    global background
    global agents
    global totalagents
    global numagents
    global batchsize

    size = 5
    inputsize = 3
    outputsize = 3

    gamesper = 3
    sigma = 0.5
    botpercentage = 0

    trainIllegal = False
    trainMO = True
    switchBots = not trainIllegal
    resetBest = False
    resetPath = False
    doubleBot = False
    postBot = False
    middleSize = 3
    normal = False

    botfrequency = 1
    changebotfreq = True
    agenttype = "gradient"
    gens = 100000
    batchsize = 3
    population = 0
    rotate = False

    nameadd = ""

    options = getopt.getopt(sys.argv[1:], 's:g:rdf:a:nq:b:t:p:clm:o')

    maxloss = (1 + size) * 3
    maxillegal = size**2 * 2

    for opt, arg in options[0]:
        if opt == "-s":
            size = int(arg)
	elif opt =="-c":
	    resetPath = True
        elif opt == "-g":
            gamesper = int(arg)
        elif opt == "-f":
            botfrequency = int(arg)
        elif opt == "-a":
            agenttype = arg
        elif opt == "-r":
            resetBest = True
        elif opt == "-d":
            doubleBot = True
        elif opt == "-n":
            normal = True
        elif opt == "-q":
            nameadd = arg
        elif opt == "-b":
            batchsize = int(arg)
        elif opt == "-t":
            gens = int(arg)
        elif opt == "-p":
            population = int(arg) if int(arg) > 0 else 0
        elif opt == "-l":
            postBot = True
        elif opt == "-m":
            middleSize = int(arg)
	elif opt == "-o":
	    rotate = True

    if doubleBot and postBot:
        doubleBot = False

    if doubleBot:
        brainsave = "braindouble"+nameadd
        cmasave = "cmadouble"+nameadd
    elif postBot:
        brainsave = "brainpost"+nameadd
        cmasave = "cmapost"+nameadd
    else:
        brainsave = "brain"+nameadd
        cmasave = "cma"+nameadd
    
    if doubleBot:
        try:
            data = file(brainsave,"r")
            init = readString(data)
            init = readString(data)
            init = readString(data)
            data.close()
        except:
            init = [0 for i in range(48*2 + 6*3 + 6*3)]
    elif postBot:
        try:
            data = file(brainsave,"r")
            init = readString(data)
            init = readString(data)
            init = readString(data)
            data.close()
        except:
            init = [0 for i in range(48 + 6*3 + 6*middleSize + middleSize)]
    else:
        try:
            data = file(brainsave,"r")
            init = readString(data)
            init = readString(data)
            init = readString(data)
            data.close()
        except:
            init = [0 for i in range(66)]

    # Start the CMA-ES
    if population > 0:
        cma = CMAES(init, sigma, population)
    else:
        cma = CMAES(init, sigma)

    try:
        cmafile = file(cmasave, "r")
        fileopened = True
    except:
        fileopened = False

    if fileopened:
        cma.readCMA(cmafile)
        if resetBest:
            cma.resetBest()
        if resetPath:
            cma.resetPath()
        cmafile.close()

    # Start the Agents
    numagents = cma.lamb
    numbots = 3
    totalagents = numagents + numbots

    timesright = 0
    for runs in range(gens):
        fits = mp.Queue()
        timestart = time()
        print "Generation %d of %d" % (runs+1, gens)
        cma.populate()
        if normal:
            strings = [normalize(list(cma.strings[i].values)) for i in range(numagents)]
            for i in range(numagents):
                cma.strings[i].values = strings[i]
        else:
            strings = [list(cma.strings[i].values) for i in range(numagents)]
        fitness = [[0 for j in range(12)] for i in range(numagents)]

        if switchBots and not trainIllegal:
            if (runs+1) % botfrequency == 0:
                againstBotsOnly = True
                numbots = 3
            else:
                againstBotsOnly = False
                botpercentage = 0
        else:
            botpercentage = 0
        totalagents = numagents + numbots
    
        agents = []
        candideWeights = [5.0,0.2]
        balancedWeights = [1.0, 1.0]
        montecristoWeights = [0.2, 5.0]
        weights = [candideWeights, balancedWeights, montecristoWeights]
        for i in range(totalagents):
            if i < numagents:
                if doubleBot:
                    agents.append(NNAgent(DoubleBrain(size, strings[i], rotate)))
                elif postBot:
                    agents.append(NNAgent(PostProcessBrain(size, strings[i], middleSize, rotate)))
                else:
                    agents.append(NNAgent(QuickBrain(size, strings[i], 3, False, False, rotate)))
            else:
                if agenttype == "random":
                    agents.append(RandomAgent())
                elif agenttype == "simple":
                    for weight in weights:
                        agents.append(BotAgent(weight[0], weight[1]))
                elif agenttype == "gradient":
                    for weight in weights:
                        agents.append(GradientAgent(weight[0], weight[1]))
                else: 
                    agents.append(RandomAgent())

        if againstBotsOnly:
            maxtimes = numagents * 3 * gamesper
        else:
            maxtimes = totalagents * int(float(totalagents)/numagents * gamesper)
        background = {"maxtimes": maxtimes, 
		      "gamesper": gamesper,
                      "run": runs, 
                      "numagents": numagents}
        if batchsize == 0:
            processes = [mp.Process(target=playRound, args=(x, fits)) 
                         for x in range(maxtimes)]
            for p in processes:
                p.start()
            for p in processes:
                p.join()
        else:
            for i in range(0,maxtimes,batchsize):
                processes = [mp.Process(target=playRound, args=(i + x, fits)) 
                             for x in range(min(batchsize, maxtimes - i))]
                for p in processes:
                    p.start()
                for p in processes:
                    p.join()

        while not fits.empty():
            f = fits.get(False)
            fitness[f[0]][f[1]] += f[2]

        timeend = time()

        # Start CMA  
	baseLoss = 1+size
	maxloss = 1
	records = []
        for i in range(len(fitness)):
            total = fitness[i][6]
            if total > 0:
                losspercent = float(fitness[i][7]) / total
            else:
                losspercent = 1.0
            if fitness[i][9] > 0:
                redloss = float(fitness[i][0] - fitness[i][1]) / fitness[i][9] / maxloss
            else:
                redloss = baseLoss / maxloss
            if fitness[i][10] > 0:
                greenloss = float(fitness[i][2] - fitness[i][3]) / fitness[i][10] / maxloss
            else:
                greenloss = baseLoss / maxloss 
            if fitness[i][11] > 0:
                blueloss = float(fitness[i][4] - fitness[i][5]) / fitness[i][11] / maxloss
            else:
                blueloss = baseLoss / maxloss
	    totalDiff = (redloss - greenloss)**2 + (greenloss-blueloss)**2 + (blueloss-redloss)**2 
	    maxLossScore = max(redloss, greenloss, blueloss)
#	    basePt = -2
#	    redloss = (-1 * (redloss < basePt) + 1 * (redloss >= basePt)) * (redloss - basePt)**2 + basePt
#	    greenloss = (-1 * (greenloss < basePt) + 1 * (greenloss >= basePt)) * (greenloss - basePt)**2 + basePt
#	    blueloss = (-1 * (blueloss < basePt) + 1 * (blueloss >= basePt)) * (blueloss - basePt)**2 + basePt
            illegalmoves = fitness[i][8]
            if total == 0:
                illegalfit = 1
            else:
                illegalfit = float(illegalmoves) / total / maxillegal
            recordfits = [losspercent, redloss, greenloss, blueloss, totalDiff, illegalfit, maxLossScore]
	    measurefits = [redloss, greenloss, blueloss, losspercent, totalDiff, maxLossScore, illegalfit]
            cma.strings[i].fitness = measurefits
            print cma.strings[i].fitness
	    records.append(recordfits)
                    
        print "Writing... "
        if againstBotsOnly or trainIllegal:
            saveBrains(cma, brainsave)

        fitnesses = [cma.strings[i].fitness for i in range(len(cma.strings))]

        if trainMO:
            fitnesses = sortByHV(fitnesses)
        elif trainIllegal:
            fitnesses = sortByN(fitnesses,4)
        else:
            fitnesses = sortByN(fitnesses,0)

        halflength = cma.mu
        halffit = records[:halflength]
        print fitnesses
        print halffit
        avg = sum(map(lambda x: x[0], halffit)) / halflength 
        redavg = sum(map(lambda x: x[1], halffit)) / halflength  * maxloss
        greenavg = sum(map(lambda x: x[2], halffit)) / halflength * maxloss
        blueavg = sum(map(lambda x: x[3], halffit)) / halflength * maxloss
	diffavg = sum(map(lambda x: x[4], halffit)) / halflength * maxloss
        illfit = sum(map(lambda x: x[5], halffit)) / halflength * maxillegal
	maxloss = sum(map(lambda x: x[6], halffit)) / halflength
        if againstBotsOnly or trainIllegal:
            if doubleBot:
                fitfile = file("fitnessesdouble"+nameadd,"a")
            elif postBot:
                fitfile = file("fitnessespost"+nameadd,"a")
            else:
                fitfile = file("fitnesses"+nameadd,"a")
            fitfile.write(str(avg) + ", " + str(redavg) + ", " + str(greenavg) + ", " + str(blueavg) + ", " + str(diffavg) + ", " + str(illfit) + ", " + str(maxloss) + "\n")
            fitfile.close()
        if trainMO:
            level = 0.25
        elif trainIllegal:
            level = 2.0
        else:
            levels = -5.0

        if againstBotsOnly and changebotfreq:
            if avg < level:
                if size == 5:
                    size = 7
                elif size == 7:
                    if agenttype == "gradient":
                        size = 9
                    else: 
                        agenttype = "gradient"
            print "Frequency at: ", botfrequency, "; agent at: ", agenttype, "; size at: ", size
        else:
            print "Not changing!"
        if trainMO:
            print "Average: %.3f, RedAvg: %.3f, GreenAvg: %.3f, BlueAvg: %.3f, DiffAvg: %.3f, Illfit: %.3f, LossScore: %.3f" % (avg, redavg, greenavg, blueavg, diffavg, illfit, maxloss)
        else:
            print "Average: %.3f, StDev: %.3f" % (avg, st)            

	if againstBotsOnly or trainIllegal:
       	    cmafile = file(cmasave,"w")
            cma.writeCMA(cmafile)
       	    cmafile.close()
	    cma.run(True)
	else:
	    cma.run(False)
        timereallyend = time()
        print "Time for run: %.3f, Time for CMA: %.3f, Total time: %.3f" % (timeend - timestart, timereallyend - timeend, timereallyend - timestart)
        if doubleBot:
            timefile = file("timesdouble"+nameadd,"a")
        elif postBot:
            timefile = file("timespost"+nameadd,"a")
        else:
            timefile = file("times"+nameadd,"a")
        timefile.write(str(timeend-timestart) + ", " + str(timereallyend-timeend) + ", " + str(timereallyend-timestart) + "\n")
        timefile.close()

def saveBrains(cma, brainsave):
    data = file(brainsave,"w")
#    cma.updateBest()
#    for best in range(cma.solutions):
#        writeString(data, cma.bestsolutions[best].values)
    for string in cma.strings:
        writeString(data, string.values)
    data.close()

def recordFitnesses(cma):
    fitnesses = [cma.strings[i].fitness for i in range(len(cma.strings))]
    fitnesses.sort()
    halflength = cma.mu
    halffit = fitnesses[:halflength]
    print fitnesses
    print halffit
    avg = sum(halffit) / halflength
    st = std(halffit)
    fitfile = file("fitnesses","a")
    fitfile.write(", (" + str(avg) + ", " + str(st) + ")")
    fitfile.close()

def readString(readfrom):
    strings = (readfrom.readline()).split(',')
    vals = []
    for i in range(len(strings)):
        try:
            vals.append(float(strings[i]))
        except:
            print "Can't convert:", str(strings[i])
    return vals

def writeString(writeto, string):
    size = len(string)
    for i in range(size - 1):
        writeto.write(str(string[i]) + ",")
    writeto.write(str(string[-1:][0]) + "\n")

def normalize(vals):
    largest = max([abs(v) for v in vals])
    return [v / largest for v in vals]

def playRound(times, fits):
#    print "Starting round %d of %d (Gen %d)" % (times+1,
#                                                background["maxtimes"],
#                                                background["run"]+1)
    numagents = background["numagents"]
    if againstBotsOnly:
        gamenum = times / (background["gamesper"]*numagents)
        boardtypes = ["hexagon"]            
      	agentnums = [gamenum + numagents for i in range(3)]
 	playertype = (times / numagents) % 3
        playeragent = times % numagents
        agentnums[playertype] = playeragent
    else:
        boardtypes = ["hexagon"]
        agentnums = [randint(0,totalagents-1) for i in range(3)]
        while agentnums[0] >= numagents and agentnums[1] >= numagents and agentnums[2] >= numagents:
            agentnums = [randint(0,totalagents-1) for i in range(3)]

    board = HexBoard(size, boardtypes[randint(0,len(boardtypes)-1)])
#    print "\t(Round %d) Agents %d, %d, and %d out of %d" % (times+1, agentnums[0], agentnums[1], agentnums[2], numagents)
            
    score = playGame(board, 
                     agentnums[0],
                     agentnums[1],
                     agentnums[2])
    del board
    putScores(score, 
              agentnums[0] if (agentnums[0]<numagents) else -1,
              agentnums[1] if (agentnums[1]<numagents) else -1,
              agentnums[2] if (agentnums[2]<numagents) else -1,
              fits)
#    print "Ending round %d of %d (Gen %d)" % (times+1,
#                                              background["maxtimes"],
#                                              background["run"]+1)

def playGame(board, player1, player2, player3):
    game = Game(board, 
                [agents[player1], 
                 agents[player2], 
                 agents[player3]])
    game.start()
    while game.computePlay():
        pass
    return [game.lost, board.illegal]

def putScores(stats,player1,player2,player3,fit):
    fitness = [[0 for j in range(12)] for i in range(numagents)]
    score = stats[0]
    ill = stats[1]
    if player1 > -1:
        fit.put( (player1, 9, 1) )
    if player2 > -1:
        fit.put( (player2, 10, 1) )
    if player3 > -1:
        fit.put( (player3, 11, 1) )
    loserscore = score[0][1]
    loser = score[0][0]
    try:
        middlescore = score[1][1]
        middle = score[1][0]
    except:
        print score
        print "Someone not dropped!"
        middle = (loser + 1) % 3
        middlescore = [0,0,0]
    winner = 2*(loser + middle) % 3
    playerArray = [player1, player2, player3]
    loserPlayer = playerArray[loser]
    middlePlayer = playerArray[middle]
    winnerPlayer = playerArray[winner]
    if loserPlayer >= 0:
        lostby = loserscore[middle] + loserscore[winner]
        fit.put( (loserPlayer, loser*2, lostby) )
        fit.put( (loserPlayer, 6, 1) )
        fit.put( (loserPlayer, 7, 1) )
        fit.put( (loserPlayer, 8, ill[loser]) )
        agents[loserPlayer].illegal = 0
    if middlePlayer >= 0:
        middlelost = middlescore[winner]
        middlewon = loserscore[middle]
        fit.put( (middlePlayer, middle*2, middlelost) )
        fit.put( (middlePlayer, middle*2+1, middlewon) )
        fit.put( (middlePlayer, 6, 1) )
        fit.put( (middlePlayer, 7, 0.5) )
        fit.put( (middlePlayer, 8, ill[middle]) )
        agents[middlePlayer].illegal = 0
    if winnerPlayer >= 0:
        wonby = middlescore[winner] + loserscore[winner]
        fit.put( (winnerPlayer, winner*2+1, wonby) )
        fit.put( (winnerPlayer, 6, 1) )
        fit.put( (winnerPlayer, 8, ill[winner]) )
        agents[winnerPlayer].illegal = 0

def getIllegals(players):
    sizeValid = len(fitness)
    sizeTotal = len(players)
    #for i in range(sizeValid):
    #    fitness[i][8] = players[i].illegal
    #for i in range(sizeValid, sizeTotal):
    #    fitness[i][8] = 0

main()
