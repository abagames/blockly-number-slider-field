"use strict";

goog.provide("Blockly.FieldNumberSlider");

goog.require("Blockly.FieldTextInput");
goog.require("goog.math");
goog.require("goog.userAgent");

declare namespace Blockly {
  let FieldNumberSlider: any;
}

Blockly.FieldNumberSlider = function(opt_value, opt_validator) {
  // Add degree symbol: '360ﾂｰ' (LTR) or 'ﾂｰ360' (RTL)
  this.symbol_ = Blockly.utils.createSvgElement("tspan", {}, null);
  this.symbol_.appendChild(document.createTextNode("\u00B0"));

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

Blockly.FieldNumberSlider.ROUND = 15;
Blockly.FieldNumberSlider.HALF = 100 / 2;
Blockly.FieldNumberSlider.CLOCKWISE = false;
Blockly.FieldNumberSlider.OFFSET = 0;
Blockly.FieldNumberSlider.WRAP = 360;
Blockly.FieldNumberSlider.RADIUS = Blockly.FieldNumberSlider.HALF - 1;

Blockly.FieldNumberSlider.prototype.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0;
    return;
  }

  // Update textElement.
  this.textElement_.textContent = this.getDisplayText_();

  // Insert degree symbol.
  if (this.sourceBlock_.RTL) {
    this.textElement_.insertBefore(this.symbol_, this.textElement_.firstChild);
  } else {
    this.textElement_.appendChild(this.symbol_);
  }
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
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  Blockly.FieldNumberSlider.superClass_.showEditor_.call(this, noFocus);
  var div = Blockly.WidgetDiv.DIV;
  if (!div.firstChild) {
    // Mobile interface uses Blockly.prompt.
    return;
  }
  // Build the SVG DOM.
  var svg = Blockly.utils.createSvgElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:html": "http://www.w3.org/1999/xhtml",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      version: "1.1",
      height: Blockly.FieldNumberSlider.HALF * 2 + "px",
      width: Blockly.FieldNumberSlider.HALF * 2 + "px"
    },
    div
  );
  var circle = Blockly.utils.createSvgElement(
    "circle",
    {
      cx: Blockly.FieldNumberSlider.HALF,
      cy: Blockly.FieldNumberSlider.HALF,
      r: Blockly.FieldNumberSlider.RADIUS,
      class: "blocklyAngleCircle"
    },
    svg
  );
  this.gauge_ = Blockly.utils.createSvgElement(
    "path",
    { class: "blocklyAngleGauge" },
    svg
  );
  this.line_ = Blockly.utils.createSvgElement(
    "line",
    {
      x1: Blockly.FieldNumberSlider.HALF,
      y1: Blockly.FieldNumberSlider.HALF,
      class: "blocklyAngleLine"
    },
    svg
  );
  // Draw markers around the edge.
  for (var angle = 0; angle < 360; angle += 15) {
    Blockly.utils.createSvgElement(
      "line",
      {
        x1: Blockly.FieldNumberSlider.HALF + Blockly.FieldNumberSlider.RADIUS,
        y1: Blockly.FieldNumberSlider.HALF,
        x2:
          Blockly.FieldNumberSlider.HALF +
          Blockly.FieldNumberSlider.RADIUS -
          (angle % 45 == 0 ? 10 : 5),
        y2: Blockly.FieldNumberSlider.HALF,
        class: "blocklyAngleMarks",
        transform:
          "rotate(" +
          angle +
          "," +
          Blockly.FieldNumberSlider.HALF +
          "," +
          Blockly.FieldNumberSlider.HALF +
          ")"
      },
      svg
    );
  }
  svg.style.marginLeft = 15 - Blockly.FieldNumberSlider.RADIUS + "px";

  // The angle picker is different from other fields in that it updates on
  // mousemove even if it's not in the middle of a drag.  In future we may
  // change this behavior.  For now, using bindEvent_ instead of
  // bindEventWithChecks_ allows it to work without a mousedown/touchstart.
  this.clickWrapper_ = Blockly.bindEvent_(
    svg,
    "click",
    this,
    Blockly.WidgetDiv.hide
  );
  this.moveWrapper1_ = Blockly.bindEvent_(
    circle,
    "mousemove",
    this,
    this.onMouseMove
  );
  this.moveWrapper2_ = Blockly.bindEvent_(
    this.gauge_,
    "mousemove",
    this,
    this.onMouseMove
  );
  this.updateGraph_();
};

Blockly.FieldNumberSlider.prototype.onMouseMove = function(e) {
  var bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
  var dx = e.clientX - bBox.left - Blockly.FieldNumberSlider.HALF;
  var dy = e.clientY - bBox.top - Blockly.FieldNumberSlider.HALF;
  var angle = Math.atan(-dy / dx);
  if (isNaN(angle)) {
    // This shouldn't happen, but let's not let this error propagate further.
    return;
  }
  angle = goog.math.toDegrees(angle);
  // 0: East, 90: North, 180: West, 270: South.
  if (dx < 0) {
    angle += 180;
  } else if (dy > 0) {
    angle += 360;
  }
  if (Blockly.FieldNumberSlider.CLOCKWISE) {
    angle = Blockly.FieldNumberSlider.OFFSET + 360 - angle;
  } else {
    angle -= Blockly.FieldNumberSlider.OFFSET;
  }
  if (Blockly.FieldNumberSlider.ROUND) {
    angle =
      Math.round(angle / Blockly.FieldNumberSlider.ROUND) *
      Blockly.FieldNumberSlider.ROUND;
  }
  angle = this.callValidator(angle);
  Blockly.FieldTextInput.htmlInput_.value = angle.toString();
  this.setValue(angle);
  this.validate_();
  this.resizeEditor_();
};

Blockly.FieldNumberSlider.prototype.setText = function(text) {
  Blockly.FieldNumberSlider.superClass_.setText.call(this, text);
  if (!this.textElement_) {
    // Not rendered yet.
    return;
  }
  this.updateGraph_();
  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};

Blockly.FieldNumberSlider.prototype.updateGraph_ = function() {
  if (!this.gauge_) {
    return;
  }
  var angleDegrees = Number(this.getText()) + Blockly.FieldNumberSlider.OFFSET;
  var angleRadians = goog.math.toRadians(angleDegrees);
  var path = [
    "M ",
    Blockly.FieldNumberSlider.HALF,
    ",",
    Blockly.FieldNumberSlider.HALF
  ];
  var x2 = Blockly.FieldNumberSlider.HALF;
  var y2 = Blockly.FieldNumberSlider.HALF;
  if (!isNaN(angleRadians)) {
    var angle1 = goog.math.toRadians(Blockly.FieldNumberSlider.OFFSET);
    var x1 = Math.cos(angle1) * Blockly.FieldNumberSlider.RADIUS;
    var y1 = Math.sin(angle1) * -Blockly.FieldNumberSlider.RADIUS;
    if (Blockly.FieldNumberSlider.CLOCKWISE) {
      angleRadians = 2 * angle1 - angleRadians;
    }
    x2 += Math.cos(angleRadians) * Blockly.FieldNumberSlider.RADIUS;
    y2 -= Math.sin(angleRadians) * Blockly.FieldNumberSlider.RADIUS;
    // Don't ask how the flag calculations work.  They just do.
    var largeFlag = Math.abs(Math.floor((angleRadians - angle1) / Math.PI) % 2);
    if (Blockly.FieldNumberSlider.CLOCKWISE) {
      largeFlag = 1 - largeFlag;
    }
    var sweepFlag = Number(Blockly.FieldNumberSlider.CLOCKWISE);
    path.push(
      " l ",
      x1,
      ",",
      y1,
      " A ",
      Blockly.FieldNumberSlider.RADIUS,
      ",",
      Blockly.FieldNumberSlider.RADIUS,
      " 0 ",
      largeFlag,
      " ",
      sweepFlag,
      " ",
      x2,
      ",",
      y2,
      " z"
    );
  }
  this.gauge_.setAttribute("d", path.join(""));
  this.line_.setAttribute("x2", x2);
  this.line_.setAttribute("y2", y2);
};

Blockly.FieldNumberSlider.prototype.classValidator = function(text) {
  if (text === null) {
    return null;
  }
  var n = parseFloat(text || 0);
  if (isNaN(n)) {
    return null;
  }
  n = n % 360;
  if (n < 0) {
    n += 360;
  }
  if (n > Blockly.FieldNumberSlider.WRAP) {
    n -= 360;
  }
  return String(n);
};

Blockly.Field.register("field_number_slider", Blockly.FieldNumberSlider);
