---
id: promises
title: Promise You Will Love It
---
## JavaScript Promises Have Arrived

What makes a good library great?  The ability to chain and group asynchronous operations!

SpRestLib not only provides a simple REST interface, it also delivers next-generation
async operation handling via [ES6 Promises](http://www.datchley.name/es6-promises/).

## Simple Chains For Async Operations

SharePoint applications frequently perform lots of operations (e.g.: read from many lists at startup)
or perform sequential steps (e.g.: get an item, then do further operations depending upon the result).
Until recently, using callbacks was the standard way to handle async completion, but with Promises
(which all SpRestLib methods return) operations can be easily chained by using `then()`, making your code
much easier to write and maintain.

See the [Async Operations via Promises](#async-operations-via-promises) section for more information and examples.

## Example
```javascript
// EX: Get the current user's ID, then get their Tasks
sprLib.user().info()
.then(function(objUser){
    return sprLib.list('Tasks').getItems({ queryFilter:'Owner/Id eq ' + objUser.Id });
})
.then(function(arrItems){
    console.log("Current user's Tasks = " + arrItems.length);
})
.catch(errMsg => console.error(errMsg));
```

You can also use the native async/await syntax (available in recent browsers and Node.JS 8.6+, or via transpiling with BabelJS) as async/await is built on JavaScript Promises.

```javascript
const infoGetter = async() => {
    // EX: Get the current user's ID, then get their Tasks
    const objUser = await sprLib.user().info();
    const arrItems = await sprLib.list('Tasks').getItems({ queryFilter:'Owner/Id eq ' + objUser.Id });
    console.log("Current user's Tasks = " + arrItems.length);
}
```
