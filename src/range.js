'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {ITERATOR, setIt, iter} = require('./iter')


/**
 * Creates a Range object that can be iterated over.
 * @constructor
 * @param {number} [start=0] - The start of the range (inclusive).
 * @param {number} stop - The end of the range (exclusive).
 * @param {number} [step=1] - The stride of the range.
 * @returns {Range}
 */
function Range(start, stop, step) {
  if (!(this instanceof Range))
    return Range.apply(Object.create(Range.prototype), arguments)

  if (arguments.length < 2)
    stop = start, start = 0

  start = parseInt(start, 10) || 0
  stop = parseInt(stop, 10) || 0
  step = parseInt(step, 10) || 1

  if (step == 0)
    throw new Error('step cannot be zero.')

  var length = stop - start
  length = length === 0 ? length : length / step
  length = length < 0 ? 0 : Math.ceil(length)
  Object.defineProperty(this, 'start', {value: start, writable: false, enumerable: true})
  Object.defineProperty(this, 'stop', {value: stop, writable: false, enumerable: true})
  Object.defineProperty(this, 'step', {value: step, writable: false, enumerable: true})
  Object.defineProperty(this, 'length', {value: length, writable: false})
  return this
}

/**
 * An alternative, static method, Range constructor.
 * @static
 * @param {number} [start=0] - The start of the range (inclusive).
 * @param {number} stop - The end of the range (exclusive).
 * @param {number} [step=1] - The stride of the range.
 * @returns {Range}
 */
Range.new = function() {
  return Range.apply(Object.create(Range.prototype), arguments)
}

/**
 * Creates an iterator of all the values in the range.
 * @returns {Iterator}
 */
Range.prototype[ITERATOR] = function() {
  var {start, step, length} = this
  var i = 0, v = start, value, done

  return setIt({
    next() {
      if (!done && !(done = i++ >= length)) {
        value = v
        v += step
      }
      return {value, done}
    }
  })
}

/**
 * Creates an iterator of all the values in the range.
 * @method
 * @returns {Iterator}
 */
Range.prototype.values = Range.prototype[ITERATOR]

/**
 * Creates an iterator of all the entries in the range.
 * @returns {Iterator} - Returns value pairs [value, value], like Set.
 */
Range.prototype.entries = function() {
  var it = this[ITERATOR](), v

  return setIt({
    next() {
      v = it.next()
      v.value = [v.value, v.value]
      return v
    }
  })
}

/**
 * Get an item from a range by index.
 * @param {number} idx - The index of the value in the range.
 * @returns {number} - Returns the value at the index, or undefined.
 */
Range.prototype.get = function(idx) {
  if (idx >= this.length || idx < 0)
    return undefined

  return this.start + idx * this.step
}

/**
 * Check if a value exists in a range.
 * @param {number} val - The value to look for.
 * @returns {boolean} - Returns true if the value exists.
 */
Range.prototype.has = function(val) {
  if (this.length === 0)
    return undefined

  var {start, stop, step} = this
  return !((val - start) % step) && (step > 0 && val >= start && val < stop || step < 0 && val <= start && val > stop)
}

/**
 * Find the index of a value in the range.
 * @param {number} val - The value to look for.
 * @returns {number} - Returns the index if the value exists, -1 otherwise.
 */
Range.prototype.indexOf = function(val) {
  var {start, step} = this
  return !this.has(val) ? -1 : ((val - start) / step)
}

/**
 * An alternative, functional, Range constructor.
 * @function
 * @param {number} [start=0] - The start of the range (inclusive).
 * @param {number} stop - The end of the range (exclusive).
 * @param {number} [step=1] - The stride of the range.
 * @returns {Range}
 */
const range = Range.new


// var r = range(1,8,6)
// var r = range(13,1,-6)
// var r = range(-13,13,5)

// console.log(r, r.length, r.indexOf(7))

// for (var v of r) {
//   console.log(v)
// }
// console.log(it.next())


module.exports = {Range, range}