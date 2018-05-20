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
    if (thisField.moveWrapper1_) {
      Blockly.unbindEvent_(thisField.moveWrapper1_);
    }
    if (thisField.moveWrapper2_) {
      Blockly.unbindEvent_(thisField.moveWrapper2_);
    }
  };
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
        Blockly.FieldNumberSlider.SIZE +
        Blockly.FieldNumberSlider.PADDING * 2 +
        "px",
      width:
        Blockly.FieldNumberSlider.SIZE +
        Blockly.FieldNumberSlider.PADDING * 2 +
        "px"
    },
    div
  );
  this.rect_ = Blockly.utils.createSvgElement(
    "rect",
    {
      x: Blockly.FieldNumberSlider.PADDING,
      y: Blockly.FieldNumberSlider.PADDING,
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
      y1: Blockly.FieldNumberSlider.PADDING,
      x2:
        Blockly.FieldNumberSlider.SIZE_HALF + Blockly.FieldNumberSlider.PADDING,
      y2: Blockly.FieldNumberSlider.SIZE + Blockly.FieldNumberSlider.PADDING,
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
  this.moveWrapper1_ = Blockly.bindEvent_(
    svg,
    "mousemove",
    this,
    this.onMouseMove
  );
  /*this.moveWrapper2_ = Blockly.bindEvent_(
    this.gauge_,
    "mousemove",
    this,
    this.onMouseMove
  );*/
  this.updateGraph_();
};

Blockly.FieldNumberSlider.prototype.onMouseMove = function(e) {
  const bBox = this.rect_.getBoundingClientRect();
  const dx = e.clientX - bBox.left;
  const dy = e.clientY - bBox.top;
  const value = dx;
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
  this.updateGraph_();
  this.size_.width = 0;
};

Blockly.FieldNumberSlider.prototype.updateGraph_ = function() {
  if (!this.rect_) {
    return;
  }
  //this.line_.setAttribute("x2", x2);
  //this.line_.setAttribute("y2", y2);
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
