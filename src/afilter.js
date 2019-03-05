'use strict'
const undefined = void 0
const {curry, isPromise, anext} = require('./tools')
const {setIt, iter} = require('./iter')


/**
 * A function that keeps values in an iterator, iterable, async-iterator or async-iterable,
 * only if fn returns true.
 * @example
 * var it = afilter(v => v != 2, [1, 2, 3, 4])
 * // Will give you an async-iterator with the promised values: 1, 3, 4
 *
 * var urls = ['http://some.resource.com/file.txt', 'http://some.resource.com/file2.txt']
 * var it = amap(url => fetch(url).then(res => res.text()), urls)
 * it = afilter(txt => txt.length < 140, it)
 * each(txt => console.log(txt), it)
 * // Will only print the text of the files, referenced by the urls, with fewer than 140 characters
 * @param {function(value:any, index:number)} fn - The test function to filter items,
 * return true to keep the item, false to remove it.
 * @param {@@iterator|@@asyncIterator} it - The iterator, iterable, async-iterator or async-iterable to filter.
 * @returns {@@asyncIterator} - Returns an async-iterator with the values that passed the test fn.
 */
function afilter(fn, it) {
  it = iter(it)
  var prev, tasks = []

  function enqueue(fn, task) {
    task = task.then(v => {
      return Promise.all([v, v.done || fn(v.value)])
    })

    tasks.push(task)
    return task
  }

  function validate([v, ok]) {
    if (ok)
      return v
    enqueue(fn, anext(it))
    return tasks.shift().then(validate)
  }

  function shift() {
    return tasks.shift().then(validate)
  }

  return setIt({
    // tasks,
    next() {
      var _prev = prev
      enqueue(fn, anext(it))

      return prev = Promise.resolve(_prev).then(shift)
    }
  }, true)
}

/**
* Allows you to curry the arguments, most useful when used with compose.
* @function
* @example
* var curried = afilter.curry(v => v != 2)
* var it = [1, 2, 3, 4]
* it = curried(it)
* // Will give you an async-iterator with the promised values: 1, 3, 4
* @param {...any} args - The arguments to bind.
* @returns {curriedFunction} - The curried version of the original function, with bindable args.
*/
afilter.curry = curry(afilter)

module.exports = afilter
