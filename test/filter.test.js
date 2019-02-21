const test = require('tape')
const tapSpec = require('tap-spec')
const filter = require('../src/filter')


test.createStream()
.pipe(tapSpec())
.pipe(process.stdout)

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

    t.equal(i, arr.length - 2, 'should have fewer items than original')
    
    t.end()
  })

  t.end()
})