let socket
let name;
let cards;
let deck;
let state;
let turn;
let values;
let other;
let on;

let drawer;
let switchMarked;
let handMarked;
let lastMarked;

function setup() {
  socket = io.connect(url);
  socket.emit("type", "user");


  state = "wait";
  other = {};

  turn = false;

  values = {
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
    2: 0
  };

  socket.on("name", (data) => {
    name = data;
    drawScreens();
  });

  socket.on("start", (data) => {
    console.log(data)
    cards = data;
    state = "switch";
    switchMarked = [null, null];
    drawScreens();
  });

  socket.on("turn", (data) => {
    state = "game";
    on = data.on;
    deck = data.deck;
    turn = true;
    handMarked = [];
    lastMarked = [];
    drawScreens();
  });

  socket.on("other", (data) => {
    state = "game";
    other = {
      user: data.user,
      cards: data.cards
    };
    on = data.on;
    deck = data.deck;
    drawScreens();
    console.log(data);
  });

  createCanvas(window.innerWidth, window.innerHeight);
  textAlign(LEFT, TOP);
}

function draw() {
  background(0, 0, 150);
  fill(0, 150, 0);
  noStroke();
  if (width > height) {
    arc(height / 2, height / 2, height - height / 10, height - height / 10, HALF_PI, PI + HALF_PI);
    arc(width - height / 2, height / 2, height - height / 10, height - height / 10, PI + HALF_PI, HALF_PI);
    rect(height / 2 - 1, height / 20, width - height + 2, height - height / 10);
  } else {
    arc(width / 2, width / 2, width - width / 10, width - width / 10, PI, TWO_PI);
    arc(width / 2, height - width / 2, width - width / 10, width - width / 10, TWO_PI, PI);
    rect(width / 20, width / 2 - 1, width - width / 10, height - width + 2);
  }
  if (drawer) drawer.d();
}

function drawScreens() {
  if (state == "wait") {
    drawer = new AdvancedDrawer([{
      type: "text",
      t: "Hei " + name + "!"
    },
    {
      type: "text",
      t: "Vent på de andre spillerene."
    },
    ])
  } else if (state == "switch") {
    let tablev = []
    cards.tablev.forEach((card) => {
      tablev.push(card + "R");
    });
    drawer = new AdvancedDrawer([{
      type: "text",
      t: "Nå skal du bytte kort."
    },
    /*{
      type: "text",
      t: "Kort på bordet:"
    },*/
    {
      type: "cards",
      c: tablev,
      fun: switchFunctionTablev,
      t: "space"
    },
    /*{
      type: "text",
      t: "Kort på  hånden:"
    },*/
    {
      type: "cards",
      c: cards.hand,
      fun: switchFunctionHand,
      t: "space"
    },
    {
      type: "advanced",
      e: [{
        type: "button",
        t: "Bytt",
        fun: switchFunction
        },
        {
          type: "button",
          t: "Ferdig",
          fun: ready
        }],
      d: "horizontal"
    },
    
    ]);
  } else if (state == "ready") {
    drawer = new AdvancedDrawer([{
      type: "text",
      t: "Bra Jobbet!"
    },
    {
      type: "text",
      t: "Nå må du bare vente på at de andre skal være klare."
    }
    ]);
  } else if (state == "game" && turn) {
    let tablev = []
    if (cards.tablev.length > 0) {
      for (let i = 0; i < 3; i++) {
        if (i < cards.tablev.length) tablev.push(cards.tablev[i] + "R");
        else tablev.push("RB");
      }
    } else {
      cards.tableu.forEach((card) => {
        tablev.push("RB");
      });
    }
    d_on = ["RBR"];
    if (on.length > 0) d_on.push(on[on.length - 1]);

    drawer = new AdvancedDrawer([
     {
      type: "text",
      t: "Nå er det din tur!"
    },
    {
      type: "cards",
      c: d_on,
      t: "space"
    },
    {
      type: "cards",
      c: tablev,
      fun: tableFunction,
      t: "space"
    },
    {
      type: "cards",
      c: cards.hand,
      fun: handFunction,
      t: "fit"
    },
      {
      type: "advanced",
      e: [{
        type: "button",
        t: "Trekk inn",
        fun: pullIn
      },
      {
        type: "button",
        t: "Sjanse",
        fun: chance
      },
      {
        type: "button",
        t: "Legg på",
        fun: layCardsFunction
        }],
      d: "horizontal"
    }
    ]);
  } else if (state == "game" && !turn && other != null) {
    if (other.cards == null) return;
    let tablev = []
    if (other.cards.tablev.length > 0) {
      for (let i = 0; i < 3; i++) {
        if (i < other.cards.tablev.length) tablev.push(other.cards.tablev[i] + "R");
        else tablev.push("RB");
      }
    } else {
      other.cards.tableu.forEach((card) => {
        tablev.push("BR");
      });
    }

    let hand = []
    other.cards.hand.forEach((card) => {
      hand.push("BR");
    });
    d_on = ["RBR"];
    if (on.length > 0) d_on.push(on[on.length - 1]);
    drawer = new AdvancedDrawer([{
      type: "text",
      t: "Nå er det din " + other.user + " sin tur!"
    },
    {
      type: "cards",
      c: d_on,
      t: "space"
    },
    {
      type: "cards",
      c: tablev,
      t: "space"
    },
    {
      type: "cards",
      c: hand,
      t: "fit"
    }
    ]);
  }

}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
  drawScreens();
}

switchFunctionHand = (index) => {
  if (switchMarked[0] != index) switchMarked[0] = index;
  else switchMarked[0] = null;
  newMarked = [];
  for (let i = 0; i < 3; i++) {
    if (i == switchMarked[0]) newMarked.push(true);
    else newMarked.push(false);
  }
  return newMarked;
}
switchFunctionTablev = (index) => {
  if (switchMarked[1] != index) switchMarked[1] = index;
  else switchMarked[1] = null;
  newMarked = [];
  for (let i = 0; i < 3; i++) {
    if (i == switchMarked[1]) newMarked.push(true);
    else newMarked.push(false);
  }
  return newMarked;
}

switchFunction = () => {
  if (!switchMarked.includes(null)) {
    switchCards(switchMarked[0], switchMarked[1]);
    switchMarked = [null, null];
    drawScreens();
  }
}

tableFunction = (index) => {
  if (lastMarked.length == 0) {
    lastMarked.push(index);
    return true;
  } else if (cards.tablev.length > index) {
    if (cards.tablev[handMarked[0]].substr(-1) == cards.tablev[index].substr(-1)) {
      if (handMarked.includes(index)) handMarked.splice(handMarked.indexOf(index), 1)
      else handMarked.push(index);
      return true;
    }
  } else if (cards.tablev.length < index) {
    if (cards.tablev.length > 0) return null;
  } else {
    handMarked = [];
    handMarked.push(index);
    newMarked = []
    cards.hand.forEach((card, i) => {
      if (i == index) newMarked.push(true);
      else newMarked.push(false);
    });
    return newMarked;
  }
}

handFunction = (index) => {
  if (handMarked.length == 0) {
    handMarked.push(index);
    return true;
  } else if (cards.hand[handMarked[0]].substr(-1) == cards.hand[index].substr(-1)) {
    if (handMarked.includes(index)) handMarked.splice(handMarked.indexOf(index), 1)
    else handMarked.push(index);
    return true;
  } else {
    handMarked = [];
    handMarked.push(index);
    newMarked = []
    cards.hand.forEach((card, i) => {
      if (i == index) newMarked.push(true);
      else newMarked.push(false);
    });
    return newMarked;
  }
}

layCardsFunction = () => {
  if (cards.hand.length > 0) {
    if (handMarked.length == 0) return;
    let markCards = [];
    handMarked.forEach((card) => {
      markCards.push(cards.hand[card]);
    });
    layCards(markCards);
    handMarked = [];
    drawScreens();
  } else {
    if (lastMarked == null) return;

  }
}

function switchCards(hand, tablev) {
  if (state === "switch") {
    var temp = cards.hand[hand];
    cards.hand[hand] = cards.tablev[tablev];
    cards.tablev[tablev] = temp;
  }
}

ready = () => {
  if (state == "switch") socket.emit("ready", cards);
  state = "ready";
  drawScreens();
}

function layCards(cs) {
  if (!turn) return;
  let card = cs[0].substr(1);
  cs.forEach((c) => {
    if (c.substr(1) != card) return;
  });
  if (on.length != 0) {

    if (values[card] < values[on[on.length - 1].substr(1)] && card != "2") return;
  }

  let place;
  if (cards.hand.length === 0) place = cards.tablev;
  else place = cards.hand;

  let valid = true;
  cs.forEach(function(card) {
    if (!place.includes(card)) valid = false;
  });
  if (valid) {
    cs.forEach(function(card) {
      place.splice(place.indexOf(card), 1);
    });
  } else return;

  on = on.concat(cs);

  let l = cards.hand.length;
  if (l < 3) {
    for (let i = 0; i < 3 - l; i++) {
      if (deck.length != 0) cards.hand.push(deck.pop());
    }
  }

  socket.emit("turn", {
    cards: cards,
    deck: deck,
    on: on
  });

  turn = false;
}

chance = () => {
  if (turn && deck.length > 0) {
    card = deck.pop()
    if (on.length > 0) {
      if (values[card.substr(1)] < values[on[on.length - 1].substr(1)] && card.substr(1) != "2") {
        cards.hand = cards.hand.concat(on).concat(card);
        on = [];
      } else on.push(card);
    } else on.push(card);
    socket.emit("turn", {
      cards: cards,
      deck: deck,
      on: on
    });
    turn = false;
  }
}

pullIn = () => {
  if (on.length == 0) return;
  cards.hand = cards.hand.concat(on);
  on = [];
  socket.emit("turn", {
    cards: cards,
    deck: deck,
    on: on
  });
  turn = false;
}

function last(num) {
  if (turn && cards.hand.length == 0 &&
    cards.tablev.length == 0 && num < cards.tableu.length) {
    card = cards.tableu.splice(num, 1);
    if (values[card.substr(1)] < values[on[on.length - 1].substr(1)] && card.substr(1) != "2") {
      cards.hand = cards.hand.cancat(on).coancat(card);
      on = [];
    } else on = on.concat(card);
    socket.emit("turn", {
      cards: cards,
      deck: deck,
      on: on
    });
    turn = false;
  }
}