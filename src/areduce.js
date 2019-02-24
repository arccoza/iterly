'use strict'
const undefined = void 0
const {curry, toAsync} = require('./tools')
const {setIt, iter} = require('./iter')


/**
 * A function that reduces an iterator, iterable, async-iterator or async-iterable to one promised value.
 * @example
 * var it = areduce((acc, v) => acc += v, 0, [1, 2, 3, 4])
 * // Will give you an async-iterator with the promised value: 10
 *
 * var urls = ['http://some.resource.com/file.txt', 'http://some.resource.com/file2.txt']
 * var it = amap(url => fetch(url).then(res => res.text()), urls)
 * it = areduce((acc, txt) => acc + txt.slice(0, 140), '', it)
 * each(txt => console.log(txt), it)
 * // Will print the combined 280 characters of text from each file referenced by the urls
 * @param {function(accumulator:any, value:any, index:number)} fn - The reducer function continually updates
 * the accumulator, until the iterator / async-iterator ends, then the accumulated value is returned.
 * @param acc - The accumulator's initial value, each item in the iterator or iterable will be added to this by fn.
 * @param {@@iterator|@@asyncIterator} it - The iterator, iterable, async-iterator or async-iterable to reduce.
 * @returns {@@asyncIterator} - Returns an async-iterator with only one promised value.
 */
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

/**
* Allows you to curry the arguments, most useful when used with compose.
* @function
* @example
* var curried = areduce.curry((acc, val) => acc + val)
* var it = [1, 2, 3, 4]
* it = curried(it)
* // Will give you an async-iterator with the promised value: 10
* @param {...any} args - The arguments to bind.
* @returns {curriedFunction} - The curried version of the original function, with bindable args.
*/
areduce.curry = curry(areduce)


module.exports = areduce