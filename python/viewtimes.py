#!/usr/bin/env python
from numpy import std
import sys
import getopt

double = ""
nameadd = ""
frequency = 2

options = getopt.getopt(sys.argv[1:], 'dq:f:')

for opt, arg in options[0]:
        if opt == "-d":
                double = "double"
        elif opt == "-q":
                nameadd += arg
        elif opt == "-f":
                frequency = int(arg)

filename = "times" + double + nameadd

timesfile = file(filename,"r")
times = timesfile.read()
timesfile.close()

times = (times.split("\n"))

arr = [x.split(', ') for x in times]
size = len(times) - 1

if frequency != 1:
        normal = [float(arr[x][0]) for x in range(size) if (x+1)%frequency != 0] if frequency != 0 else [float(arr[x][0]) for x in range(size)]
        print "Normal average: %.2f \tNormal StDev: %.2f" % (sum(normal) / len(normal), std(normal))

if frequency != 0:
        test =  [float(arr[x][0]) for x in range(frequency-1,size,frequency)]
        print "Test average: %.2f \tTest StDev: %.2f" % (sum(test) / len(test), std(test))
