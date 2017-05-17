[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/) [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php) [![npm version](https://badge.fury.io/js/sprestlib.svg)](https://badge.fury.io/js/sprestlib)

# SpRestLib

## JavaScript Library for SharePoint Web Services
Reduces your SharePoint AJAX interaction to a few lines of code. Easily read items, perform CRUD operations, gather user information and populate form elements.

### Features:
* Form Population - Fill a table with List items, populate a select, and much more
* Easy Async - Utilizes the new [ES6 Promise](http://www.datchley.name/es6-promises/) architecture to enable chaining of asynchronous operations
* Modern API - Built for [SharePoint 2013 API](https://msdn.microsoft.com/en-us/library/office/jj860569.aspx) / [OData v3](http://www.odata.org/documentation/odata-version-3-0/)
* Simple - Most REST interaction can be done in 1-2 lines of code
* Modern - Pure JavaScript solution (no other libraries are required)
* Robust - Handles errors and monitors the SharePoint authentication token

### Methods:
* List Interface - Read, create, update and delete List/Library items with a single line of code
* REST Interface - Run ad-hoc REST calls to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)
* User Interface - Get current or specified User information and Groups
* Form Population - Populate form elements using data-bind declarative binding system like Knockout or AngluarJS

### Supported Environments:
* SharePoint Online (O365), SharePoint 2013 (SP2013), SharePoint 2016 (SP2016)
* *Enterprise license not required*

**************************************************************************************************
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
  - [Client-Side](#client-side)
  - [Node](#node)
- [Methods](#methods)
  - [List/Library](#listlibrary)
  - [REST API](#rest-api)
  - [User Info/Groups](#user-infogroups)
  - [Form Population](#form-population)
- [API Reference](#api-reference)
  - [Options](#options)
  - [List/Library Operations (`SPList`)](#listlibrary-operations-splist)
    - [Create Item](#create-item)
    - [Update Item](#update-item)
    - [Delete Item](#delete-item)
    - [Get List Column Properties](#get-list-column-properties)
      - [Column Properties](#column-properties)
      - [Sample Code](#sample-code)
    - [Get List Info](#get-list-info)
      - [List Properties](#list-properties)
      - [Sample Code](#sample-code-1)
    - [Get Items](#get-items)
      - [Options](#options-1)
      - [`listCols` Object](#listcols-object)
      - [listCols `dataFunc`](#listcols-datafunc)
      - [Sample Code](#sample-code-2)
- [REST Calls](#rest-calls)
  - [Options](#options-2)
  - [Examples](#examples)
- [User Info/Groups](#user-infogroups-1)
  - [Get Current User Information (`SPUser`)](#get-current-user-information-spuser)
    - [Sample Code](#sample-code-3)
  - [Get Current User Groups (`SPGroup`)](#get-current-user-groups-spgroup)
    - [Sample Code](#sample-code-4)
- [Form Binding](#form-binding)
  - [Data Binding Types](#data-binding-types)
  - [Data Binding Options](#data-binding-options)
  - [Examples](#examples-1)
- [Lets Talk Async Operations: ES6 Promises vs Callbacks](#lets-talk-async-operations-es6-promises-vs-callbacks)
  - [tl;dr](#tldr)
  - [Async Chaining](#async-chaining)
  - [Async Grouping](#async-grouping)
- [Issues / Suggestions](#issues--suggestions)
- [Special Thanks](#special-thanks)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

**************************************************************************************************
# Installation

## Client-Side
SpRestLib utilizes the jQuery library - include it before sprestlib.  That's it!
```javascript
<script lang="javascript" src="https://code.jquery.com/jquery-3.1.1.slim.min.js"></script>
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.js"></script>
```
**NOTE**: IE11 support requires you include a Promises polyfill as well (one is included in the `libs` folder)

## Node
```javascript
npm install sprestlib

var sprLib = require("sprestlib");
```

**************************************************************************************************
# Methods

## List/Library
* `sprLib.list(listName).getItems(options)` - Returns an array of item objects using a variety of possible options

* `sprLib.list(listName).create(item)` - Add the new item to the List/Library
* `sprLib.list(listName).update(item)` - Update the existing item using the data provided
* `sprLib.list(listName).delete(item)` - Delete the item (placed into the Recycle Bin)

* `sprLib.list(listName).cols()` - Returns an array of column objects with useful info (name, datatype, etc.)

* `sprLib.list(listName).info()` - Returns information about the list (GUID, numberOfItems, etc.)

## REST API
* `sprLib.rest(options)` - Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

## User Info/Groups
* `sprLib.user(id).info()` - Returns information about the current [SPUser](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spuser.aspx)
* `sprLib.user(id).groups()` - Returns an of SPGroup objects with information about the current users Groups

## Form Population
* `data-sprlib{options}` - Populates the parent tag using the options provided

**************************************************************************************************
# API Reference

## Options
`sprLib.baseUrl(url)`

## List/Library Operations (`SPList`)
Lists can be accessed by either their name or their GUID:  
`sprLib.list(ListName)` or `sprLib.list(ListGUID)`

### Create Item
Syntax:
`sprLib.list(listName|listGUID).create(itemObject)`

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
`sprLib.list(listName|listGUID).update(itemObject)`

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
`sprLib.list(listName|listGUID).delete(itemId)`

Options:
* if `__metadata.etag` is not provided, this is equivalent to force:true (`etag:'"*"'` is used)

Example:
```javascript
sprLib.list('Employees')
.delete(99)
.then(function(objItem){ console.log('Updated Item:'); console.table(objItem); })
.catch(function(strErr){ console.error(strErr); });
```

### Get List Column Properties
Syntax:
`sprLib.list(listName|listGUID).cols()`

Returns: Array of columns with name value pairs of property values

#### Column Properties
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

#### Sample Code
```javascript
sprLib.list('Employees').cols().then(function(data){ console.table(data) });

// Result:
/*
.-------------------------------------------------------------------------------------------------------------------------------------.
|      dispName      |         dataName         |  dataType  | isAppend | isNumPct | isReadOnly | isUnique | defaultValue | maxLength |
|--------------------|--------------------------|------------|----------|----------|------------|----------|--------------|-----------|
| Name               | Name                     | Text       | false    | false    | false      | false    |              |       255 |
| Badge Number       | Badge_x0020_Number       | Number     | false    | false    | false      | false    |              |           |
| Hire Date          | Hire_x0020_Date          | DateTime   | false    | false    | false      | false    |              |           |
| ID                 | ID                       | Counter    | false    | false    | true       | false    |              |           |
'-------------------------------------------------------------------------------------------------------------------------------------'
*/
```

### Get List Info
Syntax:
`sprLib.list(listName|listGUID).info()`

Returns: Array of list properties and their values

#### List Properties
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

#### Sample Code
```javascript
sprLib.list('Employees').info().then(function(data){ console.table(data) });
```

### Get Items
Syntax:
`sprLib.list(listName|listGUID).getItems()`

Returns: Array of objects containing name/value pairs

#### Options
| Option        | Type     | Required? | Description           | Possible Values / Returns           |
| :------------ | :------- | :-------- | :-------------------- | :---------------------------------- |
| `listCols`    | array *OR* object |  | column names to be returned | array of column names *OR* object (see below) |
| `queryFilter` | string   |           | query filter          | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) |
| `queryLimit`  | string   |           | max items to return   | 1-*N* |
| `queryOrderby`| string   |           | column(s) to order by | Ex:`queryOrderby:Name` |
| `fetchAppend` | boolean  |           | return append text    | `true` or `false` (default is `false`) |

NOTE: Omitting `listCols` will result in all List columns being returned (mimics SharePoint default behavior)

#### `listCols` Object
| Option       | Type     | Required? | Description           | Possible Values / Return Values     |
| :----------- | :------- | :-------- | :-------------------- | :---------------------------------- |
| `dataName`   | string   |           | the column name       | the fixed, back-end REST column name (use [Get List Column Properties](#get-list-column-properties)) |
| `dispName`   | string   |           | the name to use when displaying results in table headers, etc. |  |
| `dateFormat` | string   |           | format to use when returning/displaying date | `INTL`, `INTLTIME`, `YYYYMMDD`, `ISO`, `US` |
| `dataFunc`   | function |           | function to use for returning a result | use a custom function to transform the query result (see below) |

#### listCols `dataFunc`
There are many times where you'll need more than a simple column value.  For example, I often provide a link to the InfoPath
form so users can edit the item directly.

The `dataFunc` option allows you access to the entire result set and to return any type of value.  See sample below where
editLink is created.

#### Sample Code
```javascript
// Get all List items, order by Name
sprLib.list('Employees').getItems({
    listCols:     ['Name', 'Badge_x0020_Number', 'Hire_x0020_Date'],
    queryOrderby: 'Name'
})
.then(function(arrData){ console.table(arrData) })
.catch(function(errMsg){ console.error(errMsg) });
```

```javascript
// Utilize listCols object to name our columns, use filtering options
sprLib.list('Employees').getItems({
    listCols: {
        empName:  { dataName:'Name'               },
        badgeNum: { dataName:'Badge_x0020_Number' },
        hireDate: { dataName:'Hire_x0020_Date'    },
		funcTest: { dataFunc:function(objItem){ return '<a href="/sites/dev/Lists/Employees/DispForm.aspx?ID='+objItem.Id +'">View Item</a>' } }
    },
    queryFilter:  'Salary gt 100000',
    queryOrderby: 'Hire_x0020_Date',
    queryLimit:   10
})
.then(function(arrData){ console.table(arrData) })
.catch(function(errMsg){ console.error(errMsg) });
```

**************************************************************************************************
# REST Calls
Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

While SpRestLib provides lots of common web service functionality, there are many times you will
need to execute ad-hoc REST calls.  Using the `sprLib.rest()` interface, any of the REST API endpoints
can be called in an easy way.

Normally, calling the REST APIs can return results in different ways (some are `data.d` while others are `data.d.results`)
whereas SpRestLib always returns consistent results will always be array of name/value objects.

Syntax
`sprLib.rest(options)`

Returns: Array of objects containing name/value pairs

## Options
| Option        | Type    | Required? | Description           | Possible Values / Returns           |
| :------------ | :------ | :-------- | :-------------------- | :---------------------------------- |
| `restUrl`     | string  | yes       | REST API endpoint     | [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx) |
| `restType`    | string  |           | rest type             | `get` or `post` (default is `get`)  |
| `queryCols`   | string  |           | fields/columns to get | whatever fields tbe REST API provides |
| `queryFilter` | string  |           | query filter          | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) |
| `queryLimit`  | string  |           | max items to return   | 1-*N* |
| `queryOrderby`| string  |           | column(s) to order by | Ex:`queryOrderby:Name` |

* url can be relative, / or http:

## Examples
```javascript
sprLib.rest({
    restUrl:      '/sites/dev/_api/web/sitegroups',
    queryCols:    ['Title','LoginName','AllowMembersEditMembership'],
    queryFilter:  'AllowMembersEditMembership eq false',
    queryOrderby: 'Title',
    queryLimit:   10
})
.then(function(arrayResults){ console.table(arrayResults) });

sprLib.rest({ restUrl:"/sites/dev/_api/web/sitegroups" }).then(function(data){ console.table(data); }); //(data.d.results)

sprLib.rest({ restUrl:"_api/web/lists/getbytitle('Employees')" }).then(function(data){ console.table(data); }); //(data.d)

(TODO:) show example with post
```

**************************************************************************************************
# User Info/Groups
Omitting the userID argument will return information about the current user, otherwise, the specified user is returned.  
`sprLib.user()` or `sprLib.user(userID)`

## Get Current User Information (`SPUser`)
Syntax:
`sprLib.user().info()`

Returns: Object with name/value pairs containing information about the user

Note: *Uses the basic SP User service (not the Enterprise licensed User Profile service)*

### Sample Code
```javascript
sprLib.user().info()
.then(function(objUser){
    console.log("Current User Info:\n");
    console.log("Id:" + objUser.Id +" - Title:"+ objUser.Title +" - Email:"+ objUser.Email); }
});
```

## Get Current User Groups (`SPGroup`)
Syntax:
`sprLib.user().groups()`

Returns: Array of objects containing the user's SharePoint groups [SPGroup](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spgroup.aspx)

### Sample Code
```javascript
sprLib.user().groups()
.then(function(arrGroups){
    console.log("Current User Groups count = "+ arrGroups.length);
    console.log("Group[0] info: "+ arrGroups[0].Id +" - "+ arrGroups[0].Title);
});
```

**************************************************************************************************
# Form Binding

Many different HTML tags can be populated by adding an `data-sprlib` property to many HTML element types.

Syntax:
`<tag data-sprlib='{ options }'>`

## Data Binding Types

The following HTML element tags can be populated:
* select: populates 1+ options
* static element (span, p, etc.): populates a single plain text value
* table: a table or tbody can be populates with 1+ columns

## Data Binding Options
| Option        | Type    | Required? | Description           | Possible Values / Returns           |
| :------------ | :------ | :-------- | :-------------------- | :---------------------------------- |
| `list`        | string  | yes       | List or Library name  |  |
| `cols`        | array   |           | columns to be populated |  |
| `text`        | string  |           | text value to use     |  |
| `value`       | string  |           | REST API endpoint     |  |
| `filter`      | string  |           | REST API endpoint     |  |
| `tablesorter` | string  |           | REST API endpoint     |  |
| `options`     | string  |           | table/tbody options   | `showBusySpinner` |

## Examples
```javascript
<select data-sprlib='{ "list":"Employees", "value":"Id", "text":"Name" }'></select>

<input type="text" data-sprlib='{ "list":"Departments", "value":"Title" }' placeholder="Departments.Title"></input>

<span data-sprlib='{ "list":"Employees", "value":"Name", "filter":{"col":"Name", "op":"eq", "val":"Brent Ely"} }'></span>

<table data-sprlib='{ "foreach": {"list":"Employees", "filter":{"col":"Badge_x0020_Number", "op":"eq", "val":1234}}, "options":{"showBusySpinner":true} }'>
<tbody data-sprlib='{ "foreach": {"list":"Employees", "cols":["Name","Utilization_x0020_Pct"] } }'></tbody>
```

**************************************************************************************************
# Lets Talk Async Operations: ES6 Promises vs Callbacks

All of the SpRestLib methods return JavaScript Promises, which provide two main benefits:
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
* Promises can be chained so they execute in the order shown only after the previous one has completed.

Example
```javascript
var item = { Name:'Marty McFly', Hire_x0020_Date:new Date() };
Promise.resolve()
.then(function()    { return sprLib.list('Employees').create(item); })
.then(function(item){ return sprLib.list('Employees').update(item); })
.then(function(item){ return sprLib.list('Employees').delete(item); })
.then(function(item){ console.log('Success! An item navigated the entire CRUD chain!'); });
```

## Async Grouping
* Promises can be grouped so they have to complete before `then()` is executed.

Example
```javascript
Promise.all([ sprLib.user().info(), sprLib.user().groups() ])
.then(function(arrResults){
    // arrResults holds the return values of each SpRestLib method above, in the order they were provided
    // so, arrResults[0] is info() and arrResults[1] is groups()
    console.log( "Current User Info `Title`: " + arrResults[0].Title  );
    console.log( "Current User Groups count: " + arrResults[1].length );
});
```

**************************************************************************************************
# Issues / Suggestions

Please file issues or suggestions on the [issues page on GitHub](https://github.com/gitbrent/SpRestLib/issues/new), or even better, [submit a pull request](https://github.com/gitbrent/SpRestLib/pulls). Feedback is always welcome!

When reporting issues, please include a code snippet or a link demonstrating the problem.

**************************************************************************************************
# Special Thanks

* [Marc D Anderson](http://sympmarc.com/) - SpRestLib is built in the spirit of the great `SPServices`
* Microsoft - for the SharePoint.com developer account
* Everyone who submitted an Issue or Pull Request

**************************************************************************************************
# License

Copyright &copy; 2016-2017 [Brent Ely](https://github.com/gitbrent/SpRestLib)

[MIT](https://github.com/gitbrent/SpRestLib/blob/master/LICENSE)
