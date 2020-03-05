var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;
var config = require('./config.json');


function newRandom2darray(rows, cols) {
    return new Array(cols).fill(null)
    .map(() => new Array(rows).fill(null)
      .map(() => Math.floor(Math.random() * 2)));
}

function new2darray(rows, cols) {
    return new Array(cols).fill(null)
      .map(() => new Array(rows).fill(0));
}

let colors = {};
function newColor() {
    var ranColor = "#" + Math.floor(Math.random()*16777215).toString(16);
    if (colors[ranColor] === 1) {
        return newColor()
    } else {
        colors[ranColor] = 1
        return ranColor
    }
}
let players = {};
let playerCount = 0;
let grid = new2darray(config.rows, config.columns);
let usergrid = new2darray(config.rows, config.columns);
let nextgrid = new2darray(config.rows, config.columns);

function countNeighbors(grid, x, y) {
    var sum = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let col = (x + i + config.columns) % config.columns;
        let row = (y + j + config.rows) % config.rows;
        sum += grid[col][row];
      }
    }
    sum -= grid[x][y];
    return sum;
  }
  
app.use("/asset", express.static(__dirname + '/asset'));
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});
io.on('connection', function (socket) {
    playerCount ++;
    var size_data = {
        'rows': config.rows,
        'columns': config.columns
    };
    socket.emit('size', size_data)
    players[socket.id] = {
        "id": socket.id,
        "name": socket.handshake.query.name,
        "color": newColor()
    };
    for (let player_socket in players) {
        socket.emit('newplayer', players[player_socket]);
    };
    function NewGeneration() {
        for (let col = 0; col < grid.length; col++) {
            for (let row = 0; row < grid[col].length; row++) {
              let state = grid[col][row];
              // Count live neighbors!
              var neighbors = countNeighbors(grid, col, row);
              var data = {
                'x': col,
                'y': row,
              };
              if (state == 0 && neighbors == 3) {
                nextgrid[col][row] = 1;
                usergrid[col][row] = 0;
                data['value'] = 1
                socket.emit("grid", data);
              } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
                nextgrid[col][row] = 0;
                usergrid[col][row] = 0;
                data['value'] = 0;
                socket.emit("grid", data);
              } else {
                nextgrid[col][row] = state;
              }
            }
          }
        grid = nextgrid;
        nextgrid = new2darray(config.rows, config.columns);
    };
    setInterval(NewGeneration, config.generationInterval);
    socket.broadcast.emit('newplayer', players[socket.id]);
    socket.broadcast.emit('online', players[socket.id]);
    console.log(`Player id ${socket.id} connected`);
    console.log(`Current player = ${playerCount}`);
    socket.on('disconnect', function () {
        playerCount = (playerCount < 0) ? 0 : playerCount-=1;
        socket.broadcast.emit('playerDisconnected', { id: socket.id });
        console.log(`Player id ${socket.id} disconnected`);
        console.log(`Current player = ${playerCount}`);
    });
    socket.on("get_grid", function(data){
        data['value'] = grid[data.x][data.y]
        data['id'] = usergrid[data.x][data.y]
        socket.emit('grid', data);
    });
    socket.on("set_grid", function(data) {
        grid[data.x][data.y] = data.value; 
        usergrid[data.x][data.y] = data.id;
        socket.broadcast.emit('grid', data);
    });
});

server.on("error", (err) => {
    console.log(err);
});

server.listen(port, () => {
    console.log('Listening on', server.address());
});
