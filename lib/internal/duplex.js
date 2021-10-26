// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototype inheritance, this class
// prototypically inherits from Readable, and then parasitically from
// Writable.

'use strict';

module.exports = Duplex;

const Readable = require('./readable');
const Writable = require('./writable');

Object.setPrototypeOf(Duplex.prototype, Readable.prototype);
Object.setPrototypeOf(Duplex, Readable);

{
  // Allow the keys array to be GC'ed.
  for (const method of Object.keys(Writable.prototype)) {
    if (!Duplex.prototype[method])
      Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;

  if (options) {
    if (options.readable === false)
      this.readable = false;

    if (options.writable === false)
      this.writable = false;

    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
    }
  }
}

Object.defineProperties(Duplex.prototype, {
  writable:
    Object.getOwnPropertyDescriptor(Writable.prototype, 'writable'),
  writableHighWaterMark:
    Object.getOwnPropertyDescriptor(Writable.prototype, 'writableHighWaterMark'),
  writableObjectMode:
    Object.getOwnPropertyDescriptor(Writable.prototype, 'writableObjectMode'),
  writableBuffer:
    Object.getOwnPropertyDescriptor(Writable.prototype, 'writableBuffer'),
  writableLength:
    Object.getOwnPropertyDescriptor(Writable.prototype, 'writableLength'),
  writableFinished:
    Object.getOwnPropertyDescriptor(Writable.prototype, 'writableFinished'),
  writableCorked:
    Object.getOwnPropertyDescriptor(Writable.prototype, 'writableCorked'),
  writableEnded:
    Object.getOwnPropertyDescriptor(Writable.prototype, 'writableEnded'),

  destroyed: {
    get() {
      if (this._readableState === undefined ||
        this._writableState === undefined) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set(value) {
      // Backward compatibility, the user is explicitly
      // managing destroyed.
      if (this._readableState && this._writableState) {
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
      }
    }
  }
});
