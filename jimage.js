var Jimage;

Jimage = (function() {

  /*
      The `constructor` takes two params; `src` and `options`.
  
      @param {String|Jimage} src - source of image. Either a path to the image
          or a previously exported Jimage file.
      [@param {Object} options - options for the image.
          @param {String} element - element for the image.
          @param {Int} scale - how much the image will be scaled by.
          @param {String|Function} mode - which mode the image will be drawn
          with. Can be either a string or a function.]
   */
  var extractPixels, getMode, load, modes;

  function Jimage(src, options) {
    var canvas, key, value, _ref;
    this.src = src;
    this.options = {
      element: null,
      scale: 1,
      mode: 'normal'
    };
    for (key in options) {
      value = options[key];
      this.options[key] = value;
    }
    _ref = this.options;
    for (key in _ref) {
      value = _ref[key];
      this[key] = value;
    }
    if (!(this.element = document.getElementById(this.options.element))) {
      canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      this.element = canvas;
    }
    this.events = {
      loaded: new Event('loaded')
    };
    load.call(this, this.src);
  }

  modes = {
    normal: function(pixel) {
      return {
        r: pixel.r,
        g: pixel.g,
        b: pixel.b,
        a: pixel.a
      };
    },
    inverted: function(pixel) {
      return {
        r: 255 - pixel.r,
        g: 255 - pixel.g,
        b: 255 - pixel.b,
        a: pixel.a
      };
    }
  };

  load = function(src) {
    var canvas, context, img;
    if (typeof src === 'object') {
      this.src = src.src;
      this.width = src.width;
      this.height = src.height;
      this.pixels = src.pixels;
      this.element.dispatchEvent(this.events.loaded);
    } else {
      img = new Image();
      canvas = document.createElement('canvas');
      context = canvas.getContext('2d');
      img.onload = (function(_this) {
        return function(e) {
          var data;
          img = e.target;
          context.drawImage(img, 0, 0);
          data = context.getImageData(0, 0, img.width, img.height).data;
          _this.width = img.width;
          _this.height = img.height;
          _this.pixels = extractPixels(data, _this.width);
          return _this.element.dispatchEvent(_this.events.loaded);
        };
      })(this);
      img.src = src;
    }
  };

  extractPixels = function(data, width) {
    var i, pixels, x, y, _, _i, _len;
    pixels = [];
    x = y = 0;
    for (i = _i = 0, _len = data.length; _i < _len; i = _i += 4) {
      _ = data[i];
      pixels.push({
        x: x,
        y: y,
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3]
      });
      x += 1;
      if (x === width) {
        x = 0;
        y += 1;
      }
    }
    return pixels;
  };

  getMode = function(mode) {
    if (mode in modes) {
      mode = modes[mode];
    } else if (typeof mode === 'function') {
      mode = mode;
    } else {
      throw new Error('`mode` was either not given or not found.');
    }
    return mode;
  };

  Jimage.prototype["export"] = function() {
    return {
      src: this.src,
      width: this.width,
      height: this.height,
      pixels: this.pixels
    };
  };

  Jimage.prototype.draw = function(options) {
    var canvas, context, key, mode, p, pixel, scale, value, _i, _len, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    _ref = this.options;
    for (key in _ref) {
      value = _ref[key];
      if (!options[key]) {
        options[key] = value;
      }
    }
    canvas = options.element != null ? document.getElementById(options.element) : this.element;
    if (canvas == null) {
      throw new Error("Canvas '" + element + "' is invalid.");
    }
    scale = options.scale;
    mode = getMode(options.mode);
    canvas.height = this.height * scale;
    canvas.width = this.width * scale;
    context = canvas.getContext('2d');
    _ref1 = this.pixels;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      pixel = _ref1[_i];
      p = mode(pixel);
      context.fillStyle = "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.a + ")";
      context.fillRect(pixel.x * scale, pixel.y * scale, scale, scale);
    }
  };

  return Jimage;

})();
