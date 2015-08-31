#!/usr/bin/env python
from hexbrain import *
from random import random, randint
from numpy import std, average
from cmaes import *
from quickbrain import *
from time import time

class HexBoard(object):
    def __init__(self, size, kind = "full"):
        self.size = size
        self.offset = (size-1)/2
        self.board = {}
        if kind == "hexagon":
            hexsize = ((size+1) / 2)
            b = hexsize - 1
            r = hexsize / 2 + self.offset
            center = (r, -(r+b), b)
        elif kind == "triangle":
            j = 0
            i = self.offset
            center = (i,j)
        for q in range(size):
            for p in range(self.offset - q/2, size + self.offset - q/2):
                if kind == "random":
                    if random() < .3:
                        self.board[p,q] = 0
                    else:
                        self.board[p,q] = 1
                elif kind == "full":
                    self.board[p,q] = 1
                elif kind == "hexagon":
                    rdistance = p - center[0]
                    gdistance = -(p+q) - center[1]
                    bdistance = q - center[2]
                    if abs(rdistance) + abs(gdistance) + abs(bdistance) > 2*(hexsize-1):
                        self.board[p,q] = 0
                    else:
                        self.board[p,q] = 1
                elif kind == "triangle":
                    pdistance = p - center[0]
                    qdistance = q - center[1]
                    if p < center[0] or abs(pdistance) + abs(qdistance) >= size:
                        self.board[p,q] = 0
                    else:
                        self.board[p,q] = 1
                else: 
                    self.board[p,q] = 0
        

    def __repr__(self):
        string = ""
        for i in range(self.size):
            stringeven = ""
            stringodd = ""
            switch = True
            for j in range(self.size):
                p = i + self.offset - j / 2
                q = j
                if switch:
                    stringeven += str(self.board[p,q]) + "\t"
                    stringodd += "\t"
                else:
                    stringodd += str(self.board[p,q]) + "\t"
                    stringeven += "\t"
                switch = not switch
            string += stringeven + "\n"
            string += stringodd + "\n"
        return string

    def boardState(self):
        return self.board

    def boardScore(self):
        score = [0,0,0]
        vecs = [(0,-1), (-1,1), (-1,0)]
        for j in range(self.size):
            for i in range(self.offset - j/2, self.size + self.offset - j/2):
                if self.board[i,j] == 1:
                    for k in range(3):
                        i1 = i + vecs[k][0]
                        j1 = j + vecs[k][1]
                        off1 = self.offset - j1/2  
                        if j1 >= 0 and j1 < self.size and i1 >= off1 and i1 < self.size + off1 and self.board[i1, j1] == 1:
                            score[k] += 1
        return score

    def checkPlace(self, p,q, vec):
        p1 = p + vec[0]
        q1 = q + vec[1]
        off = self.offset - q/2
        off1 = self.offset - q1/2  
        if q < 0 or q1 < 0 or q >= self.size or q1 >= self.size:
            return False
        elif p < off or p1 < off1 or p >= self.size + off or p1 >= self.size + off1:
            return False
        elif self.board[p,q] == 1 and self.board[p1,q1] == 1:
            return True
        else:
            return False

    def placePiece(self, p,q, vec):
        if self.checkPlace(p,q,vec):
            self.board[p,q] = 0
            self.board[p+vec[0], q+vec[1]] = 0
            return True
        else:
            return False

class Player(object):
    def __init__(self, string, agent = None):
        self.name = string.lower().capitalize()
        if string.lower() == "red":
            self.type = 0
            self.vec = (0,-1)
        elif string.lower() == "green":
            self.type = 1
            self.vec = (-1,1)
        elif string.lower() == "blue":
            self.type = 2
            self.vec = (-1,0)
        self.active = True
        self.agent = agent

    def checkPlace(self, board, p, q):
        return board.checkPlace(p, q, self.vec)

    def placePiece(self, board, p, q):
        return board.placePiece(p, q, self.vec)

    def checkLoss(self, board):
        if self.active:
            for q in range(board.size):
                for p in range(board.offset - q/2, board.size + board.offset - q/2):
                    if board.checkPlace(p,q, self.vec):
                        return False
            self.active = False
        return True

    def play(self, board):
        if self.active:
            if self.agent:
                return self.agent.play(board, self)
            else:
                return input("What's your move?: ")
        else:
            print self.name + " is not active."
            return None

class Game(object):
    def __init__(self, board, agents = [None, None, None]):
        self.players = {}
        self.players = [Player("red", agents[0]),
                        Player("green", agents[1]),
                        Player("blue", agents[2])]
        self.currentPlayer = 0
        self.board = board
        self.originalboard = board
        self.numActive = 3
        self.lost = []

    def reset(self):
        self.board = self.originalboard
        for i in range(3):
            self.players[i].active = True
        self.numActive = 3
        self.lost = []

    def nextPlayer(self):
        new = (self.currentPlayer + 1) % 3
        while not self.players[new].active:
            new = (new + 1) % 3
        return new

    def dropPlayer(self, place):
        score = self.board.boardScore()
        self.lost.append([place, score])
        self.numActive = self.numActive - 1

    def checkWin(self):
        return self.numActive <= 1
  
    def declareWin(self):
        if self.checkWin():
            return self.players[0].name

    def computePlay(self):
        if not self.checkWin():
            spot = self.players[self.currentPlayer].play(self.board)
            if spot == None:
                self.rotatePlayer()
            else:
                return self.placePiece(spot[0],spot[1])
        else:
            return False

    def checkLosses(self):
        for i in range(len(self.players)):
            j = (i + self.currentPlayer + 1) % 3            
            if self.players[j].active and self.players[j].checkLoss(self.board):
                self.dropPlayer(j)

    def rotatePlayer(self):
        self.checkLosses()
        if not self.checkWin():
            self.currentPlayer = self.nextPlayer()

    def placePiece(self, p, q):
        if self.players[self.currentPlayer].placePiece(self.board, p, q):
            self.rotatePlayer()
            return True
        else:
            return False

    def start(self):
        self.checkLosses()

class Agent(object):
    def __init__(self):
        pass

    def play(self, board, player):
        pass

class BotAgent(Agent):
    def __init__(self, s, o):
        self.help = s
        self.hurt = o
    
    def play(self, board, player):
        boardinputs = {}
        for key in board.board:
            boardinputs[key] = board.board[key]
        vecs = [(0,-1), (-1,1), (-1,0)]
        moves = {}
        for q in range(board.size):
            for p in range(board.offset - q/2, board.size + board.offset - q/2):
                if player.checkPlace(board, p, q):
                    boardinputs[p,q] = 0
                    boardinputs[p + player.vec[0], q + player.vec[1]] = 0
                    score = 0
                    for j in range(board.size):
                        for i in range(board.offset - j/2, board.size + board.offset - j/2):
                            if boardinputs[i,j] == 1:
                                for k in range(3):
                                    i1 = i + vecs[k][0]
                                    j1 = j + vecs[k][1]
                                    off1 = board.offset - j1/2  
                                    if j1 >= 0 and j1 < board.size and i1 >= off1 and i1 < board.size + off1 and boardinputs[i1, j1] == 1:
                                        if k == player.type:
                                            score += self.help
                                        else:
                                            score -= self.hurt
                    moves[p,q] = score
                    boardinputs[p,q] = 1
                    boardinputs[p + player.vec[0], q + player.vec[1]] = 1
        moves = qsort(moves)
        index = 0
        pos = moves[index].keys()[0]
        while not player.checkPlace(board, pos[0], pos[1]):
            index += 1
            pos = moves[index].keys()[0]
        return pos

class RandomAgent(Agent):
    def __init__(self):
        pass
    
    def play(self, board, player):
        boardinputs = {}
        for key in board.board:
            boardinputs[key] = board.board[key]
        vecs = [(0,-1), (-1,1), (-1,0)]
        moves = []
        for q in range(board.size):
            for p in range(board.offset - q/2, board.size + board.offset - q/2):
                if player.checkPlace(board, p, q):
                    moves.append((p,q))
        coord = moves[randint(0, len(moves) - 1)]
        return coord

class GradientAgent(BotAgent):
    def __init__(self, s, o):
        self.help = s
        self.hurt = o
        self.previousmoves = {}

    def play(self, board, player):
        boardinputs = {}
        for key in board.board:
            boardinputs[key] = board.board[key]
        vecs = [(0,-1), (-1,1), (-1,0)]
        moves = {}
        for q in range(board.size):
            for p in range(board.offset - q/2, board.size + board.offset - q/2):
                if player.checkPlace(board, p, q):
                    boardinputs[p,q] = 0
                    boardinputs[p + player.vec[0], q + player.vec[1]] = 0
                    score = 0
                    for j in range(board.size):
                        for i in range(board.offset - j/2, board.size + board.offset - j/2):
                            if boardinputs[i,j] == 1:
                                for k in range(3):
                                    i1 = i + vecs[k][0]
                                    j1 = j + vecs[k][1]
                                    off1 = board.offset - j1/2  
                                    if j1 >= 0 and j1 < board.size and i1 >= off1 and i1 < board.size + off1 and boardinputs[i1, j1] == 1:
                                        if k == player.type:
                                            score += self.help
                                        else:
                                            score -= self.hurt
                    if self.previousmoves.has_key((p,q)):
                        grad = score - self.previousmoves[p,q]
                        moves[p,q] = score + grad
                    else:
                        moves[p,q] = score
                    self.previousmoves[p,q] = score
                    boardinputs[p,q] = 1
                    boardinputs[p + player.vec[0], q + player.vec[1]] = 1
        moves = qsort(moves)
        index = 0
        pos = moves[index].keys()[0]
        while not player.checkPlace(board, pos[0], pos[1]):
            index += 1
            pos = moves[index].keys()[0]
        return pos

class NNAgent(Agent):
    def __init__(self, net):
        self.net = net

    def play(self, board, player):
        inputs = board.boardState()
        self.net.inputVals(inputs)
        outputs = qsort(self.net.getOutputs(player.type))
        index = 0
        pos = outputs[index].keys()[0]
#        print outputs[index]
        while not player.checkPlace(board, pos[0],pos[1]):
            index += 1
            try:
                pos = outputs[index].keys()[0]
            except:
                print "Wrong index at: ", str(index), ", total moves: ", str(len(outputs))
                print "All outputs:", str(outputs)
                print "Player:", str(player.type)
                print board
#                raise ValueError
                pos = None
#            print outputs[index]
            illegal[player.type] += 1
        return pos

def qsort(array):
    """ Quicksort for dictionaries
    Returns dictionary with each key: value pair in a list
    Sorts from max to min
    """
    head = None
    for key in array:
        head = array[key] 
        break
    less = {key: array[key] for key in array if array[key] < head}
    equal = [{key: array[key]} for key in array if array[key] == head]
    more = {key: array[key] for key in array if array[key] > head}
    if less and more:
        return qsort(more) + equal + qsort(less)
    elif more:
        return qsort(more) + equal
    elif less:
        return equal + qsort(less)
    else:
        return equal

def main():
    # Start the Basics
    size = 9
    inputsize = 1
    outputsize = 3

    gamesper = 3
    sigma = 0.3
    botpercentage = 0

    trainIllegal = False
    switchBots = True
    resetBest = True
    resetPath = False
    botfrequency = 1
    agenttype = "gradient"

    gens = 1000
    
    try:
        data = file("brains","r")
        init = readString(data)
#        init = normalize(init)
        data.close()
    except:
        init = [2*random() - 1 for i in range(66)]

    # Start the CMA-ES
    cma = CMAES(init,sigma)

    try:
        cmafile = file("cma", "r")
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
    numbots = int((botpercentage * numagents) / (1.0 - botpercentage))
    totalagents = numagents + numbots

    againstBotsOnly = False
    timesright = 0
    timestart = time()
    global illegal
    for runs in range(gens):
        print "Generation %d of %d" % (runs+1, gens)
        cma.populate()
        strings = [list(cma.strings[i].values) for i in range(numagents)]
        fitness = [[0 for j in range(7)] for i in range(numagents)]

        if switchBots and not trainIllegal:
            if runs % botfrequency == 0:
                againstBotsOnly = True
                botpercentage = 1.0/2.0
            elif runs % botfrequency == 1:
                againstBotsOnly = False
                botpercentage = 0
        else:
            botpercentage = 0

        numbots = int((botpercentage * numagents) / (1.0 - botpercentage))
        totalagents = numagents + numbots
    
        agents = []
        for i in range(totalagents):
            if i < numagents:
#                agents.append(NNAgent(HexMDLSTM(size, inputsize, outputsize, strings[i])))
                agents.append(NNAgent(QuickBrain(size, strings[i])))
            else:
                if agenttype == "random":
                    agents.append(RandomAgent())
                elif agenttype == "simple":
                    agents.append(BotAgent(random(), random()))
                elif agenttype == "gradient":
                    agents.append(GradientAgent(random(), random()))
                else: 
                    agents.append(RandomAgent())

#        boardtypes = ["random","hexagon","triangle","full"]
        boardtypes = ["hexagon", "triangle"]
        if againstBotsOnly:
            maxtimes = numagents * 3 * gamesper
        else:
            maxtimes = totalagents * int(float(totalagents)/numagents * gamesper)
        for times in range(maxtimes):
            illegal = [0,0,0]
            print "Game %d of %d (Gen %d)" % (times+1, maxtimes, runs+1)
            
            if againstBotsOnly:
                agentnums = [randint(numagents,totalagents-1) for i in range(3)]

                playertype = (times / numagents) % 3
                playeragent = times % numagents
                agentnums[playertype] = playeragent
            else:
                agentnums = [randint(0,totalagents-1) for i in range(3)]
                while agentnums[0] >= numagents and agentnums[1] >= numagents and agentnums[2] >= numagents:
                    agentnums = [randint(0,totalagents-1) for i in range(3)]

            board = HexBoard(size, boardtypes[randint(0,len(boardtypes)-1)])
            game = Game(board, [agents[agentnums[0]], agents[agentnums[1]], agents[agentnums[2]]])
            game.start()
            while game.computePlay():
                pass
            score = board.boardScore()
            del board
            if trainIllegal:
#                print illegal
                fitness[agentnums[0]][0] += illegal[0]
                fitness[agentnums[0]][1] += 1
                fitness[agentnums[1]][2] += illegal[1]
                fitness[agentnums[1]][3] += 1
                fitness[agentnums[2]][4] += illegal[2]
                fitness[agentnums[2]][5] += 1
            else:
                loserscore = game.lost[0][1]
                loser = game.lost[0][0]
                try:
                    middlescore = game.lost[1][1]
                    middle = game.lost[1][0]
                except:
                    print game.lost
                    print "Someone not dropped!"
                    middle = (loser + 1) % 3
                    middlescore = [0,0,0]
                winner = 2*(loser + middle) % 3
                winnerscore = score
                if agentnums[loser] < numagents:
                    fitness[agentnums[loser]][loser*2] += 2 + loserscore[middle] + loserscore[winner]
                    fitness[agentnums[loser]][6] += 1
                if agentnums[winner] < numagents:
                    fitness[agentnums[winner]][winner*2+1] += 2 + winnerscore[winner]
                    fitness[agentnums[winner]][6] += 1
                if agentnums[middle] < numagents:
                    fitness[agentnums[middle]][middle*2] += 1 + middlescore[winner]
                    fitness[agentnums[middle]][middle*2+1] += 1 + middlescore[loser]
                    fitness[agentnums[middle]][6] += 1

        for i in range(len(fitness)):
            if not trainIllegal:
                total = fitness[i][6]
                if total > 0:
                    totalwin = float(fitness[i][1] + fitness[i][3] + fitness[i][5]) / total
                    totalloss = float(fitness[i][0] + fitness[i][2] + fitness[i][4]) / total
                else:
                    totalwin = 0
                    totalloss = 0
                avg = totalloss - totalwin
                print fitness[i]
                cma.strings[i].fitness = avg
            else:
                illegalmoves = fitness[i][0] + fitness[i][2] + fitness[i][4]
                gamesplayed = fitness[i][1] + fitness[i][3] + fitness[i][5]
            
                if gamesplayed == 0:
                    cma.strings[i].fitness = 100
                else:
                    if fitness[i][1] > 0:
                        redillegal = float(fitness[i][0]) / fitness[i][1]
                    else:
                        redillegal = 50
                    if fitness[i][3] > 0:
                        greenillegal = float(fitness[i][2]) / fitness[i][3]
                    else:
                        greenillegal = 50
                    if fitness[i][4] > 0:
                        blueillegal = float(fitness[i][4]) / fitness[i][4]
                    else:
                        blueillegal = 50
                    totalillegal = float(illegalmoves) / gamesplayed
                    maxillegal = max(redillegal, greenillegal, blueillegal)
                    inverted =  maxillegal - (3.0*maxillegal - redillegal - greenillegal - blueillegal)
#                cma.strings[i].fitness = float(illegalmoves)/float(gamesplayed)
                    cma.strings[i].fitness = ((inverted**2 + 3*totalillegal**2) / 4.0)**0.5
        print "Writing... "
        if againstBotsOnly or trainIllegal:
            data = file("brains","w")
            cma.updateBest()
            for best in range(cma.solutions):
                writeString(data, cma.bestsolutions[best].values)
                for string in cma.strings:
                    writeString(data, string.values)
            data.close()
        fitnesses = [cma.strings[i].fitness for i in range(len(cma.strings))]
        fitnesses.sort()
        halflength = len(fitnesses)/2
        halffit = fitnesses[:halflength]
        print fitnesses
        print halffit
        avg = sum(halffit) / halflength
        st = std(halffit)
        print "Average: %.3f, StDev: %.3f" % (avg, st)

        cmafile = file("cma","w")
        cma.writeCMA(cmafile)
        cmafile.close()
        """
        if avg <= size:
            timesright += 1
        else:
            timesright = 0
        if timesright >= 3:
            print "Finished run.  Generations: %d,  Time: %.3f,  Average: %.3f, StDev: %.3f" % (runs + 1, time() - timestart, avg, st)
            return(runs, time() - timestart, avg, st)
            """
        cma.run()

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

def main_play():
    # Start the Basics
    size = 7
    inputsize = 1
    outputsize = 3

    # Start the Agents
    numagents = 5

    strings = []
    try:
        data = file("brains","r")
        for i in range(numagents):
            try:
                strings.append(readString(data))
            except:
                numagents = i
                break
        data.close()
    except:
        print "No brain to load!"
        for i in range(numagents):
            strings.append([2*random() - 1 for i in range(66)])

    agents = []
    global illegal
    illegal = [0,0,0]
    for i in range(numagents):
#        agents.append(NNAgent(QuickBrain(size, strings[i])))
        agents.append(BotAgent(random(), random()))
    
    board = HexBoard(size, "hexagon")
    game = Game(board, [None, agents[randint(0,numagents-1)], agents[0]])
    print board
    game.start()
    while not game.checkWin():
        game.computePlay()
        print board

main()
