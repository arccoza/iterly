const undefined = void 0
const ITERATOR = Symbol && Symbol.iterator ? Symbol.iterator : '@@iterator'
const ASYNC_ITERATOR = Symbol && Symbol.asyncIterator ? Symbol.asyncIterator : '@@asyncIterator'


function setIt(it, async=false) {
  const fn = function() { return it }

  if (!async) {
    if (Symbol && Symbol.iterator && !it[Symbol.iterator]) 
      it[Symbol.iterator] = fn
    if (!it['@@iterator'])
      it['@@iterator'] = fn
  }
  else {
    if (Symbol && Symbol.asyncIterator && !it[Symbol.asyncIterator]) 
      it[Symbol.asyncIterator] = fn
    if (!it['@@asyncIterator'])
      it['@@asyncIterator'] = fn
  }

  return it
}

/**
 * Gets an iterator for any array-like; that is anything with a length property that
 * can be indexed with array[index] notation.
 * @example
 * var it = iterArray([1, 2, 3, 4])
 * // Will give you an iterator with the values: 1, 2, 3, 4
 * var it = iterArray([1, 2, 3, 4], 2)
 * // Will give you an iterator with the values: [1, 2], [3, 4]
 * @param {(Array|arrayLike)} a - The array-like to create an iterator from.
 * @param {number} [chunkSize=0] - If set larger than zero, will break the array up
 * into chunks of length chunkSize.
 * @returns {@@iterator} - Returns an iterator with the values from the array-like.
 */
function iterArray(a, chunkSize) {
  var i = 0
  
  if (chunkSize > 0)
    var next = function next() { return i < a.length ? {value: a.slice(i, (i += chunkSize))} : {done: true} }
  else
    var next = function next() { return i < a.length ? {value: a[i++]} : {done: true} }

  return setIt({next})
}

/**
 * Gets an iterator of [key, value] pairs for any javascript object.
 * @example
 * var it = iterObject({a: 1, b: 2, c: 3})
 * // Will give you an iterator with the values: [a, 1], [b, 2], [c, 3]
 * @param {Object} o - The object to create an iterator from. Only iterates over an objects own-properties.
 * @returns {@@iterator} - Returns an iterator with the [key, value] pairs from the object.
 */
function iterObject(o) {
  var keys = Object.keys(o), k, i = 0

  return setIt({
    next() {
      return i < keys.length ? {value: [(k = keys[i++]), o[k]], done: false} : {done: true}
    }
  })
}

function iterFn(fn, {sentinel, async=false}) {
  var value, o = {i: 0, sentinel}

  return setIt({
    next() {
      value = fn(o)
      o.i++

      if (async)
        return value.then(value => value !== sentinel ? {value} : {done: true})
      return value !== sentinel ? {value} : {done: true}
    }
  }, async)
}

function iterReadable(reader, chunkSize) {
  reader.pause()

  function canRead() {
    return new Promise((res, rej) => {
      reader.on('readable', function() {
        res({read: this.read.bind(this)})
      })
    })
  }
  
  var pRead = canRead()

  var pEnd = new Promise((res, rej) => {
    reader.on('end', function() {
      rej({end: true, error: undefined})
    })

    reader.on('error', function(error) {
      rej({end: true, error})
    })

    reader.on('close', function(error) {
      rej({end: true, error: undefined})
    })
  })

  const it = setIt({
    next() {
      var v
      return Promise.race([pRead, pEnd])
      .then(({read}) => {
        v = read(chunkSize)
        // console.log(v)
        if (v === null) {
          pRead = canRead()
          return this.next()
        }

        return {done: false, value: v}
      })
      .catch(({end, error}) => ({done: true, value: undefined, end, error}))
    }
  }, true)

  return it
}

function iter(obj, {async=false, sentinel=undefined}={}) {
  if (obj == null)
    return obj
  else if (obj[ITERATOR])
    return obj[ITERATOR]()
  else if (typeof obj.length === 'number')
    return iterArray(obj)
  else if (obj[ASYNC_ITERATOR])
    return obj[ASYNC_ITERATOR]()
  else if (obj.call && obj.apply && sentinel !== undefined)
    return iterFn(obj, {async, sentinel})

  
  // if (async) {
  //   if (obj[ASYNC_ITERATOR])
  //     return obj[ASYNC_ITERATOR]()
  // }
  // else {
  //   if (obj[ITERATOR])
  //     return obj[ITERATOR]()
  //   else if (Array.isArray(obj) || obj.charAt)
  //     return iterArray(obj)
  //   else if(!obj.call && !obj.apply)
  //     return iterObject(obj)
  // }

  // if (obj.next)
  //   return setIt(obj, async)
  // else if (obj.call && obj.apply && sentinel !== undefined)
  //   return iterFn(obj, {async, sentinel})
}


// var END = {}
// var it = iter(({i}) => Promise.resolve( i > 4 ? END : i * 2 ), {sentinel: END, async: true})
// it.next().then(console.log.bind(console))
// it.next().then(console.log.bind(console))
// it.next().then(console.log.bind(console))
// it.next().then(console.log.bind(console))
// it.next().then(console.log.bind(console))
// it.next().then(console.log.bind(console))


// var it = iter([1,2,3,4])
// for (var i of it) {
//   console.log(i)
//   if (i == 3)
//     break
// }
// console.log(it.closed)
// for (var i of it) {
//   console.log(i)
// }

// for (var [k, v] of iter({a: 1, b: 2, c: 3, d: 4})) {
//   console.log(k, v)
// }

// for (var i of iter(({i, v, END}) => i < 10 ? i * i : END)) {
//   console.log(i)
// }

module.exports = {ITERATOR, ASYNC_ITERATOR, setIt, iter, iterArray, iterObject, iterFn, iterReadable}
