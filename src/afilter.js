'use strict'
const undefined = void 0
const {curry, isPromise, anext} = require('./tools')
const {setIt, iter} = require('./iter')


function afilter(fn, it) {
  it = iter(it)
  var _next = anext.bind(null, it)
  var p = Promise.resolve(), done = false
  
  return setIt({
    next() {
      if (done)
        return p

      return p = p.then(_next).then(function step(v) {
        if (done = v.done)
          return v

        var ok = fn(v.value)
        if (isPromise(ok))
          return ok.then(ok => ok ? v : _next().then(step))
        else if(ok)
          return v
        return _next().then(step)
      })
    }
  }, true)
}
afilter.curry = curry(afilter)


module.exports = afilter