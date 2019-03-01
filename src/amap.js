'use strict'
const undefined = void 0
const {curry, toAsync, isPromise, anext} = require('./tools')
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
  if (it.isTasked)
    return it

  it = iter(it)

  var obj = {
    isTasked: true,
    it,
    jobs: [],
    tickets: [],
    check() {
      var {jobs, tickets} = this
      while (jobs[0] && jobs[0].ok) {
        var job = jobs.shift()
        if (!job.skip)
          tickets.shift()(job)
      }
      console.log('tickets: ', tickets.length)
    },
    nextJob(op) {
      var {it, jobs, tickets, check} = this
      var done, job = anext(it).then(v => op(v, job)).then(v => (done = v.done, v.value)).then(value => ({value, done}))
      console.log(jobs.push(job))
      job.then(v => (job.ok = true, check(), v))
    },
    next(op, needsTicket=true) {
      var {tickets} = this
      this.nextJob(op)

      if (needsTicket)
        return new Promise(res => tickets.push(res))
    }
  }
  obj.check = obj.check.bind(obj)
  obj.next = obj.next.bind(obj)

  return setIt(obj, true)
}


function amap2(fn, it) {
  // it = toAsync(iter(it))
  it = taskMaster(it)
  var _next = it.next

  it.next = function next(op) {
    return _next((v, job) => {
      if (!v.done) {
        v.value = fn(v.value)
        if (op)
          v = isPromise(v.value) ? v.value.then(value => op({value}, job)) : op(v, job)
      }
      return v
    })
  }

  return it
}

function afilter2(fn, it) {
  var _next = it.next
  it.next = function next(op) {
    return _next(function step(v, job) {
      if (!v.done && !fn(v.value)) {
        // console.log('oi', v)
        job.skip = true
        it.nextJob(step)
      }
      return v
    })
  }
  return it
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
var m3 = amap2(v => ((v *= 2), v == 4 ? new Promise((res, rej) => setTimeout(res.bind(null, v), 5000)) : v), createIt(4))
m3 = afilter2(v => v != 4, m3)
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
