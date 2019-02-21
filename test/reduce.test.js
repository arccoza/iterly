const test = require('tape')
const tapSpec = require('tap-spec')
const reduce = require('../src/reduce')


test.createStream()
.pipe(tapSpec())
.pipe(process.stdout)

test('reduce', t => {
  t.test('Should have only one, accumulated, item', function (t) {
    var arr = [-2,-1,0,1,2,3,4], i = 0
    var sum = 7
    var fn = {
      sum (acc, v, i) {
        t.equal(arguments.length, 3, 'should receive 3 arguments')
        t.equal(typeof acc, 'number', 'arg #1 should be a number')
        t.equal(typeof v, 'number', 'arg #2 should be a number')
        t.equal(typeof i, 'number', 'arg #3 should be a number')
  
        return acc + v
      },
      array (acc, v, i) {
        t.equal(arguments.length, 3, 'should receive 3 arguments')
        t.ok(Array.isArray(acc), 'arg #1 should be an array')
        t.equal(typeof v, 'number', 'arg #2 should be a number')
        t.equal(typeof i, 'number', 'arg #3 should be a number')
  
        return acc.push(v), acc
      },
      string (acc, v, i) {
        t.equal(arguments.length, 3, 'should receive 3 arguments')
        t.equal(typeof acc, 'string', 'arg #1 should be a string')
        t.equal(typeof v, 'number', 'arg #2 should be a number')
        t.equal(typeof i, 'number', 'arg #3 should be a number')
  
        return acc + v
      },
    }

    var it = reduce(fn.sum, 0, arr)
    t.equal(it.next().value, sum, 'item should be the sum of all items')
    t.ok(it.next().done, 'should have only one item')

    var it = reduce(fn.array, [], arr)
    t.same(it.next().value, arr, 'item should be an array of all items')
    t.ok(it.next().done, 'should have only one item')

    var it = reduce(fn.string, '', arr)
    t.equal(it.next().value, arr.join(''), 'item should be a string of all items')
    t.ok(it.next().done, 'should have only one item')
    
    t.end()
  })

  t.end()
})