const test = require('tape')
const filter = require('../src/filter')

test('filter', t => {
  t.test('Should keep items that pass test fn, and maintain original order', function (t) {
    var arr = [-2,-1,0,1,2,3,4], i = 0
    var expected = [-1,0,1,2,4]
    var fn = v => v != -2 && v != 3
    var it = filter(fn, arr)

    for (var v of it) {
      t.equal(v, expected[i])
      i++
    }
    
    t.end()
  })

  t.test('Should have fewer items than original', function (t) {
    var arr = [1,2,3,4], res
    var fn = v => v != 2
    var it = filter(fn, arr)

    it.next()
    it.next()
    it.next()
    res = it.next()

    t.ok(res.done)
    
    t.end()
  })

  t.end()
})