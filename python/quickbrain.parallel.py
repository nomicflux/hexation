#!/usr/bin/env python
from math import exp, sqrt, tanh
from random import random
from numpy import dot
import multiprocessing as mp

INPUT = 0
INPUTGATE = 1
FORGETGATEONE = 2
RECURONE = 3
FORGETGATETWO = 4
RECURTWO = 5
MEMOUTPUT = 6
OUTPUTGATE = 7
OUTPUT = 8

UPLEFT = 0    
DOWNRIGHT = 1
UPRIGHT = 2
DOWNLEFT = 3
LEFT = 4
RIGHT = 5

outQ = mp.Queue()
class QuickBrain(object):
    def __init__(self, size, weights = None, outputsize = 3, sigmoidoutput = False):
        self.size = size
        self.invert = size - 1
        self.offset = (size-1)/2
        self.outputsize = outputsize
        self.sigmoidoutput = sigmoidoutput
        self.input = {}
#        self.memlayers = [{}, {}, {}, {}, {}, {}]
        self.outputlayers = [{}, {}, {}, {}, {}, {}]
        self.w = [[] for i in range(9)]
        if weights == None:
            self.loadWeights([1.0 for i in range(48)] + [1.0/6.0 for j in range(6 * self.outputsize)])
        else:
            self.loadWeights(weights)
 #       self.setupLayers()
#        self.brainQ = mp.Queue()

    def inputVals(self, inputs):
        self.input = inputs

    def loadWeights(self, weights):
        for k in range(6):
            self.w[k] = [weights.pop(0),   # Input
                         weights.pop(0),   # Input Gate
                         weights.pop(0), weights.pop(0), # Forget Gates
                         weights.pop(0), weights.pop(0), # Recurrance
                         weights.pop(0),  # Output Gate
                         weights.pop(0)]  # Mem Output
        self.w[OUTPUT] = [[weights.pop(0) for i in range(6)] for j in range(self.outputsize)]

    def f(self, val):
        return tanh(val)

    def g(self,val):
        if val < -45:
            return 0.0
        elif val > 45:
            return 1.0
        else:
            return (1.0 + exp(-val))**(-1)

    def getHiddenOutputs(self, side, invertp, invertq, move1, move2, outQ):
        outputlayer = {}
        memlayer = {}
        if invertq:
            (qstart, qstop, qstep) = (self.invert, -1, -1)
        else:
            (qstart, qstop, qstep) = (0,self.size,1)
        if invertp:
            (pstart, pstop, pstep) = (self.invert + self.offset, self.offset-1, -1)
        else:
            (pstart, pstop, pstep) = (self.offset, self.size + self.offset, 1)
        for q in range(qstart,qstop,qstep):
            for p in range(pstart - q/2, pstop - q/2, pstep):
                i = self.input[p,q]
                place1 = (p+move1[0], q+move1[1])
                place2 = (p+move2[0], q+move2[1])
                inp = self.f(i * self.w[side][INPUT])
                inpgate = self.g(i*self.w[side][INPUTGATE])
                if memlayer.has_key(place1):
                    memvecone = memlayer[p+move1[0], q+move1[1]]
                    side1 = memvecone * self.g(i*self.w[side][FORGETGATEONE] + memvecone * self.w[side][RECURONE])
                else:
                    side1 = 0
                if memlayer.has_key(place2):
                    memvectwo = memlayer[p+move2[0], q+move2[1]]
                    side2 = memvectwo * self.g(i*self.w[side][FORGETGATEONE] + memvectwo * self.w[side][RECURONE])
                else:
                    side2 = 0
                mem = memlayer[p,q] =  inp * inpgate + side1 + side2
                outputlayer[p,q] = self.f(mem*self.w[side][MEMOUTPUT])*self.g(i*self.w[side][OUTPUTGATE])
        outQ.put( (side, outputlayer) )


    def getOutputs(self, num):
        outQ = mp.Queue()
        processes = [mp.Process(target=self.getHiddenOutputs, args=(UPLEFT, False, False, [0,-1], [-1,0], outQ)), 
                     mp.Process(target=self.getHiddenOutputs, args=(DOWNRIGHT, True, True, [0,1], [1,0], outQ)),
                     mp.Process(target=self.getHiddenOutputs, args=(UPRIGHT, False, True, [-1,0], [-1,1], outQ)),
                     mp.Process(target=self.getHiddenOutputs, args=(DOWNLEFT, True, False, [1,0], [1,-1], outQ)),
                     mp.Process(target=self.getHiddenOutputs, args=(LEFT, True, False, [0,-1], [1,-1], outQ)),
                     mp.Process(target=self.getHiddenOutputs, args=(RIGHT, False, True, [0,1], [-1,1], outQ))]
            
        for p in processes:
            p.start()
        for p in processes:
            p.join()

        outputs = [outQ.get() for p in processes]
        for o in outputs:
            self.outputlayers[o[0]] = o[1]

        output = {}

        if self.sigmoidoutput:
            for q in range(self.size):
                for p in range(self.offset - q/2, self.size + self.offset - q/2):
                    output[p,q] = self.f(dot([self.outputlayers[j][p,q] for j in range(6)], self.w[OUTPUT][num]))
        else:
            for q in range(self.size):
                for p in range(self.offset - q/2, self.size + self.offset - q/2):                    
                    output[p,q] = dot([self.outputlayers[j][p,q] for j in range(6)], self.w[OUTPUT][num])
        
        return output

def printBoard(board):
    string = ""
    size = int(sqrt(len(board)))
    offset = (size-1)/2
    for i in range(size):
        stringeven = ""
        stringodd = ""
        switch = True
        for j in range(size):
            p = i + offset - j / 2
            q = j
            if switch:
                stringeven += str(board[p,q]) + "\t"
                stringodd += "\t"
            else:
                stringodd += str(board[p,q]) + "\t"
                stringeven += "\t"
            switch = not switch
        string += stringeven + "\n"
        string += stringodd + "\n"
    return string

def main():
    size = 3
    brain = QuickBrain(size)
    board = {}
    for q in range(size):
        for p in range(size/2 - q/2, size + size/2 - q/2):
            board[p,q] = 1
    brain.inputVals(board)
    outputs = brain.getOutputs(0)
    print printBoard(outputs)
