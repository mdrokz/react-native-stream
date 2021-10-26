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

'use strict';

const {
  promisify: { custom: customPromisify },
} = require('./util');

const pipeline = require('./internal/pipeline');
const eos = require('./internal/end-of-stream');

// Lazy loaded
let promises = null;

const Stream = module.exports = require('./internal//legacy').Stream;
Stream.Readable = require('./internal/readable');
Stream.Writable = require('./internal/writable');
Stream.Duplex = require('./internal/duplex');
Stream.Transform = require('./internal/transform');
Stream.PassThrough = require('./internal/passthrough');
Stream.pipeline = pipeline;
Stream.finished = eos;

function lazyLoadPromises() {
  if (promises === null) promises = require('./promises');
  return promises;
}

Object.defineProperty(Stream, 'promises', {
  configurable: true,
  enumerable: true,
  get() {
    return lazyLoadPromises();
  }
});

Object.defineProperty(pipeline, customPromisify, {
  enumerable: true,
  get() {
    return lazyLoadPromises().pipeline;
  }
});

Object.defineProperty(eos, customPromisify, {
  enumerable: true,
  get() {
    return lazyLoadPromises().finished;
  }
});

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

Stream._isUint8Array = require('./internal/util/types').isUint8Array;

class FastBuffer extends Uint8Array {};

Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
  return new FastBuffer(chunk.buffer,
                                       chunk.byteOffset,
                                       chunk.byteLength);
};

module.exports = Stream;