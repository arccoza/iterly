'use strict'
const undefined = void 0
const {curry, toAsync, isPromise, anext, each, isAsyncIter} = require('./tools')
const {range} = require('./range')
const {setIt, iter} = require('./iter')
const amap = require('./amap')
const afilter = require('./afilter')
const areduce = require('./areduce')


function checkJobs(err) {
  var {jobs, tickets} = this
  while (jobs[0] && jobs[0].ok) {
    var job = jobs.shift()
    if (!job.skip)
      tickets.shift()(job)
  }
}

function addSrc(it) {
  return this.src.push(it)
}

function getTask() {
  return anext(this.src[0])
}

function addJob(op) {
  var done, job = this.getTask().then(v => op(v, job)).then(v => (done = v.done, v.value)).then(value => ({value, done}))
  var i = this.jobs.push(job)
  job.then(v => (job.ok = true, this.checkJobs(), v)).catch(err => (job.ok = false, this.checkJobs(err), err))
  return job
}

function addTicket() {
  return new Promise(res => this.tickets.push(res))
}

function next(op) {
  var ticket = this.addTicket()
  this.addJob(op)
  return ticket
}

function supervise(it) {
  if (it.isSupervised)
    return it

  it = iter(it)

  var obj = Object.defineProperties({}, {
    src: {
      value: [it],
      writable: false,
      enumerable: false,
    },
    jobs: {
      value: [],
      writable: false,
      enumerable: false,
    },
    tickets: {
      value: [],
      writable: false,
      enumerable: false,
    },
    isSupervised: {
      value: true,
      writable: false,
      enumerable: false,
    },
  })

  obj.checkJobs = checkJobs.bind(obj)
  obj.addSrc = addSrc.bind(obj)
  obj.getTask = getTask.bind(obj)
  obj.addJob = addJob.bind(obj)
  obj.addTicket = addTicket.bind(obj)
  obj.next = next.bind(obj)

  return setIt(obj, true)
}


function amap2(fn, it) {
  it = supervise(it)
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

function amap3(fn, it) {
  it = iter(it)
  var prev

  function start(task) {
    return task.then(v => {
      if (v.done)
        return v
      return Promise.resolve(fn(v.value)).then(value => ({value}))
    })
  }

  function strip([v, prev]) {
    return v.done ? (v.value = prev.value, v) : v
  }

  return setIt({
    next() {
      var _prev = prev
      var task = start(anext(it))

      return prev = Promise.all([task, _prev]).then(strip)
    }
  }, true)
}

async function* amapn(fn, it) {
  it = iter(it)

  while (true) {
    var v = await anext(it)
    
    if (!v.done) {
      v.value = await fn(v.value)
      yield v.value
    }
    else
      return
  }
}

function afilter2(fn, it) {
  var _next = it.next

  it.next = function next(op) {
    return _next(function step(v, job) {
      if (!v.done && !fn(v.value)) {
        job.skip = true
        it.addJob(step)
      }
      return v
    })
  }

  return it
}

function afilter3(fn, it) {
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

function areduce2(n, fn, acc, it) {
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


function createIt(max) {
  var i = 0
  return setIt({
    next() {
      var j = i++
      return new Promise((res, rej) => {
        if (j >= max)
          return res({done: true})
        // if (j == 2)
        //   return res({value: createIt(2)})
        setTimeout(() => res({value: j}), 1000 / (j + 1))
      })
    }
  }, true)
}

// var m1 = amap(v => v, createIt(4))
// var m2 = amap(v => v, createIt(4))
// var m3 = amap2(v => ((v *= 2), v == 4 ? new Promise((res, rej) => setTimeout(res.bind(null, v), 5000)) : v), createIt(4))
// var m3 = amap2(v => ((v *= 2), v == 4 ? new Promise((res, rej) => setTimeout(rej.bind(null, v), 5000)) : v), createIt(4))
var m3 = createIt(4)
// var m3 = range(4000)
// m3 = toAsync(m3)
var m3 = amap(v => v *= 2, m3)
// m3 = afilter(v => v != 4 && v != 6, m3)
// m3 = areduce2(2, (acc, v) => acc + v, 0, m3)
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
all.push(m3.next().then(print))
Promise.all(all).then(_ => print('m3 -> ', process.hrtime(start), m3.tasks)).catch(print)

function each2(x, fn, it) {
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
        // Wait for any returned promises, return the last tasks value
        return Promise.all(tasks).then(v => v[i - 1])
      })
      // If done, resolve, otherwise step again
      .then(v => done ? res(v) : step(res, rej))
    })
  }
  else {
    for (var value, done; {value, done} = it.next(), !done;)
      ret = fn(value)
    runDone ? ret : ret = fn(value, done)
  }
}

// var start = process.hrtime()
// each2(33, function(v, d) {
//   if (v % 1000 == 0) {
//     var used = process.memoryUsage().heapUsed / 1024 / 1024
//     print(v, used)
//   }
//   // print(arguments[0], arguments[1])
//   return v
// }, m3)
// .then(v => print(v, process.hrtime(start)))

async function eachNative(it) {
  while (true) {
    var v = await it.next()

    if (v.value % 1000 == 0) {
      var used = process.memoryUsage().heapUsed / 1024 / 1024
      print(v, used)
    }

    if (v.done)
      break
  }
}

// var start = process.hrtime()
// eachNative(m3).then(v => print(process.hrtime(start)))


function forAwaitEach(source, callback, thisArg) {
  var asyncIterator = source
  if (asyncIterator) {
    var i = 0
    return new Promise(function(resolve, reject) {
      function next() {
        asyncIterator
          .next()
          .then(function(step) {
            if (!step.done) {
              Promise.resolve(callback.call(thisArg, step.value, i++, source))
                .then(next)
                .catch(reject)
            } else {
              resolve()
            }
            // Explicitly return null, silencing bluebird-style warnings.
            return null
          })
          .catch(reject)
        // Explicitly return null, silencing bluebird-style warnings.
        return null
      }
      next()
    })
  }
}

// var start = process.hrtime()
// forAwaitEach(m3, (v) => {
//   if (v % 1000000 == 0) {
//     var used = process.memoryUsage().heapUsed / 1024 / 1024
//     print(v, used)
//   }
//   return v
// }).then(_ => print('done', process.hrtime(start)))

module.exports = supervise