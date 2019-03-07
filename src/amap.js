'use strict'
const undefined = void 0
const {curry, toAsync, isPromise, anext} = require('./tools')
const {setIt, iter} = require('./iter')


/**
 * A function that maps iterator, iterable, async-iterator or async-iterable values over a function.
 * @example
 * var it = amap(v => 2 * v, [1, 2, 3, 4])
 * // Will give you an async-iterator with the promised values: 2, 4, 6, 8
 *
 * var urls = ['http://some.resource.com/file.txt', 'http://some.resource.com/file2.txt']
 * var it = amap(url => fetch(url).then(res => res.text()), urls)
 * it = amap(txt => txt.slice(0, 140), it)
 * each(txt => console.log(txt), it)
 * // Will print the first 140 characters of text for each file referenced by the urls
 * @param {function(value:any, index:number)} fn - The function to modify each value in the iterator.
 * @param {@@iterator|@@asyncIterator} it - The iterator, iterable, async-iterator or async-iterable to map over.
 * @returns {@@asyncIterator} - Returns an async-iterator with values returned by fn.
 */
function amap(fn, it) {
  it = iter(it)
  var prev

  return setIt({
    next() {
      var _prev = prev
      var task = start(fn, anext(it))

      return prev = Promise.all([task, _prev]).then(strip)
    }
  }, true)
}

// Helper fn
function start(fn, task) {
  return task.then(v => {
    if (v.done)
      return v
    return Promise.resolve(fn(v.value)).then(value => ({value}))
  })
}

// Helper fn
function strip([v, prev]) {
  return v.done ? (v.value = prev.value, v) : v
}

/**
* Allows you to curry the arguments, most useful when used with compose.
* @function
* @example
* var curried = amap.curry(v => 2 * v)
* var it = [1, 2, 3, 4]
* it = curried(it)
* // Will give you an async-iterator with the promised values: 2, 4, 6, 8
* @param {...any} args - The arguments to bind.
* @returns {curriedFunction} - The curried version of the original function, with bindable args.
*/
amap.curry = curry(amap)


module.exports = amap
