export class Bar {
  constructor(height, width, x, y, ctx) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.color = "red";
    this.border = false;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = "black";
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.border) this.ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

export class VisualSort {
  constructor(ul, ctx, canvas, sleepDuration) {
    this.target = ul;
    this.ctx = ctx;
    this.canvas = canvas;
    this.bars = [];
    this.initialize();
    this.drawLoop();
    this.sd = sleepDuration ?? 50;
  }

  async start() {
    throw new Error("This function has to be replaced!");
  }

  drawLoop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.bars.forEach(bar => {
      bar.draw();
    });
    requestAnimationFrame(this.drawLoop.bind(this));
  }

  initialize() {
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // leaving a 10px empty on the right and left side for a slightly better look.
    const w = (cw - 20) / this.target.length;
    // height modifier to keep it flexible (arrays containing only values from 0 to 1 just as visible as ones containing values from 0 to 1000)
    // keeping a 10px margin top
    const hm = (ch - 10) / Math.max(...this.target);

    for(let i = 0; i < this.target.length; i++) {
      this.bars.push(new Bar(this.target[i] * -hm, w, (i * w) + 10, ch, this.ctx));
    }
  }
  
  swap(i1, i2) {
    [this.bars[i1].x, this.bars[i2].x] = [this.bars[i2].x, this.bars[i1].x];
    [this.bars[i1], this.bars[i2]] = [this.bars[i2], this.bars[i1]];
    [this.target[i1], this.target[i2]] = [this.target[i2], this.target[i1]];
  }
}