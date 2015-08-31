#!/usr/bin/env python
from random import random, randint, normalvariate
from math import exp, sqrt, floor, log
import numpy as np
from numpy.linalg import *

class GAString(object):
    def __init__(self, values = [], fitness = 999999):
        self.values = values
        self.fitness = fitness

def sortStrings(strings):
    if len(strings) <= 1:
        return strings
    head = strings[0]
    left = [string for string in strings if string.fitness < head.fitness]
    equal = [string for string in strings if string.fitness == head.fitness]
    right = [string for string in strings if string.fitness > head.fitness]
    if left and right:
        return sortStrings(left) + equal + sortStrings(right)
    elif left:
        return sortStrings(left) + equal
    elif right:
        return equal + sortStrings(right)
    else:
        return equal

def matricize(vec):
    A = np.identity(len(vec))
    for i in range(len(vec)):
        for j in range(len(vec)):
            A[i,j] = vec[i]*vec[j]
    return A

def vecToString(vec):
    string = ""
    for v in vec:
        string += str(np.real(v)) + ","
    return string[:len(string)-1]

def matToString(mat):
    string = ""
    for m in mat:
        string += vecToString(m) + ";"
    return string[:len(string)-1]

def vecFromString(string):
    vals = string.split(",")
    for i in range(len(vals)):
        vals[i] = float(vals[i])
    return np.array(vals)

def matFromString(string):
    vals = string.split(";")
    for i in range(len(vals)):
        vals[i] = vecFromString(vals[i])
    return np.array(vals)

class CMAES(object):
    def __init__(self, mean = None, sigma = 0.3, popsize = None):
        if mean != None:
            self.dim = len(mean)
            self.xmean = mean
        else:
            self.dim = 30*1 + 6*3 + 18
            self.xmean = np.array([2*random()-1 for i in range(self.dim)])
        self.sigma = sigma

        if popsize == None:
            self.lamb = int(4+floor(3*log(self.dim)))
        else:
            self.lamb = popsize
        mu = self.lamb / 2.0 
        weights = np.array([log(mu + 0.5) - log(i+1.0) for i in range(int(mu))])
        self.mu = int(mu)
        self.weights = np.array([weight / sum(weights) for weight in weights])
        self.mueff = sum(self.weights)**2 / sum([weight**2 for weight in self.weights])

        self.cc = (4.0 + self.mueff / self.dim) / (self.dim + 4.0 + 2.0*self.mueff / self.dim)
        self.cs = (self.mueff + 2.0) / (self.dim + self.mueff + 5.0)
        self.c1 = 2.0 / ((self.dim + 1.3)**2 + self.mueff)
        self.cmu = min(1.0-self.c1, 2*(self.mueff - 2.0+1.0/self.mueff) / ((self.dim + 2.0)**2 + self.mueff))
        self.damps = 1.0 + 2.0*max(0, sqrt((self.mueff-1.0)/(self.dim + 1.0)) - 1.0) + self.cs
        
        self.pc = np.array([0 for i in range(self.dim)])
        self.ps = np.array([0 for i in range(self.dim)])
        self.D =  np.array([1 for i in range(self.dim)])
        self.B = np.identity(self.dim)
        self.C = np.identity(self.dim)
        self.invrtsqrtC = np.identity(self.dim)
        self.eigeneval = 0
        self.chiN = self.dim**(0.5)*(1-1/(4*self.dim)+1/(21*self.dim**2))
        
        self.counteval = 0

        self.solutions = 16
        
        self.bestsolutions = [GAString([2*random()-1 for i in range(self.dim)]) for j in range(self.solutions)]

        self.populate()

    def resetPath(self):
        self.pc = np.array([0 for i in range(self.dim)])
        self.ps = np.array([0 for i in range(self.dim)])

    def resetBest(self):
        self.bestsolutions = [GAString([2*random()-1 for i in range(self.dim)]) for j in range(self.solutions)]

    def readCMA(self, readfrom):
        strings = readfrom.read().split("\n")
        self.xmean = vecFromString(strings[0])
        self.sigma = float(strings[1])

        self.weights = vecFromString(strings[2])

        self.mueff = float(strings[3])

        self.pc = vecFromString(strings[4])
        self.ps = vecFromString(strings[5])
        self.D = vecFromString(strings[6])

        self.B = matFromString(strings[7])
        self.C = matFromString(strings[8])

        self.eigeneval = float(strings[9])
        self.counteval = float(strings[10])

        self.lamb = int(strings[11])

        self.solutions = int(strings[12])
        
        for i in range(self.solutions):
            self.bestsolutions[i] = GAString(vecFromString(strings[13+2*i]), float(strings[14+2*i]))

        self.dim = len(self.xmean)

        self.mu = int(self.lamb / 2)

        self.cc = (4.0 + self.mueff / self.dim) / (self.dim + 4.0 + 2.0*self.mueff / self.dim)
        self.cs = (self.mueff + 2.0) / (self.dim + self.mueff + 5.0)
        self.c1 = 2.0 / ((self.dim + 1.3)**2 + self.mueff)
        self.cmu = min(1.0-self.c1, 2*(self.mueff - 2.0+1.0/self.mueff) / ((self.dim + 2.0)**2 + self.mueff))
        self.damps = 1.0 + 2.0*max(0, sqrt((self.mueff-1.0)/(self.dim + 1.0)) - 1.0) + self.cs

        invD = np.array([self.D[i]**(-1) for i in range(len(self.D))])
        self.invrtsqrtC = np.dot(np.dot(self.B, np.diag(invD)), np.transpose(self.B))

        self.chiN = self.dim**(0.5)*(1-1/(4*self.dim)+1/(21*self.dim**2))

        self.populate()

    def writeCMA(self, writeto):
        writeto.write(vecToString(self.xmean) + "\n")
        writeto.write(str(self.sigma) + "\n")

        writeto.write(vecToString(self.weights) + "\n")

        writeto.write(str(self.mueff) + "\n")

        writeto.write(vecToString(self.pc) + "\n")
        writeto.write(vecToString(self.ps) + "\n")
        writeto.write(vecToString(self.D) + "\n")

        writeto.write(matToString(self.B) + "\n")
        writeto.write(matToString(self.C) + "\n")

        writeto.write(str(self.eigeneval) + "\n") 
        writeto.write(str(self.counteval) + "\n") 

        writeto.write(str(self.lamb) + "\n") 

        writeto.write(str(self.solutions) + "\n") 

        for i in range(self.solutions):
            writeto.write(vecToString(self.bestsolutions[i].values) + "\n")
            writeto.write(str(self.bestsolutions[i].fitness) + "\n")

    def populate(self):
        self.strings = []
#        rando = np.array([normalvariate(0,1) for i in range(self.dim)])

        for j in range(self.lamb):
            z = np.dot(self.B, [self.D[i] * normalvariate(0,1) for i in range(self.dim)])
            self.strings.append(GAString(self.xmean + self.sigma * z))

    def getStringMatrix(self):
        A = np.tile(np.zeros(self.mu),[self.dim, 1])
        for j in range(self.mu):
            for i in range(self.dim):
                A[i,j] = self.strings[j].values[i]
        return A

    def run(self):
        self.strings = sortStrings(self.strings)
        arx = self.getStringMatrix()
        xold = self.xmean
        self.xmean = np.dot(arx[:,0:self.mu],self.weights)    # Update weighted mean
        self.counteval += self.lamb

        # Update ps, pc (evolution paths)
        diff = self.xmean - xold
        c = (self.cs * (2 - self.cs) * self.mueff)**0.5 / self.sigma
        self.ps = (1.0-self.cs)*self.ps + c * np.dot(self.invrtsqrtC, diff)
        c = (self.cc * (2 - self.cc) * self.mueff)**0.5 / self.sigma
        hsig = (norm(self.ps)
                / (1-(1-self.cs)**(2*self.counteval/self.lamb)) / self.dim
                < 2 + 4./(self.dim+1))
        self.pc = (1.0-self.cc)*self.pc + hsig * c * diff
#        hsig = normVec(ps)/sqrt(1.0 - (1.0 - cs)**2(
 
        siginv = 1.0 / self.sigma
        artmp = siginv * (arx[:,0:self.mu] - np.transpose(np.tile(xold,[self.mu, 1])))

        # Update covariance matrix
        pcc = matricize(self.pc)
        first = (1 - self.c1 - self.cmu) * self.C
        second = self.c1*(pcc + (1 - hsig) * self.cc*(2-self.cc) * self.C)
        conj = np.dot(np.dot(artmp, np.diag(self.weights)),np.transpose(artmp))
        fourth = self.cmu*conj
        self.C = first + second + fourth

        self.sigma = self.sigma * exp((self.cs / self.damps)*(norm(self.ps) / self.chiN - 1))   # Update sigma

        if self.counteval - self.eigeneval > self.lamb / (self.c1 + self.cmu) / self.dim / 10.0:
            self.eigeneval = self.counteval
            self.C = np.triu(self.C) + np.transpose(np.triu(self.C, 1))
            self.D, self.B = np.linalg.eig(self.C)
            self.D = np.sqrt(self.D)
            invD = np.array([self.D[i]**(-1) for i in range(len(self.D))])
            self.invrtsqrtC = np.dot(np.dot(self.B, np.diag(invD)), np.transpose(self.B))

    def updateBest(self): 
        currbest = sortStrings(self.strings)[0]
        for i in range(self.solutions):
            if currbest.fitness < self.bestsolutions[i].fitness:
                print "Better %d!" % (i+1)
                for j in range(self.solutions - 1, i, -1):
                    self.bestsolutions[j] = self.bestsolutions[j-1]
                self.bestsolutions[i] = currbest
                break

def fitness(string):
    string.fitness = sum([x**2 - 2*x + 1 + sqrt(abs(x)) for x in string.values])

def main():
    init = np.array([random() for i in range(20)])
    cma = CMAES(init, 0.3)

    try:
        cmafile = file("cma", "r")
        fileopened = True
    except:
        fileopened = False

    if fileopened:
        cma.readCMA(cmafile)
        cmafile.close()

    cmafile = file("cma", "w")

    for string in cma.strings:
        fitness(string)
        print string.fitness
    print "---"
    for times in range(50):
        cma.populate()
        for string in cma.strings:
            fitness(string)
        cma.run()

    for string in cma.strings:
        fitness(string)
        print string.fitness


    cma.writeCMA(cmafile)
    cmafile.close()

