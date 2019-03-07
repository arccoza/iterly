'use strict'
const undefined = void 0
const {curry, isAsyncIter, each} = require('./tools')
const {setIt, iter} = require('./iter')


/**
* Enumerate takes an iterable, async-iterable, iterator, or async-iterator
* and returns the same with its values updated with an [index, value] pair,
* starting at 0 or at the optional start arg.
* @example
* var arr = ['a', 'b', 'c', 'd']
* var it = enumerate(arr)
* // Will give you an iterator with the values: [0, 'a'], [1, 'b'], [2, 'c'], [3, 'd']
* @param {number} [start=0] - The optional index start.
* @param {(iterable|asyncIterable)} it - The iterable or async-iterable to return.
* @returns {(iterator|asyncIterator)} - Returns an iterator or async-iterator with
* the [index, value] pair items.
*/
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