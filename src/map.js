'use strict'
const undefined = void 0
const {curry} = require('./tools')
const {setIt, iter} = require('./iter')


/**
 * A function that maps iterator or iterable values over a function.
 * @example
 * var it = map(v => 2 * v, [1, 2, 3, 4])
 * // Will give you an iterator with the values: 2, 4, 6, 8
 * @param {function(value:any, index:number)} fn - The function to modify each value in the iterator.
 * @param {@@iterator} it - The iterator or iterable to map over.
 * @returns {@@iterator} - Returns an iterator with values that will be updated by fn.
 */
function map(fn, it) {
  it = iter(it)
  
  return setIt({
    next() {
      var {value, done} = it.next()
      return done ? {done} : {value: fn(value),  done}
    }
  })
}

/**
* Allows you to curry the arguments, most useful when used with compose.
* @function
* @example
* var curried = map.curry(v => 2 * v)
* var it = [1, 2, 3, 4]
* it = curried(it)
* // Will give you an iterator with the values: 2, 4, 6, 8
* @param {...any} args - The arguments to bind.
* @returns {curriedFunction} - The curried version of the original function, with bindable args.
*/
map.curry = curry(map)


module.exports = map
