/**
 * Finds shortest path from start to end using the A-Star algorithm.
 * 
 * @param {Array} field - 2D Array representing the field. Additionally containing maxX and maxY.
 * @param {Object} start - Node-object of start node.
 * @param {Object} target - Node-object of target node.
 * @param {Boolean} [fullDirections = false] - True to enable diagonal map traversal.
 * @return {Array} Path from start to target. Empty Array if unreachable.
 */
export function aStar(field, start, target, fullDirections) {
  if (start === target) return [...start.i];
  if (!start.passable || !target.passable) return [];

  const diagonals = fullDirections ?? false;
  const closed = [...Array(field.maxX + 1)].map(_ => [...Array(field.maxY + 1)].map(_ => false));
  const open = new LL();
  open.push(start);

  while (open.length > 0) {
    let q = open.pop();

    const qX = q.i[0];
    const qY = q.i[1];
    closed[qX][qY] = true;
    const successors = [];

    if (qY !== 0 && field[qX][qY - 1].passable) successors.push(field[qX][qY - 1]);
    if (qY !== field.maxY && field[qX][qY + 1].passable) successors.push(field[qX][qY + 1]);
    if (qX !== field.maxX && field[qX + 1][qY].passable) successors.push(field[qX + 1][qY]);
    if (qX !== 0 && field[qX - 1][qY].passable) successors.push(field[qX - 1][qY]);
    if (diagonals) {
      if (qY !== 0 && qX !== 0 && field[qX - 1][qY - 1].passable) successors.push(field[qX - 1][qY - 1]);
      if (qY !== field.maxY && qX !== field.maxX && field[qX + 1][qY + 1].passable) successors.push(field[qX + 1][qY + 1]);
      if (qX !== field.maxX && qY !== 0 && field[qX + 1][qY - 1].passable) successors.push(field[qX + 1][qY - 1]);
      if (qX !== 0 && qY !== field.maxY && field[qX - 1][qY + 1].passable) successors.push(field[qX - 1][qY + 1]);
    }
    
    for (let i = 0; i  < successors.length; i++) {
      const successor = successors[i];
      if (successor.type === 1) {
        successor.parent = q;
        return getFullPath(successor);
      }

      if (!closed[successor.i[0]][successor.i[1]]) {
        const gSuccessor = q.g + 1 + successor.weight;
        const hSuccessor = heuristicDistance(successor, target);
        const fSuccessor = gSuccessor + hSuccessor;

        if (!successor.f || successor.f > fSuccessor) {
          const removing = open.findFirst(node => { return node === successor });
          if (removing) open.pop(removing);
          const n = open.findFirst(node => { return node.f >= fSuccessor });
          if (n) open.insertBefore(n, successor);
          else open.insertLast(successor);

          successor.parent = q;
          successor.f = fSuccessor;
          successor.g = gSuccessor;
        }
      }
    }
  }

  return [];
}

function getFullPath(node) {
  const result = [];
  while (node) {
    result.push([...node.i]);
    node = node.parent;
  }

  return result.reverse();
}

// Manhatten Distance seems to deliver the best result for a squarish field like this
function heuristicDistance(node1, node2) {
  const dx = Math.abs(node1.i[0] - node2.i[0]);
  const dy = Math.abs(node1.i[1] - node2.i[1]);
  return (dx + dy);
}

// Doubly linked list
class LL {
  constructor() {
    this.next = undefined;
    this.last = undefined;
    this.length = 0;
  }

  get head() {
    return this.next;
  }

  get foot() {
    return this.last;
  }

  pop(node) {
    node = node ?? this.next;
    
    if (node.next) node.next.prev = node.prev;
    else this.last = node.prev;
    node.prev.next = node.next;
    
    this.length--;

    return node.content;
  }

  push(content) {
    return this.insertAfter(this, content);
  }
  
  insertLast(content) {
    return this.insertAfter(this.last, content);
  }

  insertAfter(node, content) {
    const newNode = {
      next: undefined,
      content: content,
      prev: node,
    };

    if (node.next) node.next.prev = newNode;
    else this.last = newNode;
    newNode.next = node.next;
    node.next = newNode;
    
    this.length++;

    return true;
  }

  insertBefore(node, content) {
    const newNode = {
      next: node,
      content: content,
      prev: undefined,
    };

    if (node === this) return false;

    node.prev.next = newNode;
    newNode.prev = node.prev;
    node.prev = newNode;

    this.length++;

    return true;
  }

  // returns first instance cb evaluates to true, or undefined
  findFirst(cb) {
    let node = this.next;
    while (node) {
      if (cb(node.content)) break;
      node = node.next;
    }

    return node;
  }
}

/**
 * Object representing a single node of the field.
 * 
 * @param {Number} type - 0 = start node, 1 = target node, >= 2 = standart node.
 * @param {Boolean} passable - If node is accessible/passable.
 * @param {Number} weight - 0 = standard weight; the higher the weight, the harder the node is to traverse.
 * @param {Array} indices - x and y indices of this node.
 */
export function Node(type, passable, weight, indices) {
  this.type = type < 2 ? type : 2;
  this.passable = passable;
  this.weight = weight;
  this.i = indices;
  this.f = undefined;
  this.g = 0;
  this.parent = undefined;
}

/**
 * Finds best path from start to end using the A-Star algorithm.
 * 
 * @param {RenderingContext} ctx - Canvas' rendering context.
 * @param {Array} dimensions - [width, height].
 * @param {Array} field - 2D Array representing the field. Additionally containing maxX and maxY.
 * @param {Object} start - Node-object of start node.
 * @param {Object} target - Node-object of target node.
 * @param {Number} [pause = 10] - time between actions in ms.
 * @param {Boolean} [fullDirections = false] - True to enable diagonal map traversal.fullDirections
 * @param {Object} [colors] - Colors for the Nodes.
 * @return {Array} Path from start to target. Empty Array if unreachable.
 */
export async function aStarVisual(ctx, dimensions, field, start, target, pause, fullDirections, colors) {
  function sleep(ms) {  // TODO: async?
    return new Promise(resolve => {setTimeout(resolve, ms)});
  }
  async function animate() {
    ctx.clearRect(0, 0, w, h);

    for(let i = 0; i < field.length; i++) {
      for (let j = 0; j < field[i].length; j++) {
        field[i][j].vNode.draw();
      }
    }

    if (!done) requestAnimationFrame(animate);
    else console.log("done");
  }
  async function getFullPathV(node) {
    const result = [];
    while (node) {
      node.vNode.inPath = true;
      result.push([...node.i]);
      node = node.parent;
      await sleep(waitTime);
    }
  
    return result.reverse();
  }

  if (typeof(colors?.default) === "string") colors.defaultBlock = RGBHexToHSL(colors.default);
  else colors.defaultBlock = undefined;
  
  let done = false;
  const diagonals = fullDirections ?? false;
  const waitTime = pause ?? 10;
  const [w, h] = dimensions;
  let x = 0, y = 0;
  const stepX = Math.floor(w / (field.maxX + 1));
  const stepY = Math.floor(h / (field.maxY + 1));
  for(let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[i].length; j++) {
      const vNode = new VisuNode(ctx, x, y, stepX, stepY, field[i][j], colors);
      field[i][j].vNode = vNode;
      y += stepY;
    }
    x += stepX;
    y = 0;
  }
  animate();
  
  if (start === target) return [...start.i];
  if (!start.passable || !target.passable) return [];

  const closed = [...Array(field.maxX + 1)].map(_ => [...Array(field.maxY + 1)].map(_ => false));
  const open = new LL();
  open.push(start);

  while (open.length > 0) {
    let q = open.pop();
    q.vNode.inClosed = true;
    q.vNode.active = true;
    await sleep(waitTime);

    const qX = q.i[0];
    const qY = q.i[1];
    closed[qX][qY] = true;
    const successors = [];

    // Boundry-/Passability-Check
    // Northern successor
    if (qY !== 0 && field[qX][qY - 1].passable) {
      successors.push(field[qX][qY - 1]);
    }
    // Southern successor
    if (qY !== field.maxY && field[qX][qY + 1].passable) {
      successors.push(field[qX][qY + 1]);
    }
    // Eastern successor
    if (qX !== field.maxX && field[qX + 1][qY].passable) {
      successors.push(field[qX + 1][qY]);
    }
    // Western successor
    if (qX !== 0 && field[qX - 1][qY].passable) {
      successors.push(field[qX - 1][qY]);
    }
    if (diagonals) {
      // North-Western successor
      if (qY !== 0 && qX !== 0 && field[qX - 1][qY - 1].passable) {
        successors.push(field[qX - 1][qY - 1]);
      }
      // South-Eastern successor
      if (qY !== field.maxY && qX !== field.maxX && field[qX + 1][qY + 1].passable) {
        successors.push(field[qX + 1][qY + 1]);
      }
      // North-Eastern successor
      if (qX !== field.maxX && qY !== 0 && field[qX + 1][qY - 1].passable) {
        successors.push(field[qX + 1][qY - 1]);
      }
      // South-Western successor
      if (qX !== 0 && qY !== field.maxY && field[qX - 1][qY + 1].passable) {
        successors.push(field[qX - 1][qY + 1]);
      }
    }
    
    for (let i = 0; i  < successors.length; i++) {
      const successor = successors[i];
      // check if target
      if (successor.type === 1) {
        successor.parent = q;
        const fullPath = await getFullPathV(successor);
        done = true;
        return fullPath;
      }

      // check if successor is already closed
      if (!closed[successor.i[0]][successor.i[1]]) {
        const gSuccessor = q.g + 1 + successor.weight;
        const hSuccessor = heuristicDistance(successor, target);
        const fSuccessor = gSuccessor + hSuccessor;

        if (!successor.f || successor.f > fSuccessor) {
          const removing = open.findFirst(node => { return node === successor });
          if (removing) open.pop(removing);
          const n = open.findFirst(node => { return node.f >= fSuccessor });
          if (n) open.insertBefore(n, successor);
          else open.insertLast(successor);
          successor.parent = q;
          successor.f = fSuccessor;
          successor.g = gSuccessor;
        }
      }
    }
    q.vNode.active = false;
  }

  done = true;
  return [];
}

class VisuNode {
  constructor(ctx, x, y, width, height, node, color) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;
    this._inPath = false;
    this._inClosed = false;
    this._inOpen = false;
    this._active = false;
    this._isSuccessor = false;
    this.node = node;
    this.hslQueue = [];
    this.hslSpeeds = [10, 2, 2];
    this.hsl = color?.defaultBlock ?? [0, 0, 50];
    this.test = 0;
    this.clrStart = color?.start ?? "#fff";
    this.clrTarget = color?.target ?? "#fff";
    this.clrImpassable = color?.impassible ?? "#000";
    this.clrGrid = color?.grid ?? "#fff";
  }

  // bool is not a reserved word, I checked!
  set inPath(bool) {
    this._inPath = bool;
    if (bool) this.hsl = [120, 100, 50]; this.hslQueue = [];
  }

  set inClosed(bool) {
    this._inClosed = bool;
    if (bool) this.hslQueue.push([240, 100, 50]);
  }

  set active(bool) {
    this._active = bool;
    if (bool) this.hsl = [0, 100, 50];
  }

  set inOpen(bool) {
    this._inOpen = bool;
    if (bool) this.hslQueue.push([25, 100, 50]);
  }

  set isSuccessor(bool) {
    this._isSuccessor = bool;
    if (bool) this.hslQueue.push([60, 100, 50]);
  }

  update() {
    if (this.hslQueue.length === 0) return;

    const [tHue, tSaturation, tLightness] = this.hslQueue[0];
    let [curHue, curSaturation, curLightness] = this.hsl;
    
    if (Math.abs(curHue - tHue) < this.hslSpeeds[0] - 1) curHue = tHue;
    else curHue += this.hslSpeeds[0] * (curHue < tHue ? 1 : -1);
    
    if (Math.abs(curSaturation - tSaturation) < this.hslSpeeds[1] - 1) curSaturation = tSaturation;
    else curSaturation += this.hslSpeeds[1] * (curSaturation < tSaturation ? 1 : -1);
    
    if (Math.abs(curLightness - tLightness) < this.hslSpeeds[2] - 1) curLightness = tLightness;
    else curLightness += this.hslSpeeds[2] * (curLightness < tLightness ? 1 : -1);

    this.hsl = [curHue, curSaturation, curLightness];
    if (curHue === tHue && curSaturation === tSaturation && curLightness === tLightness) this.hslQueue.shift();
  }

  draw() {
    this.update();
    const ctx = this.ctx;
    ctx.save();

    ctx.lineWidth = 1 + this.node.weight;
    ctx.strokeStyle = this.clrGrid;
    ctx.fillStyle = `hsl(${this.hsl[0]}, ${this.hsl[1]}%, ${this.hsl[2]}%)`;

    if (!this.node.passable) ctx.fillStyle = this.clrImpassable;
    else if (this.node.type === 0) ctx.fillStyle = this.clrStart;
    else if (this.node.type === 1) ctx.fillStyle = this.clrTarget;

    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    ctx.restore();
  }
}

function RGBHexToHSL(RGBHex) {
  let r, g, b, h, s, l, cmin, cmax, delta;
  // #abc === #aabbcc
  if (RGBHex?.length === 4) {
    r = parseInt(RGBHex[1].repeat(2), 16);
    g = parseInt(RGBHex[2].repeat(2), 16);
    b = parseInt(RGBHex[3].repeat(2), 16);
  } else if (RGBHex?.length === 7) {
    r = parseInt(RGBHex.substr(1, 2), 16);
    g = parseInt(RGBHex.substr(3, 2), 16);
    b = parseInt(RGBHex.substr(5, 2), 16);
  }
  else return undefined;
  
  r /= 255;
  g /= 255;
  b /= 255;

  cmin = Math.min(r, g, b);
  cmax = Math.max(r, g, b);
  delta = cmax - cmin;

  // calculate hue
  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = ((b - r) / delta) + 2;
  else if (cmax === b) h = ((r - g) / delta) + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  // calculate lightness
  l = (cmax + cmin) / 2;

  // calculate saturation
  s = delta === 0 ? 0 : (delta / (1 - Math.abs(2 * l - 1)));
  
  // from 0 to 1 to 0% to 100%
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  
  return [h, s, l];
}