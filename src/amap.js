'use strict'
const undefined = void 0
const {curry, toAsync, isPromise} = require('./tools')
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
