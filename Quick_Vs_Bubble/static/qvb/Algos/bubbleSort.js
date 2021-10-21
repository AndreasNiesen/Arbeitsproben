import { sleep } from "../Utility.js";
import { Bar, VisualSort } from "../base/baseClass.js";

export class BubbleSort {
  constructor(ul) {
    this.target = ul;
  }

  async start() {
    for (let i = this.target.length - 1; i > 0; i--) {
      for (let j = 1; j <= i; j++) {
        if (this.target[j] < this.target[j - 1]) this.swap(j, j-1);
      }
    }
  }

  swap(i1, i2) {
    [this.target[i1], this.target[i2]] = [this.target[i2], this.target[i1]];
  }
}

export class VisualBubbleSort extends VisualSort {
  async start() {
    for (let i = this.target.length - 1; i > 0; i--) {
      for (let j = 1; j <= i; j++) {
        this.bars[j].color = "blue";
        this.bars[j-1].color = "blue";
        await sleep(this.sd);
        if (this.target[j] < this.target[j - 1]) this.swap(j, j-1);
        this.bars[j].color = "red";
        this.bars[j-1].color = "red";
      }
      this.bars[i].color = "greenyellow";
    }
    this.bars[0].color = "greenyellow";
  }
}