
/*
 * lstats.js v1.2.6
 * (c) 2017 @Johnny Wu
 * Released under the MIT License.
 */

'use strict';

// polyfill
function polyfill () {
  if (typeof window.performance === 'undefined') {
    window.performance = {};
  }

  if (!window.performance.now) {

    var nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart) {
      nowOffset = performance.timing.navigationStart;
    }

    window.performance.now = function now() {
      return Date.now() - nowOffset;
    };
  }

  if (!window.performance.mark) {
    window.performance.mark = function () { };
  }

  if (!window.performance.measure) {
    window.performance.measure = function () { };
  }

  if (!window.performance.memory) {
    window.performance.memory = { usedJSHeapSize: 0, totalJSHeapSize: 0 };
  }
}

polyfill();

var _width = 80;
var _height = 38;

var PR = Math.round(window.devicePixelRatio || 1);
var WIDTH = _width * PR;
var HEIGHT = _height * PR;
var TEXT_X = 3 * PR;
var TEXT_Y = 2 * PR;
var GRAPH_X = 3 * PR;
var GRAPH_Y = 15 * PR;
var GRAPH_WIDTH = 74 * PR;
var GRAPH_HEIGHT = (_height - 18) * PR;

var _Graph = function _Graph(dom, name, fg, bg) {
  this._name = name;
  this._fg = fg;
  this._bg = bg;

  // this._min = Infinity;
  // this._max = 0;

  this._canvas = document.createElement('canvas');
  this._canvas.width = WIDTH;
  this._canvas.height = HEIGHT;
  this._canvas.style.cssText = "width:" + _width + "px;height:" + _height + "px";

  this._ctx = this._canvas.getContext('2d', { alpha: false });
  this._ctx.font = "bold " + (9 * PR) + "px Helvetica,Arial,sans-serif";
  this._ctx.textBaseline = 'top';

  this._ctx.fillStyle = bg;
  this._ctx.fillRect(0, 0, WIDTH, HEIGHT);

  this._ctx.fillStyle = fg;
  this._ctx.fillText(name, TEXT_X, TEXT_Y);
  this._ctx.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  this._ctx.fillStyle = bg;
  this._ctx.globalAlpha = 0.9;
  this._ctx.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  dom.appendChild(this._canvas);
};

_Graph.prototype.draw = function draw (value, maxValue) {
  // this._min = Math.min(this._min, value);
  // this._max = Math.max(this._max, value);

  var v = Math.round(value * 100) / 100;

  this._ctx.fillStyle = this._bg;
  this._ctx.globalAlpha = 1;
  this._ctx.fillRect(0, 0, WIDTH, GRAPH_Y);
  this._ctx.fillStyle = this._fg;
  this._ctx.fillText((v + " " + (this._name)), TEXT_X, TEXT_Y);

  this._ctx.drawImage(this._canvas,
    GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT,
    GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT
  );
  this._ctx.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

  var h = Math.round((1 - (value / maxValue)) * GRAPH_HEIGHT);
  this._ctx.fillStyle = this._bg;
  this._ctx.globalAlpha = 0.9;
  this._ctx.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, h);
};

var _ThresholdGraph = (function (_Graph) {
  function _ThresholdGraph(dom, name, fg, bg) {
    _Graph.call(this, dom, name, fg, bg);

    this._threshold = 0;

    this._canvas2 = document.createElement('canvas');
    this._canvas2.width = GRAPH_WIDTH;
    this._canvas2.height = GRAPH_HEIGHT;
    this._canvas2.style.cssText = "width:" + (GRAPH_WIDTH/PR) + "px;height:" + (GRAPH_HEIGHT/PR) + "px";

    this._ctx2 = this._canvas2.getContext('2d', { alpha: false });
    this._ctx2.fillStyle = bg;
    this._ctx.globalAlpha = 0.9;
    this._ctx2.fillRect(0, 0, GRAPH_WIDTH, GRAPH_HEIGHT);
  }

  if ( _Graph ) _ThresholdGraph.__proto__ = _Graph;
  _ThresholdGraph.prototype = Object.create( _Graph && _Graph.prototype );
  _ThresholdGraph.prototype.constructor = _ThresholdGraph;

  _ThresholdGraph.prototype.draw = function draw (value, alarm) {
    var v = Math.round(value * 100) / 100;

    this._ctx.fillStyle = this._bg;
    this._ctx.globalAlpha = 1;
    this._ctx.fillRect(0, 0, WIDTH, GRAPH_Y);
    this._ctx.fillStyle = this._fg;

    this._ctx.fillText((v + " " + (this._name)), TEXT_X, TEXT_Y);

    if (value > this._threshold) {
      var factor = (value - (value % GRAPH_HEIGHT)) / GRAPH_HEIGHT;
      var newThreshold = GRAPH_HEIGHT * (factor + 1);

      var lastThreshold = this._threshold;
      this._threshold = newThreshold;

      var ratio = lastThreshold / newThreshold;

      this._ctx2.drawImage(this._canvas,
        GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT,
        0, 0, GRAPH_WIDTH, GRAPH_HEIGHT
      );

      this._ctx.fillStyle = this._fg;
      this._ctx.globalAlpha = 1;
      this._ctx.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

      this._ctx.fillStyle = this._bg;
      this._ctx.globalAlpha = 0.9;
      this._ctx.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

      this._ctx.fillStyle = this._fg;
      this._ctx.globalAlpha = 1;
      this._ctx.drawImage(this._canvas2,
        PR, 0, GRAPH_WIDTH - PR, GRAPH_HEIGHT,
        GRAPH_X, GRAPH_Y + (1.0 - ratio) * GRAPH_HEIGHT, GRAPH_WIDTH - PR, ratio * GRAPH_HEIGHT
      );
    } else {
      this._ctx.drawImage(this._canvas,
        GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT,
        GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT
      );
    }

    //
    var h = Math.round((1 - (value / this._threshold)) * GRAPH_HEIGHT);
    this._ctx.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

    if ( alarm ) {
      this._ctx.fillStyle = '#e00';
      this._ctx.globalAlpha = 1;
      this._ctx.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, h);
    } else {
      this._ctx.fillStyle = this._bg;
      this._ctx.globalAlpha = 0.9;
      this._ctx.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, h);
    }
  };

  return _ThresholdGraph;
}(_Graph));

/**
 * @class LStats
 */
var LStats = function LStats (dom, installs, css) {
  var this$1 = this;
  if ( installs === void 0 ) installs = ['fps', 'ms', 'mb'];
  if ( css === void 0 ) css = '';

  this._mode = 0;
  this._enableFPS = installs.indexOf('fps') !== -1;
  this._enableMS = installs.indexOf('ms') !== -1;
  if (window.performance.memory && window.performance.memory.totalJSHeapSize) {
    this._enableMB = installs.indexOf('mb') !== -1;
  }

  // ms
  // this._lastTick = 0;
  this._framesMS = 0;
  this._lastTimeMS = 0;

  // fps
  this._frames = 0;
  this._lastTimeFPS = 0;

  // MB
  this._used = 0;
  this._lastUsed = 0;
  this._lastTimeMB = 0;

  // dom
  var container = document.createElement('div');
  container.style.cssText = "position:fixed;top:5px;right:5px;cursor:pointer;opacity:0.9;z-index:9999;" + css;
  container.addEventListener('mousedown', function (event) {
    event.preventDefault();
    event.stopPropagation();

    this$1._mode = ++this$1._mode % container.children.length;

    for (var i = 0; i < container.children.length; ++i) {
      container.children[i].style.display = i === this$1._mode ? 'block' : 'none';
    }
  });

  if (this._enableFPS) {
    this._graphFPS = new _Graph(container, 'FPS', '#0ff', '#002');
  }
  if (this._enableMS) {
    this._graphMS = new _Graph(container, 'MS', '#f08', '#201');
  }
  if (this._enableMB) {
    this._graphMB = new _ThresholdGraph(container, 'MB', '#0f0', '#020');
  }

  // show first one
  for (var i = 0; i < container.children.length; ++i) {
    container.children[i].style.display = i === 0 ? 'block' : 'none';
  }

  dom.appendChild(container);

  this._container = container;
};

/**
 * @method tick
 */
LStats.prototype.tick = function tick () {
  var time = window.performance.now();

  if (this._enableMS) {
    ++this._framesMS;

    var e = time - this._lastTimeMS;
    if (e > 100) {
      this._graphMS.draw(e/this._framesMS, 50);
      this._framesMS = 0;
      this._lastTimeMS = time;
    }
  }

  if (this._enableFPS) {
    ++this._frames;

    var e$1 = time - this._lastTimeFPS;
    if (e$1 > 1000) {
      this._graphFPS.draw(this._frames * 1000 / e$1, 100);
      this._frames = 0;
      this._lastTimeFPS = time;
    }
  }

  if ( this._enableMB ) {
    var e$2 = time - this._lastTimeMB;
    if (e$2 > 200) {
      this._lastUsed = this._used;
      this._used = window.performance.memory.usedJSHeapSize;
      this._lastTimeMB = time;
      var delta = this._used - this._lastUsed;

      this._graphMB.draw(this._used / 1048576, delta < 0);
    }
  }
};

/**
 * @method show
 */
LStats.prototype.show = function show () {
  this._container.style.display = 'block';
};

/**
 * @method hide
 */
LStats.prototype.hide = function hide () {
  this._container.style.display = 'none';
};

module.exports = LStats;
//# sourceMappingURL=lstats.js.map
