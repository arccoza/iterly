const test = require('tape')
const map = require('../src/map')

test('map', t => {
  t.test('Should have the same items, modified by fn, in the same order as original', function (t) {
    var arr = [-2,-1,0,1,2,3,4], i = 0
    var fn = v => 2 * v
    var mapIt = map(fn, arr)

    for (var v of mapIt) {
      t.equal(v, fn(arr[i]))
      i++
    }
    
    t.end()
  })

  t.test('Should have the same number of items as original', function (t) {
    var arr = [1,2,3,4], res
    var fn = v => v
    var mapIt = map(fn, arr)

    mapIt.next()
    mapIt.next()
    mapIt.next()
    mapIt.next()
    res = mapIt.next()

    t.ok(res.done)
    
    t.end()
  })

  t.end()
})