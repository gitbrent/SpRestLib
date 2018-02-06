---
id: feat-promises
title: Promise-based Operations
---
**************************************************************************************************
Table of Contents
- [(New) ES6/ES2015 Promises vs (Old) Callbacks](#new-es6es2015-promises-vs-old-callbacks)
- [tl;dr](#tldr)
- [Async Chaining](#async-chaining)
  - [Example Logic](#example-logic)
  - [Example Code](#example-code)
- [Async Grouping](#async-grouping)
  - [Example Logic](#example-logic-1)
  - [Example Code](#example-code-1)
**************************************************************************************************

SpRestLib exclusively utilizes JavaScript ES6 Promises for asynchronous SharePoint operations.

## (New) ES6/ES2015 Promises vs (Old) Callbacks

SpRestLib asynchronous methods return Promises, which provide two main benefits:
* No more callback functions
* No more managing async operations

If you're unfamiliar with the new [ES6 Promise](http://www.datchley.name/es6-promises/) functionality, you may want to
the a moment to read more about them.  They really are a game changer for those of us who deal with asynchronous
operations.

All major browsers (and Node.js) now fully support ES6 Promises, so keep reading to see them in action.

## tl;dr
**Promises can be chained using `then()` or grouped using `Promise.all()` so callbacks and queue management
are a thing of the past.**

## Async Chaining
* Promises can be chained so they execute in the order shown only after the previous one has completed

### Example Logic
* SpRestLib methods return a Promise, meaning the "return sprestlib" calls below cause the subsequent `.then()` to wait for that method's REST call to return a result
* That's all you need to code to enable chaining of asynchronous operations without any callback functions or queue management!

### Example Code
```javascript
var item = {
  EmpName:  'Marty McFly',
  EmpNumb:  1001,
  HireDate: new Date()
};

Promise.resolve()
.then(function()    { return sprLib.list('Employees').create(item); })
.then(function(item){ return sprLib.list('Employees').update(item); })
.then(function(item){ return sprLib.list('Employees').delete(item); })
.then(function(item){
  console.log('Success! An item navigated the entire CRUD chain!');
});
```

## Async Grouping
* Promises can be grouped using `.all()` meaning each of them must complete before `.then()` is executed.

### Example Logic
* This example requires that both the user info and user group queries complete before we move on
* The old AJAX callback method model required a lot more code to do this very thing!

### Example Code
```javascript
Promise.all([
    sprLib.user().info(),
    sprLib.user().groups()
])
.then(function(arrResults){
    // 'arrResults' holds the return values of both method calls above - in the order they were provided
    // Therefore, arrResults[0] holds user info() and arrResults[1] holds user groups()
    console.log( "Current User Info `Title`: " + arrResults[0].Title  );
    console.log( "Current User Groups count: " + arrResults[1].length );
});
```
