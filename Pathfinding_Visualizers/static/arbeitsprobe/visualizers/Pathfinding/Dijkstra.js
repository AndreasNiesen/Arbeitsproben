/**
 * Finds shortest path from start to end using Dijkstras algorithm.
 * 
 * @param {Array} field - 2D Array representing the field. Additionally containing maxX and maxY.
 * @param {Object} start - Node-object of start node.
 * @param {Object} target - Node-object of target node.
 * @param {Boolean} [fullDirections = false] - True to enable diagonal map traversal.
 * @return {Array} Path from start to target. Empty Array if unreachable.
 */
export function dijkstras(field, start, target, fullDirections) {
  if (start === target || start.passable === false || target.passable === false) return [];

  const diagonals = fullDirections ?? false;
  const w = field.maxX + 1;
  const h = field.maxY + 1;
  const closed = [...Array(w)].map(_ => [...Array(h)].map(_ => false));
  const open = new LL();
  open.push(start);
  start.g = 0;

  while (open.length > 0) {
    const curNode = open.pop();
    const curX = curNode.i[0];
    const curY = curNode.i[1];
    closed[curX][curY] = true;
    if (curNode.type === 1) return getFullPath(curNode);

    const unvisitedNeighbors = [];
    if (curX > 0 && field[curX - 1][curY].passable) unvisitedNeighbors.push(field[curX - 1][curY]);
    if (curX < w - 1 && field[curX + 1][curY].passable) unvisitedNeighbors.push(field[curX + 1][curY]);
    if (curY > 0 && field[curX][curY - 1].passable) unvisitedNeighbors.push(field[curX][curY - 1]);
    if (curY < h - 1 && field[curX][curY + 1].passable) unvisitedNeighbors.push(field[curX][curY + 1]);
    if (diagonals) {
      if (curX > 0 && curY > 0 && field[curX - 1][curY - 1].passable) unvisitedNeighbors.push(field[curX - 1][curY - 1]);
      if (curX > 0 && curY < h - 1 && field[curX - 1][curY + 1].passable) unvisitedNeighbors.push(field[curX - 1][curY + 1]);
      if (curX < w - 1 && curY < h - 1 && field[curX + 1][curY + 1].passable) unvisitedNeighbors.push(field[curX + 1][curY + 1]);
      if (curX < w - 1 && curY > 0 && field[curX + 1][curY - 1].passable) unvisitedNeighbors.push(field[curX + 1][curY - 1]);
    }

    for (let i = 0; i < unvisitedNeighbors.length; i++) {
      const neighbor = unvisitedNeighbors[i];
      const gNeighbor = curNode.g + 1 + neighbor.weight;
      if (gNeighbor < neighbor.g) {
        neighbor.parent = curNode;
        neighbor.g = gNeighbor;
      }
      if (!closed[neighbor.i[0]][neighbor.i[1]]) {
        const rm = open.findFirst(node => { return node === neighbor });
        if (rm) open.pop(rm);
        const bf = open.findFirst(node => { return node.g >= neighbor.g });
        if (bf) open.insertBefore(bf, neighbor);
        else open.insertLast(neighbor);
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
  this.g = 0;
  this.parent = undefined;
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
 * Finds best path from start to end using Dijkstras algorithm.
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
export async function dijkstrasVisual(ctx, dimensions, field, start, target, pause, fullDirections, colors) {
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

  if (start === target || start.passable === false || target.passable === false) return [];

  const diagonals = fullDirections ?? false;
  const closed = [...Array(field.maxX + 1)].map(_ => [...Array(field.maxY + 1)].map(_ => false));
  const open = new LL();
  open.push(start);
  start.g = 0;

  while (open.length > 0) {
    const curNode = open.pop();
    curNode.vNode.inClosed = true;
    curNode.vNode.active = true;
    await sleep(waitTime);

    const curX = curNode.i[0];
    const curY = curNode.i[1];
    closed[curX][curY] = true;
    if (curNode.type === 1) {
      const fullPath = await getFullPathV(curNode);
      done = true;
      return fullPath;
    }

    const unvisitedNeighbors = [];
    if (curX > 0 && field[curX - 1][curY].passable) unvisitedNeighbors.push(field[curX - 1][curY]);
    if (curX < field.maxX && field[curX + 1][curY].passable) unvisitedNeighbors.push(field[curX + 1][curY]);
    if (curY > 0 && field[curX][curY - 1].passable) unvisitedNeighbors.push(field[curX][curY - 1]);
    if (curY < field.maxY && field[curX][curY + 1].passable) unvisitedNeighbors.push(field[curX][curY + 1]);
    if (diagonals) {
      if (curX > 0 && curY > 0 && field[curX - 1][curY - 1].passable) unvisitedNeighbors.push(field[curX - 1][curY - 1]);
      if (curX > 0 && curY < field.maxY && field[curX - 1][curY + 1].passable) unvisitedNeighbors.push(field[curX - 1][curY + 1]);
      if (curX < field.maxX && curY < field.maxY && field[curX + 1][curY + 1].passable) unvisitedNeighbors.push(field[curX + 1][curY + 1]);
      if (curX < field.maxX && curY > 0 && field[curX + 1][curY - 1].passable) unvisitedNeighbors.push(field[curX + 1][curY - 1]);
    }

    for (let i = 0; i < unvisitedNeighbors.length; i++) {
      const neighbor = unvisitedNeighbors[i];
      const gNeighbor = curNode.g + 1 + neighbor.weight;
      if (gNeighbor < neighbor.g) {
        neighbor.parent = curNode;
        neighbor.g = gNeighbor;
      }
      if (!closed[neighbor.i[0]][neighbor.i[1]]) {
        const rm = open.findFirst(node => { return node === neighbor });
        if (rm) open.pop(rm);
        const bf = open.findFirst(node => { return neighbor.g <= node.g });
        if (bf) open.insertBefore(bf, neighbor);
        else open.insertLast(neighbor);
      }
    }
    curNode.vNode.active = false;
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