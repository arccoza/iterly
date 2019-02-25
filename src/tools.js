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

function each(fn, it) {
  it = iter(it)
  var isAsync = isAsyncIter(it), value, done
  var skipDone = fn.length < 2

  if (isAsync) {
    return it.next().then(function step(v) {
      ({value, done} = v)
      if (done)
        return skipDone ? Promise.resolve(value) : fn(value, done)
      return fn(value), it.next().then(step)
    })
  }
  else {
    for (var value, done; {value, done} = it.next(), !done;)
      fn(value)
    skipDone ? value : fn(value, done)
  }
}

function anext(it) {
  var v = it.next()
  return Promise.resolve(v)
  .then(({value, done}) => Promise.all([value, done]))
  .then(([value, done]) => ({value, done}))
}


module.exports = {isFunction, isPromise, isAsyncIter, curry, compose, toAsync, each, anext}
