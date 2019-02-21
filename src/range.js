'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {ITERATOR, setIt, iter} = require('./iter')


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

Range.new = function() {
  return Range.apply(Object.create(Range.prototype), arguments)
}

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

Range.prototype.values = Range.prototype[ITERATOR]

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

Range.prototype.get = function(idx) {
  if (idx >= this.length || idx < 0)
    return undefined

  return this.start + idx * this.step
}

Range.prototype.has = function(val) {
  if (this.length === 0)
    return undefined

  var {start, stop, step} = this
  return !((val - start) % step) && (step > 0 && val >= start && val < stop || step < 0 && val <= start && val > stop)
}

const range = Range.new


// var r = range(1,8,6)
// var r = range(13,1,-6)
// var r = range(-13,13,5)

// console.log(r, r.length, r.has(7))

// for (var v of r) {
//   console.log(v)
// }
// console.log(it.next())


module.exports = {Range, range}