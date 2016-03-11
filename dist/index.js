"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _spawn = require('child_process').spawn;
var isError = require('util').isError;
var Duplexify = require('duplexify');
var fs = require('fs');

var operators = Symbol();
var settings = Symbol();

var ImageMagick = function (_Duplexify) {
  _inherits(ImageMagick, _Duplexify);

  /**
   * Constructor
   *
   * @param {String} src
   * @api public
   */

  function ImageMagick(src) {
    _classCallCheck(this, ImageMagick);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageMagick).call(this));

    _this.input = '-';
    _this.output = '-';
    _this[operators] = [];
    _this[settings] = [];
    _this.spawned = false;
    if (src) _this.from(src);
    return _this;
  }

  /**
   * Resume
   */

  _createClass(ImageMagick, [{
    key: 'resume',
    value: function resume() {
      if (!this.spawned) this.spawn();
      this.spawned = true;
      _get(Object.getPrototypeOf(ImageMagick.prototype), 'resume', this).call(this);
    }

    /**
     * Sets the input file format
     *
     * @param {String} args
     * @api public
     */

  }, {
    key: 'inputFormat',
    value: function inputFormat(args) {
      this.input = args + ':-';
      return this;
    }

    /**
     * Sets the output file format
     *
     * @param {String} args
     * @api public
     */

  }, {
    key: 'outputFormat',
    value: function outputFormat(args) {
      this.output = args + ':-';
      return this;
    }

    /**
     * Sets the `quality` option
     *
     * @param {String|Number} args
     * @api public
     */

  }, {
    key: 'quality',
    value: function quality(args) {
      this[operators].push('-quality', args);
      return this;
    }

    /**
     * Sets the `resize` option
     *
     * @param {String} args
     * @api public
     */

  }, {
    key: 'resize',
    value: function resize(args) {
      this[operators].push('-resize', args);
      return this;
    }

    /**
     * Sets the `scale` option
     *
     * @param {String} args
     * @api public
     */

  }, {
    key: 'scale',
    value: function scale(args) {
      this[operators].push('-scale', args);
      return this;
    }

    /**
     * Sets the `crop` option
     *
     * @param {String} args
     * @api public
     */

  }, {
    key: 'crop',
    value: function crop(args) {
      this[operators].push('-crop', args);
      return this;
    }

    /**
     * Sets the `gravity` option
     *
     * @param {String} args
     * @api public
     */

  }, {
    key: 'gravity',
    value: function gravity(args) {
      this[operators].push('-gravity', args);
      return this;
    }

    /**
     * Sets the `thumbnail` option
     *
     * @param {String} args
     * @api public
     */

  }, {
    key: 'thumbnail',
    value: function thumbnail(args) {
      this[operators].push('-thumbnail', args);
      return this;
    }

    /**
     * Sets the `auto-orient` option
     *
     * @api public
     */

  }, {
    key: 'autoOrient',
    value: function autoOrient() {
      this[operators].push('-auto-orient');
      return this;
    }

    /**
     * Sets the `type` option
     *
     * @param {String} args
     * @api public
     */

  }, {
    key: 'type',
    value: function type(args) {
      this[operators].push('-type', args);
      return this;
    }

    /**
     * Passes additional settings
     *
     * @param {String} key
     * @param {Mixed} val
     * @api public
     */

  }, {
    key: 'set',
    value: function set(key, val) {
      this[settings].push('-' + key);
      if (val != null) this[settings].push(val);
      return this;
    }

    /**
     * Passes additional operators
     *
     * @param {String} key
     * @param {Mixed} val
     * @api public
     */

  }, {
    key: 'op',
    value: function op(key, val) {
      this[operators].push('-' + key);
      if (val != null) this[operators].push(val);
      return this;
    }

    /**
     * Read image data from path
     *
     * @param {String} path
     * @api public
     */

  }, {
    key: 'from',
    value: function from(path) {
      var read = fs.createReadStream(path);
      read.on('error', this.onerror);
      read.pipe(this);
      return this;
    }

    /**
     * Write image data to path
     *
     * @param {String} path
     * @return {Stream} writable stream
     * @api public
     */

  }, {
    key: 'to',
    value: function to(path) {
      var write = fs.createWriteStream(path);
      write.on('error', this.onerror);
      this.pipe(write);
      return write;
    }

    /**
     * Spawn `convert`
     *
     * @api private
     */

  }, {
    key: 'spawn',
    value: function spawn() {
      var onerror = this.onerror.bind(this);
      var proc = _spawn('convert', this.args());

      var stdout = proc.stdout;
      stdout.on('error', onerror);
      this.setReadable(stdout);

      var stdin = proc.stdin;
      stdin.on('error', onerror);
      this.setWritable(stdin);

      var stderr = proc.stderr;
      stderr.on('data', onerror);
      stderr.on('error', onerror);
    }

    /**
     * Constructs args for cli call
     *
     * @api private
     */

  }, {
    key: 'args',
    value: function args() {
      return this[settings].concat([this.input], this[operators], [this.output]);
    }

    /**
     * Re-emit errors
     *
     * @param {Error|Buffer} err
     * @api private
     */

  }, {
    key: 'onerror',
    value: function onerror(err) {
      if (!isError(err)) err = new Error(err);
      if (!this.listeners('error')) throw err;
      this.emit('error', err);
    }
  }]);

  return ImageMagick;
}(Duplexify);

/**
 * Expose factory method.
 */

module.exports = function (src) {
  return new ImageMagick(src);
};