const express = require("express");
const socket = require("socket.io");
const app = express();

app.use(express.static("public"));

let lastName;
let screenSocket;
const usernames = [];
const users = [];
let turn;
let on = [];

let deck = [
  "HA", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "HJ", "HQ", "HK",
  "SA", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "SJ", "SQ", "SK",
  "CA", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "CJ", "CQ", "CK",
  "DA", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "DJ", "DQ", "DK"
];

app.get("/user/:name", (req, res) => {
  if (screenSocket && !usernames.includes(req.params.name)) {
    res.sendFile(__dirname + "/public/user/user.html");
    lastName = req.params.name;
    usernames.push(lastName);
    console.log(lastName + " is connected.");
  }
});

app.get("/screen", (req, res) => {
  res.sendFile(__dirname + "/public/screen/screen.html");
  console.log("Screen is connected");
});

const server = app.listen("8000", () => {
  console.log("listening");
});

const io = socket(server)

io.on("connection", (socket) => {
  socket.on("type", (data) => {
    if (data === "user") {
      HandleUser(socket);
    } else if (data === "screen") {
      HandleScreen(socket);
    }
  });
});

function HandleUser(socket) {
  socket.emit("name", lastName);
  screenSocket.emit("user", lastName);

  let user = {
    name: lastName,
    socket: socket,
    cards: {},
    ready: false
  };
  users.push(user);

  socket.on("ready", (data) => {
    user.cards.hand = data.hand;
    user.cards.tablev = data.tablev;
    user.ready = true;

    console.log(user.name + " ready");

    let all = true;
    users.forEach((user) => {
      if (!user.ready) all = false;
    });
    if (all) StartRound();
  });

  socket.on("turn", (data) => {
    user.cards = data.cards
    on = data.on
    deck = data.deck

    let valid = false;
    if (on.length >= 4) {
      let cards = on.slice(-4);
      let value = cards[0].substr(1);
      valid = true;
      cards.forEach((card) => {
        if (card.substr(1) != value) valid = false;
      });
    }
    if (on.length > 0) if (on[on.length - 1].substr(1) == "10") valid = true;
    if (valid) {
      on = [];
      NewTurn();
    }
    else {
      turn++;
      if (turn >= users.length) turn = 0;
      NewTurn()
    }
  });
}

function HandleScreen(socket) {
  screenSocket = socket;

  socket.on("start", Start);
}

function Start() {


  shuffle(deck);

  users.forEach((user) => {
    user.cards.hand = [deck.pop(), deck.pop(), deck.pop()];
    user.cards.tablev = [deck.pop(), deck.pop(), deck.pop()];
    user.cards.tableu = [deck.pop(), deck.pop(), deck.pop()];

    user.socket.emit("start", {
      hand: user.cards.hand,
      tablev: user.cards.tablev,
      tableu: user.cards.tableu
    });
  });
}

function StartRound() {
  let values = {
    3: 0,
    4: 1,
    5: 2,
    6: 3,
    7: 4,
    8: 5,
    9: 6,
    J: 7,
    Q: 8,
    K: 9,
    A: 10,
    10: 10,
    2: 10
  };
  let record = [-1, 11, 11, 11]


  users.forEach((user, i) => {
    let sw = false;
    var hand = [];
    user.cards.hand.forEach(function(c) {
      hand.push(values[c.substr(1)]);
    });
    hand = hand.sort((a, b) => {
      return a - b;
    });
    for (let i = 0; i < 3; i++) {
      if (hand[i] < record[i + 1]) sw = true;
      else if (hand[i] > record[i + 1]) break;
    }
    if (sw) record = [i, hand[0], hand[1], hand[2]];
  });

  turn = record[0];
  NewTurn();
}

function NewTurn() {
  users.forEach((user, i) => {
    if (i == turn) {
      user.socket.emit("turn", {
        on: on,
        deck: deck
      });
    } else {
      user.socket.emit("other", {
        user: users[turn].name,
        on: on,
        deck: deck,
        cards: users[turn].cards
      })
    }
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}