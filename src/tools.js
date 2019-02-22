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
  var isAsync = isAsyncIter(it)

  if (isAsync) {
    return it.next().then(function step({value, done}) {
      if (done)
        return fn(value, done)
      return fn(value), it.next().then(step)
    })
  }
  else {
    for (var value, done; {value, done} = it.next(), !done;)
      fn(value)
    fn(value, done)
  }
}


module.exports = {isFunction, isPromise, isAsyncIter, curry, compose, toAsync, each}