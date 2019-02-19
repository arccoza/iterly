'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {setIt, iter} = require('./iter')


function map(fn, it) {
  it = iter(it)
  
  return setIt({
    next() {
      var {value, done} = it.next()
      return done ? {done} : {value: fn(value),  done}
    }
  })
}
map.curry = curry(map)


module.exports = map