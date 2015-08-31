from random import randint, random

def sortByHV(lst):
    q = []
    for x in lst:
        q.append(x)
    terraced = paretoTerrace(q)
    hvs = zip(terraced[0], [0 for x in terraced[0]], contributedHV(q))
    for i in range(1,len(terraced) - 1):
        for y in terraced[i-1]:
            q.remove(y)
        hvs += zip(terraced[i], [i for x in terraced[i]], contributedHV(q))
    hvs += zip(terraced[-1], [len(terraced)-1 for x in terraced[-1]], [1 for x in terraced[-1]])
    sort = sortTriple(sortTriple(hvs,2,1),1,-1)
    ranked = map(lambda x: x[0], sort)
    return ranked

def sortTriple(lst, num, direction):
    if type(lst) == list and len(lst) <= 1:
        return lst
    if type(lst) == tuple:
        return [lst]
    head = lst[0]
    if direction == -1:
        less = [x for x in lst if x[num] < head[num]]
        equal = [x for x in lst if x[num] == head[num]]
        more = [x for x in lst if x[num] > head[num]]
    else:
        less = [x for x in lst if x[num] > head[num]]
        equal = [x for x in lst if x[num] == head[num]]
        more = [x for x in lst if x[num] < head[num]]
    if less and more:
        return sortTriple(less,num,direction) + equal + sortTriple(more,num,direction)
    elif less:
        return sortTriple(less,num,direction) + equal
    elif more:
        return equal + sortTriple(more,num,direction)
    else:
        return equal

def contributedHV(ps):
    terraced = paretoTerrace(ps)
    ndom = terraced[0]
    ref = terraced[-1][0]
    
    hv = hso(ndom, ref)
    hvs = []
    for x in ndom:
        q = [y for y in ndom if y != x]
        if len(q) >= 1:
            hvs.append(hso(q,ref))
        else:
            hvs.append(0)
    return hvs

def hso(ps, ref):
    n = len(ps[0])-1
    p1 = sortByN(ps,0)
    s = [(1,p1)]
    for k in range(n):
        sprime = []
        for y in s:
            x = y[0]
            q1 = y[1]
            for z in sli(q1,k, ref):
                xprime = z[0]
                q1prime = z[1]
                sprime.append((x*xprime, q1prime))
        s = sprime
    vol = 0
    for y in s:
        x = y[0]
        q1 = y[1]
        vol += x*abs(q1[0][n] - ref[n])
    return vol

def tail(a):
    if len(a) > 1:
        return a[1:]
    else:
        return []

def sli(p1,k, ref):
    p = p1[0]
    p1 = tail(p1)
    q1 = []
    s = []
    while p1 != []:
        q1 = insert(p, k+1, q1)
        pprime = p1[0]
        s.append((abs(p[k] - pprime[k]), q1))
        p = pprime
        p1 = tail(p1)
    q1 = insert(p, k+1, q1)
    s.append((abs(p[k] - ref[k]), q1))
    return s

def insert(p,k,p1):
    q1 = []
    while p1 != [] and p1[0][k] < p[k]:
        q1.append(p1[0])
        p1 = tail(p1)
    q1.append(p)
    while p1 != []:
        if not dominates(p, p1[0], k):
            q1.append(p1[0])
        p1 = tail(p1)
    return q1

def dominates(p,q,k):
    if all([x <= y for x, y in zip(p[k:], q[k:])]) and any([x < y for x,y in zip(p[k:], q[k:])]):
        return True
    else:
        return False

def sortByN(A,n):
    if len(A) <= 1:
        return A
    head = A[0]
    less = [x for x in A if x[n] < head[n]]
    equal = [x for x in A if x[n] == head[n]]
    more = [x for x in A if x[n] > head[n]]
    if n < len(head)-1:
        equal = sortByN(equal,n+1)
    if less and more:
        return sortByN(less,n) + equal + sortByN(more,n)
    elif less:
        return sortByN(less,n) + equal
    elif more:
        return equal + sortByN(more,n)
    else:
        return equal
    
def paretoDominate(string1, string2):
    if all([x <= y for x, y in zip(string1, string2)]) and any([x < y for x,y in zip(string1, string2)]):
        return True
    else:
        return False

def paretoFront(strings):
    front = []
    size = len(strings)
    for i in range(size):
        if not any([paretoDominate(x,strings[i]) for x in strings[:] if x != strings[i]]):
            front.append(strings[i])
    return front

def paretoTerrace(strings):
    update = strings
    terrace = []
    while update != []:
        new = paretoFront(update)
        update = [x for x in update if x not in new]
        terrace.append(new)
    return terrace

def crowdingDistance(strings):
    mini = min(strings)
    maxi = max(strings)
    crowding = []
    for i in range(len(strings)):
        if strings[i] == mini or strings[i] == maxi:
            crowding.append(99999)
        else:
            less = []
            more = []
            for j in range(len(strings)):
                if i != j:
                    if strings[j] <= strings[i]:
                        less.append(strings[j])
                    if strings[j] >= strings[i]:
                        more.append(strings[j])
            diffs = []
            for x in less:
                for y in more:
                    diffs.append(y - x)
            crowding.append(min(diffs))
    return crowding

small = [[1,2,3],[1,2,2]]

large = [[1,2,3],[1,2,2],[1,1,3],[0,2,3]]

rando = [[randint(0,10), randint(0,10), randint(0,10)] for i in range(16)]
