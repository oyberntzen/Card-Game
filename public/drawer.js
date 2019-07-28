let img;

function preload() {
  img = loadImage("../cards.png");
  clicks = [];
}

function TextField(t, x, y, boxWidth, boxHeight, margin, c, centred = true) {
  this.t = t
  this.w = boxWidth - (margin * 2);
  this.h = boxHeight - (margin * 2);
  this.x = x + margin
  this.y = y + margin
  this.c = c
  this.centred = centred

  this.bef = 20;

  this.d = function() {
    textSize(this.bef + 1);
    while (textWidth(this.t) < this.w && this.bef + 1 < this.h) {
      this.bef++;
      textSize(this.bef + 1);
    }
    textSize(this.bef);
    while (textWidth(this.t) > this.w || this.bef > this.h && this.bef > 1) {
      this.bef--;
      textSize(this.bef);
    }
    textSize(this.bef);
    fill(this.c);
    if (this.centred)
      text(this.t, this.x + ((this.w - textWidth(this.t)) / 2), this.y);
    else
      text(this.t, this.x, this.y);
    //noFill();
    //rect(this.x, this.y, this.w, this.h);
    //fill(this.c);
  }
}

function AdvancedDrawer(elements, x = 0, y = 0, boxWidth = width, boxHeight = height, direction = "vertical") {
  if (direction == "vertical") {
    h = boxHeight / elements.length;
    m = min([boxWidth / 50, h / 20]);

    this.elements = []
    elements.forEach((e, index) => {
      if (e.type == "text")
        this.elements.push(new TextField(e.t, x, index * h + y, boxWidth, h, m, 255));
      else if (e.type == "button")
        this.elements.push(new Button(e.t, x, index * h + y, boxWidth, h, m, 255, [0, 150, 150], [0, 255, 255], e.fun));
      else if (e.type == "cards")
        this.elements.push(new CardField(e.c, x, index * h + y, boxWidth, h, m, e.fun, e.t));
      else if (e.type == "advanced")
        this.elements.push(new AdvancedDrawer(e.e, x, index * h + y, boxWidth, h, e.d));
    });
  } else if (direction == "horizontal") {
    w = boxWidth / elements.length;
    m = min([w / 50, boxHeight / 20]);
    this.elements = [];
    elements.forEach((e, index) => {
      w = boxWidth / elements.length;
      if (e.type == "text")
        this.elements.push(new TextField(e.t, index * w + x, y, w, boxHeight, m, 255));
      else if (e.type == "button")
        this.elements.push(new Button(e.t, index * w + x, y, w, boxHeight, m, 255, [0, 150, 150], [0, 255, 255], e.fun));
      else if (e.type == "cards")
        this.elements.push(new CardField(e.c, index * w + x, y, w, boxHeight, m, e.fun, e.t));
      else if (e.type == "advanced")
        this.elements.push(new AdvancedDrawer(e.e, index * w + x, y, w, boxHeight, e.d));
    });
  }
  this.d = () => {
    this.elements.forEach((element) => {
      element.d();
    });
  }
}

function Button(t, x, y, boxWidth, boxHeight, margin, tc, bc1, bc2, fun) {
  this.bc1 = bc1;
  this.bc2 = bc2;
  this.t = new TextField(t, 0, y, boxWidth, boxHeight, margin, tc, false);
  this.t.d();
  background(0);
  w = textWidth(t);
  this.w = w;
  this.t.x = x + ((boxWidth - w) / 2);
  this.fun = fun

  this.d = () => {

    if (mouseX > this.t.x && mouseX < this.t.x + this.w &&
      mouseY > this.t.y && mouseY < this.t.y + this.t.h) {
      fill(this.bc2);
      if (mouseIsPressed) this.fun();
    } else
      fill(this.bc1);
    rect(this.t.x, this.t.y, this.w, this.t.h);
    this.t.d();
  }
}

function getSprite(card) {
  let w = img.width / 14;
  let h = img.height / 4;

  let values = {
    A: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
    8: 7,
    9: 8,
    10: 9,
    J: 10,
    Q: 11,
    K: 12,
    B: 13
  };
  let x = values[card.substr(1)] * w;

  let sorts = {
    C: 0,
    S: 1,
    H: 2,
    D: 3,
    R: 0,
    B: 1
  };

  let y = sorts[card[0]] * h;

  let result = img.get(x, y, w, h);
  return result;
}

function CardField(cards, x, y, boxWidth, boxHeight, margin, fun, type = "fit") {
  this.cards = cards;
  this.marked = [];
  this.fun = fun;
  this.margin = margin;
  for (let i = 0; i < cards.length; i++) this.marked.push([false, false]);

  let relative = (img.width / 14) / (img.height / 4);
  let max_w = (boxWidth - (margin * (cards.length + 1))) / cards.length;
  let max_h = boxHeight - margin * 2;

  

  let w;
  let h;
  let extra_margin;

  if (type == "space") {
    if (max_w / relative < max_h) {
      w = int(max_w);
      h = int(max_w / relative);
    } else {
      w = int(max_h * relative);
      h = int(max_h);
    }
  } else if (type == "fit") {
    w = int(max_h * relative);
    h = int(max_h);
    let min_m = int(w / 3.5);
    let new_m = margin + w;
    while (margin * 2 + (cards.length - 1) * new_m + w > boxWidth) {
      if (new_m > min_m + w) {
        new_m--;
      } else {
        h--;
        w = int(h * relative);
        min_m = int(w / 3.5) - w;
      }
    }
    extra_margin = new_m - w;
  }

  let total_w;
  if (type === "space")
    total_w = (cards.length * (w + margin)) + margin;
  else if (type === "fit")
    total_w = margin * 2 + (cards.length - 1) * (extra_margin + w) + w;

  this.coords = [];
  for (let i = 0; i < cards.length; i++) {
    if (type == "space")
      this.coords.push({
        x: (i * (margin + w) + margin + x) + (boxWidth - total_w) / 2,
        y: margin + y,
        w: w,
        h: h,
        box_x: (i * (margin + w) + margin + x) + (boxWidth - total_w) / 2,
        box_y: margin + y,
        box_w: w,
        box_h: h
      });
    else if (type == "fit") {
      if (i == 0)
        this.coords.push({
          x: (i * (margin + w) + margin + x) + (boxWidth - total_w) / 2,
          y: margin + y,
          w: w,
          h: h,
          box_x: (i * (margin + w) + margin + x) + (boxWidth - total_w) / 2,
          box_y: margin + y,
          box_w: w + min(extra_margin, 0),
          box_h: h
        });
      else if (i == cards.length - 1)
        this.coords.push({
          x: (margin + i * (w + extra_margin) + x) + (boxWidth - total_w) / 2,
          y: margin + y,
          w: w,
          h: h,
          box_x: (margin + i * (w + extra_margin) + x) + (boxWidth - total_w) / 2,
          box_y: margin + y,
          box_w: w,
          box_h: h
        });
      else
        this.coords.push({
          x: (margin + i * (w + extra_margin) + x) + (boxWidth - total_w) / 2,
          y: margin + y,
          w: w,
          h: h,
          box_x: (margin + i * (w + extra_margin) + x) + (boxWidth - total_w) / 2,
          box_y: margin + y,
          box_w: w + min(extra_margin, 0),
          box_h: h
        });
    }
  }

  this.d = () => {
    this.coords.forEach((pos, i) => {
      if (this.cards[i].substr(-1) == "R" || this.cards[i].substr(-1) == "B") {
        image(getSprite(this.cards[i].substr(-1) + "B"), pos.x - this.margin, pos.y - this.margin, pos.w, pos.h);
        image(getSprite(this.cards[i].substr(0, this.cards[i].length - 1)), pos.x, pos.y, pos.w, pos.h);
      } else image(getSprite(this.cards[i]), pos.x, pos.y, pos.w, pos.h);
      if (this.marked[i][1]) {
        noFill();
        stroke(0, 0, 255);
        strokeWeight(7);
        rect(pos.x - margin / 2, pos.y, pos.w, pos.h);
        noStroke();
      }
      if (mouseIsPressed && !this.marked[i][0] &&
        mouseX > pos.box_x && mouseX < pos.box_x + pos.box_w &&
        mouseY > pos.box_y && mouseY < pos.box_y + pos.box_h && this.fun != null) {
        result = this.fun(i)
        if (result == true) this.marked[i][1] = !this.marked[i][1];
        else if (result != null)
          result.forEach((mark, j) => {
            this.marked[j][1] = mark;
          });
        this.marked[i][0] = true;
      } else if (!mouseIsPressed) this.marked[i][0] = false;
    });
  }
}