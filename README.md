Clock Puzzle Generator
================

In the process of playing through Final Fantasy XIII-2, players might find themselves confronted with the infamous 'clock puzzles', known on the internet for giving players trouble.
In the spirit of masochim, I wrote up a web app that generates these puzzles for users to solve, [which can be played here](http://cemulate.github.io/ff13-clock-puzzle).
It can also solve puzzles that you enter.

For those unfamiliar, the puzzles consist of a certian number of nodes arranged in a circle. There are two "clock hands" in the interior of the circle.
Any node can be clicked (eliminated) to start. After eliminating a node, the clock hands move, starting from the eliminated node, a certain number of positions in either direction given by the value of the eliminated node.
The two (possibly one) nodes that the clock hands point to after this movement are the only two choices for your next move, and so on.
The goal is to eliminate all nodes.
The game is over if there is a situation where both clock hands point to already eliminated nodes (no valid move).

If the explanation is confusing (which it is), its best to get a quick feel for it by messing around with it for a bit.

----

During the course of the game, I ended up writing a brute force solver to calculate the solutions to these puzzles for me, as many others have done.
It's an interesting and challenging little exercise, and I would recommend it to curious readers.

The brute force algorithm to solve this problem runs in exponential time, and its actually impossible to achieve a more efficient algorithm.
To see why, we can re-cast the problem into graph theory.

Construct a graph with all the puzzle's nodes as vertices. 
Then, for each node N with value V, add a directed edge to the vertices/nodes that are V spots counterclockwise and V spots clockwise from N (the two nodes possible after visiting N).

Solving the puzzle is then equivalent to finding a [Hamiltonian Path](https://en.wikipedia.org/wiki/Hamiltonian_path) for this graph -- a walk that visits each vertex exactly once.
Deciding whether or not an arbitrary graph has a Hamiltonian Path is an NP-Complete problem, meaning no polynomial-time algorithm exists to check Hamiltonicity (or find such a path, for that matter).
So in this case, we'll have to settle for the brute force method.