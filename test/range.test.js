const test = require('tape')
const tapSpec = require('tap-spec')
const {iter} = require('../src/iter')
const {Range, range} = require('../src/range')


test.createStream()
.pipe(tapSpec())
.pipe(process.stdout)

test('range', t => {
  t.test('Constructor should be able to take variable arguments', function (t) {
    var r = new Range()
    t.comment(JSON.stringify(r))
    t.equal(r.start, 0)
    t.equal(r.stop, 0)
    t.equal(r.step, 1)

    var r = new Range(4)
    t.comment(JSON.stringify(r))
    t.equal(r.start, 0)
    t.equal(r.stop, 4)
    t.equal(r.step, 1)

    var r = new Range(1, 4)
    t.comment(JSON.stringify(r))
    t.equal(r.start, 1)
    t.equal(r.stop, 4)
    t.equal(r.step, 1)

    var r = new Range(1, 4, 2)
    t.comment(JSON.stringify(r))
    t.equal(r.start, 1)
    t.equal(r.stop, 4)
    t.equal(r.step, 2)

    var r = new Range(null, 4, 2)
    t.comment(JSON.stringify(r))
    t.equal(r.start, 0)
    t.equal(r.stop, 4)
    t.equal(r.step, 2)

    var r = new Range(4, null, 2)
    t.comment(JSON.stringify(r))
    t.equal(r.start, 4)
    t.equal(r.stop, 0)
    t.equal(r.step, 2)

    var r = new Range(-1, -4)
    t.comment(JSON.stringify(r))
    t.equal(r.start, -1)
    t.equal(r.stop, -4)
    t.equal(r.step, 1)

    var r = new Range(-1, -4, -2)
    t.comment(JSON.stringify(r))
    t.equal(r.start, -1)
    t.equal(r.stop, -4)
    t.equal(r.step, -2)

    t.end()
  })

  var ranges = [
    {args: [null, null], expected: []},
    {args: [1, null], expected: []},
    {args: [null, 6], expected: [0,1,2,3,4,5]},
    {args: [null, null, null], expected: []},
    {args: [1, null, null], expected: []},
    {args: [null, 6, null], expected: [0,1,2,3,4,5]},
    {args: [], expected: []},
    {args: [6], expected: [0,1,2,3,4,5]},
    {args: [1, 6], expected: [1,2,3,4,5]},
    {args: [6, 1], expected: []},
    {args: [1, 6, 2], expected: [1,3,5]},
    {args: [0, 6, 2], expected: [0,2,4]},
    {args: [1, 6, 3], expected: [1,4]},
    {args: [0, 6, 3], expected: [0,3]},
    {args: [6, 1, 2], expected: []},
    {args: [6, 0, 2], expected: []},
    {args: [6, 1, -2], expected: [6,4,2]},
    {args: [6, 0, -2], expected: [6,4,2]},
    {args: [6, 1, -3], expected: [6,3]},
    {args: [6, 0, -3], expected: [6,3]},
    {args: [-6, 0, -2], expected: []},
    {args: [-6, 0, 2], expected: [-6,-4,-2]},
    {args: [-6, 1, 2], expected: [-6,-4,-2, 0]},
  ]

  t.test('new Range, Range.new and range should all produce the same object', function (t) {
    for (var {args} of ranges) {
      var expected = new Range(...args)
      t.same(Range.new(...args), expected, `Range.new(${args}) should create the same object as new Range(${args})`)
      t.same(range(...args), expected, `range(${args}) should create the same object as new Range(${args})`)
    }

    t.end()
  })

  t.test('lengths should be equal', function (t) {
    for (var {args, expected} of ranges) {
      var r = new Range(...args)
      t.equal(r.length, expected.length, `range ${JSON.stringify(r)} length should be ${expected.length}`)
    }

    t.end()
  })

  t.test('iter() should give an iterator for the range', function (t) {
    for (var {args, expected} of ranges) {
      var r = new Range(...args)
      var arr = Array.from(iter(r))
      t.same(arr, expected, `range iter ${JSON.stringify(r)} should be ${JSON.stringify(expected)}`)
    }

    t.end()
  })

  t.test('values() should give an iterator for the range', function (t) {
    for (var {args, expected} of ranges) {
      var r = new Range(...args)
      var values = Array.from(r.values())
      t.same(values, expected, `range.values() ${JSON.stringify(r)} should be ${JSON.stringify(expected)}`)
    }

    t.end()
  })

  t.test('entries() should give an iterator for the range', function (t) {
    for (var {args, expected} of ranges) {
      var r = new Range(...args)
      var entries = Array.from(r.entries())
      t.same(entries, expected.map(v => [v,v]), `range.entries() ${JSON.stringify(r)} should be ${JSON.stringify(expected.map(v => [v,v]))}`)
    }

    t.end()
  })

  // t.test('get(index) should fetch values at index', function (t) {
  //   for (var {args, expected} of ranges) {
  //     var r = new Range(...args)
  //     var entries = Array.from(r.entries())
  //     r.get(arg)
  //   }

  //   t.end()
  // })

  t.end()
})