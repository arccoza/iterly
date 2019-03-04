'use strict'
const undefined = void 0
const {curry, toAsync, isPromise, anext} = require('./tools')
const {setIt, iter} = require('./iter')
const afilter = require('./afilter')


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

  return setIt({
    next() {
      var _prev = prev
      return prev = anext(it).then(v => {
        if (!v.done)
          v.value = fn(v.value)
        return Promise.all([v.value, v.done, _prev])
        .then(([value, done, prev]) => {
          value = done ? prev.value : value          
          return {value, done}
        })
      })
    }
  })
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
  var prev = Promise.resolve(), tasks = []
  var enqueue = () => {
    var task = prev = anext(it).then(v => {
      return Promise.all([v, v.done || fn(v.value)])
    })

    tasks.push(task)
    return task
  }
  var validate = ([v, ok]) => {
    if (ok)
      return v
    enqueue()
    return tasks.shift().then(validate)
  }

  return setIt({
    tasks,
    next() {
      var _prev = prev
      var task = enqueue()
      console.log(tasks.length)
      
      return _prev.then(() => tasks.shift().then(validate))
    }
  })
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

// var m1 = amap(v => v, createIt(4))
// var m2 = amap(v => v, createIt(4))
// var m3 = amap2(v => ((v *= 2), v == 4 ? new Promise((res, rej) => setTimeout(res.bind(null, v), 5000)) : v), createIt(4))
// var m3 = amap2(v => ((v *= 2), v == 4 ? new Promise((res, rej) => setTimeout(rej.bind(null, v), 5000)) : v), createIt(4))
var m3 = amap3(v => v *= 2, createIt(4))
m3 = afilter3(v => v != 4 && v != 6, m3)
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
Promise.all(all).then(_ => print('m3 -> ', process.hrtime(start), m3.tasks)).catch(print)


module.exports = supervise
