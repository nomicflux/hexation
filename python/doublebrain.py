from quickbrain import *
from math import log, e, exp, atan

class DoubleBrain(object):
    maxval = log(e-1)

    def __init__(self, size, weights1 = None, weights2 = None, rotate = False):
        self.size = size
        self.inputsize = 3
        self.outputsize = 3
        midpoint = 48 + 6*self.inputsize
        if weights2 == None and weights1 != None:
            weights2 = weights1[midpoint:]
            weights1 = weights1[:midpoint]
        self.bottom = QuickBrain(size, weights1, self.inputsize, True, False, rotate)
        self.top = QuickBrain(size, weights2, self.outputsize, False, False, rotate)

    def loadWeights(self, weights1, weights2):
        self.bottom.loadWeights(weights1)
        self.top.loadWeights(weights2)

    def getOutputs(self,num):
        if num >= self.inputsize:
            output = self.bottom.getOutputs(0)
        else:
            output = self.bottom.getOutputs(num)
        self.top.inputVals(output)
        return self.top.getOutputs(num)

    def inputVals(self, inputs):
        self.bottom.inputVals(inputs)
