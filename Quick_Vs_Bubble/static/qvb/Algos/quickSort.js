import { sleep } from "../Utility.js";
import { Bar, VisualSort } from "../base/baseClass.js";

export class QuickSort {
  constructor(ul) {
    this.target = ul;
  }

  async start(start, end) {
    start = start ?? 0;
    end = end ?? this.target.length - 1;

    if(end - start < 1) return;

    let pivot = this.target[end];
    let pivotIndex = start - 1;
    
    for (let i = start; i <= end; i++) {
      if (this.target[i] <= pivot) {
        this.swap(++pivotIndex, i);
      }
    }

    await Promise.all([this.start(start, pivotIndex - 1), this.start(pivotIndex + 1, end)]);
  }
  
  swap(i1, i2) {
    [this.target[i1], this.target[i2]] = [this.target[i2], this.target[i1]];
  }

  static async sort(ul, start, end) {
    start = start ?? 0;
    end = end ?? ul.length - 1;

    if(end - start < 1) return;

    let pivot = ul[end];
    let pivotIndex = start - 1;
    
    for (let i = start; i <= end; i++) {
      if (ul[i] <= pivot) {
        pivotIndex++;
        [ul[pivotIndex], ul[i]] = [ul[i], ul[pivotIndex]];
      }
    }

    await Promise.all([QuickSort.sort(ul, start, pivotIndex - 1), QuickSort.sort(ul, pivotIndex + 1, end)]);
  }
}

export class VisualQuickSort extends VisualSort {
  async start(start, end) {
    start = start ?? 0;
    end = end ?? this.target.length - 1;

    this.bars[(end > start || start >= this.target.length) ? end : start].color = "greenyellow";

    if(end - start < 1) return;

    let pivot = this.target[end];
    this.bars[end].color = "blue";
    let pivotIndex = start - 1;
    
    for (let i = start; i <= end; i++) {
      if (this.target[i] <= pivot) {
        this.swap(++pivotIndex, i);
      }
      this.bars[i].color = "black";
      await sleep(this.sd);
      this.bars[i].color = "red";
    }

    this.bars[pivotIndex].color = "greenyellow";
    await Promise.all([this.start(start, pivotIndex - 1), this.start(pivotIndex + 1, end)]);
  }
}

// ------------------------------------------------------------------------------------------
// Worse/Blocking QuickSort - For demonstration only
// ------------------------------------------------------------------------------------------
export class BlockingVisualQuickSort extends VisualSort {
  async start(start, end) {
    start = start ?? 0;
    end = end ?? this.target.length - 1;

    this.bars[(end > start || start >= this.target.length) ? end : start].color = "greenyellow";

    if(end - start < 1) return;

    let pivot = this.target[end];
    this.bars[end].color = "blue";
    let pivotIndex = start - 1;
    
    for (let i = start; i <= end; i++) {
      if (this.target[i] <= pivot) {
        this.swap(++pivotIndex, i);
      }
      this.bars[i].color = "black";
      await sleep(this.sd);
      this.bars[i].color = "red";
    }

    this.bars[pivotIndex].color = "greenyellow";
    await this.start(start, pivotIndex - 1);
    await this.start(pivotIndex + 1, end);
  }
}