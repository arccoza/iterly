'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {setIt, iter} = require('./iter')


function range(start, stop, step) {
  if (arguments.length == 0)
    return

  if (arguments.length == 1)
    stop = parseInt(start, 10), start = 0, step = 1
  else if (arguments.length == 2)
    start = parseInt(start, 10), stop = parseInt(stop, 10), step = 1
  else
    start = parseInt(start, 10), stop = parseInt(stop, 10), step = parseInt(step, 10)

  var i = start, value, done, fail
  if (step > 0)
    fail = (a, b) => a >= b
  else if (step < 0)
    fail = (a, b) => a <= b
  else
    return

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


module.exports = range