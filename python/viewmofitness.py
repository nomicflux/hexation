#!/usr/bin/env python

import matplotlib.pyplot as plt
import sys
import getopt

start = 0
double = ""
nameadd = ""

options = getopt.getopt(sys.argv[1:], 's:dq:')

for opt, arg in options[0]:
        if opt == "-s":
                start = int(arg)
        elif opt == "-d":
                double = "double"
        elif opt == "-q":
                nameadd += arg

fitfilename = "fitnesses" + double + nameadd

fitfile = file(fitfilename,"r")
fitnesses = fitfile.read()
fitfile.close()

fitnesses  = (fitnesses.split("\n"))[start:]
size = len(fitnesses)
fitnesses = fitnesses[:size-1]

arr = [x.split(', ') for x in fitnesses]

averageloss = [float(x[0]) for x in arr]
redloss = [float(x[1]) for x in arr]
greenloss = [float(x[2]) for x in arr]
blueloss = [float(x[3]) for x in arr]
totaldiff = [float(x[4]) for x in arr]
illfit = [float(x[5]) for x in arr]
winscore = [float(x[6]) for x in arr]

size = len(fitnesses)

fig, axes = plt.subplots(nrows = 4) 

axes[0].plot(range(size), illfit, "grey")
axes[1].plot(range(size), averageloss, "black")
axes[2].plot(range(size), redloss, "r")
axes[2].plot(range(size), greenloss, "g")
axes[2].plot(range(size), blueloss, "b")
axes[2].plot(range(size), winscore, "black")
axes[3].plot(range(size), totaldiff, "black")
plt.show()
