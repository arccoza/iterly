'use strict'
const undefined = void 0
const {curry, toAsync, isPromise} = require('./tools')
const {setIt, iter} = require('./iter')


/**
 * A function that maps iterator, iterable, async-iterator or async-iterable values over a function.
 * @example
 * var it = amap(v => 2 * v, [1, 2, 3, 4])
 * // Will give you an async-iterator with the promised values: 2, 4, 6, 8
 *
 * var urls = ['http://some.resource.com/file.txt', 'http://some.resource.com/file2.txt']
 * var it = amap(url => fetch(url).then(res => res.text()), urls)
 * it = amap(txt => txt.slice(0, 140), it)
 * each(txt => console.log(txt), it)
 * // Will print the first 140 characters of text for each file referenced by the urls
 * @param {function(value:any, index:number)} fn - The function to modify each value in the iterator.
 * @param {@@iterator|@@asyncIterator} it - The iterator, iterable, async-iterator or async-iterable to map over.
 * @returns {@@asyncIterator} - Returns an async-iterator with values returned by fn.
 */
function amap(fn, it) {
  it = toAsync(iter(it))
  var value, done, p
  
  return setIt({
    next() {
      if (done)
        return p
      return p = it.next()
      .then(v => Promise.all([v.value, v.done]))
      .then(v => {
        done = v[1]
        if (done)
          return {value, done}
        value = fn(v[0])
        return isPromise(value) ? value.then(v => ({value: (value = v), done})) : {value, done}
      })
    }
  }, true)
}

/**
* Allows you to curry the arguments, most useful when used with compose.
* @function
* @example
* var curried = amap.curry(v => 2 * v)
* var it = [1, 2, 3, 4]
* it = curried(it)
* // Will give you an async-iterator with the promised values: 2, 4, 6, 8
* @param {...any} args - The arguments to bind.
* @returns {curriedFunction} - The curried version of the original function, with bindable args.
*/
amap.curry = curry(amap)


function taskMaster(it) {
  var obj = {
    it,
    jobs: [],
    tickets: [],
    check() {
      var {jobs, tickets} = this
      while (jobs[0] && jobs[0].ok) {
        tickets.shift()(jobs.shift())
      }
    },
    next(fn) {
      var {it, jobs, tickets, check} = this
      var job = it.next().then(v => fn(v, job))
      jobs.push(job)
      job.then(check)
      return new Promise(res => tickets.push(res))
    }
  }
  obj.check = obj.check.bind(obj)
  obj.next = obj.next.bind(obj)

  return setIt(obj, true)
}


function amap2(fn, it) {
  it = toAsync(iter(it))
  var t = taskMaster(it)
  
  return setIt({
    next() {
      return t.next((v, job) => {
        if (!v.done)
          v.value = fn(v.value)
        job.ok = true
        return v
      })
    }
  }, true)
}

function createIt(max) {
  var i = 0
  return setIt({
    next() {
      var j = i++
      return new Promise((res, rej) => {
        if (j > max)
          return res({done: true})
        // if (j == 2)
        //   return res({value: createIt(2)})
        setTimeout(() => res({value: j}), 1000 / (j + 1))
      })
    }
  }, true)
}

var m1 = amap(v => v, createIt(4))
var m2 = amap(v => v, createIt(4))
var m3 = amap2(v => v, createIt(4))
var print = console.log.bind(console)


// var all = []
// var start = process.hrtime()
// all.push(m1.next().then(print))
// all.push(m1.next().then(print))
// all.push(m1.next().then(print))
// all.push(m1.next().then(print))
// all.push(m1.next().then(print))
// all.push(m1.next().then(print))
// Promise.all(all).then(_ => print('m1 -> ', process.hrtime(start)))

// var start = process.hrtime()
// var a = async () => {
//   print(await m2.next())
//   print(await m2.next())
//   print(await m2.next())
//   print(await m2.next())
//   print(await m2.next())
//   print(await m2.next())
// }
// a().then(_ => print('m2 -> ', process.hrtime(start)))

var all = []
var start = process.hrtime()
all.push(m3.next().then(print))
all.push(m3.next().then(print))
all.push(m3.next().then(print))
all.push(m3.next().then(print))
all.push(m3.next().then(print))
all.push(m3.next().then(print))
Promise.all(all).then(_ => print('m3 -> ', process.hrtime(start)))


module.exports = amap
