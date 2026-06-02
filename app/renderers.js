// https://github.com/processing/p5.js/tree/main/src/core

class Renderer {
  constructor(w, h, opts = {}) {
    this.width = w;
    this.height = h;
  }

  begin(id, opts = {}) {
  }

  reset() {
  }

  fill(color) {
  }

  stroke(color) {
  }

  push() {
    push();
  }

  pop() {
    pop();
  }

  noFill() {
  }

  noStroke() {
  }

  strokeWeight(w) {
  }

  strokeCap(which) {
  }

  background(color) {
  }

  line(x1, y1, x2, y2) {
  }

  lineV(A, B) {
  }

  rect(x, y, w, h) {
  }

  ellipse(x, y, w, h) {
  }

  circle(x, y, d) {
  }

  circleV(pos, d) {
  }

  arc(x, y, w, h, start, stop) {
  }

  bezier(x1, y1, x2, y2, x3, y3, x4, y4) {
  }

  translate(x, y) {
  }

  rotate(angle) {
  };

  scale(s) {
  }

  save(filename) {
  }

  beginShape(opts = {}) {
  }

  endShape(mode) {
  }

  vertex(x, y) {
  }

  vertexV(v) {
  }

  beginGroup(id) {
  }

  endGroup() {
  }

  textSize(size) {
  }

  text(s, x, y) {
  }

  windowResized(w, h) {
  }


  getFilenameSave() {
    return `${Date.now()}_export.${this.ext}`;
  }

  show() {
  }

  hide() {
  }

  removeFromDocument() {
  }

  getParent(id) {
    let parent;
    if (id)
      parent = document.getElementById(id);
    if (!parent)
      parent = document;
    return parent;
  }

  addToDocument(id) {
    this.getParent(id).append(this.canvas.canvas);
  }

}


class RendererP5 extends Renderer {
  constructor(w, h, opts = {}) {
    super(w, h, opts);
    this.name = "rendererP5";
    this.context = window;
    if (opts.canvas) {
      this.canvas = opts.canvas;
      if (opts.id) this.canvas.id(opts.id);
    }
    this.ext = "png";
  }

  noFill() {
    this.context.noFill();
  }

  noStroke() {
    this.context.noStroke();
  }

  stroke(color) {
    this.context.stroke(color);
  }

  strokeWeight(w) {
    this.context.strokeWeight(w);
  }

  strokeCap(which) {
    this.context.strokeCap(which);
  }

  fill(color) {
    this.context.fill(color);
  }

  push() {
    this.context.push();
  }

  pop() {
    this.context.pop();
  }

  background(color) {
    this.context.background(color);
  }

  line(x1, y1, x2, y2) {
    this.context.line(x1, y1, x2, y2);
  }

  lineV(A, B) {
    this.context.line(A.x, A.y, B.x, B.y);
  }

  rect(x, y, w, h) {
    this.context.rect(x, y, w, h);
  }

  ellipse(x, y, w, h) {
    this.context.ellipse(x, y, w, h);
  }

  circle(x, y, d) {
    this.context.circle(x, y, d);
  }

  circleV(pos, d) {
    this.circle(pos.x, pos.y, d);
  }

  arc(x, y, w, h, start, stop) {
    this.context.arc(x, y, w, h, start, stop);
  }

  translate(x, y) {
    this.context.translate(x, y);
  }

  rotate(angle) {
    this.context.rotate(angle);
  };

  scale(s) {
    this.context.scale(s);
  }


  beginShape(opts) {
    this.context.beginShape();
  }

  endShape(mode) {
    this.context.endShape(mode);
  }

  vertex(x, y) {
    this.context.vertex(x, y);
  }

  curveVertex(x, y) {
    this.context.curveVertex(x, y);
  }

  vertexV(v) {
    this.vertex(v.x, v.y);
  }

  textSize(size) {
    this.context.textSize(size);
  }

  text(s, x, y) {
    this.context.text(s, x, y);
  }

  bezier(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.context.bezier(x1, y1, x2, y2, x3, y3, x4, y4);
  }

  save(filename) {
    this.context.save(filename ? filename : this.getFilenameSave());
  }

  show() {
    this.canvas.show();
  }

  hide() {
    this.canvas.hide();
  }


  removeFromDocument() {
    this.canvas.canvas.remove(); // weird :-)
  }

}


class RendererP5Offscreen extends RendererP5 {
  static() {
  }

  constructor(w, h, opts = {}) {
    super(w, h, opts);
    this.name = "rendererP5Off";
    this.context = createGraphics(w, h);
    this.context.pixelDensity(opts.pixelDensity ?? 1);
    this.canvas = this.context;
    if (opts.id) this.canvas.id(opts.id);
    this.removeFromDocument();
  }

  static drawSVGToCanvas(ctx, svg, cbDone) {
    let img = new Image();
    img.onload = e => {
      ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
      // console.log(canvas.width)
      if (cbDone)
        cbDone(img);
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<?xml version="1.0" standalone="no"?>\r\n${svg.outerHTML}`);

  }

  // https://ourcodeworld.com/articles/read/1548/how-to-render-a-svg-string-file-onto-a-canvas-and-export-it-to-png-or-jpeg-with-a-custom-resolution-preserving-quality-in-javascript
  drawFromSVG(svg_, cb) {
    RendererP5Offscreen.drawSVGToCanvas(this.canvas.elt.getContext('2d'), svg_, cb);
  }
}

class RendererSVG extends Renderer {
  constructor(w, h, opts = {}) {
    super(w, h, opts);

    this.name = "rendererSVG";

    this.svg = "";
    this.svgns = "http://www.w3.org/2000/svg";

    this.fillColor = "#FFFFFF";
    this.strokeColor = "#000000";
    this.strokeW = 1;

    this.elmtSvg = null;
    this.elmtDraw = null;

    this.matrix = new Matrix3();
    this.matrixStack = [];

    this.matrixGroup = new Matrix3();
    this.matrixStackGroup = [];

    this.elemtDraws = new Map();
    this.elemtDrawsStack = [];

    this.drawStateStack = [];

    this.bBackgroundAsSvgAttr = true;

    this.ext = "svg";

  }

  elmt() {
    return this.elmtSvg;
  }

  setAttributesWH(w, h) {
    this.elmtSvg.setAttribute("width", w.toFixed(2));
    this.elmtSvg.setAttribute("height", h.toFixed(2));
  }

  setId(id) {
    this.elmtSvg.setAttribute("id", id);
  }

  svgElmt() {
    return this.elmtSvg;
  }

  begin(id, opts = {}) {
    // TODO : target a specific element ?
    this.elmtSvg = document.createElementNS(this.svgns, "svg");
    this.elmtSvg.setAttribute("class", "renderer");
    this.elmtSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this.setId(id);


    this.elmtSvg.setAttribute("version", `1.1`);
    this.elmtSvg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
    /*        this.elmtSvg.setAttribute("width", `${this.width}`);
            this.elmtSvg.setAttribute("height", `${this.height}`);
     */
    this.setAttributesWH(this.width, this.height);

    this.elemtDraws.set("svg", this.elmtSvg);
    this.elmtDraw = this.elmtSvg;

    this.elemtDrawsStack.push(this.elmtSvg);

    document.body.appendChild(this.elmtSvg);
  }

  isInGroup() {
    return this.elemtDrawsStack.length > 1;   // elmtSvg on top of the stack
  }

  beginGroup(id) {
    //console.group(`beginGroup(${id})`)
    //console.log(`matrixGroup=${this.matrixGroup.getTransformSvg()}`);
    let g;
    if (this.elemtDraws.has(id)) {
      g = this.elemtDraws.get(id);
    } else {
      g = document.createElementNS(this.svgns, "g");
      g.setAttribute("id", id);
      this.setDrawAttributes(g);
      this.elmtDraw.append(g);
      this.elemtDraws.set(id, g);
      this.elmtDraw = g;
    }

    // Apply current transformation to group
    // reset the transformation then (not need to apply current transformation to children groups)
    let matrixCurrent = this.matrixGroup.copy();
    this.matrixStackGroup.push(matrixCurrent);
    if (!matrixCurrent.isIdentity())
      g.setAttribute("transform", matrixCurrent.getTransformSvg());
    this.matrixGroup.setIdentity();

    this.elemtDrawsStack.push(g);
    this.elmtDraw = g;

    // console.groupEnd();

    return g;
  }

  endGroup() {
    this.elemtDrawsStack.pop();
    if (this.elemtDrawsStack.length > 0)
      this.elmtDraw = this.elemtDrawsStack[this.elemtDrawsStack.length - 1];


    //console.group(`endGroup()`)

    if (this.matrixStackGroup.length > 0)
      this.matrixGroup = this.matrixStackGroup.pop();

    //console.log(`matrixGroup=${this.matrixGroup.getTransformSvg()}`);

    //console.groupEnd();
  }

  reset() {
    this.matrix = new Matrix3();
    this.matrixStack = [];
    this.matrixGroup.setIdentity();
    this.elemtDraws = new Map();
    this.elemtDrawsStack = [];
    this.elemtDrawsStack.push(this.elmtSvg);
  }


  fill(color) {
    this.fillColor = color;
  }

  noFill() {
    this.fill("none");
  }

  stroke(color) {
    this.strokeColor = color;
  }

  noStroke() {
    this.stroke("none");
  }

  strokeWeight(w) {
    this.strokeW = w;
  }

  strokeCap(which) {
    this.strokeCap_ = which;
  }

  background(color) {
    this.removeAllSvgNodes();
    //this.reset();
    //this.elmtSvg.append(this.elmtDefs);

    let strokeColor_ = this.strokeColor;
    let fillColor_ = this.fillColor;

    if (this.bBackgroundAsSvgAttr) {
      this.elmtSvg.style.backgroundColor = color;
    } else {
      this.noStroke();
      this.fill(color);
      this.drawElmt(this.getRect(0, 0, this.width, this.height, "background"));

      this.stroke(strokeColor_);
      this.fill(fillColor_);
    }

  }

  line(x1, y1, x2, y2) {
    let line = this.getLine(x1, y1, x2, y2);
    //line.setAttribute("filter", "url(#pencil)");
    this.drawElmt(line);
  }

  lineV(A, B) {
    this.line(A.x, A.y, B.x, B.y);
  }

  rect(x, y, w, h) {
    this.drawElmt(this.getRect(x, y, w, h));
  }

  ellipse(x, y, w, h) {
    this.drawElmt(this.getEllipse(x, y, w, h));
  }

  circle(x, y, d) {
    this.drawElmt(this.getCircle(x, y, Math.abs(d)));
  }

  circleV(pos, d) {
    this.circle(pos.x, pos.y, d);
  }

  arc(x, y, w, h, start, stop) {
    this.drawElmt(this.getArc(x, y, w, h, start, stop));
  }

  bezier(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.drawElmt(this.getBezier(x1, y1, x2, y2, x3, y3, x4, y4));
  }

  translate(x, y) {
    this.matrix.translate(x, y);
    this.matrixGroup.translate(x, y);
  }

  rotate(angle) {
    this.matrix.rotate(angle);
    this.matrixGroup.rotate(angle);
  }

  scale(s) {
    this.matrix.scale(s);
    this.matrixGroup.scale(s);
  }

  beginShape(opts = {}) {
    this.shapeVertices = [];
    if (opts.id)
      this.shapeId = opts.id;
  }

  endShape(mode) {
    let polyline = this.getPolyline(this.shapeVertices, mode);
    if (this.shapeId) {
      polyline.setAttribute("id", this.shapeId);
      this.shapeId = undefined; // for next time
    }
    this.drawElmt(polyline);
  }

  vertex(x, y) {
    this.shapeVertices.push({ x: x, y: y });
  }

  curveVertex(x, y) {
    this.shapeVertices.push({ x: x, y: y });
  }

  vertexV(v) {
    this.vertex(v.x, v.y);
  }

  getDrawState() {
    return {
      "strokeColor": this.strokeColor,
      "strokeW": this.strokeW,
      "strokeCap": this.strokeCap_,
      "fillColor": this.fillColor
    };
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/save
  push() {
    this.drawStateStack.push(this.getDrawState());
    this.matrixStack.push(this.matrix.copy());
  }

  pop() {
    if (this.drawStateStack.length >= 1) {
      let ds = this.drawStateStack.pop();
      this.strokeColor = ds.strokeColor;
      this.strokeW = ds.strokeW;
      this.strokeCap_ = ds.strokeCap;
      this.fillColor = ds.fillColor;
    }

    if (this.matrixStack.length >= 1)
      this.matrix = this.matrixStack.pop();
  }


  getLine(x1, y1, x2, y2) {
    let line = document.createElementNS(this.svgns, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    if (this.isInGroup() == false)
      this.setDrawAttributes(line);


    return line;
  }


  getPolyline(vertices, mode) {
    let type = "polyline";
    if (mode == CLOSE)
      type = "polygon";

    let polyline = document.createElementNS(this.svgns, type);
    let strPoints = "";
    let first = true;
    vertices.forEach(v => {
      strPoints += `${first ? "" : " "}${v.x},${v.y}`;
      first = false;
    });
    polyline.setAttribute("points", strPoints);
    if (this.isInGroup() == false)
      this.setDrawAttributes(polyline);
    return polyline;
  }

  getRect(x, y, w, h, id) {
    let rect = document.createElementNS(this.svgns, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", w);
    rect.setAttribute("height", h);
    if (id !== undefined)
      rect.setAttribute("id", id);
    if (this.isInGroup() == false)
      this.setDrawAttributes(rect);
    return rect;
  }

  getEllipse(x, y, w, h) {
    let ellipse = document.createElementNS(this.svgns, "ellipse");
    ellipse.setAttribute("cx", x);
    ellipse.setAttribute("cy", y);
    ellipse.setAttribute("rx", 0.5 * w);
    ellipse.setAttribute("ry", 0.5 * h);
    if (this.isInGroup() == false)
      this.setDrawAttributes(ellipse);
    return ellipse;
  }

  getCircle(x, y, d) {
    let circle = document.createElementNS(this.svgns, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 0.5 * d);
    if (this.isInGroup() == false)
      this.setDrawAttributes(circle);
    return circle;
  }

  getArc(x, y, w, h, start, stop) {
    let arc = f_svg_ellipse_arc([x, y], [w / 2, h / 2], [start, stop - start], 0);
    if (this.isInGroup() == false)
      this.setDrawAttributes(arc);
    return arc;
  }

  getBezier(x1, y1, x2, y2, x3, y3, x4, y4) {
    let path = document.createElementNS(this.svgns, "path");
    path.setAttribute("d", `M ${x1},${y1} c ${x2 - x1},${y2 - y1} ${x3 - x1},${y3 - y1} ${x4 - x1},${y4 - y1}`);
    if (this.isInGroup() == false)
      this.setDrawAttributes(path);
    return path;
  }

  setDrawAttributes(svgElmt) {
    svgElmt.setAttribute("fill", this.fillColor);
    svgElmt.setAttribute("stroke", this.strokeColor);
    svgElmt.setAttribute("stroke-width", this.strokeW);
    if (this.strokeCap_)
      svgElmt.setAttribute("stroke-linecap", this.strokeCap_);

    let m = svgElmt.tagName == "g" ? this.matrixGroup : this.matrix;
    if (!m.isIdentity())
      svgElmt.setAttribute("transform", m.getTransformSvg());
  }

  drawElmt(svgElmt) {
    this.elmtDraw.appendChild(svgElmt);
  }

  removeAllSvgNodes() {
    /*        const svg = this.elmtSvg;
            const defs = this.elmtSvg.querySelector('defs');

            svg.childNodes.forEach(child => {
                if(child !== defs) {
                  svg.removeChild(child);
                }
              });
    */

    while (this.elmtSvg.firstChild)
      this.elmtSvg.removeChild(this.elmtSvg.firstChild);
  }


  save(filename) {
    this.saveSvg(this.elmtSvg, filename ? filename : this.getFilenameSave());
  }

  saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
    var svgUrl = window.URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  toImageSrc() {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<?xml version="1.0" standalone="no"?>\r\n${this.elmtSvg.outerHTML}`);
  }

  show() {
    this.elmtSvg.setAttribute("style", `display:block`);
  }

  hide() {
    this.elmtSvg.setAttribute("style", `display:none`);
  }


  windowResized(w, h) {
  }

  removeFromDocument() {
    this.elmtSvg.remove();
  }

  addToDocument(id) {
    this.getParent(id).append(this.elmtSvg);
  }


}

class RendererHPGL extends Renderer {
  constructor(w, h, opts = {}) {
    super(w, h, opts);

    // For preview
    this.rendererCanvas = opts.rendererCanvas;

    // Size in mm
    this.wMM = opts.wMM;
    this.hMM = opts.hMM;

    this.pxPerMM = this.rendererCanvas.width / this.wMM;

    this.model =
      {
        name: "Roland DXY-1300",
        resMM: 40 // per mm
      };

    this.output = "";
    this.ext = "hpgl";
  }

  _mm(px) {
    return px / this.pxPerMM;
  }

  _pu(px) {
    return (this._mm(px) * this.model.resMM).toFixed(0);
  }


  background(color) {
    this.output = "";
  }


  line(x1, y1, x2, y2) {
    this.rendererCanvas.line(x1, y1, x2, y2);
    let h = this.rendererCanvas.height;
    this.output += `PU${this._pu(x1)},${this._pu(h - y1)};`; // reversed coordinates system
    this.output += `PD${this._pu(x2)},${this._pu(h - y2)};`;
  }

  lineV(A, B) {
    this.line(A.x, A.y, B.x, B.y);
  }

  save(filename) {
    let s = `IN;SP1;${this.output}`;
    this.saveHPGL(filename ? filename : this.getFilenameSave(), s);
  }

  saveHPGL(name, s) {
    var hpglBlob = new Blob([s], { type: "text;charset=utf-8" });
    var hpglUrl = window.URL.createObjectURL(hpglBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = hpglUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  show() {
    this.rendererCanvas.show();
  }

  hide() {
    this.rendererCanvas.hide();
  }
}


/* [
Copyright © 2020 Xah Lee

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

URL: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
Version 2019-06-19

] */

const cos = Math.cos;
const sin = Math.sin;
//const π = Math.PI;

const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
const f_rotate_matrix = (x => [[cos(x), -sin(x)], [sin(x), cos(x)]]);
const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);

const f_svg_ellipse_arc = (([cx, cy], [rx, ry], [t1, Δ], φ) => {
  /* [
  returns a SVG path element that represent a ellipse.
  cx,cy → center of ellipse
  rx,ry → major minor radius
  t1 → start angle, in radian.
  Δ → angle to sweep, in radian. positive.
  φ → rotation on the whole, in radian
  URL: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
  Version 2019-06-19
   ] */
  Δ = Δ % (2 * Math.PI);
  const rotMatrix = f_rotate_matrix(φ);
  const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1), ry * sin(t1)]), [cx, cy]));
  const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1 + Δ), ry * sin(t1 + Δ)]), [cx, cy]));
  const fA = ((Δ > Math.PI) ? 1 : 0);
  const fS = ((Δ > 0) ? 1 : 0);
  const path_2wk2r = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path_2wk2r.setAttribute("d", "M " + sX + " " + sY + " A " + [rx, ry, φ / (2 * Math.PI) * 360, fA, fS, eX, eY].join(" "));
  return path_2wk2r;
});

class Matrix3 {
  constructor(opts = {}) {
    this.name = opts.name ?? "Matrix3x3";
    this.a = Array(9);
    this.setIdentity();
  }

  setIdentity() {
    for (let i = 0; i < this.a.length; i++)
      this.a[i] = 0;
    this.a[0] = this.a[4] = this.a[8] = 1.0;
    return this;
  }

  isIdentity() {
    let is = true;
    for (let i = 0; i < this.a.length; i++) {
      if (i == 0 || i == 4 || i == 8) {
        if (this.a[i] != 1.0) {
          is = false;
          break;
        }
      } else {
        if (this.a[i] != 0.0) {
          is = false;
          break;
        }
      }
    }
    return is;
  }

  copy() {
    let copy = new Matrix3();
    for (let i = 0; i < this.a.length; i++)
      copy.a[i] = this.a[i];
    return copy;
  }

  /*
                M

              0 3 6
      tmp     1 4 7
              2 5 8
      0 3 6
      1 4 7
      2 5 8

  */
  multiplyBy(M) {
    let tmp = this.copy();

    this.a[0] = tmp.a[0] * M.a[0] + tmp.a[3] * M.a[1] + tmp.a[6] * M.a[2];
    this.a[1] = tmp.a[1] * M.a[0] + tmp.a[4] * M.a[1] + tmp.a[7] * M.a[2];
    this.a[2] = tmp.a[2] * M.a[0] + tmp.a[5] * M.a[1] + tmp.a[8] * M.a[2];

    this.a[3] = tmp.a[0] * M.a[3] + tmp.a[3] * M.a[4] + tmp.a[6] * M.a[5];
    this.a[4] = tmp.a[1] * M.a[3] + tmp.a[4] * M.a[4] + tmp.a[7] * M.a[5];
    this.a[5] = tmp.a[2] * M.a[3] + tmp.a[5] * M.a[4] + tmp.a[8] * M.a[5];

    this.a[6] = tmp.a[0] * M.a[6] + tmp.a[3] * M.a[7] + tmp.a[6] * M.a[8];
    this.a[7] = tmp.a[1] * M.a[6] + tmp.a[4] * M.a[7] + tmp.a[7] * M.a[8];
    this.a[8] = tmp.a[2] * M.a[6] + tmp.a[5] * M.a[7] + tmp.a[8] * M.a[8];

    return this;
  }

  multiplyVector(V) {
    return createVector
    (
      this.a[0] * V.x + this.a[3] * V.y + this.a[6],
      this.a[1] * V.x + this.a[4] * V.y + this.a[7]
    );
  }

  translateV(t) {
    return this.multiplyBy((new Matrix3()).setTranslation(t));
  }

  translate(x, y) {
    return this.multiplyBy((new Matrix3()).setTranslation(x, y));
  }

  rotate(angle) {
    return this.multiplyBy((new Matrix3()).setRotation(angle));
  }

  scale(s) {
    return this.multiplyBy((new Matrix3()).setScale(s));
  }


  setScale(s) {
    this.a[0] = s;
    this.a[4] = s;
    return this;
  }

  setTranslation() {
    if (arguments.length == 1) {
      this.a[6] = arguments[0].x; // assume a p5.Vector
      this.a[7] = arguments[0].y;
      ;
      this.a[8] = 1.0;
    } else if (arguments.length == 2) {
      this.a[6] = arguments[0];
      this.a[7] = arguments[1];
      this.a[8] = 1.0;
    }

    return this;
  }


  setRotation(angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);

    this.a[0] = c;
    this.a[1] = s;
    this.a[3] = -s;
    this.a[4] = c;

    return this;
  }


  setOrthoBasis() {
    let O, i, j;

    if (arguments.length === 3) {
      O = arguments[0] || createVector();
      i = arguments[1];
      j = arguments[2];
    } else if (arguments.length === 2) {
      i = arguments[0];
      j = arguments[1];
    }

    this.setIdentity();

    this.a[0] = i.x;
    this.a[1] = i.y;
    this.a[3] = j.x;
    this.a[4] = j.y;

    if (O) {
      this.a[6] = O.x;
      this.a[7] = O.y;
    }

    return this;
  }

  /*
      0 1 2
      3 4 5
      6 7 8

      0 3 6
      1 4 7
      2 5 8
  */
  getDeterminant() {
    return this.a[0] * (this.a[4] * this.a[8] - this.a[7] * this.a[5])
      - this.a[1] * (this.a[3] * this.a[8] - this.a[6] * this.a[5])
      + this.a[2] * (this.a[3] * this.a[7] - this.a[6] * this.a[4]);

  }

  // TODO : verify for column based matrix
  getInverse() {
    let d = this.getDeterminant();
    d = 1.0 / d;

    let Minv = new Matrix3();

    Minv.a[0] = this.a[4] * this.a[8] - this.a[7] * this.a[5] / d;
    Minv.a[1] = -(this.a[1] * this.a[8] - this.a[7] * this.a[2]) / d;
    Minv.a[2] = this.a[1] * this.a[5] - this.a[2] * this.a[4] / d;

    Minv.a[3] = -(this.a[3] * this.a[8] - this.a[5] * this.a[6]) / d;
    Minv.a[4] = this.a[0] * this.a[8] - this.a[2] * this.a[6] / d;
    Minv.a[5] = -(this.a[0] * this.a[5] - this.a[2] * this.a[3]) / d;

    Minv.a[6] = this.a[3] * this.a[7] - this.a[4] * this.a[6] / d;
    Minv.a[7] = -(this.a[0] * this.a[7] - this.a[1] * this.a[6]) / d;
    Minv.a[8] = this.a[0] * this.a[4] - this.a[3] * this.a[1] / d;

    return Minv;
  }

  getTransformSvg(p = 4) {
    return `matrix(${this.a[0].toFixed(p)} ${this.a[1].toFixed(p)} ${this.a[3].toFixed(p)} ${this.a[4].toFixed(p)} ${this.a[6].toFixed(p)} ${this.a[7].toFixed(p)})`;
  }

  toString() {
    let s = `${this.name}\n`;
    for (let r = 0; r < 3; r++) {
      let sep = "";
      for (let c = 0; c < 3; c++) {
        let offset = r + c * 3; // invert r & c for logging
        let value = this.a[offset];
        if (sep != "" & (value < 0)) sep = " ";
        s += sep + nf(value, 3, 4) + (c == 2 ? "\n" : "");
        sep = "  ";
      }
    }
    return s;
  }

}
