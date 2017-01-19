[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/) [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
# SpRestLib

## JavaScript Library for SharePoint Web Services

### Features:
* Easy Async - Utilizes the new [ES6 Promise](http://www.datchley.name/es6-promises/) architecture to enable chaining of asynchronous operations
* Modern API - Built for [SharePoint 2013 API](https://msdn.microsoft.com/en-us/library/office/jj860569.aspx) / [OData v3](http://www.odata.org/documentation/odata-version-3-0/)
* Simple - JavaScript and REST solution (no CSOM or any libraries required)
* Robust - Monitors the SharePoint authentication token and refreshes it after expiration
* Lightweight - Small but feature-rich (~30kb minified)

### Methods:
* List Interface - Read, create, update and delete List/Library items with a single line of code
* REST Interface - Run ad-hoc REST calls to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)
* User Interface - Get current or specified User information and Groups
* Form Population - Populate form elements using data-bind declarative binding system like Knockout or AngluarJS

### Supported Environments:
* SharePoint Online (O365), SharePoint 2013 (SP2013), SharePoint 2016 (SP2016)
* *Enterprise license not required*

**************************************************************************************************
# Installation

## Client-Side
SpRestLib utilizes the jQuery library - include it before sprestlib.  That's it!
```javascript
<script lang="javascript" src="https://code.jquery.com/jquery-3.1.1.slim.min.js"></script>
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.js"></script>
```
**NOTE** IE11 support requires you include a Promises polyfill as well (one is included in the `libs` folder)

## NPM
```javascript
npm install sprestlib
```

**************************************************************************************************
# Methods

## List/Library

### Create, Update, Delete List Items
* `sprLib.list(listName).create(item)` - Add the new item to the List/Library
* `sprLib.list(listName).update(item)` - Update the existing item using the data provided
* `sprLib.list(listName).delete(item)` - Delete the item (placed into the Recycle Bin)

### Get List Columns
* `sprLib.list(listName).cols()` - Returns an array of column objects with useful info (internal name, datatype, etc.)

### Get List Info
* `sprLib.list(listName).info()` - Returns information about the list (GUID, numberOfItems, etc.)

### Get List Items
* `sprLib.list(listName).getItems(options)` - Returns an array of item objects using a variety of possible options

## REST API Interface
* `sprLib.rest(options)` - Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

## User Info and Groups
* `sprLib.user(id).info()` - Returns information about the current [SPUser](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spuser.aspx)
* `sprLib.user(id).groups()` - Returns an of SPGroup objects with information about the current users Groups


**************************************************************************************************
# Async Operations: ES6 Promises vs Callbacks

All of the SpRestLib methods return JavaScript Promises, which provide two main benefits:
* No more callback functions
* No more managing async operations

If you're unfamiliar with the new [ES6 Promise](http://www.datchley.name/es6-promises/) functionality, you may want to
the a moment to read more about them.  They really are a game changer for those of us who deal with asynchronous
operations.

All major browsers (and Node.js) now fully support ES6 Promises, so keep reading to see them in action.

## tl;dr
Promises can be chained using `then()` or grouped using `Promise.all()` so callbacks and queue management
are a thing of the past.

## Example: Chaining async SharePoint REST operations is easy with Promises
```javascript
var item = { Name:'Marty McFly', Hire_x0020_Date:new Date() };
Promise.resolve()
.then(function()    { return sprLib.list('Employees').create(item); })
.then(function(item){ return sprLib.list('Employees').update(item); })
.then(function(item){ return sprLib.list('Employees').delete(item); })
.then(function(item){ console.log('Success! An item navigated the entire CRUD chain!'); });
```

**************************************************************************************************
# Library Reference

## List/Library Operations (**`SPList`**)
`sprLib.list(ListName)`
`sprLib.list(ListGUID)`

### Create Item
Syntax:
`sprLib.list(listName).create(itemObject)`

Options:
An object with internal name/value pairs to be inserted

Example:
```javascript
sprLib.list('Employees')
.create({ Name:'Marty McFly', Badge_x0020_Number:12345, Hire_x0020_Date:new Date() })
.then(function(objItem){ console.log('New Item:'); console.table(objItem); })
.catch(function(strErr){ console.error(strErr); });
```

### Update Item
Syntax:
`sprLib.list(listName).update(itemObject)`

Options:
* An object with internal name/value pairs to be inserted
* if `__metadata.etag` is not provided, this is equivalent to force:true (`etag:'"*"'` is used)

Example:
```javascript
sprLib.list('Employees')
.update({ __metadata:{ etag:10 }, ID:99, Name:'Marty (nobody calls me chicken) McFly' })
.then(function(objItem){ console.log('Updated Item:'); console.table(objItem); })
.catch(function(strErr){ console.error(strErr); });
```

### Delete Item
Syntax:
`sprLib.list(listName).delete(itemId)`

Options:
* if `__metadata.etag` is not provided, this is equivalent to force:true (`etag:'"*"'` is used)

Example:
```javascript
sprLib.list('Employees')
.delete(99)
.then(function(objItem){ console.log('Updated Item:'); console.table(objItem); })
.catch(function(strErr){ console.error(strErr); });
```

### Get Columns
`sprLib.list(listName).cols()`
* Returns: Array of column objects

Column Properties

| Property       | Type     | Description                  |
| :------------- | :------- | :--------------------------- |
| `dispName`     | string   | display name                 |
| `dataName`     | string   | internal name - used in REST queries and in `listCols` arguments |
| `dataType`     | string   | column type - values: `Boolean`, `Calculated`, `Currency`, `DateTime`, `Note`, `Number`, `Text`  |
| `isAppend`     | boolean  | is this an append text column? |
| `isNumPct`     | boolean  | is this a percentage number column? |
| `isReadOnly`   | boolean  | is this an read only column? |
| `isUnique`     | boolean  | are unique values enforced on this column? |
| `defaultValue` | boolean  | the default value (if any) |
| `maxLength`    | boolean  | the maxlength of the column |

### Get Info
**Syntax**
* `sprLib.list(listName).info()`

**Returns**
* Array of list properties and their value

**List Properties**

| Property             | Type     | Description                  |
| :------------------- | :------- | :--------------------------- |
| `AllowContentTypes`  | boolean  | Whether `Allow management of content types?` is enabled |
| `BaseTemplate`       | integer  | [SPListTemplateType](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.splisttemplatetype.aspx) SP Base Template ID number - ex: `100` |
| `Created`            | date     | Date the List/Library was created |
| `Description`        | boolean  | List/Library `Description` |
| `EnableAttachments`  | boolean  | Whether users can attach files to items in this list |
| `ForceCheckout`      | boolean  | Whether Force checkout is enabled |
| `Hidden`             | boolean  | Whether List is hidden |
| `Id`                 | GUID     | The SP GUID of the List |
| `ItemCount`          | number   | The number of Items in the List |
| `Title`              | string   | The Title of the List/Library |

**Example**
```javascript
sprLib.list('Employees').info().then(function(data){ console.table(data) });
```

### Get Items
* Returns values from List/Library using the query parameters provided
* Omitting `listCols` will result in every column being returned (mimics SharePoint default behavior)

#### Options
| Option       | Type     | Required? | Description           | Possible Values / Returns           |
| :----------- | :------- | :-------- | :-------------------- | :---------------------------------- |
| `listCols`   | array *OR* object |  | column names to be returned | array of column names *OR* object (see below) |
| `queryFilter` | string   |          | query filter          | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) |
| `queryMaxItems` | string |          | max items to return   | 1-*N* |
| `queryOrderby`  | string |          | column(s) to order by | Ex:`queryOrderby:Name` |

#### `listCols` Object
| Option       | Type     | Required? | Description           | Possible Values / Return Values     |
| :----------- | :------- | :-------- | :-------------------- | :---------------------------------- |
| `dataName`   | string   |           | the column name       | the fixed, back-end REST column name (use descList() if unknown) |
| `dispName`   | string   |           | the name to use when displaying results in table headers, etc. |  |
| `dateFormat` | string   |           | format to use when returning/displaying date | `INTL`, `INTLTIME`, `YYYYMMDD`, `ISO`, 'US' |
| `dataFunc`   | function |           | function to use for returning a result | use a custom function to transform the query result (see below) |

#### listCols `dataFunc`
There are many times where you'll need more than a simple column value.  For example, I often provide a link to the InfoPath
form so users can edit the item directly.

The `dataFunc` option allows you access to the entire result set and to return any type of value.  See sample below where
editLink is created.

#### Sample Code
(WIP)





**************************************************************************************************
# User

`sprLib.user()`

## Get Current User Information
`sprLib.user().info()`
* Returns information about the current user
* *Uses the basic SP User service (not the Enterprise licensed User Profile service)*

```javascript
sprLib.user().info()
.then(function(objUser){
	console.log("Current User Info:\n");
	console.log("Id:" + objUser.Id +" - Title:"+ objUser.Title +" - Email:"+ objUser.Email); }
});
```

## Get Current User Groups
`sprLib.user().groups()`
* Returns the current users SharePoint permission groups

### Sample Code
```javascript
sprLib.user().groups()
.then(function(arrGroups){
	console.log("Current User Groups count = "+ arrGroups.length);
	console.log("Group[0] info: "+ arrGroups[0].Id +" - "+ arrGroups[0].Title);
});
```

## Get User By ID
`sprLib.user(ID).info()`
* Returns information about a user with a given member ID
* *Uses the basic SP User service (not the Enterprise licensed User Profile service)*

### Sample Code
```javascript
// Get User object for User with `id` 123:
sprLib.user().info(123)
.then(function(objUser){
	console.log("User Info:\n");
	console.log("Id:" + objUser.Id +" - Title:"+ objUser.Title +" - Email:"+ objUser.Email); }
});
```

**************************************************************************************************
# Form Binding

```javascript
<table data-sprlib='{ "foreach": {"listName":"Employees", "filter":{"col":"Badge_x0020_Number", "op":"eq", "val":1234}}, "options":{"showBusySpinner":true} }'>
```

**************************************************************************************************
# Tips &amp; Tricks (WIP)

## Async Chaining
You can easily chain asynchronous calls as SpRestLib methods will return a Promise.  The Promise method `then()`
will in turn wait for the Promise to either resolve or reject.

So thanks to the new ES6 Promise feature, we can now simply order asynchronous operations without a managing
a queue or requiring callbacks.

```javascript
Promise.resolve()
.then(function(){
	// Clear User var
	gObjCurrUser = {};
	// sprLib methods return Promises, and .then() waits for promises to resolve/reject
	return sprLib.user().info();
})
.then(function(result){
	// Capture User info
	gObjCurrUser = result;
	return sprLib.user(gObjCurrUser.Id).groups();
})
.then(function(result){
	// Capture User Groups
	gArrCurrGrps = result;
})
.then(function(){
	// Now we have all of our data
	console.log( "Current User Info `Title`: " + gObjCurrUser.Title    );
	console.log( "Current User Groups count: " + gArrCurrGrps.length );
})
.catch(function(errMsg){ console.error(errMsg) });
```

```javascript
Promise.resolve()
.then(function()        { return sprLib.list('Departments').getItems({ listCols: ['Title'] }) })
.then(function(arrData) { console.warn('WARN: Awesome code ahead!'); console.log(arrData); })
.then(function()        { return sprLib.list('Employees').getItems({ listCols: ['Name','Badge_x0020_Number'] }) })
.then(function(arrData) { console.warn('WARN: Awesome code ahead!'); console.log(arrData); })
.catch(function(errMesg){ console.error(errMesg); });
```

## Async Grouping
When you merely need all your REST requests to complete - regardless of order - add all the SpRestLib Promises
as an array to `Promise.all()` and `then()` waits until all of them have completed.

Example
```javascript
Promise.all([ sprLib.user().info(), sprLib.user().groups() ])
.then(function(arrResults){
	// arrResults holds the return values of each SpRestLib method above, in the order they were provided
	console.log( "Current User Info `Title`: " + arrResults[0].Title  );
	console.log( "Current User Groups count: " + arrResults[1].length );
});
```

**************************************************************************************************
# Configurable! (WIP)

var APP_OPTS and APP_CSS can be edited to set base URL, max rows returned, etc easily

**************************************************************************************************
# Issues / Suggestions

Please file issues or suggestions on the [issues page on github](https://github.com/gitbrent/SpRestLib/issues/new), or even better, [submit a pull request](https://github.com/gitbrent/SpRestLib/pulls). Feedback is always welcome!

When reporting issues, please include a code snippet or a link demonstrating the problem.

**************************************************************************************************
# Special Thanks

* [Marc D Anderson](http://sympmarc.com/) - SpRestLib is built in the spirit of SPServices
* Microsoft - for the SharePoint.com developer account

**************************************************************************************************
# License

Copyright &copy; 2016-2017 [Brent Ely](https://github.com/gitbrent/SpRestLib)

[MIT](https://github.com/gitbrent/SpRestLib/blob/master/LICENSE)
