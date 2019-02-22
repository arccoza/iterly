'use strict'
const undefined = void 0
const {curry, isAsyncIter, each} = require('./tools')
const {setIt, iter} = require('./iter')


function enumerate(start, it) {
  if (arguments.length == 1)
    it = start, start = 0

  it = iter(it)
  var i = start, value, done, p
  var isAsync = isAsyncIter(it)

  if (isAsync) {
    var next = function next() {
      if (done)
        return p.then(v => (v.value = value, v))

      var j = i++
      return p = it.next().then(({value, done}) => Promise.all([value, done]))
      .then((v) => {
        done = v[1]
        value = done ? value : [j, v[0]]
        return {value, done}
      })
    }
  }
  else {
    var next = function next() {
      if (done)
        return {value, done}

      var v = it.next()
      done = v.done
      value = done ? value : [i++, v.value]
      return {value, done}
    }
  }

  return setIt({next}, isAsync)
}
enumerate.curry = curry(enumerate)

module.exports = enumerate
