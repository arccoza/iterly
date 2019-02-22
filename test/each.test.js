const test = require('tape')
const tapSpec = require('tap-spec')
const {each} = require('../src/tools')


test.createStream()
.pipe(tapSpec())
.pipe(process.stdout)

async function* genAsyncIt() {
  yield 'sam'
  yield Promise.resolve('bob')
  yield 'jon'
}

function* genSyncIt() {
  yield 'sam'
  yield Promise.resolve('bob')
  yield 'jon'
}

test('each should loop through an async iterator, unwrapping any promises', t => {
  var expected = ['sam', 'bob', 'jon']
  var i = 0
  each((value, done) => {
    if (done) {
      t.equal(i, 3)
    }
    t.same(value, expected[i++])
  }, genAsyncIt()).then(t.end)
})

test('each should loop through a sync iterator, leaving promises as is', t => {
  var expected = ['sam', Promise.resolve('bob'), 'jon']
  var i = 0
  each((value, done) => {
    if (done)
      t.equal(i, 3)
    t.same(value, expected[i++])
  }, genSyncIt())

  t.end()
})