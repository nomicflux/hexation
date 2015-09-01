# hexation
## Hexation Board Game and Neural Networks
This game can be played at: [https://hexation.herokuapp.com/](https://hexation.herokuapp.com/)

The python scripts for the neural networks are located in the Python directory.  The rest is for the web page.

### To-do:
* This started as a project to provide a quick-and-dirty view of what my neural networks were doing, and the code still needs to be extensively refactored.  I want to keep the board logic, gameplay logic, and neural network logic in completely distinct modules, and use dependency injections to simulate namespaces.
* The neural networks run decently, but ultimately are slowed down by the python code.  I'd like to rewrite them in a quicker language - currently considering Julia.
* The neural networks have trouble learning how to play as the blue player.  Currently, I'm rotating the board for them, so that all three players can see the board from the same angle, as it were, and only have to learn different strategies for the different players (if the strategies are in fact different).  I'm also analyzing them using multiple objectives (overall wins, equality of wins across players, amount that they win by, number of illegal moves, and a couple other metrics which I occasionally play around with), though I'm still trying to figure out whether they do better with more dimensions of information, or a simple overall win metric.
