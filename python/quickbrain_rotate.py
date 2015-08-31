#!/usr/bin/env python
from math import exp, sqrt, tanh
from random import random
from numpy import dot

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

class QuickBrain(object):
    def __init__(self, size, weights = None, outputsize = 3, sigmoidoutput = False):
        self.size = size
        self.offset = (size-1)/2
        self.outputsize = outputsize
        self.sigmoidoutput = sigmoidoutput
        self.input = {}
        self.memlayers = [{}, {}, {}, {}, {}, {}]
        self.outputlayers = [{}, {}, {}, {}, {}, {}]
        self.w = [[] for i in range(9)]
        if weights == None:
            self.loadWeights([1.0 for i in range(48)] + [1.0/6.0 for j in range(6 * self.outputsize)])
        else:
            self.loadWeights(weights)
        self.setupLayers()

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

    def setupLayers(self):
        invert = self.size - 1
        for y in range(self.size):
            for x in range(self.size):
                q = y
                p = x + self.offset - q/2
                self.memlayers[UPLEFT][p,q] = 0
                self.memlayers[UPLEFT][p, q-1] = 0
                self.memlayers[UPLEFT][p-1, q] = 0

                q = invert - y
                p = (invert - x) + self.offset - q/2
                self.memlayers[DOWNRIGHT][p,q] = 0
                self.memlayers[DOWNRIGHT][p, q+1] = 0
                self.memlayers[DOWNRIGHT][p+1, q] = 0

                q = invert - y
                p = x + self.offset - q/2
                self.memlayers[UPRIGHT][p,q] = 0
                self.memlayers[UPRIGHT][p-1, q] = 0
                self.memlayers[UPRIGHT][p-1, q+1] = 0
                
                q = y
                p = (invert - x) + self.offset - q/2
                self.memlayers[DOWNLEFT][p,q] = 0
                self.memlayers[DOWNLEFT][p+1, q-1] = 0
                self.memlayers[DOWNLEFT][p+1, q] = 0

                q = y
                p = (invert - x) + self.offset - q / 2
                self.memlayers[LEFT][p,q] = 0
                self.memlayers[LEFT][p, q-1] = 0
                self.memlayers[LEFT][p+1, q-1] = 0

                q = invert - y
                p = x + self.offset - q/2
                self.memlayers[RIGHT][p,q] = 0
                self.memlayers[RIGHT][p-1, q+1] = 0
                self.memlayers[RIGHT][p, q+1] = 0

    def getOutputs(self, num):
	if num == 0:
		(UL, DR, UR, DL, LT, RT) = (UPLEFT, DOWNRIGHT, UPRIGHT, DOWNLEFT, LEFT, RIGHT)
	if num == 1:
		(UL, DR, UR, DL, LT, RT) = (DOWNLEFT, UPRIGHT, LEFT, RIGHT, DOWNRIGHT, UPLEFT)
	if num == 2:
		(UL, DR, UR, DL, LT, RT) = (LEFT, RIGHT, UPLEFT, DOWNRIGHT, DOWNLEFT, UPRIGHT) 
        invert = self.size - 1
        for y in range(self.size):
            for x in range(self.size):
                q = y
                p = x + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[UPLEFT][p, q-1]
                memvectwo = self.memlayers[UPLEFT][p-1, q]
                mem = self.memlayers[UPLEFT][p,q] = self.f(i * self.w[UL][INPUT]) * self.g(i*self.w[UL][INPUTGATE]) + memvecone * self.g(i*self.w[UL][FORGETGATEONE] + memvecone * self.w[UL][RECURONE]) + memvectwo * self.g(i*self.w[UL][FORGETGATETWO] + memvectwo*self.w[UL][RECURTWO])
                self.outputlayers[UPLEFT][p,q] = self.f(mem*self.w[UL][MEMOUTPUT])*self.g(i*self.w[UL][OUTPUTGATE])

                q = invert - y
                p = (invert - x) + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[DOWNRIGHT][p, q+1]
                memvectwo = self.memlayers[DOWNRIGHT][p+1, q]
                mem = self.memlayers[DOWNRIGHT][p,q] = self.f(i * self.w[DR][INPUT]) * self.g(i*self.w[DR][INPUTGATE]) + memvecone * self.g(i*self.w[DR][FORGETGATEONE] + memvecone * self.w[DR][RECURONE]) + memvectwo * self.g(i*self.w[DR][FORGETGATETWO] + memvectwo*self.w[DR][RECURTWO])
                self.outputlayers[DOWNRIGHT][p,q] = self.f(mem*self.w[DR][MEMOUTPUT])*self.g(i*self.w[DR][OUTPUTGATE])

                q = invert - y
                p = x + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[UPRIGHT][p-1, q]
                memvectwo = self.memlayers[UPRIGHT][p-1, q+1]
                mem = self.memlayers[UPRIGHT][p,q] = self.f(i * self.w[UR][INPUT]) * self.g(i*self.w[UR][INPUTGATE]) + memvecone * self.g(i*self.w[UR][FORGETGATEONE] + memvecone * self.w[UR][RECURONE]) + memvectwo * self.g(i*self.w[UR][FORGETGATETWO] + memvectwo*self.w[UR][RECURTWO])
                self.outputlayers[UPRIGHT][p,q] = self.f(mem*self.w[UR][MEMOUTPUT])*self.g(i*self.w[UR][OUTPUTGATE])
                
                q = y
                p = (invert - x) + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[DOWNLEFT][p+1, q-1]
                memvectwo = self.memlayers[DOWNLEFT][p+1, q]
                mem = self.memlayers[DOWNLEFT][p,q] = self.f(i * self.w[DL][INPUT]) * self.g(i*self.w[DL][INPUTGATE]) + memvecone * self.g(i*self.w[DL][FORGETGATEONE] + memvecone * self.w[DL][RECURONE]) + memvectwo * self.g(i*self.w[DL][FORGETGATETWO] + memvectwo*self.w[DL][RECURTWO])
                self.outputlayers[DOWNLEFT][p,q] = self.f(mem*self.w[DL][MEMOUTPUT])*self.g(i*self.w[DL][OUTPUTGATE])

                q = y
                p = (invert - x) + self.offset - q / 2
                i = self.input[p,q]
                memvecone = self.memlayers[LEFT][p, q-1]
                memvectwo = self.memlayers[LEFT][p+1, q-1]
                mem = self.memlayers[LEFT][p,q] = self.f(i * self.w[LT][INPUT]) * self.g(i*self.w[LT][INPUTGATE]) + memvecone * self.g(i*self.w[LT][FORGETGATEONE] + memvecone * self.w[LT][RECURONE]) + memvectwo * self.g(i*self.w[LT][FORGETGATETWO] + memvectwo*self.w[LT][RECURTWO])
                self.outputlayers[LEFT][p,q] = self.f(mem*self.w[LT][MEMOUTPUT])*self.g(i*self.w[LT][OUTPUTGATE])

                q = invert - y
                p = x + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[RIGHT][p-1, q+1]
                memvectwo = self.memlayers[RIGHT][p, q+1]
                mem = self.memlayers[RIGHT][p,q] = self.f(i * self.w[RT][INPUT]) * self.g(i*self.w[RT][INPUTGATE]) + memvecone * self.g(i*self.w[RT][FORGETGATEONE] + memvecone * self.w[RT][RECURONE]) + memvectwo * self.g(i*self.w[RT][FORGETGATETWO] + memvectwo*self.w[RT][RECURTWO])
                self.outputlayers[RIGHT][p,q] = self.f(mem*self.w[RT][MEMOUTPUT])*self.g(i*self.w[RT][OUTPUTGATE])
            
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
    size = 5
    brain = QuickBrain(size)
    board = {}
    for q in range(size):
        for p in range(size/2 - q/2, size + size/2 - q/2):
            board[p,q] = 1
    brain.inputVals(board)
    outputs = brain.getOutputs(0)
    print printBoard(outputs)

