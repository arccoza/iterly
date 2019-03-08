const map = require('./map')
const filter = require('./filter')
const reduce = require('./reduce')
const range = require('./range')
const enumerate = require('./enumerate')
const amap = require('./amap')
const afilter = require('./afilter')
const areduce = require('./areduce')
const {ITERATOR, ASYNC_ITERATOR, setIt, iter, iterArray, iterObject, iterFn, iterReadable} = require('./iter')
const {isFunction, isPromise, isAsyncIter, isArrayLike, curry, compose, toAsync, each, anext, schedule} = require('./tools')


module.exports = {
  map, filter, reduce,
  range, enumerate,
  amap, afilter, areduce,
  ITERATOR, ASYNC_ITERATOR, setIt, iter, iterArray, iterObject, iterFn, iterReadable,
  isFunction, isPromise, isAsyncIter, isArrayLike, curry, compose, toAsync, each, anext, schedule,
}
