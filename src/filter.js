'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {setIt, iter} = require('./iter')


function filter(fn, it) {
  it = iter(it)
  
  return setIt({
    next() {
      // This loop will just spin until done or it finds a value that passes the test
      for (var value, done; {value, done} = it.next(), done ? !done : !fn(value););
      return {value, done}
    }
  })
}
filter.curry = curry(filter)

module.exports = filter