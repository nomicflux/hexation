#!/usr/bin/env python
from math import exp, sqrt, tanh
from random import random
from scipy import dot

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
    def __init__(self, size, weights = None):
        self.size = size
        self.offset = (size-1)/2
        self.input = {}
        self.memlayers = [{}, {}, {}, {}, {}, {}]
        self.outputlayers = [{}, {}, {}, {}, {}, {}]
        self.w = [[] for i in range(9)]
        if weights == None:
            self.loadWeights([1.0 for i in range(48)] + [1.0/6.0 for j in range(18)])
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
        self.w[OUTPUT] = [[weights.pop(0) for i in range(6)] for j in range(3)]

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
        invert = self.size - 1
        for y in range(self.size):
            for x in range(self.size):
                q = y
                p = x + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[UPLEFT][p, q-1]
                memvectwo = self.memlayers[UPLEFT][p-1, q]
                mem = self.memlayers[UPLEFT][p,q] = self.f(i * self.w[UPLEFT][INPUT]) * self.g(i*self.w[UPLEFT][INPUTGATE]) + memvecone * self.g(i*self.w[UPLEFT][FORGETGATEONE] + memvecone * self.w[UPLEFT][RECURONE]) + memvectwo * self.g(i*self.w[UPLEFT][FORGETGATETWO] + memvectwo*self.w[UPLEFT][RECURTWO])
                self.outputlayers[UPLEFT][p,q] = self.f(mem*self.w[UPLEFT][MEMOUTPUT])*self.g(i*self.w[UPLEFT][OUTPUTGATE])

                q = invert - y
                p = (invert - x) + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[DOWNRIGHT][p, q+1]
                memvectwo = self.memlayers[DOWNRIGHT][p+1, q]
                mem = self.memlayers[DOWNRIGHT][p,q] = self.f(i * self.w[DOWNRIGHT][INPUT]) * self.g(i*self.w[DOWNRIGHT][INPUTGATE]) + memvecone * self.g(i*self.w[DOWNRIGHT][FORGETGATEONE] + memvecone * self.w[DOWNRIGHT][RECURONE]) + memvectwo * self.g(i*self.w[DOWNRIGHT][FORGETGATETWO] + memvectwo*self.w[DOWNRIGHT][RECURTWO])
                self.outputlayers[DOWNRIGHT][p,q] = self.f(mem*self.w[DOWNRIGHT][MEMOUTPUT])*self.g(i*self.w[DOWNRIGHT][OUTPUTGATE])

                q = invert - y
                p = x + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[UPRIGHT][p-1, q]
                memvectwo = self.memlayers[UPRIGHT][p-1, q+1]
                mem = self.memlayers[UPRIGHT][p,q] = self.f(i * self.w[UPRIGHT][INPUT]) * self.g(i*self.w[UPRIGHT][INPUTGATE]) + memvecone * self.g(i*self.w[UPRIGHT][FORGETGATEONE] + memvecone * self.w[UPRIGHT][RECURONE]) + memvectwo * self.g(i*self.w[UPRIGHT][FORGETGATETWO] + memvectwo*self.w[UPRIGHT][RECURTWO])
                self.outputlayers[UPRIGHT][p,q] = self.f(mem*self.w[UPRIGHT][MEMOUTPUT])*self.g(i*self.w[UPRIGHT][OUTPUTGATE])
                
                q = y
                p = (invert - x) + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[DOWNLEFT][p+1, q-1]
                memvectwo = self.memlayers[DOWNLEFT][p+1, q]
                mem = self.memlayers[DOWNLEFT][p,q] = self.f(i * self.w[DOWNLEFT][INPUT]) * self.g(i*self.w[DOWNLEFT][INPUTGATE]) + memvecone * self.g(i*self.w[DOWNLEFT][FORGETGATEONE] + memvecone * self.w[DOWNLEFT][RECURONE]) + memvectwo * self.g(i*self.w[DOWNLEFT][FORGETGATETWO] + memvectwo*self.w[DOWNLEFT][RECURTWO])
                self.outputlayers[DOWNLEFT][p,q] = self.f(mem*self.w[DOWNLEFT][MEMOUTPUT])*self.g(i*self.w[DOWNLEFT][OUTPUTGATE])

                q = y
                p = (invert - x) + self.offset - q / 2
                i = self.input[p,q]
                memvecone = self.memlayers[LEFT][p, q-1]
                memvectwo = self.memlayers[LEFT][p+1, q-1]
                mem = self.memlayers[LEFT][p,q] = self.f(i * self.w[LEFT][INPUT]) * self.g(i*self.w[LEFT][INPUTGATE]) + memvecone * self.g(i*self.w[LEFT][FORGETGATEONE] + memvecone * self.w[LEFT][RECURONE]) + memvectwo * self.g(i*self.w[LEFT][FORGETGATETWO] + memvectwo*self.w[LEFT][RECURTWO])
                self.outputlayers[LEFT][p,q] = self.f(mem*self.w[LEFT][MEMOUTPUT])*self.g(i*self.w[LEFT][OUTPUTGATE])

                q = invert - y
                p = x + self.offset - q/2
                i = self.input[p,q]
                memvecone = self.memlayers[RIGHT][p-1, q+1]
                memvectwo = self.memlayers[RIGHT][p, q+1]
                mem = self.memlayers[RIGHT][p,q] = self.f(i * self.w[RIGHT][INPUT]) * self.g(i*self.w[RIGHT][INPUTGATE]) + memvecone * self.g(i*self.w[RIGHT][FORGETGATEONE] + memvecone * self.w[RIGHT][RECURONE]) + memvectwo * self.g(i*self.w[RIGHT][FORGETGATETWO] + memvectwo*self.w[RIGHT][RECURTWO])
                self.outputlayers[RIGHT][p,q] = self.f(mem*self.w[RIGHT][MEMOUTPUT])*self.g(i*self.w[RIGHT][OUTPUTGATE])
            
        output = {}
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

