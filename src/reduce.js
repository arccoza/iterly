'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {setIt, iter} = require('./iter')


/**
 * A function that reduces all the items in an iterator or iterable to one value.
 * @example
 * var it = reduce((acc, v) => acc += v, 0, [1, 2, 3, 4])
 * // Will give you an iterator with the value: 10
 * var it = reduce((acc, v, i) => (acc[i] = v, acc), [], [1, 2, 3, 4])
 * // Will give you an iterator with a single item, which will be an array: [1, 2, 3, 4]
 * @param {function(accumulator:any, value:any, index:number)} fn - The reducer function continually updates
 * the accumulator, until the iterator ends, then the accumulated value is returned.
 * @param acc - The accumulator's initial value, each item in the iterator or iterable will be added to this by fn.
 * @param {@@iterator} it - The iterator or iterable to reduce.
 * @returns {@@iterator} - Returns an iterator with only one value.
 */
function reduce(fn, acc, it) {
  it = iter(it)
  var value, done

  return setIt({
    next() {
      if (done)
        return {value, done}

      for (var i = 0; {value, done} = it.next(), !done; i++) {
        acc = fn(acc, value, i)
      }

      value = acc
      return {value}
    }
  })
}

/**
* Allows you to curry the arguments, most useful when used with compose.
* @function
* @example
* var curried = reduce.curry((acc, val) => acc + val)
* var it = [1, 2, 3, 4]
* it = curried(it)
* // Will give you an iterator with the value: 10
* @param {...any} args - The arguments to bind.
* @returns {curriedFunction} - The curried version of the original function, with bindable args.
*/
reduce.curry = curry(reduce)


module.exports = reduce
