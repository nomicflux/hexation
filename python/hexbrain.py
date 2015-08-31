#!/usr/bin/env python
from math import exp, sqrt, tanh
from random import random

class Connectible(object):
    def getVal(self):
        return self.value

class Connection(object):
    def __init__(self, node, weight):
        self.node = node
        self.weight = weight

    def __repr__(self):
        return "From: %s with weight: %s" % (str(self.node),str(self.weight))

class Input(Connectible):
    def __init__(self, value):
        self.value = value

    def getVal(self):
        return self.value

class Node(Connectible):
    baseVal = 0
    def __init__(self, connections, nodes=[]):
        if type(connections) == list:
            self.connectionsFrom = connections
        else:
            self.connectionsFrom = [connections]
        if nodes:
            for n in nodes:
                self.connectionsFrom.append(Connection(n,1.0))
        self.ran = False
        self.value = self.baseVal

    def __repr__(self):
        string = ""
        for conn in self.connectionsFrom:
            string += "\t\tConnection \t|  Weight: %s  \tValue From: %s\n" % (conn.weight, conn.node.getVal())
        return string

    def aggFunction(self,x,y):
        return x + y

    def inputFunction(self,val):
        return val

    def derivFunction(self, x, y):
        return 1

    def aggInputs(self):
        if not self.ran:
            self.ran = True
            agg = self.baseVal
            for conn in self.connectionsFrom:
                agg = self.aggFunction(agg, conn.node.getVal() * conn.weight)
                self.value = self.inputFunction(agg)

    def addConnection(self, conn):
        self.connectionsFrom.append(conn)

    def getVal(self):
        self.aggInputs()
        return self.value

    def reset(self):
        self.ran = False
        self.value = 0

class InputNode(Node):
    def inputVal(self, x):
        self.value = x

class PiNode(Node):
    baseVal = 1
    def aggFunction(self, x,y):
        return x*y

class TanhNode(Node):
    def inputFunction(self, val):
        return tanh(val)

    def derivFunction(self, val):
        return 1 - tanh(val)**2

class SigmoidNode(Node):
    def inputFunction(self, val):
        if val < -45:
            return -1.0
        elif val > 45:
            return 1.0
        else:
            return 2.0*(1.0 + exp(-val))**(-1) - 1.0

    def derivFunction(self, val):
        if val < -45:
            f = 0.0
        elif val > 45:
            f = 1.0
        else:
            f = (1.0 + exp(-val))**(-1)
        return 2*f * (1 - f)

class OutputNode(Node):
    def aggInputs(self):
        if not self.ran:
            self.ran = True
            agg = self.baseVal
            for conn in self.connectionsFrom:
                agg = self.aggFunction(agg, conn.node.getOutput() * conn.weight)
                self.value = self.inputFunction(agg)


class GateNode(Node):
    def inputFunction(self, val):
        if val < -45:
            return 0.0
        elif val > -45:
            return 1.0
        else:
            return (1.0 + exp(-val))**(-1)

    def derivFunction(self, val):
        f = self.inputFunction(val)
        return f * (1 - f)

class Gate(Connectible):
    def __init__(self, connections, piconnections):
        self.entry = GateNode([])
        self.piNode = PiNode([])
        for conn in connections:
            self.entry.addConnection(conn)
        if type(piconnections) == list:
            for node in piconnections:
                self.piNode.addConnection(Connection(node, 1.0))
        else:
            self.piNode.addConnection(Connection(piconnections, 1.0))
        self.piNode.addConnection(Connection(self.entry, 1.0))
        self.ran = False
    
    def __repr__(self):
        string = "\tEntrance \t|  Value: %s\n" % (self.entry.getVal())
        string += "\tPi Node \t|  Value: %s\n" % (self.piNode.getVal())
        string += str(self.piNode)
        return string

    def runCells(self):
        if not self.ran:
            self.piNode.aggInputs()
            self.ran = True
    
    def getVal(self):
 #       self.runCells()
        return self.piNode.getVal()

    def reset(self):
        self.ran = False
        self.entry.reset()
        self.piNode.reset()
    
class LSTMWeights(object):
    def __init__(self, i, ig, fg, fgr, og, ogm):
        if type(i) == list:
            self.input = i
        else:
            self.input = [i]
        if type(ig) == list:
            self.inputgate = ig
        else:
            self.inputgate = [ig]
        if type(fg) == list:
            self.forgetgate = fg
        else:
            self.forgetgate = [fg]
        if type(fgr) == list:
            self.forgetgaterecur = fgr
        else:
            self.forgetgaterecur = [fgr]
        if type(og) == list:
            self.outputgate = og
        else:
            self.outputgate = [og]
        self.outputgatememory = ogm

    def __repr__(self):
        for index, i in enumerate(self.input):
            string = "Input %d: %.2f\n" % (index, i)
        for index, i in enumerate(self.inputgate):
            string += "Input Gate %d: %.2f\n" % (index, i)
        for i in range(len(self.forgetgate)):
            for index, j in enumerate(self.forgetgate[i]):
                string += "Forget Gate #%d %d: %.2f\n" % (i, index, j)
        for index, i in enumerate(self.outputgate):
            string += "Output Gate %d: %.2f\n" % (index, i)
        string += "Memory Output: %.2f\n" % (self.outputgatememory)
        return string


class LSTMCell(Connectible):
    def __init__(self, dim, inputs, connectedCells, weights):
        """ Structure of weights:
            {"input": inputs to input node
             "inputgate": inputs to input gate
             "forgetgate"[]: inputs to forget gates
             "forgetgaterecur"[]: recurrance to forget gates
             "outputgate": inputs to output gate
             "outputgatememory": memory to output gate}
        """

        self.dim = dim
        if not type(connectedCells) == list:
            connectedCells = [connectedCells]
        if not type(inputs) == list:
            inputs = [inputConnections]
        
        # Construct Input Cell Connections
        connections = []
        for x, y in zip(inputs, weights.input):
            connections.append(Connection(x,y))
        self.input = TanhNode(connections)

        # Construct Input Gate Connections (Inputs)
        connections = []
        for x, y in zip(inputs, weights.inputgate):
            connections.append(Connection(x,y))
        self.inputGate = Gate(connections, [self.input])

        # Construct Forget Gates and Forget Gate Connections (Inputs + Recurrance)
        self.forgetGates = []
        for i in range(dim):
            connections = []
            for x, y in zip(inputs, weights.forgetgate[i]):
                connections.append(Connection(x,y))
            if i < len(connectedCells):
                connections.append(Connection(connectedCells[i], weights.forgetgaterecur[i]))
                self.forgetGates.append(Gate(connections, connectedCells[i]))
            else:
                self.forgetGates.append(Gate(connections,[]))

        # Memory just sums inputs through gates
        self.memory = Node([], [self.inputGate] + self.forgetGates)

        # Construct Output Gate Connections (Inputs + Memory)
        connections = [Connection(self.memory, weights.outputgatememory)]
        for x, y in zip(inputs, weights.outputgate):
            connections.append(Connection(x,y))
        self.outputGate = Gate(connections, [self.memory])

        # Value not calculated yet
        self.ran = False

    def __repr__(self):
        string = "Input \t\t|  Value: %s\n" % (self.input.getVal())
        string += "InputGate \t|  Value: %s\n" % (self.inputGate.getVal())
        string += str(self.inputGate)
        for i in range(self.dim):
            string += "ForgetGate %s \t|  Value: %s\n" % (i, self.forgetGates[i].getVal())
            string += str(self.forgetGates[i])
        string += "Memory \t\t|  Value: %s\n" % (self.memory.getVal())
        string += "OutputGate \t|  Value: %s\n" % (self.outputGate.getVal())
        string += str(self.outputGate)
        return string

    def runCell(self):
        if not self.ran:
            self.input.aggInputs()
            self.inputGate.runCells()
            for gate in self.forgetGates:
                gate.runCells()
            self.memory.aggInputs()
            self.ran = True
    
    def getVal(self):
        self.runCell()
        return self.memory.getVal()

    def getOutput(self):
        self.runCell()
        return self.outputGate.getVal()

    def reset(self):
        self.ran = False
        self.input.reset()
        self.inputGate.reset()
        for gate in self.forgetGates:
            gate.reset()
        self.outputGate.reset()
        self.memory.reset()

class HexMDLSTM(object):
    def __init__(self, size, inputsize, outputsize, weights = None):
        self.size = size
        self.offset = (size-1)/2
        self.inputsize = inputsize
        self.outputsize = outputsize
        if weights:
            if type(weights) == str:
                self.makeRandomHex()
            elif type(weights[0] == float):
                self.loadWeights(weights)
            else:
                self.makeHexNet(weights)
        else:
            self.makeUnweightedHex()

    def reset(self):
        for key in self.net["hidden"]:
            for cell in self.net["hidden"][key]:
                self.net["hidden"][key][cell].reset()
        for cell in self.net["output"]:
            for n in range(len(self.net["output"][cell])):
                self.net["output"][cell][n].reset()

    def loadWeights(self, numlst):
        ulweight = LSTMWeights([numlst.pop(0) for i in range(self.inputsize)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               [[numlst.pop(0) for i in range(self.inputsize)], [numlst.pop(0) for i in range(self.inputsize)]],
                               [numlst.pop(0) for i in range(2)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               numlst.pop(0))
        drweight = LSTMWeights([numlst.pop(0) for i in range(self.inputsize)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               [[numlst.pop(0) for i in range(self.inputsize)], [numlst.pop(0) for i in range(self.inputsize)]],
                               [numlst.pop(0) for i in range(2)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               numlst.pop(0))
        urweight = LSTMWeights([numlst.pop(0) for i in range(self.inputsize)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               [[numlst.pop(0) for i in range(self.inputsize)], [numlst.pop(0) for i in range(self.inputsize)]],
                               [numlst.pop(0) for i in range(2)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               numlst.pop(0))
        dlweight = LSTMWeights([numlst.pop(0) for i in range(self.inputsize)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               [[numlst.pop(0) for i in range(self.inputsize)], [numlst.pop(0) for i in range(self.inputsize)]],
                               [numlst.pop(0) for i in range(2)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               numlst.pop(0))
        lweight = LSTMWeights([numlst.pop(0) for i in range(self.inputsize)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               [[numlst.pop(0) for i in range(self.inputsize)], [numlst.pop(0) for i in range(self.inputsize)]],
                               [numlst.pop(0) for i in range(2)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               numlst.pop(0))
        rweight = LSTMWeights([numlst.pop(0) for i in range(self.inputsize)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               [[numlst.pop(0) for i in range(self.inputsize)], [numlst.pop(0) for i in range(self.inputsize)]],
                               [numlst.pop(0) for i in range(2)],
                               [numlst.pop(0) for i in range(self.inputsize)],
                               numlst.pop(0))

        weights = {"upleft": ulweight,
                   "downright": drweight,
                   "upright": urweight,
                   "downleft": dlweight,
                   "left": lweight,
                   "right": rweight,
                   "output": [[numlst.pop(0) for i in range(6)] for j in range(self.outputsize)]}
        return self.makeHexNet(weights)


    def connect2DHexLayer(self, inputs, weights, vecs):
        #    layer = [[None for i in range(size)] for j in range(size)]
        layer = {}
        totalvec = (vecs[0][0] + vecs[1][0], vecs[0][1] + vecs[1][1])
            
        if totalvec[0] > 0:
            istart = self.size-1 + self.offset
            iend = self.offset
            istep = -1
        else:
            istart = self.offset
            iend = self.size-1 + self.offset
            istep = 1

        if totalvec[1] > 0:
            jstart = self.size-1
            jend = 0
            jstep = -1
        else:
            jstart = 0
            jend = self.size-1
            jstep = 1
                    
            #    for i in range(istart, iend + istep, istep):
        for j in range(jstart, jend + jstep, jstep):
            for i in range(istart - (j/2), iend + istep - (j/2), istep):
                    #            if i >= offset - j/2 and i <= size - 1 + offset - j/2:
                q1 = j + vecs[0][1]
                q2 = j + vecs[1][1]
                    
                p1 = i + vecs[0][0]
                p2 = i + vecs[1][0]
            
                closeCells = []
                    #            print "<i,j>: <%d,%d> \t| <p1,q1>: <%d,%d> \t| <p2,q2>: <%d,%d>" % (i,j,p1,q1,p2,q2)
                    #            print "<i,j>: <%d,%d>" % (i,j)
                if q1 >= 0 and q1 < self.size and p1 >= self.offset - q1/2 and p1 < self.size + self.offset - q1/2:
                    closeCells.append(layer[p1,q1])
                    #                print "\t<p1, q1>: <%d, %d>" % (p1, q1)
                    
                if q2 >= 0 and q2 < self.size and p2 >= self.offset - q2/2 and p2 < self.size + self.offset - q2/2:
                    closeCells.append(layer[p2,q2])
                #                print "\t<p2, q2>: <%d, %d>" % (p2, q2)

                layer[i,j] = LSTMCell(2, inputs[i,j], closeCells, weights)
        return layer

    def makeHexNet(self, weights):
        hiddenLayers ={}
    #    inputNodes = [[[Input(0.0) for k in range(inputsize)] for i in range(x)] for j in range(x)]
        inputNodes = {}
        
        for j in range(self.size):
            for i in range(self.offset - j/2, self.size + self.offset - j/2):
                inputNodes[i,j] = [Input(0.0) for k in range(self.inputsize)]
    #    outputNodes = [[[None for k in range(outputsize)] for i in range(x)] for j in range(x)]
                outputNodes = {} 

        hiddenLayers["upleft"] = self.connect2DHexLayer(inputNodes, weights["upleft"], [(0,-1), (-1,0)])
        hiddenLayers["downright"] = self.connect2DHexLayer(inputNodes, weights["downright"], [(0,1), (1,0)])
        hiddenLayers["upright"] = self.connect2DHexLayer(inputNodes, weights["upright"], [(-1,0), (-1,1)])
        hiddenLayers["downleft"] = self.connect2DHexLayer(inputNodes, weights["downleft"], [(1,-1), (1,0)])
        hiddenLayers["left"] = self.connect2DHexLayer(inputNodes, weights["left"], [(0,-1), (1,-1)])
        hiddenLayers["right"] = self.connect2DHexLayer(inputNodes, weights["right"], [(-1,1), (0,1)])

        for j in range(self.size):
            for i in range(self.offset - j/2, self.size + self.offset - j/2):
                outputs = []
                for k in range(self.outputsize):
                    outconns = [Connection(hiddenLayers["upleft"][i,j], weights["output"][k][0]),
                                Connection(hiddenLayers["downright"][i,j], weights["output"][k][1]),
                                Connection(hiddenLayers["upright"][i,j], weights["output"][k][2]),
                                Connection(hiddenLayers["downleft"][i,j], weights["output"][k][3]),
                                Connection(hiddenLayers["left"][i,j], weights["output"][k][4]),
                                Connection(hiddenLayers["right"][i,j], weights["output"][k][5])]
                    outputs.append(OutputNode(outconns))
                outputNodes[i,j] = outputs
        self.net = {"input": inputNodes, "hidden": hiddenLayers, "output": outputNodes}

    def inputVals(self, inputs):
        self.reset()
        for j in range(self.size):
            for i in range(self.offset - j/2, self.size + self.offset - j/2):
                if self.inputsize == 1:
                    self.net["input"][i,j][0].value = inputs[i,j]
                else:
                    for k in range(self.inputsize):
                        self.net["input"][i,j][k].value = inputs[i,j][k]

    def getOutputs(self, num, softmax = False):
        outputs = {}
        if softmax:
            total = 0.0
            for key in self.net["output"]:
                total += exp(self.net["output"][key][num].getVal())
        for key in self.net["output"]:
            if softmax:
                outputs[key] = exp(self.net["output"][key][num].getVal()) / total
            else:
                outputs[key] = self.net["output"][key][num].getVal()
        return outputs
        
    def makeUnweightedHex(self):
        unweight = LSTMWeights([1.0 for k in range(self.inputsize)],
                               [1.0 for k in range(self.inputsize)],
                               [[1.0 for k in range(self.inputsize)], [1.0 for k in range(self.inputsize)]],
                               [1.0, 1,0],
                               [1.0 for k in range(self.inputsize)],
                               1.0)
        weights = {"upleft": unweight,
                   "downright": unweight,
                   "upright": unweight,
                   "downleft": unweight,
                   "left": unweight,
                   "right": unweight,
                   "output": [[1.0/6.0 for i in range(6)] for j in range(outputsize)]}
        return self.makeHexNet(weights)

    def makeRandomHex(self):
        allWeights = []
        for layers in range(6):
            inputWeights = [(2*random() - 1) for i in range(self.inputsize)]
            inputGateWeights = [(2*random() - 1) for i in range(self.inputsize)]
            forgetGateWeights = [[(2*random() - 1) for i in range(self.inputsize)],
                                 [(2*random() - 1) for i in range(self.inputsize)]]
            forgetGateRecurWeight= [2*random() - 1, 2*random() - 1]
            outputGateWeights = [(2*random() - 1) for i in range(self.inputsize)]
            outputGateMem = 2*random() - 1

            allWeights.append(LSTMWeights(inputWeights, inputGateWeights, forgetGateWeights, forgetGateRecurWeight, outputGateWeights, outputGateMem))

        outputWeights = [[2*random()-1 for k in range(6)] for i in range(self.outputsize)]
        weights = {"upleft": allWeights[0],
                   "downright": allWeights[1],
                   "upright": allWeights[2],
                   "downleft": allWeights[3],
                   "left": allWeights[4],
                   "right": allWeights[5],
                   "output": outputWeights}
        return self.makeHexNet(weights)

def softMax(lst):
    total = 0;
    newlst = []
    for x in lst:
        total += exp(x)
    for x in lst:
        newlst.append(exp(x) / total)
    return newlst

def main():
    size = 11
    net = makeRandomHex(size, 2, 2)
    offset = (size-1) / 2
    inputs = {}
    for j in range(size):
        for i in range(offset - j/2, size + offset - j/2):
            inputs[i,j] = [1, -1]
    inputVals(net, inputs)
    outputs = [getOutputs(net, 0),
               getOutputs(net, 1)]

    for times in range(10):
        for n in range(len(outputs)):
            for i in range(size):
                stringsodd = ""
                stringseven = ""
                switch = True
                for j in range(size):
                    q = j
                    p = i + offset - j/2
                    if switch:
                        stringseven += "%.2f\t" % (outputs[n][p,q])
                        stringsodd += "\t"
                    else:
                        stringsodd += "%.2f\t" % (outputs[n][p,q])
                        stringseven += "\t"
                    switch = not switch
                print stringseven
                print stringsodd
            print " ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ "
        print "#---------------------------------------------------------#" 
        for y in range(size):
            for x in range(offset - y/2, size + offset - y/2):
                inputs[x,y] = [outputs[0][x,y], outputs[1][x,y]]
    #            inputs[x,y] = [0.0,0.0]
        inputVals(net, inputs)
        for key in net["hidden"]:
            for cell in net["hidden"][key]:
                net["hidden"][key][cell].reset()
        for cell in net["output"]:
            for n in range(len(net["output"][cell])):
                net["output"][cell][n].reset()
        outputs = [getOutputs(net, 0),
                   getOutputs(net, 1)]
