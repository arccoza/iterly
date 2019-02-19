'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {setIt, iter} = require('./iter')


function reduce(fn, acc, it) {
  it = iter(it)
  var value, done

  return setIt({
    next() {
      if (done)
        return {value, done}

      for (var i = 0; {value, done} = it.next(), !done; i++) {
        acc = fn(acc, value, i)
      }

      value = acc
      return {value}
    }
  })
}
reduce.curry = curry(reduce)


module.exports = reduce