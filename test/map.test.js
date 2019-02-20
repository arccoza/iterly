const t = require('tape')
const map = require('../src/map')


t('Each iter item should equal original value modified by fn', function (t) {
  var arr = [-2,-1,0,1,2,3,4], i = 0
  var fn = v => 2 * v
  var mapIt = map(fn, arr)

  for (var v of mapIt) {
    t.equal(v, fn(arr[i]))
    i++
  }
  
  t.end();
});