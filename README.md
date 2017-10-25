[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/) [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php) [![npm version](https://badge.fury.io/js/sprestlib.svg)](https://badge.fury.io/js/sprestlib)

# SpRestLib

## JavaScript Library for SharePoint REST Web Services
Enables rapid development of SharePoint Apps/Add-ins using the JavaScript SharePoint App Model. This
library provides a clean, concise API that simplifies async REST interaction. Easily read/write List
items (CRUD), execute REST calls, and gather user/group information.

### Features:
* Simple  - Most REST/Web Service interaction can be done in a couple of lines of code
* Modern  - Lightweight, pure JavaScript solution
* Elegant - Utilizes the new [ES6 Promise](http://www.datchley.name/es6-promises/) architecture for asynchronous operations
* Robust  - Built for [SharePoint 2013 API](https://msdn.microsoft.com/en-us/library/office/jj860569.aspx) and [OData v3](http://www.odata.org/documentation/odata-version-3-0/)

### Methods:
* List Interface - Create, read, update, and delete (CRUD) List/Library items with a single line of code
* REST Interface - Run ad-hoc REST calls to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx) endpoint
* User Interface - Get current or specified User and Groups details
* Form Population - Populate form elements using data-bind declarative binding system like Knockout or AngluarJS

### Supported Environments:
* SharePoint 2013 (SP2013), SharePoint 2016 (SP2016), SharePoint Online (O365)
* *Enterprise license not required*

**************************************************************************************************
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
  - [Client-Side](#client-side)
    - [Include Local Scripts](#include-local-scripts)
    - [Include Bundle Script](#include-bundle-script)
    - [Install With Bower](#install-with-bower)
  - [Node.js](#nodejs)
- [Method Overview](#method-overview)
  - [List/Library](#listlibrary)
  - [REST API](#rest-api)
  - [User Info/Groups](#user-infogroups)
  - [Form Population](#form-population)
  - [Utility](#utility)
- [Method Reference](#method-reference)
  - [List/Library Methods (`SPList`)](#listlibrary-methods-splist)
    - [BaseUrl](#baseurl)
    - [Get Items](#get-items)
      - [Options](#options)
      - [listCols Object](#listcols-object)
      - [listCols dataFunc Option](#listcols-datafunc-option)
      - [Sample Code](#sample-code)
    - [Create Item](#create-item)
    - [Update Item](#update-item)
    - [Delete Item](#delete-item)
    - [Recycle Item](#recycle-item)
    - [Get List Column Properties](#get-list-column-properties)
      - [Column Properties](#column-properties)
      - [Sample Code](#sample-code-1)
    - [Get List Info](#get-list-info)
      - [List Properties](#list-properties)
      - [Sample Code](#sample-code-2)
  - [REST API Methods](#rest-api-methods)
    - [Options](#options-1)
    - [Examples](#examples)
  - [User Info/Group Methods](#user-infogroup-methods)
    - [Options](#options-2)
    - [Get User Information (`SPUser`)](#get-user-information-spuser)
      - [Sample Code](#sample-code-3)
    - [Get User Groups (`SPGroup`)](#get-user-groups-spgroup)
      - [Sample Code](#sample-code-4)
  - [Form Binding](#form-binding)
    - [Data Binding Types](#data-binding-types)
    - [Data Binding Options](#data-binding-options)
      - [Examples](#examples-1)
  - [Utility Methods](#utility-methods)
- [Node.js and SharePoint Online](#nodejs-and-sharepoint-online)
  - [Connect To Office 365/SharePoint Online With Node.js](#connect-to-office-365sharepoint-online-with-nodejs)
    - [Demo](#demo)
- [Async Operations via Promises](#async-operations-via-promises)
  - [(New) ES6/ES2015 Promises vs (Old) Callbacks](#new-es6es2015-promises-vs-old-callbacks)
    - [tl;dr](#tldr)
    - [Async Chaining](#async-chaining)
      - [Example Logic](#example-logic)
      - [Example Code](#example-code)
    - [Async Grouping](#async-grouping)
      - [Example Logic](#example-logic-1)
      - [Example Code](#example-code-1)
- [Issues / Suggestions](#issues--suggestions)
- [Special Thanks](#special-thanks)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

**************************************************************************************************
# Installation

## Client-Side

### Include Local Scripts
```javascript
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/jquery.min.js"></script>
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.js"></script>
```
*IE11 support requires a Promises polyfill as well (included in the `libs` folder)*

### Include Bundle Script
```javascript
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.bundle.js"></script>
```
*Bundle includes all required libraries (SpRestLib + jQuery and Promises)*

### Install With Bower
```javascript
bower install sprestlib
```

## Node.js
```javascript
npm install sprestlib

var sprLib = require("sprestlib");
```
* Desktop: Compatible with Electron applications.

**************************************************************************************************
# Method Overview

## List/Library
* `sprLib.list(listName).getItems(options)` - Returns an array of item objects using a variety of possible options

* `sprLib.list(listName).create(item)` - Create a new list item using JSON data
* `sprLib.list(listName).update(item)` - Update an existing item using JSON data
* `sprLib.list(listName).delete(id)`   - Delete an existing item by ID (permanently delete)
* `sprLib.list(listName).recycle(id)`  - Recycle an existing item by ID (move to Recycle Bin)

* `sprLib.list(listName).cols()` - Returns an array of column objects with useful info (name, datatype, etc.)

* `sprLib.list(listName).info()` - Returns information about the List/Library (GUID, numberOfItems, etc.)

## REST API
* `sprLib.rest(options)` - Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

## User Info/Groups
* `sprLib.user(options).info()`   - Returns user information object (Id, Title, Email, etc.)  ([SPUser](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spuser.aspx))
* `sprLib.user(options).groups()` - Returns user group objects (Id, Title, Owner, etc.)  ([SPGroup](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spgroup.aspx))

## Form Population
* `data-sprlib{options}` - Populates the parent tag using the options provided

## Utility
* `sprLib.renewSecurityToken()` - Refreshes the SharePoint page security digest token

**************************************************************************************************
# Method Reference

## List/Library Methods (`SPList`)
Lists can be accessed by either their name or their GUID:  

Syntax: `sprLib.list(listName)` or `sprLib.list(listGUID)`

### BaseUrl
By default, the library defaults to the local directory.  There are occasions where operations would be pointed to other
locations - reading from a subsite, etc. - and that can be done easily be passing a baseUrl parameter.

Syntax: `sprLib.list({ listName:'name', baseUrl:'urlPath' })`

Example:
```javascript
sprLib.list({ listName:'Employees', baseUrl:'/sites/HumanResources/devtest/' })
```


### Get Items
Syntax:  
`sprLib.list(listName|listGUID).getItems()`

Returns:
* Array of objects containing name/value pairs
* `__metadata` is always included in the results array (to enable further operations, use of Etag, etc.)

#### Options
| Option        | Type     | Default   | Description           | Possible Values / Returns           |
| :------------ | :------- | :-------- | :-------------------- | :---------------------------------- |
| `listCols`    | array *OR* object |  | column names to be returned | array of column names *OR* object (see below) |
| `cache`       | boolean  | `false`   | cache settings        | Ex:`cache: true` |
| `queryFilter` | string   |           | query filter          | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) |
| `queryLimit`  | string   |           | max items to return   | 1-*N* |
| `queryOrderby`| string   |           | column(s) to order by | Ex:`queryOrderby:Name` |

NOTE: Omitting `listCols` will result in all List columns being returned (mimics SharePoint default behavior)

#### listCols Object
| Option        | Type     | Default   | Description           | Possible Values / Return Values     |
| :------------ | :------- | :-------- | :-------------------- | :---------------------------------- |
| `dataName`    | string   |           | the column name       | the fixed, back-end REST column name (use [Get List Column Properties](#get-list-column-properties)) |
| `dispName`    | string   |           | the name to use when displaying results in table headers, etc. |  |
| `dateFormat`  | string   |           | format to use when returning/displaying date | `INTL`, `INTLTIME`, `YYYYMMDD`, `ISO`, `US` |
| `dataFunc`    | function |           | function to use for returning a result | use a custom function to transform the query result (see below) |
| `getVersions` | boolean  | `false`   | return append text versions in array | `true` or `false` |

#### listCols dataFunc Option
There are many times where you'll need more than a simple column value.  For example, I often provide a link to the InfoPath
form so users can edit the item directly.

The `dataFunc` option allows you access to the entire result set and to return any type of value.  See sample below where
"editLink" is created.

#### Sample Code
```javascript
// EX: Simple array of column names
sprLib.list('Employees')
.getItems(
    ['Id', 'Name', 'Badge_x0020_Number']
)
.then(function(arrData){
    console.table(arrData);
})
.catch(function(errMsg){ console.error(errMsg) });

// Result:
/*
.---------------------------------------------------------.
|   __metadata    | Id  |    Name    | Badge_x0020_Number |
|-----------------|-----|------------|--------------------|
| [object Object] | 253 | Hal Jordan |              12345 |
'---------------------------------------------------------'
*/
```

```javascript
// EX: Using 'listCols' option with array of column names
sprLib.list('Employees').getItems({
    listCols: ['Name', 'Badge_x0020_Number', 'Hire_x0020_Date']
})
.then(function(arrData){ console.table(arrData) })
.catch(function(errMsg){ console.error(errMsg) });
```

```javascript
// EX: Using 'listCols' option to name our columns
// EX: Using 'getVersions' to gather all "Append Text"/Versioned Text into an array
// EX: Using 'dataFunc' option to return a dynamic, generated value (an html link)
// EX: Using query options: filter, order, limit
sprLib.list('Employees').getItems({
    listCols: {
        empId:      { dataName:'ID' },
        badgeNum:   { dataName:'Badge_x0020_Number' },
        appendText: { dataName:'Versioned_x0020_Comments', getVersions:true },
        editLink:   { dataFunc:function(objItem){ return '<a href="/sites/dev/Lists/Employees/DispForm.aspx?ID='+objItem.ID+'">View Emp</a>' } }
    },
    queryFilter:  'Salary gt 100000',
    queryOrderby: 'Hire_x0020_Date',
    queryLimit:   3
})
.then(function(arrData){ console.table(arrData) })
.catch(function(errMsg){ console.error(errMsg) });

// RESULT:
/*
.--------------------------------------------------------------------------------------------------------------------------------.
| empId | badgeNum |            appendText              |                                editLink                                |
|-------|----------|------------------------------------|------------------------------------------------------------------------|
|   334 |  1497127 | ["20170624:Update","20170601:New"] | <a href="/sites/dev/Lists/Employees/DispForm.aspx?ID=334">View Emp</a> |
|   339 |  1497924 | ["Not here yet", "Emp created"]    | <a href="/sites/dev/Lists/Employees/DispForm.aspx?ID=334">View Emp</a> |
|   350 |  1497927 | ["Vice President promotion"]       | <a href="/sites/dev/Lists/Employees/DispForm.aspx?ID=334">View Emp</a> |
'--------------------------------------------------------------------------------------------------------------------------------'
*/
```



### Create Item
Syntax: `sprLib.list(listName|listGUID).create(itemObject)`

Options: An object with internal name/value pairs to be inserted

Returns: Object with key/value pairs

Example:
```javascript
sprLib.list('Employees')
.create({
    Name: 'Marty McFly',
    Badge_x0020_Number: 12345,
    Hire_x0020_Date: new Date(),
    Active: true
})
.then(function(objItem){
    console.log('New Item:');
    console.table(objItem);
})
.catch(function(strErr){ console.error(strErr); });
```


### Update Item
Syntax:
`sprLib.list(listName|listGUID).update(itemObject)`

Options:
* An object with internal name/value pairs to be inserted
* if `__metadata.etag` is not provided, this is equivalent to force:true (`etag:'"*"'` is used)

Returns:
The object provided

Example:
```javascript
sprLib.list('Employees')
.update({
    ID: 99,
    Name: 'Marty McFly',
    Active: false
})
.then(function(objItem){
    console.log('Updated Item:');
    console.table(objItem);
})
.catch(function(strErr){ console.error(strErr); });
```


### Delete Item
Syntax:
`sprLib.list(listName|listGUID).delete(itemId)`

Options:
* if `__metadata.etag` is not provided, this is equivalent to force:true (`etag:'"*"'` is used)

Returns:
ID of the item just deleted

Notes:
Permanently deletes the item (bypasses Recycle Bin; Is not recoverable)

Example:
```javascript
sprLib.list('Employees')
.delete(99)
.then(function(intId){
    console.log('Deleted Item:'+intId);
})
.catch(function(strErr){ console.error(strErr); });
```


### Recycle Item
Syntax:
`sprLib.list(listName|listGUID).recycle(itemId)`

Returns:
ID of the item just recycled

Notes:
Moves the item into the Site Recycle Bin

Example:
```javascript
sprLib.list('Employees')
.recycle(99)
.then(function(intId){
    console.log('Recycled Item:'+intId);
})
.catch(function(strErr){ console.error(strErr); });
```



### Get List Column Properties
Syntax:
`sprLib.list(listName|listGUID).cols()`

Returns: Array of columns with name value pairs of property values

#### Column Properties
| Property       | Type     | Description                                |
| :------------- | :------- | :----------------------------------------- |
| `dispName`     | string   | display name                               |
| `dataName`     | string   | internal name - used in REST queries and in `listCols` arguments |
| `dataType`     | string   | column type (FieldTypeKind) values: `Boolean`, `Calculated`, `Currency`, `DateTime`, `Note`, `Number`, `Text` |
| `defaultValue` | boolean  | the default value (if any)                 |
| `isAppend`     | boolean  | is this an append text column?             |
| `isNumPct`     | boolean  | is this a percentage number column?        |
| `isReadOnly`   | boolean  | is this an read only column?               |
| `isRequired`   | boolean  | is a value required in this column?        |
| `isUnique`     | boolean  | are unique values enforced on this column? |
| `maxLength`    | boolean  | the maximum length of the column value     |

#### Sample Code
```javascript
sprLib.list('Employees').cols().then(function(data){ console.table(data) });

// Result:
/*
.--------------------------------------------------------------------------------------------------------------------------------------.
|   dispName   |      dataName      |  dataType  | isAppend | isNumPct | isReadOnly | isRequired | isUnique | defaultValue | maxLength |
|--------------|--------------------|------------|----------|----------|------------|------------|----------|--------------|-----------|
| ID           | ID                 | Counter    | false    | false    | true       | false      | false    |              |           |
| Name         | Name               | Text       | false    | false    | false      | false      | false    |              |       255 |
| Badge Number | Badge_x0020_Number | Number     | false    | false    | false      | true       | true     |              |           |
| Hire Date    | Hire_x0020_Date    | DateTime   | false    | false    | false      | false      | false    |              |           |
'--------------------------------------------------------------------------------------------------------------------------------------'
*/
```

### Get List Info
Syntax:
`sprLib.list(listName|listGUID).info()`

Returns: Array of list properties and their values

#### List Properties
| Property             | Type     | Description                                             |
| :------------------- | :------- | :------------------------------------------------------ |
| `AllowContentTypes`  | boolean  | Whether `Allow management of content types?` is enabled |
| `BaseTemplate`       | integer  | [SPListTemplateType](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.splisttemplatetype.aspx) SP Base Template ID number - ex: `100` |
| `Created`            | date     | Date the List/Library was created                       |
| `Description`        | boolean  | List/Library `Description`                              |
| `EnableAttachments`  | boolean  | Whether users can attach files to items in this list    |
| `ForceCheckout`      | boolean  | Whether Force checkout is enabled                       |
| `Hidden`             | boolean  | Whether List is hidden                                  |
| `Id`                 | GUID     | The SP GUID of the List                                 |
| `ItemCount`          | number   | The number of Items in the List                         |
| `Title`              | string   | The Title of the List/Library                           |

#### Sample Code
```javascript
sprLib.list('Employees').info().then(function(data){ console.table(data) });

// Result:
/*
.-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------.
| AllowContentTypes | BaseTemplate |       Created        | Description | EnableAttachments | ForceCheckout | Hidden |                  Id                  | ItemCount |   Title   |
|-------------------|--------------|----------------------|-------------|-------------------|---------------|--------|--------------------------------------|-----------|-----------|
| true              |          100 | 2016-08-21T20:48:43Z |             | true              | false         | false  | 8fda2799-dbbc-a420-9869-df87b08b09c1 |        25 | Employees |
'-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------'
*/
```



**************************************************************************************************
## REST API Methods
Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

Use the `sprLib.rest()` interface to GET or PORT to any of the dozens of available SP REST API Endpoints.

The available REST service endpoints can add Users to Groups, create columns in a List/Library, enumerate site properties
and other super useful functions.

**Get Results**  
Calling the SharePoint REST APIs directly via AJAX calls will return results in different forms (some are `data.d` while others are `data.d.results`)
whereas SpRestLib always returns consistent results in the form of array of objects with name/value pairs.

Syntax
`sprLib.rest(options)`

Returns: Array of objects containing name/value pairs

### Options
| Option        | Type    | Default     | Description           | Possible Values / Returns           |
| :------------ | :------ | :---------- | :-------------------- | :---------------------------------- |
| `url`         | string  | current url | REST API endpoint     | full or relative url. See: [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx) |
| `type`        | string  | `GET`       | rest type             | `GET` or `POST`. Ex:`type: 'POST'` |
| `data`        | string  |             | data to be sent       | Ex:`data: {'type': 'SP.FieldDateTime'}` |
| `cache`       | boolean | `false`     | cache settings        | Ex:`cache: true` |
| `contentType` | string  | `application/json` | request header content-type | Only used with `type:'POST'` |
| `queryCols`   | string  |             | fields/columns to get | any available field from the SP REST API |
| `queryFilter` | string  |             | query filter          | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) Ex:`queryFilter: 'Salary lt 99000'` |
| `queryLimit`  | string  | `1000`      | max items to return   | 1-5000. Ex:`queryLimit: 5000` |
| `queryOrderby`| string  |             | column(s) to order by | Ex:`queryOrderby: Name` |

### Examples
```javascript
// EX: Get site group info
sprLib.rest({
    url:          '/sites/dev/_api/web/sitegroups',
    queryCols:    ['Title','LoginName','AllowMembersEditMembership'],
    queryFilter:  'AllowMembersEditMembership eq false',
    queryOrderby: 'Title',
    queryLimit:   10
})
.then(function(arrayResults){ console.table(arrayResults) })
.catch(function(errMsg){ console.error(errMsg) });
/*
.------------------------------------------------------------------------------.
|         Title          |       LoginName        | AllowMembersEditMembership |
|------------------------|------------------------|----------------------------|
| Dev Site Owners        | Dev Site Owners        | false                      |
| Dev Site Visitors      | Dev Site Visitors      | false                      |
| Excel Services Viewers | Excel Services Viewers | false                      |
'------------------------------------------------------------------------------'
*/

// EX: Create a new List column
sprLib.rest({
    url:  "_api/web/lists/getbytitle('Employees')/fields",
    type: "POST",
    data: "{'__metadata':{'type':'SP.FieldDateTime'}, 'FieldTypeKind':4, 'Title':'Bonus Date', 'DisplayFormat':1 }"
})
.then(function(){ console.log("New column created!"); })
.catch(function(errMsg){ console.error(errMsg) });
```



**************************************************************************************************
## User Info/Group Methods
Omitting options will return information about the current user, otherwise, the specified user is returned.  
`sprLib.user()`  
`sprLib.user(options)`

### Options
| Option   | Type     | Required? | Description           | Possible Values / Returns                             |
| :------- | :------- | :-------- | :-------------------- | :---------------------------------------------------- |
| `id`     | number   |           | user id               | user id to query. Ex: `{id:99}`                       |
| `email`  | string   |           | user email address    | user email to query. Ex: `{email:'brent@github.com'}` |
| `login`  | string   |           | user login name       | user loginName to query. Ex: `{login:'i:0#.f|membership|brent@github.com'}` |
| `title`  | string   |           | user title            | user title to query. Ex: `{title:'Brent Ely'}`        |

### Get User Information (`SPUser`)
Syntax:
`sprLib.user().info()`  
`sprLib.user(options).groups()`

Returns: Object with name/value pairs containing information about the SharePoint user

Note: *Uses the basic SP User service (not the Enterprise licensed User Profile service)*

#### Sample Code
```javascript
// EXAMPLE: Get current user info
sprLib.user().info()
.then(function(objUser){ console.table([objUser]) });

// EXAMPLE: Get user info by email address
sprLib.user({ email:'brent@microsoft.com' }).info()
.then(function(objUser){ console.table([objUser]); });

// RESULT:
/*
.--------------------------------------------------------------------------------------------.
| Id |              LoginName                |   Title   |        Email        | IsSiteAdmin |
|----|---------------------------------------|-----------|---------------------|-------------|
|  9 | i:0#.f|membership|brent@microsoft.com | Brent Ely | brent@microsoft.com | true        |
'--------------------------------------------------------------------------------------------'
*/
```

### Get User Groups (`SPGroup`)
Syntax:
`sprLib.user().groups()`  
`sprLib.user(options).groups()`

Returns: Array of objects containing the user's SharePoint groups [SPGroup](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spgroup.aspx)

#### Sample Code
```javascript
sprLib.user().groups()
.then(function(arrGroups){ console.table(arrGroups) });

// RESULT:
/*
.-----------------------------------------------------------------------------------------.
| Id |      Title       |        Description         |   OwnerTitle    |    LoginName     |
|----|------------------|----------------------------|-----------------|------------------|
|  6 | Dev Site Owners  | Use for full control perms | Dev Site Owners | Dev Site Owners  |
|  7 | Dev Site Members | Use for contribute perms   | Dev Site Owners | Dev Site Members |
'-----------------------------------------------------------------------------------------'
*/
```



**************************************************************************************************
## Form Binding
Perform control/form binding with an AngluarJS-like syntax made especially for SharePoint Web Services.

Many different HTML tags can be populated by adding an `data-sprlib` property to many HTML element types.

Syntax:
`<tag data-sprlib='{ options }'>`

### Data Binding Types

The following HTML element tags can be populated:
* select: populates 1+ options
* static element (span, p, etc.): populates a single plain text value
* table: a table or tbody can be populates with 1+ columns

### Data Binding Options
| Option        | Type    | Required? | Description             | Possible Values / Returns           |
| :------------ | :------ | :-------- | :---------------------- | :---------------------------------- |
| `list`        | string  | yes       | List or Library name    |   |
| `cols`        | array   |           | columns to be populated |   |
| `text`        | string  |           | text string to show     |   |
| `value`       | string  |           | value string to show    |   |
| `filter`      | string  |           | query filter value      | Ex: `filter="ID eq 100"`  |
| `tablesorter` | string  |           | whether to add jQuery TableFilter to table |   |
| `options`     | string  |           | table/tbody options     | `showBusySpinner` |

#### Examples
```html
<!-- select -->
<select data-sprlib='{ "list":"Employees", "value":"Id", "text":"Name" }'></select>

<!-- input -->
<input type="text" data-sprlib='{ "list":"Departments", "value":"Title" }' placeholder="Departments.Title"></input>

<!-- static elements span, div, etc. -->
<span data-sprlib='{ "list":"Employees", "value":"Name", "filter":{"col":"Name", "op":"eq", "val":"Brent Ely"} }'></span>

<!-- table/tbody -->
<table data-sprlib='{ "foreach": {"list":"Employees", "filter":{"col":"Active", "op":"eq", "val":true}}, "options":{"showBusySpinner":true} }'>
<tbody data-sprlib='{ "foreach": {"list":"Employees", "cols":["Name","Utilization_x0020_Pct"] } }'></tbody>
```



**************************************************************************************************
## Utility Methods
Refreshes the SharePoint page security digest token.  
`sprLib.renewSecurityToken()`

Starting in SP2013, .aspx pages include a security digest token in a hidden input element that will expire
after 30 minutes (by default).

This method allows the refresh of this value, which can be useful in certain cases.

NOTE: SpRestLib will refresh the token automatically as needed during CRUD operations.





**************************************************************************************************
# Node.js and SharePoint Online

## Connect To Office 365/SharePoint Online With Node.js

SpRestLib can be utilized via Node.js to perform powerful operations, generate reports, etc.

### Demo
See the `example` directory for a complete, working demo of connecting to SharePoint Online.





**************************************************************************************************
# Async Operations via Promises

## (New) ES6/ES2015 Promises vs (Old) Callbacks

SpRestLib asynchronous methods return Promises, which provide two main benefits:
* No more callback functions
* No more managing async operations

If you're unfamiliar with the new [ES6 Promise](http://www.datchley.name/es6-promises/) functionality, you may want to
the a moment to read more about them.  They really are a game changer for those of us who deal with asynchronous
operations.

All major browsers (and Node.js) now fully support ES6 Promises, so keep reading to see them in action.

### tl;dr
**Promises can be chained using `then()` or grouped using `Promise.all()` so callbacks and queue management
are a thing of the past.**

### Async Chaining
* Promises can be chained so they execute in the order shown only after the previous one has completed

#### Example Logic
* SpRestLib methods return a Promise, meaning the "return sprestlib" calls below cause the subsequent `.then()` to wait for that method's REST call to return a result
* That's all you need to code to enable chaining of asynchronous operations without any callback functions or queue management!

#### Example Code
```javascript
var item = { Name:'Marty McFly', Hire_x0020_Date:new Date() };
Promise.resolve()
.then(function()    { return sprLib.list('Employees').create(item); })
.then(function(item){ return sprLib.list('Employees').update(item); })
.then(function(item){ return sprLib.list('Employees').delete(item); })
.then(function(item){ console.log('Success! An item navigated the entire CRUD chain!'); });
```

### Async Grouping
* Promises can be grouped using `.all()` meaning each of them must complete before `.then()` is executed.

#### Example Logic
* This example requires that both the user info and user group queries complete before we move on
* The old AJAX callback method model required a lot more code to do the same thing!

#### Example Code
```javascript
Promise.all([ sprLib.user().info(), sprLib.user().groups() ])
.then(function(arrResults){
    // 'arrResults' holds the return values of both method calls above - in the order they were provided
    // Therefore, arrResults[0] holds user info() and arrResults[1] holds user groups()
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

* [Marc D Anderson](http://sympmarc.com/) - SpRestLib is built in the spirit of the late, great `SPServices` library
* Microsoft - for the SharePoint.com developer account
* Everyone who submitted an Issue or Pull Request



**************************************************************************************************
# License

Copyright &copy; 2016-2017 [Brent Ely](https://github.com/gitbrent/SpRestLib)

[MIT](https://github.com/gitbrent/SpRestLib/blob/master/LICENSE)
