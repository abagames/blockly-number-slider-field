"use strict";

goog.provide("Blockly.FieldNumberSlider");

goog.require("Blockly.FieldTextInput");
goog.require("goog.math");
goog.require("goog.userAgent");

declare namespace Blockly {
  let FieldNumberSlider: any;
}

Blockly.FieldNumberSlider = function(opt_value, opt_validator) {
  opt_value = opt_value && !isNaN(opt_value) ? String(opt_value) : "0";
  Blockly.FieldNumberSlider.superClass_.constructor.call(
    this,
    opt_value,
    opt_validator
  );
};
goog.inherits(Blockly.FieldNumberSlider, Blockly.FieldTextInput);

Blockly.FieldNumberSlider.fromJson = function(options) {
  return new Blockly.FieldNumberSlider(options["angle"]);
};

Blockly.FieldNumberSlider.SIZE = 100;
Blockly.FieldNumberSlider.SIZE_HALF = 100 / 2;
Blockly.FieldNumberSlider.INT_SIZE = 20;
Blockly.FieldNumberSlider.PADDING = 20;

Blockly.FieldNumberSlider.prototype.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0;
    return;
  }
  this.textElement_.textContent = this.getDisplayText_();
  this.updateWidth();
};

Blockly.FieldNumberSlider.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldNumberSlider.superClass_.dispose_.call(thisField)();
    thisField.gauge_ = null;
    if (thisField.clickWrapper_) {
      Blockly.unbindEvent_(thisField.clickWrapper_);
    }
    if (thisField.moveWrapper_) {
      Blockly.unbindEvent_(thisField.moveWrapper_);
    }
  };
};

Blockly.FieldNumberSlider.prototype.addText = function(text, x, y) {
  const te = Blockly.utils.createSvgElement("text", { x, y }, this.svg_);
  te.textContent = text;
};

Blockly.FieldNumberSlider.prototype.showEditor_ = function() {
  var noFocus =
    goog.userAgent.MOBILE || goog.userAgent.ANDROID || goog.userAgent.IPAD;
  Blockly.FieldNumberSlider.superClass_.showEditor_.call(this, noFocus);
  var div = Blockly.WidgetDiv.DIV;
  if (!div.firstChild) {
    return;
  }
  const svg = Blockly.utils.createSvgElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:html": "http://www.w3.org/1999/xhtml",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      version: "1.1",
      height:
        Blockly.FieldNumberSlider.INT_SIZE +
        Blockly.FieldNumberSlider.SIZE +
        Blockly.FieldNumberSlider.PADDING * 3 +
        "px",
      width:
        Blockly.FieldNumberSlider.SIZE +
        Blockly.FieldNumberSlider.PADDING * 2 +
        "px"
    },
    div
  );
  this.svg_ = svg;
  this.addText(
    "0",
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.SIZE * 0.02,
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.INT_SIZE * 0.8
  );
  this.addText(
    "9",
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.SIZE * 0.89,
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.INT_SIZE * 0.8
  );
  this.addText(
    "-",
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.SIZE * 0.02,
    Blockly.FieldNumberSlider.PADDING * 2 +
      Blockly.FieldNumberSlider.INT_SIZE +
      Blockly.FieldNumberSlider.SIZE * 0.12
  );
  this.addText(
    "0",
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.SIZE_HALF,
    Blockly.FieldNumberSlider.PADDING * 2 +
      Blockly.FieldNumberSlider.INT_SIZE +
      Blockly.FieldNumberSlider.SIZE * 0.12
  );
  this.addText(
    "1",
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.SIZE * 0.88,
    Blockly.FieldNumberSlider.PADDING * 2 +
      Blockly.FieldNumberSlider.INT_SIZE +
      Blockly.FieldNumberSlider.SIZE * 0.12
  );
  this.addText(
    "10",
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.SIZE * 0.81,
    Blockly.FieldNumberSlider.PADDING * 2 +
      Blockly.FieldNumberSlider.INT_SIZE +
      Blockly.FieldNumberSlider.SIZE * 0.27
  );
  this.addText(
    "100",
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.SIZE * 0.71,
    Blockly.FieldNumberSlider.PADDING * 2 +
      Blockly.FieldNumberSlider.INT_SIZE +
      Blockly.FieldNumberSlider.SIZE * 0.53
  );
  this.addText(
    "1000",
    Blockly.FieldNumberSlider.PADDING + Blockly.FieldNumberSlider.SIZE * 0.62,
    Blockly.FieldNumberSlider.PADDING * 2 +
      Blockly.FieldNumberSlider.INT_SIZE +
      Blockly.FieldNumberSlider.SIZE * 0.97
  );
  this.intRect_ = Blockly.utils.createSvgElement(
    "rect",
    {
      x: Blockly.FieldNumberSlider.PADDING,
      y: Blockly.FieldNumberSlider.PADDING,
      width: Blockly.FieldNumberSlider.SIZE,
      height: Blockly.FieldNumberSlider.INT_SIZE,
      class: "blocklyAngleCircle"
    },
    svg
  );
  this.floatRect_ = Blockly.utils.createSvgElement(
    "rect",
    {
      x: Blockly.FieldNumberSlider.PADDING,
      y:
        Blockly.FieldNumberSlider.PADDING * 2 +
        Blockly.FieldNumberSlider.INT_SIZE,
      width: Blockly.FieldNumberSlider.SIZE,
      height: Blockly.FieldNumberSlider.SIZE,
      class: "blocklyAngleCircle"
    },
    svg
  );
  Blockly.utils.createSvgElement(
    "line",
    {
      x1:
        Blockly.FieldNumberSlider.SIZE_HALF + Blockly.FieldNumberSlider.PADDING,
      y1:
        Blockly.FieldNumberSlider.PADDING * 2 +
        Blockly.FieldNumberSlider.INT_SIZE,
      x2:
        Blockly.FieldNumberSlider.SIZE_HALF + Blockly.FieldNumberSlider.PADDING,
      y2:
        Blockly.FieldNumberSlider.SIZE +
        Blockly.FieldNumberSlider.PADDING * 2 +
        Blockly.FieldNumberSlider.INT_SIZE,
      class: "blocklyAngleMarks"
    },
    svg
  );
  this.clickWrapper_ = Blockly.bindEvent_(
    svg,
    "click",
    this,
    Blockly.WidgetDiv.hide
  );
  this.moveWrapper_ = Blockly.bindEvent_(
    svg,
    "mousemove",
    this,
    this.onMouseMove
  );
};

Blockly.FieldNumberSlider.prototype.onMouseMove = function(e) {
  const iBox = this.intRect_.getBoundingClientRect();
  const fBox = this.floatRect_.getBoundingClientRect();
  const rx = e.clientX - iBox.left;
  const fy = e.clientY - fBox.top;
  const vx = Math.min(Math.max(1, rx), 99);
  let value;
  if (fy < -Blockly.FieldNumberSlider.PADDING / 2) {
    value = Math.floor(vx / 10);
  } else {
    const vy = Math.min(Math.max(0, fy), 99);
    const s = Math.pow(vy / 99, 3) * 999 + 1;
    const v = (vx - 50) / 49 * s;
    const tf = Math.abs(v) < 1 ? 2 : Math.abs(v) < 10 ? 1 : 0;
    value = v.toFixed(tf);
  }
  Blockly.FieldTextInput.htmlInput_.value = value.toString();
  this.setValue(value);
  this.validate_();
  this.resizeEditor_();
};

Blockly.FieldNumberSlider.prototype.setText = function(text) {
  Blockly.FieldNumberSlider.superClass_.setText.call(this, text);
  if (!this.textElement_) {
    return;
  }
  this.size_.width = 0;
};

Blockly.FieldNumberSlider.prototype.classValidator = function(text) {
  if (text === null) {
    return null;
  }
  var n = parseFloat(text || 0);
  if (isNaN(n)) {
    return null;
  }
  return String(n);
};

Blockly.Field.register("field_number_slider", Blockly.FieldNumberSlider);
