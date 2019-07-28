let socket;
let users;
let drawer;
let state;

function setup() {
  socket = io.connect(url);
  socket.emit("type", "screen");
  state = "wait";

  users = [];

  socket.on("user", (data) => {
    users.push(data);
    drawLogin();
  });

  createCanvas(window.innerWidth, window.innerHeight);
  textAlign(LEFT, TOP);
  drawLogin();
}

function draw() {
  background(0);

  drawer.d()
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
  drawLogin();
}

function drawLogin() {
  names = []
  users.forEach((user) => {
    names.push({
      type: "text",
      t: user
    });
  });
  drawer = new AdvancedDrawer(names.concat([{
    type: "text",
    t: "Link: " + url + "/user/navn"
  }, {
    type: "button",
    t: "Start",
    fun: start
  }]));
}

start = () => {
  if (state == "wait") socket.emit("start");
  state = "switch";
}