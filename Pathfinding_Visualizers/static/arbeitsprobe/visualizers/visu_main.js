import * as pathing from "./Pathfinding/pathing.js";

// Canvas Setup
const canvas = document.querySelector("canvas#mainCanvas");
const ctx = canvas.getContext("2d");
let WIDTH = canvas.width = window.innerWidth;
let HEIGHT = canvas.height = window.innerHeight - 50;
window.addEventListener("resize", onResize, false);

function onResize(e) {
  const canvasComputedStyles = window.getComputedStyle(canvas);
  canvas.width = WIDTH = Number(canvasComputedStyles.width.slice(0, -2));
  canvas.height = HEIGHT = Number(canvasComputedStyles.height.slice(0, -2));
}
onResize();

// Controls Setup
const controlPanel = document.querySelector("div.controls");
const startBtn = controlPanel.querySelector("#startBtn");
const resetBtn = controlPanel.querySelector("#resetBtn");
const algoSelect = controlPanel.querySelector("select#algoSelect");
const nodeSelect = controlPanel.querySelector("select#nodeSelect");
const choices = {
  /**
   * Possible choices:
   *    "aStar"
   *    "dijkstras"
   */
  algo: algoSelect[algoSelect.selectedIndex].value,

  /** Possible choices:
   *    "start"
   *    "target"
   *    "weight"
   *    "wall"
   */
  node: nodeSelect[nodeSelect.selectedIndex].value,
}

algoSelect.addEventListener("input", e => {
  choices.algo = algoSelect[algoSelect.selectedIndex].value;
  if (!preparing) return;
  [field, nodeField] = createField();
});
nodeSelect.addEventListener("input", e => {
  choices.node = nodeSelect[nodeSelect.selectedIndex].value;
});
startBtn.addEventListener("click", e => {
  if (start.x === undefined || start.y === undefined || start.node === undefined) {
    console.error("start undefined");
    return;
  }
  if (target.x === undefined || target.y === undefined || target.node === undefined) {
    console.error("target undefined");
    return;
  }
  preparing = false;
});
resetBtn.addEventListener("click", e => {
  [field, nodeField] = createField();
  if ( !preparing ) {
    preparing = true;
    animate();
  }
});
window.addEventListener("resize", e => {
  if ( !preparing ) return;
  [field, nodeField] = createField();
}, false);

// Remaining Setups
let mouseDown = false;
let preparing = true;
const nodeSize = {
  w: 20,
  h: 20,
};
const start = {
  x: undefined,
  y: undefined,
  node: undefined,
};
const target = {
  x: undefined,
  y: undefined,
  node: undefined,
};
const colors = {
  start: "#32cd32",
  target: "#b30000",
  default: "#fff",
  impassible: "#000",
  grid: "#000",
};

function createField() {
  const w = Math.floor(WIDTH / nodeSize.w);  // amount of nodes per row
  const h = Math.floor(HEIGHT / nodeSize.h);  // amount of nodes per col
  start.x = start.y = start.node = undefined;
  target.x = target.y = target.node = undefined;
  const field = [...Array(w)].map(_ => [...Array(h)].map(_ => undefined));
  const nodeField = [...Array(w)].map(_ => [...Array(h)].map(_ => undefined));
  
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const node = new pathing[choices.algo + "Node"](2, true, 0, [x, y]);
      if (choices.algo === "dijkstras") node.g = Infinity;
      nodeField[x][y] = node;
      field[x][y] = {
        node: node,
        draw: function() {
          ctx.save();
          ctx.lineWidth = 1 + this.node.weight;
          ctx.fillStyle = colors.default;
          if ( this.node.type === 0 ) ctx.fillStyle = colors.start;
          else if ( this.node.type ===1 ) ctx.fillStyle = colors.target;
          if (!this.node.passable) ctx.fillStyle = colors.impassible;
          ctx.strokeStyle = colors.grid;
          ctx.fillRect(this.node.i[0] * nodeSize.w, this.node.i[1] * nodeSize.h, nodeSize.w, nodeSize.h);
          ctx.strokeRect(this.node.i[0] * nodeSize.w, this.node.i[1] * nodeSize.h, nodeSize.w, nodeSize.h);
          ctx.restore();
        },
      };
    }
  }
  nodeField.maxX = w - 1;
  nodeField.maxY = h - 1;

  return [field, nodeField];
}
let [field, nodeField] = createField();

async function animate() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for (let x = 0; x < field.length; x++) {
    for (let y = 0; y < field[x].length; y++) {
      field[x][y].draw();
    }
  }
  if ( preparing ) requestAnimationFrame(animate);
  else console.log(await pathing[choices.algo + "Visual"](ctx, [WIDTH, HEIGHT], nodeField, start.node, target.node, 10, false, colors));
}
animate();

// Canvas clicks
canvas.addEventListener("click", e => {
  if (!preparing) return;
  const x = (e.offsetX - (e.offsetX % nodeSize.w)) / nodeSize.w;
  const y = (e.offsetY - (e.offsetY % nodeSize.h)) / nodeSize.h;
  const node = field[x][y].node;

  if (choices.node === "start") {
    if (start.node) start.node.type = 2;
    start.node = node;
    start.node.type = 0;
    start.x = x;
    start.y = y;
    return;
  }
  if (choices.node === "target") {
    if (target.node) target.node.type = 2;
    target.node = node;
    target.node.type = 1;
    target.x = x;
    target.y = y;
    return;
  }
  if (choices.node === "wall") {
    if (!node.passable && !mouseDown) node.passable = true;
  }
});
window.addEventListener("mousedown", e => {
  mouseDown = true;
});
window.addEventListener("mouseup", e => {
  setTimeout(_ => {mouseDown = false}, 1);  // prevent stupid click-event interaction
});
canvas.addEventListener("mousemove", e => {
  if (!preparing) return;
  if (choices.node !== "wall" || !mouseDown) return;

  const x = (e.offsetX - (e.offsetX % nodeSize.w)) / nodeSize.w;
  const y = (e.offsetY - (e.offsetY % nodeSize.h)) / nodeSize.h;
  const node = field[x][y].node;

  node.passable = false;
})