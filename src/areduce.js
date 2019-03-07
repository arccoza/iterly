'use strict'
const undefined = void 0
const {curry, anext} = require('./tools')
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
 * @param {number} [n=0] - If a value greater than 0 is provided, then areduce will create multiple,
 * grouped reductions, each made of `n` items, like a scan fn.
 * @param {function(accumulator:any, value:any, index:number)} fn - The reducer function continually updates
 * the accumulator, until the iterator / async-iterator ends, then the accumulated value is returned.
 * @param acc - The accumulator's initial value, each item in the iterator or iterable will be added to this by fn.
 * @param {@@iterator|@@asyncIterator} it - The iterator, iterable, async-iterator or async-iterable to reduce.
 * @returns {@@asyncIterator} - Returns an async-iterator with only one promised value.
 */
 // TODO: Investigate adding an `n` param, to return multiple reductions, each from `n` items.
function areduce(n, fn, acc, it) {
  if (arguments.length < 4)
    it = acc, acc = fn, fn = n, n = 0
  n = n < 0 ? 0 : n

  it = iter(it)
  var prev, done

  var op = function op(it, prev) {
    for (var i = 0, arr = []; arr.push(anext(it)), ++i < n;);
    arr.push(prev)
    
    var task = Promise.all(arr).then(arr => {
      arr.pop()
      for (var i = 0, l = arr.length, v; v = arr.shift(), !(v && v.done) && i < l; i++)
        acc = fn(acc, v.value)

      return Promise.resolve(acc).then(value => ({value: acc, done: !i}))
    })

    return n > 0 ? task : (done = true, task.then(v => v.done ? {value: v.value} : op(it)))
  }

  return setIt({
    next() {
      if (done)
        return prev

      var _prev = prev, task = op(it, _prev)
      prev = task.then(({value}) => ({value, done: true}))

      return task
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
