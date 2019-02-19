'use strict'
const undefined = void 0
const {curry, toAsync} = require('./tools')
const {setIt, iter} = require('./iter')


function amap(fn, it) {
  it = toAsync(iter(it))
  var value, done, p
  
  return setIt({
    next() {
      if (done)
        return p
      return p = it.next()
      .then(v => Promise.all([v.value, v.done]))
      .then(v => {
        done = v[1]
        if (done)
          return {value, done}
        value = fn(v[0])
        return isPromise(value) ? value.then(v => ({value: (value = v), done})) : {value, done}
      })
    }
  }, true)
}
amap.curry = curry(amap)


module.exports = amap