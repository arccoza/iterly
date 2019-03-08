'use strict'
const undefined = void 0
const {ITERATOR, ASYNC_ITERATOR, setIt, iter} = require('./iter')


function isFunction(fn) {
  return Boolean(fn && fn.call && fn.apply)
}

function isPromise(p) {
  return Boolean(p && p.then && p.catch)
}

function isAsyncIter(it) {
  return Boolean(it && !it[ITERATOR] && it[ASYNC_ITERATOR])
}

function isArrayLike(obj) {
  return typeof obj.length === 'number'
}

class Placeholder {  // Substitute, Dummy
  constructor() {
    this.isPlaceholder = true
  }
}

const __ = new Placeholder()


/**
* Returns a curried version of the provided function.
* @param {function} fn - The function to curry.
* @param {...any} [args] - Any arguments to bind.
* @returns {function} - Returns the curried function.
*/
function curry(fn, ...args) {
  const arity = fn.length

  return function curried(...more) {
    more = args.concat(more)

    if (more.length < arity)
      return curry(fn, ...more)
    else
      return fn(...more)
  }
}

/**
* Perhaps the most useful function here; allows you to compose (combine)
* other functions into one new function that takes one argument of
* an iterable, async-iterable, iterator, or async-iterator.
* @example
* var urlPrefix = 'http://some.resource.com/'
* var files = ['file.txt', 'file2.txt', 'file3.txt', 'file4.txt']
* 
* var getShortTexts = compose(
*   filter.curry(file => file != 'file3.txt'), // Removes file3.txt
*   map.curry(file => urlPrefix + file), // Adds the url prefix to the file names, creating the file url
*   amap.curry(url => fetch(url).then(res => res.text())), // Fetches the files from the web
*   afilter.curry(txt => txt.length <= 140), // Removes files longer than 140 characters
* )
* 
* each(txt => console.log(txt), getShortTexts([files]))
* // Will print out the contents of the files with 140 or fewer chracters, skipping file3.txt.
* @param {...function} fns - Any number of functions to combine.
* @returns {function(it:anyIterableOrAsyncIterable)} - The composed function.
*/
function compose(...fns) {
  return function(it) {
    for (var i = 0, fn; fn = fns[i]; i++)
      it = fn(it)
    return it
  }
}

function toAsync(it) {
  it = iter(it)

  if (it == null)
    return it

  return setIt({
    next() {
      var nv = it.next()
      if (isPromise(nv))
        return nv
      return Promise.all([nv.value, nv.done]).then(([value, done]) => ({value, done}))
    }
  }, true)
}

/**
* Loops over any iterable, async-iterable, iterator, async-iterator or array-like,
* calling fn for each item. If looping over an async-iterable / async-iterator
* a promise will be returned by each with the value of the final return from fn.
* @example
* each((value) => console.log(value), [1, 2, 3, 4])
* // Will print:
* // 1
* // 2
* // 3
* // 4
* @param {number} [x=1] - The number of async items to run in parallel, has no effect on sync iterables.
* @param {function(value)|function(value, done)} fn - The fn to call for each item. The function will be called
* for every value in the iterable / async-iterable. If the function has a second param (done) then
* the loop function will be called when the iterable / async-iterable is done, with a done value of true.
* If no second param (done) is provided then the loop function will only be called with the values from
* the iterable / async-iterable.
* @param {iterable|asyncIterable} it - The iterable, async-iterable, iterator, async-iterator or array-like
* to loop over.
* @returns {Promise|undefined} - Returns a Promise that resolves to the last value returned by fn if looping
* over an async-iterable. If looping over an iterable returns undefined.
*/
function each(x, fn, it) {
  if (arguments.length < 3)
    it = fn, fn = x, x = 1
  x = x < 1 ? 1 : x

  it = iter(it)
  var isAsync = isAsyncIter(it), value, done, ret
  var runDone = fn.length >= 2

  if (isAsync) {
    return new Promise(function step(res, rej) {
      // Grab `x` tasks, to run in parallel
      for (var tasks = []; tasks.push(it.next()) < x;);

      // Wait for all tasks to run
      Promise.all(tasks).then(tasks => {
        for (var i = 0, v; v = tasks[i], i < tasks.length;) {
          done = v.done
          if (!done || runDone)
            tasks[i++] = fn(v.value, v.done)
          if (done)
            break
        }
        // Wait for any returned promises, return the last task's value
        return Promise.all(tasks).then(v => v[i - 1])
      })
      // If done, resolve, otherwise step again
      .then(v => done ? res(v) : step(res, rej)).catch(rej)
    })
  }
  else {
    for (var value, done; {value, done} = it.next(), !done;)
      ret = fn(value)
    !runDone ? ret : ret = fn(value, done)
  }
}

function anext(it) {
  var v = it.next()
  return Promise.resolve(v)
  .then(({value, done}) => Promise.all([value, done]))
  .then(([value, done]) => ({value, done}))
}


module.exports = {isFunction, isPromise, isAsyncIter, isArrayLike, curry, compose, toAsync, each, anext}
