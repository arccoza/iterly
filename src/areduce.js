'use strict'
const undefined = void 0
const {curry, toAsync} = require('./tools')
const {setIt, iter} = require('./iter')


function areduce(fn, acc, it) {
  it = toAsync(iter(it))
  var p, done = false, i = 0

  return setIt({
    next() {
      if (done)
        return p.then(v => (v.done = true, v))
      done = true

      return p = it.next().then(function step(v) {
        if (v.done)
          return {value: acc}
        acc = fn(acc, v.value, i++)
        return it.next().then(step)
      })
    }
  }, true)
}
areduce.curry = curry(areduce)


module.exports = areduce