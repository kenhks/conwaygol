let canvas;
let ctx;
let grid;
let usergrid;
let username;
let usercolors = {};
let edit;
let socket;
let resolution = 20;

function new2darray(rows, cols) {
  return new Array(cols).fill(null)
    .map(() => new Array(rows).fill(null));
}

function get_username() {
  document.getElementById("username").readOnly = true;
  username = document.getElementById("username").value
}

function start() {
  get_username();
  connect();
  document.querySelector('body > main > div > div.container').style.display = "none";
  canvas = document.getElementById('gol');
  ctx = canvas.getContext('2d');
  canvas.addEventListener('click', handleclick);
}

function handleclick(e) {
  let rect = canvas.getBoundingClientRect(); 
  let x = Math.floor((event.clientX - rect.left) / resolution); 
  let y = Math.floor((event.clientY - rect.top) / resolution);
  
  ctx.beginPath();
  ctx.rect(x * resolution, y * resolution, resolution - 1, resolution - 1);
  ctx.fillStyle = usercolors[socket.id];
  ctx.fill();
  grid[x][y] = 1;
  var data = {
    "x": x,
    "y": y,
    "value": grid[x][y],
    "id": socket.id
  }
  socket.emit("set_grid", data);
}

function connect() {
  socket = io.connect('http://localhost:3000' + `?name=${username}`);
  socket.on("newplayer", function(data){
    console.log("newplayer", data);
    usercolors[data.id] = data.color;
  });
  socket.on("edit", function(data){
      edit = data.edit;
  });
  socket.on("size", function(data) {
    grid = new2darray(data.rows, data.columns);
    usergrid = new2darray(data.rows, data.columns);
    canvas.width = resolution * data.columns;
    canvas.height = resolution * data.rows;
    for (let col = 0; col < grid.length; col++) {
      for (let row = 0; row < grid[col].length; row++) {
        var grid_data = {
          "x": col,
          "y": row
        };
        socket.emit("get_grid", grid_data);
      }
    }
  });
  socket.on("grid", function(data) {
    grid[data.x][data.y] = data.value;
    usergrid[data.x][data.y] = data.id;
    let x = data.x * resolution;
    let y = data.y * resolution;
    if (grid[data.x][data.y] == 1) {
      ctx.beginPath();
      ctx.rect(x, y, resolution - 1, resolution - 1);
      ctx.fillStyle = usercolors[data.id] || "#000000";
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.rect(x, y, resolution - 1, resolution - 1);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }
  });
  
}
