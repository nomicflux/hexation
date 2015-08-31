#!/usr/bin/env python
import matplotlib.pyplot as plt
import sys
import getopt

start = 0
double = ""
nameadd = ""
newline = False

options = getopt.getopt(sys.argv[1:], 's:dq:n')

for opt, arg in options[0]:
        if opt == "-s":
                start = int(arg)
        elif opt == "-d":
                doouble = "double"
        elif opt == "-q":
                nameadd += arg
        elif opt == "-n":
                newline = True

fitfilename = "fitnesses" + double + nameadd

fitfile = file(fitfilename,"r")
fitnesses = fitfile.read()
fitfile.close()

if not newline:
        fitnesses = (fitnesses.split("), ("))[start:]
        if start == 0:
                fitnesses[0] = fitnesses[0][3:]
        fitnesses[-1] = (fitnesses[-1])[:len(fitnesses[-1])-1]
else:
        fitnesses = (fitnesses.split("\n"))[:-1]

size = len(fitnesses)
arr = [x.split(', ') for x in fitnesses]

fitfilew = file(fitfilename+"_transformed","w")
for x in fitnesses:
        arr = map(float, x.split(', '))
        string = "%f, %f, %f, %f, %f\n" % (arr[0], arr[1]/24, arr[2]/24, arr[3]/24, arr[4]/49/3)
        fitfilew.write(string)
fitfilew.close()
