'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {setIt, iter} = require('./iter')


/**
 * A function that keeps values in an iterator or iterable only if fn returns true.
 * @example
 * var it = filter(v => v != 2, [1, 2, 3, 4])
 * // Will give you an iterator with the values: 1, 3, 4
 * @param {function(value:any, index:number)} fn - The test function to filter items,
 * return true to keep the item, false to remove it.
 * @param {@@iterator} it - The iterator or iterable to filter.
 * @returns {@@iterator} - Returns an iterator with only the values that passed the test fn.
 */
function filter(fn, it) {
  it = iter(it)
  
  return setIt({
    next() {
      // This loop will just spin until done or it finds a value that passes the test
      for (var value, done; {value, done} = it.next(), done ? !done : !fn(value););
      return {value, done}
    }
  })
}

/**
* Allows you to curry the arguments, most useful when used with compose.
* @function
* @example
* var curried = filter.curry(v => v != 2)
* var it = [1, 2, 3, 4]
* it = curried(it)
* // Will give you an iterator with the values: 1, 3, 4
* @param {...any} args - The arguments to bind.
* @returns {curriedFunction} - The curried version of the original function, with bindable args.
*/
filter.curry = curry(filter)

module.exports = filter
