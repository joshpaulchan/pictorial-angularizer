// SectionedCanvas.js
// Written by Josh Paul A. Chan

// `SectionedCanvas(el)`
// This canvas wrapper class abstracts over HTML5 canvas to aid in features for
// the Pictorial Angularizer mk.3000. It splits the canvas into several
// horizontal sections, and makes each of them a 'virtual' canvas.
// 
//  1) clearing the canvas sections
//  2) resizing the canvas
//  3) displaying images on the canvas
// 
// @pre: the canvas element must be initialized and in the DOM
// @pre: numSections must be a non-zero integer
// [all] @pre: the Sectioned Canvas must be initialized
// @post: the canvas will be 'split' into numSections
// 
// @params: el : Node : the Canvas Node
// @params: numSections : Number : the number of sections to split the canvas into
var SectionedCanvas = function(el, numSections) {
  this.el = el;
  this.parentNode = el.parentNode;
  this.ctx = el.getContext('2d');
  
  if (numSections <= 0) numSections = 2;
  this.numSections = numSections || 2;
  this.sectionWidth = -1;
  
  this.curStrokeStyle = {}
  this.lastStrokeStyle = {}
  
  this.lines = {};
  this.images = {};
  
  this.initialize();
}

// `initialize()`
// Initializes the canvas by drawing the canvas & clearing all its sections,
// attaches resize functions
// 
// @pre: any
// @post: resize event listener is attached
// @post: resizes canvas to match parent and clears it
//
// @params: none
// @returns: none
SectionedCanvas.prototype.initialize = function() {
  // Register an event listener to resize during window resize
  window.addEventListener('resize', function() {
    this.resizeToParent();
    this.clearAll();
    this.drawStack();
  }.bind(this), false);
  // Draw canvas border for the first time.
  this.resizeToParent();
  this.clearAll();
  this.drawStack();
}

// `resizeToParent()`
// Resizes the canvas to fit its parent
//
// @pre: any
// @post: the canvas will be resized to math the parent node's clientWidth and
// Height, respectively
// 
// @params: none
// @returns: none
SectionedCanvas.prototype.resizeToParent = function() {
  var p = this.parentNode;
  // resize canvas
  this.el.width = p.clientWidth;
  this.el.height = p.clientHeight;
  
  // update sectionWidth
  this.sectionWidth = Math.floor(p.clientWidth / this.numSections);
}

// `clear(section)`
// Clears a specific section of the canvas
//
// @pre: any
// @post: the section (if valid) will be cleared
// 
// @params: section : Number : the section to clear
// @returns: none
SectionedCanvas.prototype.clear = function(section) {
  if (section < 0) { return; }
  else if (section > this.numSections) { return; }
  
  // save old style
  this.lastStrokeStyle = this.curStrokeStyle;
  
  // clear pixels
  this.ctx.fillStyle = '#333';
  this.ctx.fillRect(0, 0, section * this.sectionWidth, p.clientHeight);
  
  // re-assign old style
  this.curStrokeStyle = this.lastStrokeStyle;
}

SectionedCanvas.prototype.clearAll = function() {
  var p = this.parentNode;
  
  // clear pixels
  this.ctx.strokeStyle = '#333';
  this.ctx.fillRect(0, 0, p.clientWidth, p.clientHeight);
  
  // draw borders
  this.ctx.strokeStyle = '#fff';
  for (var i = 0; i < this.numSections; i++) {
    var xOffset = (i + 1) * this.sectionWidth;
    this.drawLine(xOffset, 0, xOffset, p.clientHeight);
  }
}

SectionedCanvas.prototype.drawStack = function() {
  // draw images
  Object.keys(this.images).forEach(function(sectionId) {
    img = this.images[sectionId];
    this.drawImage(sectionId, img);
  }.bind(this));
  
  // draw lines
  Object.keys(this.lines).forEach(function(lId) {
    l = this.lines[lId];
    this.drawSpanningLine(lId, l.origin, l.dest);
  }.bind(this));
}

SectionedCanvas.prototype.drawLine = function(ox, oy, dx, dy) {
  this.ctx.beginPath();
  this.ctx.moveTo(ox, oy);
  this.ctx.lineTo(dx, dy);
  this.ctx.stroke();
  this.ctx.closePath();
}

SectionedCanvas.prototype.drawLines = function(ls) {
  if (!!ls) {
    var newLines = {};
    ls.forEach(function(cm) {
      newLines[cm.id] = cm;
    });
    this.lines = newLines;
  }
  this.clearAll();
  this.drawStack();
}

SectionedCanvas.prototype.drawImages = function(images) {
  this.images = (!!images) ? images : this.images;
  this.clearAll();
  this.drawStack();
}

SectionedCanvas.prototype.drawSpanningLine = function(id, o, d) {
  this.lines[id] = { 
    origin : { x: o.x, y: o.y },
    dest : { x: d.x, y: d.y }
  };
  
  var ctx = this.ctx;
  var r = 8;
  
  ctx.strokeStyle = '#fff';
  
  // draw origin point
  ctx.beginPath();
  ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.closePath();
  
  // draw line
  this.drawLine(o.x, o.y, d.x, d.y);
  
  // draw dest point
  ctx.beginPath();
  ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.closePath();
}

SectionedCanvas.prototype.drawImage = function(section, img) {
  this.images[section] = img;
  var p = this.parentNode;
  
  var ratio = img.height / img.width;
  var yRatio = this.sectionWidth / (ratio * img.width);
  
  var xOffset = section * this.sectionWidth;
  var yOffset = (p.clientHeight - yRatio * img.height) / 2;
  // draw image
  this.ctx.drawImage(img, xOffset, yOffset, this.sectionWidth, ratio * this.sectionWidth);
}
