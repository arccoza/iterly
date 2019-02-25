# Description

An iterator / async-iterator library with support for old platforms that don't have iterables or async-iterables.
Iterly provides several useful functions for composing, manipulating and iterating through iterables,
async-iterables, arrays, streams, and array-like objects such as nodejs Buffer.

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [map](#map)
    -   [Parameters](#parameters)
    -   [Examples](#examples)
    -   [curry](#curry)
        -   [Parameters](#parameters-1)
        -   [Examples](#examples-1)
-   [filter](#filter)
    -   [Parameters](#parameters-2)
    -   [Examples](#examples-2)
    -   [curry](#curry-1)
        -   [Parameters](#parameters-3)
        -   [Examples](#examples-3)
-   [reduce](#reduce)
    -   [Parameters](#parameters-4)
    -   [Examples](#examples-4)
    -   [curry](#curry-2)
        -   [Parameters](#parameters-5)
        -   [Examples](#examples-5)
-   [Range](#range)
    -   [Parameters](#parameters-6)
    -   [ITERATOR](#iterator)
    -   [values](#values)
    -   [entries](#entries)
    -   [get](#get)
        -   [Parameters](#parameters-7)
    -   [has](#has)
        -   [Parameters](#parameters-8)
    -   [indexOf](#indexof)
        -   [Parameters](#parameters-9)
    -   [new](#new)
        -   [Parameters](#parameters-10)
-   [range](#range-1)
    -   [Parameters](#parameters-11)
-   [enumerate](#enumerate)
    -   [Parameters](#parameters-12)
    -   [Examples](#examples-6)
-   [amap](#amap)
    -   [Parameters](#parameters-13)
    -   [Examples](#examples-7)
    -   [curry](#curry-3)
        -   [Parameters](#parameters-14)
        -   [Examples](#examples-8)
-   [afilter](#afilter)
    -   [Parameters](#parameters-15)
    -   [Examples](#examples-9)
    -   [curry](#curry-4)
        -   [Parameters](#parameters-16)
        -   [Examples](#examples-10)
-   [areduce](#areduce)
    -   [Parameters](#parameters-17)
    -   [Examples](#examples-11)
    -   [curry](#curry-5)
        -   [Parameters](#parameters-18)
        -   [Examples](#examples-12)
-   [iterArray](#iterarray)
    -   [Parameters](#parameters-19)
    -   [Examples](#examples-13)
-   [iterObject](#iterobject)
    -   [Parameters](#parameters-20)
    -   [Examples](#examples-14)
-   [iterFn](#iterfn)
    -   [Parameters](#parameters-21)
    -   [Examples](#examples-15)
-   [iter](#iter)
    -   [Parameters](#parameters-22)
-   [curry](#curry-6)
    -   [Parameters](#parameters-23)
-   [compose](#compose)
    -   [Parameters](#parameters-24)
    -   [Examples](#examples-16)
-   [each](#each)
    -   [Parameters](#parameters-25)

## map

A function that maps iterator or iterable values over a function.

### Parameters

-   `fn` **function (value: any, index: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))** The function to modify each value in the iterator.
-   `it` **@@iterator** The iterator or iterable to map over.

### Examples

```javascript
var it = map(v => 2 * v, [1, 2, 3, 4])
// Will give you an iterator with the values: 2, 4, 6, 8
```

Returns **@@iterator** Returns an iterator with values that will be updated by fn.

### curry

Allows you to curry the arguments, most useful when used with compose.

#### Parameters

-   `args` **...any** The arguments to bind.

#### Examples

```javascript
var curried = map.curry(v => 2 * v)
var it = [1, 2, 3, 4]
it = curried(it)
// Will give you an iterator with the values: 2, 4, 6, 8
```

Returns **curriedFunction** The curried version of the original function, with bindable args.

## filter

A function that keeps values in an iterator or iterable only if fn returns true.

### Parameters

-   `fn` **function (value: any, index: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))** The test function to filter items,
    return true to keep the item, false to remove it.
-   `it` **@@iterator** The iterator or iterable to filter.

### Examples

```javascript
var it = filter(v => v != 2, [1, 2, 3, 4])
// Will give you an iterator with the values: 1, 3, 4
```

Returns **@@iterator** Returns an iterator with only the values that passed the test fn.

### curry

Allows you to curry the arguments, most useful when used with compose.

#### Parameters

-   `args` **...any** The arguments to bind.

#### Examples

```javascript
var curried = filter.curry(v => v != 2)
var it = [1, 2, 3, 4]
it = curried(it)
// Will give you an iterator with the values: 1, 3, 4
```

Returns **curriedFunction** The curried version of the original function, with bindable args.

## reduce

A function that reduces all the items in an iterator or iterable to one value.

### Parameters

-   `fn` **function (accumulator: any, value: any, index: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))** The reducer function continually updates
    the accumulator, until the iterator ends, then the accumulated value is returned.
-   `acc`  The accumulator's initial value, each item in the iterator or iterable will be added to this by fn.
-   `it` **@@iterator** The iterator or iterable to reduce.

### Examples

```javascript
var it = reduce((acc, v) => acc += v, 0, [1, 2, 3, 4])
// Will give you an iterator with the value: 10
var it = reduce((acc, v, i) => (acc[i] = v, acc), [], [1, 2, 3, 4])
// Will give you an iterator with a single item, which will be an array: [1, 2, 3, 4]
```

Returns **@@iterator** Returns an iterator with only one value.

### curry

Allows you to curry the arguments, most useful when used with compose.

#### Parameters

-   `args` **...any** The arguments to bind.

#### Examples

```javascript
var curried = reduce.curry((acc, val) => acc + val)
var it = [1, 2, 3, 4]
it = curried(it)
// Will give you an iterator with the value: 10
```

Returns **curriedFunction** The curried version of the original function, with bindable args.

## Range

Creates a Range object that can be iterated over.

### Parameters

-   `start` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The start of the range (inclusive). (optional, default `0`)
-   `stop` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The end of the range (exclusive).
-   `step` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The stride of the range. (optional, default `1`)

Returns **[Range](#range)** 

### ITERATOR

Creates an iterator of all the values in the range.

Returns **Iterator** 

### values

Creates an iterator of all the values in the range.

Returns **Iterator** 

### entries

Creates an iterator of all the entries in the range.

Returns **Iterator** Returns value pairs [value, value], like Set.

### get

Get an item from a range by index.

#### Parameters

-   `idx` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The index of the value in the range.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Returns the value at the index, or undefined.

### has

Check if a value exists in a range.

#### Parameters

-   `val` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The value to look for.

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Returns true if the value exists.

### indexOf

Find the index of a value in the range.

#### Parameters

-   `val` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The value to look for.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Returns the index if the value exists, -1 otherwise.

### new

An alternative, static method, Range constructor.

#### Parameters

-   `start` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The start of the range (inclusive). (optional, default `0`)
-   `stop` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The end of the range (exclusive).
-   `step` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The stride of the range. (optional, default `1`)

Returns **[Range](#range)** 

## range

An alternative, functional, Range constructor.

### Parameters

-   `start` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The start of the range (inclusive). (optional, default `0`)
-   `stop` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The end of the range (exclusive).
-   `step` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The stride of the range. (optional, default `1`)

Returns **[Range](#range)** 

## enumerate

Enumerate takes an iterable, async-iterable, iterator, or async-iterator
and returns the same with its values updated with an [index, value] pair,
starting at 0 or at the optional start arg.

### Parameters

-   `start` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The optional index start. (optional, default `0`)
-   `it` **(iterable | asyncIterable)** The iterable or async-iterable to return.

### Examples

```javascript
var arr = ['a', 'b', 'c', 'd']
var it = enumerate(arr)
// Will give you an iterator with the values: [0, 'a'], [1, 'b'], [2, 'c'], [3, 'd']
```

Returns **(iterator | asyncIterator)** Returns an iterator or async-iterator with
the [index, value] pair items.

## amap

A function that maps iterator, iterable, async-iterator or async-iterable values over a function.

### Parameters

-   `fn` **function (value: any, index: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))** The function to modify each value in the iterator.
-   `it` **(@@iterator | @@asyncIterator)** The iterator, iterable, async-iterator or async-iterable to map over.

### Examples

```javascript
var it = amap(v => 2 * v, [1, 2, 3, 4])
// Will give you an async-iterator with the promised values: 2, 4, 6, 8

var urls = ['http://some.resource.com/file.txt', 'http://some.resource.com/file2.txt']
var it = amap(url => fetch(url).then(res => res.text()), urls)
it = amap(txt => txt.slice(0, 140), it)
each(txt => console.log(txt), it)
// Will print the first 140 characters of text for each file referenced by the urls
```

Returns **@@asyncIterator** Returns an async-iterator with values returned by fn.

### curry

Allows you to curry the arguments, most useful when used with compose.

#### Parameters

-   `args` **...any** The arguments to bind.

#### Examples

```javascript
var curried = amap.curry(v => 2 * v)
var it = [1, 2, 3, 4]
it = curried(it)
// Will give you an async-iterator with the promised values: 2, 4, 6, 8
```

Returns **curriedFunction** The curried version of the original function, with bindable args.

## afilter

A function that keeps values in an iterator, iterable, async-iterator or async-iterable,
only if fn returns true.

### Parameters

-   `fn` **function (value: any, index: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))** The test function to filter items,
    return true to keep the item, false to remove it.
-   `it` **(@@iterator | @@asyncIterator)** The iterator, iterable, async-iterator or async-iterable to filter.

### Examples

```javascript
var it = afilter(v => v != 2, [1, 2, 3, 4])
// Will give you an async-iterator with the promised values: 1, 3, 4

var urls = ['http://some.resource.com/file.txt', 'http://some.resource.com/file2.txt']
var it = amap(url => fetch(url).then(res => res.text()), urls)
it = afilter(txt => txt.length < 140, it)
each(txt => console.log(txt), it)
// Will only print the text of the files, referenced by the urls, with fewer than 140 characters
```

Returns **@@asyncIterator** Returns an async-iterator with the values that passed the test fn.

### curry

Allows you to curry the arguments, most useful when used with compose.

#### Parameters

-   `args` **...any** The arguments to bind.

#### Examples

```javascript
var curried = afilter.curry(v => v != 2)
var it = [1, 2, 3, 4]
it = curried(it)
// Will give you an async-iterator with the promised values: 1, 3, 4
```

Returns **curriedFunction** The curried version of the original function, with bindable args.

## areduce

A function that reduces an iterator, iterable, async-iterator or async-iterable to one promised value.

### Parameters

-   `fn` **function (accumulator: any, value: any, index: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))** The reducer function continually updates
    the accumulator, until the iterator / async-iterator ends, then the accumulated value is returned.
-   `acc`  The accumulator's initial value, each item in the iterator or iterable will be added to this by fn.
-   `it` **(@@iterator | @@asyncIterator)** The iterator, iterable, async-iterator or async-iterable to reduce.

### Examples

```javascript
var it = areduce((acc, v) => acc += v, 0, [1, 2, 3, 4])
// Will give you an async-iterator with the promised value: 10

var urls = ['http://some.resource.com/file.txt', 'http://some.resource.com/file2.txt']
var it = amap(url => fetch(url).then(res => res.text()), urls)
it = areduce((acc, txt) => acc + txt.slice(0, 140), '', it)
each(txt => console.log(txt), it)
// Will print the combined 280 characters of text from each file referenced by the urls
```

Returns **@@asyncIterator** Returns an async-iterator with only one promised value.

### curry

Allows you to curry the arguments, most useful when used with compose.

#### Parameters

-   `args` **...any** The arguments to bind.

#### Examples

```javascript
var curried = areduce.curry((acc, val) => acc + val)
var it = [1, 2, 3, 4]
it = curried(it)
// Will give you an async-iterator with the promised value: 10
```

Returns **curriedFunction** The curried version of the original function, with bindable args.

## iterArray

Gets an iterator for any array-like; that is anything with a length property that
can be indexed with array[index] notation.

### Parameters

-   `a` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | arrayLike)** The array-like to create an iterator from.
-   `chunkSize` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** If set larger than zero, will break the array up
    into chunks of length chunkSize. (optional, default `0`)

### Examples

```javascript
var it = iterArray([1, 2, 3, 4])
// Will give you an iterator with the values: 1, 2, 3, 4
var it = iterArray([1, 2, 3, 4], 2)
// Will give you an iterator with the values: [1, 2], [3, 4]
```

Returns **@@iterator** Returns an iterator with the values from the array-like.

## iterObject

Gets an iterator of [key, value] pairs for any javascript object.

### Parameters

-   `o` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The object to create an iterator from. Only iterates over an objects own-properties.

### Examples

```javascript
var it = iterObject({a: 1, b: 2, c: 3})
// Will give you an iterator with the values: [a, 1], [b, 2], [c, 3]
```

Returns **@@iterator** Returns an iterator with the [key, value] pairs from the object.

## iterFn

Turns a function into an iterator.

### Parameters

-   `fn` **function ({i, sentinel})** The iterator will return whatever this function returns,
    until it returns the sentinel value, then it will stop. The function is given an object with
    an index i and the sentinel value, you can add any other state you want to keep between iterations
    to this object if you like.
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** This options object must contain the sentinel property, the sentinel
    is returned by fn to signal the end of iteration.
    -   `options.sentinel`  Any distinct value to use as an indicator that the iterator function is done.
    -   `options.isAsync` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** If true an async-iterator will be returned. (optional, default `false`)

### Examples

```javascript
var it = iterFn(({i, sentinel}) => i >= 4 ? sentinel : i * 2, {sentinel: {}})
// Will give you an iterator with the values: 0, 2, 4, 6
```

Returns **(@@iterator | @@asyncIterator)** Returns an iterator or async-iterator with the values returned by fn.

## iter

Gets an iterator / async-iterator for any iterable, async-iterable, array-like, or function with a sentinel.

### Parameters

-   `obj` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The possible iterable to create an iterator for.
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `{}`)
    -   `options.sentinel`  Any distinct value to use as a stop indicator when creating an iterator from a function,
        see iterFn.
    -   `options.isAsync` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** If true and obj is a function, an async-iterator will be returned. (optional, default `false`)

Returns **(@@iterator | @@asyncIterator | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))** Returns an iterator, async-iterator, or undefined if obj is not iterable.

## curry

Returns a curried version of the provided function.

### Parameters

-   `fn` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** The function to curry.
-   `args` **...any?** Any arguments to bind.

Returns **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** Returns the curried function.

## compose

Perhaps the most useful function here; allows you to compose (combine)
other functions into one new function that takes one argument of
an iterable, async-iterable, iterator, or async-iterator.

### Parameters

-   `fns` **...[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** Any number of functions to combine.

### Examples

```javascript
var urlPrefix = 'http://some.resource.com/'
var files = ['file.txt', 'file2.txt', 'file3.txt', 'file4.txt']

var getShortTexts = compose(
  filter.curry(file => file != 'file3.txt'), // Removes file3.txt
  map.curry(file => urlPrefix + file), // Adds the url prefix to the file names, creating the file url
  amap.curry(url => fetch(url).then(res => res.text())), // Fetches the files from the web
  afilter.curry(txt => txt.length <= 140), // Removes files longer than 140 characters
)

each(txt => console.log(txt), getShortTexts([files]))
// Will print out the contents of the files with 140 or fewer chracters, skipping file3.txt.
```

Returns **function (it: anyIterableOrAsyncIterable)** The composed function.

## each

Loops over any iterable, async-iterable, iterator, async-iterator or array-like,
calling fn for each item. If looping over an async-iterable / async-iterator
a promise will be returned by each with the value of the final return from fn.

### Parameters

-   `fn` **(function (value) | function (value, done))** The fn to call for each item. The function will be called
    for every value in the iterable / async-iterable. If the function has a second param (done) then
    the loop function will be called when the iterable / async-iterable is done, with a done value of true.
    If no second param (done) is provided then the loop function will only be called with the values from
    the iterable / async-iterable.
-   `it` **(iterable | asyncIterable)** The iterable, async-iterable, iterator, async-iterator or array-like
    to loop over.

Returns **([Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) \| [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))** Returns a Promise that resolves to the last value returned by fn if looping
over an async-iterable. If looping over an iterable returns undefined.
