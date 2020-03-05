# Conway's Game of Life Multi-Player

this repo is a web-based version of conway's game of life, allow multiplayer to share the same world. 

Design:
1. the server hosts the game world
2. client only fetch the world data and push the new grid, and rendering the world base on changes
3. computation of generation is handled by server-side


Workflow:
1. client: connect to server 
   server: return the game metadata and existing player info, notify existing players
2. client: add their cell and push the change
   server: receive the cell and broadcast to other clients
3. Server compute the new generation and broadcast the generation diff to players 

Trade-off:
1. Computation of generation is managed by server
- Pros: the result is consistent for every players
- Cons: the resource is highly demanding.
2. Initialize game world when server start and save the world in memoery 
- Pros: show the history of previous players and fast computation and lower I/O bound
- Cons: the world data is gone after serve restart


Live Session : https://conwaygol-hks.herokuapp.com/

Game Rules
* [Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)


Technical Stacks
* [Node.js](https://nodejs.org/), 
* [Socket.io](https://socket.io/), to handle the traffic asynchronously
* [Bootstrap](https://getbootstrap.com/), manage the web element with modern style

Learning Materials:
* https://www.youtube.com/watch?v=i6eP1Lw4gZk&t=489s
* https://www.youtube.com/watch?v=FWSR_7kZuYg