let canvas;
let ctx;
let grid;
let usergrid;
let username;
let users = {};
let usercolors = {};
let edit;
let socket;
let resolution = 20;

function new2darray(rows, cols) {
  return new Array(cols).fill(null)
    .map(() => new Array(rows).fill(null));
}

function get_username() {
  var username_in = document.getElementById("username")
  username_in.readOnly = true;
  username = username_in.value;
}

function start() {
  get_username();
  connect();
  playerlist_div = document.querySelector('#playerlist')
  playerlist_div.style.display = "inline";
  form = document.querySelector('body > main > div > div.container')
  form.style.display = "none";
  canvas = document.getElementById('gol');
  ctx = canvas.getContext('2d');
  canvas.addEventListener('click', handleclick);
}

function init_playerlist(name, color, active=false) {
  let playerlist_ul = document.querySelector('#playerlist_ul')
  var entry = document.createElement("li");
  var entry_color = document.createElement("div");
  entry_color.className = "playercolor";
  entry_color.style.backgroundColor = color;
  entry.appendChild(entry_color);
  var entry_name = document.createElement("div")
  entry_name.append(document.createTextNode(name))
  entry_name.className = "playername"
  entry.appendChild(entry_name);
  entry.className = "list-group-item";
  if (active) {
    entry.className = "list-group-item active";
  };
  playerlist_ul.appendChild(entry);
  
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
  socket = io.connect(window.location.hostname + `?name=${username}`);
  socket.on("newplayer", function(data){
    users[data.id] = data.name;
    usercolors[data.id] = data.color;
    init_playerlist(data.name, data.color, socket.id == data.id);
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
