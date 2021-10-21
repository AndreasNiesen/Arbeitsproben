import { VisualQuickSort, BlockingVisualQuickSort, QuickSort } from "./Algos/quickSort.js";
import { VisualBubbleSort } from "./Algos/bubbleSort.js"
import { range } from "./Utility.js";

const sleepDuration = 50;

const arrSize = 100;
const x = [];

if (!window.location.search) {
  for (let i of range(arrSize)) {
    x.push(Math.floor(Math.random() * arrSize));
  }
} else {
  let buffer = window.location.search;
  buffer = buffer.split("?")[1].split("=");
  if (buffer[0].toLowerCase() == "arr") {
    buffer = buffer[1];
    buffer.split(",").forEach(chars => {
      let i = parseInt(chars);
      if (isNaN(i)) {
        console.log("\"" + chars + "\" is not a number and will be ignored!");
      } else {
        x.push(i);
      }
    });

    if (x.length <= 1) {
      throw new Error("[ERROR] Array is Empty! Use the menu to use a custom array!");
    }
  } else if (buffer[0].toLowerCase() == "size") {
    let size = parseInt(buffer[1]);
    if (isNaN(size) || size < 1) {
      throw new Error("[ERROR] " + buffer[1] + " is not a valid int! Use the menu to use a custom array!");
    }

    for (let i of range(size)) {
      x.push(Math.floor(Math.random() * size));
    }
  }
}


let qs = new Array(...x);  // Array-copy for q(uick)s(ort)
let badQS = new Array(...x);  // Array-copy for badQ(uick)S(ort)
let bs = new Array(...x);  // Array-copy for b(ubble)s(ort)

QuickSort.sort(x).then(console.log(x));


// ----------------------
// QuickSort setup
// ----------------------
const qsCanvas = document.getElementById("quicksort");
const qsCtx = qsCanvas.getContext("2d");

qsCanvas.width = 500;
qsCanvas.height = 300;

let vqs = new VisualQuickSort(qs, qsCtx, qsCanvas, sleepDuration);

// ----------------------
// Blocking QuickSort setup
// ----------------------
const badQSCanvas = document.getElementById("badQuickSort");
const badQSCtx = badQSCanvas.getContext("2d");

badQSCanvas.width = 500;
badQSCanvas.height = 300;

let vbadQS = new BlockingVisualQuickSort(badQS, badQSCtx, badQSCanvas, sleepDuration);

// ----------------------
// BubbleSort setup
// ----------------------
const bsCanvas = document.getElementById("bubblesort");
const bsCtx = bsCanvas.getContext("2d");

bsCanvas.width = 500;
bsCanvas.height = 300;

let vbs = new VisualBubbleSort(bs, bsCtx, bsCanvas, sleepDuration);


// ----------------------
// Comparison start
// ----------------------
// await Promise.all([vqs.start(), vbs.start()]);
// console.log("QuickSorted:\t" + qs);
// console.log("BubbleSorted:\t" + bs);

vbs.start();
vqs.start();
vbadQS.start();


// -------------------------------------------------------------------------------------


// ----------------------
// faq-stuff
// ----------------------
const faq_bg = document.querySelector("div.faq");
const faq_toggle = document.querySelector("input#faq_toggle");

faq_bg.addEventListener("click", e => {
  if (e.target !== faq_bg) return;
  faq_toggle.checked = false;
});

window.addEventListener("keydown", e => {
  if (!faq_toggle.checked || e.key !== "Escape") return;
  faq_toggle.checked = false;
});