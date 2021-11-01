if (typeof process !== 'undefined' && process.nextTick) {
  module.exports = process.nextTick;
} else if (typeof setImmediate !== 'undefined') {
  module.exports = setImmediate;
} else {
  module.exports = function (fn, ...args) {
    setTimeout(fn, 0, args);
  };
}