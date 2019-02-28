var Benchmark = require('benchmark')
var {setIt, iterArray} = require('..')
var versions = {'0.5': require('iterly0_5')}
var print = console.log.bind(console)


var suite = new Benchmark.Suite

suite
.add('amap 0.5', async function() {
  var it = versions['0.5'].amap(v => v * 2, createIt(4))
  var all = []
  all.push(it.next())
  all.push(it.next())
  all.push(it.next())
  all.push(it.next())
  all.push(it.next())
  all.push(it.next())
  await Promise.all(all)
})
.on('complete', function() {
  for (var bench of iterArray(this)) {
    console.log(`--- ${bench.name} ---`)
    console.log(`total: ${bench.times.elapsed}`)
    console.log(`mean: ${bench.stats.mean}\n`)
  }
})
.run({ 'async': true })

function createIt(max) {
  var i = 0
  return setIt({
    next() {
      var j = i++
      return new Promise((res, rej) => {
        if (j > max)
          return res({done: true})
        setTimeout(() => res({value: j}), 1000 / (j + 1))
      })
    }
  }, true)
}
