from quickbrain import *
from math import log, e, exp, tanh
from numpy import dot

class PostProcessBrain(object):
    def __init__(self, boardsize, weights = None, middlesize = 3, rotate = False):
        self.size = boardsize
        self.outputsize = 6
        self.middlesize = middlesize
	playerSize = 3
        midpoint = 48
        weights2 = weights[midpoint:]
        weights1 = weights[:midpoint]
        self.bottom = QuickBrain(self.size, weights1, self.outputsize, False, True, rotate)
        self.playerWeights = [weights2[i*playerSize:(i+1)*playerSize] for i in range(self.outputsize)]
	pos = self.outputsize * playerSize
        self.postWeights = [weights2[pos + i*self.outputsize:pos + (i+1)*self.outputsize] for i in range(middlesize)]
	pos2 = pos + middlesize*self.outputsize
        self.finalWeights = weights2[pos2:]

    def sigmoid(self,val):
        if val < -45:
            return 0.0
        elif val > 45:
            return 1.0
        else:
            return (1.0 + exp(-val))**(-1)

    def getOutputs(self,num):
	if num == 0:
		player = [1,0,0]
	elif num == 1:
		player = [0,1,0]
	else:
		player = [0,0,1]
        final = {}
        output = self.bottom.getOutputs(num)
        for q in range(self.size):
            for p in range(self.bottom.offset - q/2, self.size + self.bottom.offset - q/2):
                inputs = output[p,q]
                #print "inputs: ", inputs
		processed = [inputs[i] * dot(player, self.playerWeights[i]) for i in range(self.outputsize)]
                #print "Processed: ", processed
                #print "Post Weights: ", self.postWeights
                #print "Final Weights: ", self.finalWeights
		#print "---"
                process = [tanh(dot(processed, self.postWeights[i])) for i in range(self.middlesize)]
                final[p,q] = self.sigmoid(dot(process, self.finalWeights))
        
        return final

    def inputVals(self, inputs):
        self.bottom.inputVals(inputs)
