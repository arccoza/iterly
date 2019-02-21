'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {ITERATOR, setIt, iter} = require('./iter')


function Range(start, stop, step) {
  if (arguments.length == 0)
    throw new Error('Range requires at least 1 argument.')

  if (arguments.length == 1)
    stop = parseInt(start, 10), start = 0, step = 1
  else if (arguments.length == 2)
    start = parseInt(start, 10), stop = parseInt(stop, 10), step = 1
  else
    start = parseInt(start, 10), stop = parseInt(stop, 10), step = parseInt(step, 10)

  if (step == 0)
    throw new Error('step cannot be zero.')

  var length = stop - start
  length = length === 0 ? length : length / step
  length = length < 0 ? 0 : Math.floor(length)
  Object.defineProperty(this, 'start', {value: start, writable: false, enumerable: true})
  Object.defineProperty(this, 'stop', {value: stop, writable: false, enumerable: true})
  Object.defineProperty(this, 'step', {value: step, writable: false, enumerable: true})
  Object.defineProperty(this, 'length', {value: length, writable: false})
}

Range.new = function(...args) {
  return new Range(...args)
}

Range.prototype[ITERATOR] = function() {
  var {start, stop, step} = this
  var i = start, value, done, fail
  if (step > 0)
    fail = (a, b) => a >= b
  else if (step < 0)
    fail = (a, b) => a <= b

  return setIt({
    next() {
      if (!done && !(done = fail(i, stop))) {
        value = i
        i += step
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
  if (this.length === 0 || idx < 0)
    return undefined

  var {start, stop, step} = this
  var v = start + idx * step
  return Math.abs(v) < Math.abs(stop) ? v : undefined
}

Range.prototype.has = function(val) {
  if (this.length === 0)
    return undefined

  var {start, stop, step} = this
  val = Math.abs(val)
  return val >= Math.abs(start) && val < Math.abs(stop) && !(val % Math.abs(step))
}

function range(...args) {
  return Range.new(...args)
}


// var r = Range.new(0, 5, 2)

// console.log(r.has(5))

// for (var v of r.entries()) {
//   console.log(v)
// }
// console.log(it.next())


module.exports = {Range, range}