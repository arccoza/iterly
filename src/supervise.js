'use strict'
const undefined = void 0
const {curry, toAsync, isPromise, anext} = require('./tools')
const {setIt, iter} = require('./iter')


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


module.exports = supervise
