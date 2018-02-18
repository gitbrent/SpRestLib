[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/) [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php) [![npm version](https://img.shields.io/npm/v/sprestlib.svg)](https://www.npmjs.com/package/sprestlib)

# SpRestLib

## JavaScript Library for SharePoint REST Web Services
Provides a clean, concise API that greatly simplifies asynchronous REST interaction with SharePoint. Easily read/write List
items (CRUD), execute REST calls, and gather site/user/group information. Enables rapid development of SharePoint Apps/Add-ins
using the JavaScript SharePoint App Model.  

### Library Features:
* Simple  - Most REST/Web Service interaction can be done in a few lines of code
* Modern  - Lightweight, pure JavaScript solution
* Elegant - Utilizes the new [ES6 Promise](http://www.datchley.name/es6-promises/) architecture for asynchronous operations
* Robust  - Built for [SharePoint 2013 API](https://msdn.microsoft.com/en-us/library/office/jj860569.aspx) and [OData v3](http://www.odata.org/documentation/odata-version-3-0/)

### SharePoint Interfaces:
* List Methods - Create, read, update, and delete (CRUD) List/Library items with a single line of code
* REST Methods - Run ad-hoc REST calls to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx) endpoint
* User Methods - Get User information (ID, Email, LoginName, Groups, etc.)
* Site Methods - Get Site information (Lists, Groups, Users, Roles, Subsites and Permissions)
* Form Population - Populate form elements using data-bind declarative binding system like Knockout or AngluarJS

### Supported Environments:
* SharePoint 2013 (SP2013), SharePoint 2016 (SP2016), SharePoint Online (O365)
* *Enterprise license not required*


**************************************************************************************************
# Method Overview

## REST API
* `sprLib.rest(options)` - Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

## List/Library
* `sprLib.list(listName).getItems(options)` - Returns an array of item objects using a variety of possible options
* `sprLib.list(listName).create(item)` - Create a new list item using JSON data
* `sprLib.list(listName).update(item)` - Update an existing item using JSON data
* `sprLib.list(listName).delete(id)`   - Delete an existing item by ID (permanently delete)
* `sprLib.list(listName).recycle(id)`  - Recycle an existing item by ID (move to Recycle Bin)
* `sprLib.list(listName).cols()` - Returns an array of column objects with useful info (name, datatype, etc.)
* `sprLib.list(listName).info()` - Returns information about the List/Library (GUID, numberOfItems, etc.)

## Site Collection/Subsite
* `sprLib.site(siteUrl).groups()`   - Returns an array of the site's Groups and Members
* `sprLib.site(siteUrl).info()`     - Returns over a dozen site properties (ID, Owner, Language, Logo, etc.)
* `sprLib.site(siteUrl).lists()`    - Returns an array of the site's Lists/Libraries
* `sprLib.site(siteUrl).perms()`    - Returns an array of the site's Member/Roles objects
* `sprLib.site(siteUrl).roles()`    - Returns an array of the site's Roles
* `sprLib.site(siteUrl).subsites()` - Returns an array of the site's Subsites
* `sprLib.site(siteUrl).users()`    - Returns an array of the site's Users and their base permissions

## User Information
* `sprLib.user(options).groups()`  - Returns an object with `SP.Group` group properties (Id, Owner, Title, etc.)
* `sprLib.user(options).info()`    - Returns an object with `SP.User` user properties (Id, Email, Login, Title, etc.)
* `sprLib.user(options).profile()` - Returns an object with `SP.UserProfile.PersonProperties` (DirectReports, PictureUrl, etc.)

## Utility
* `sprLib.renewSecurityToken()` - Refreshes the SharePoint page security digest token

## SpRestLib-UI :: Form Population
* `data-sprlib{options}` - Populates the parent tag using the options provided



**************************************************************************************************
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Documentation](#documentation)
- [Library Test Drive](#library-test-drive)
  - [SpRestLib via Console](#sprestlib-via-console)
- [Promise You Will Love It](#promise-you-will-love-it)
  - [JavaScript Promises Have Arrived](#javascript-promises-have-arrived)
- [Installation](#installation)
  - [Client-Side](#client-side)
    - [Include Local Scripts](#include-local-scripts)
    - [Include Bundle Script](#include-bundle-script)
    - [Install With Bower](#install-with-bower)
  - [Node.js](#nodejs)
- [Method Reference](#method-reference)
  - [REST API Methods](#rest-api-methods)
    - [Options](#options)
    - [Examples](#examples)
  - [List/Library Methods (`SPList`)](#listlibrary-methods-splist)
    - [Options](#options-1)
      - [Options: baseUrl](#options-baseurl)
      - [Options: requestDigest](#options-requestdigest)
    - [Get Items](#get-items)
      - [Options](#options-2)
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
  - [Site Methods (`SPSite`)](#site-methods-spsite)
    - [Get Site Info](#get-site-info)
      - [Site Properties](#site-properties)
      - [Sample Code](#sample-code-3)
    - [Get Site Lists](#get-site-lists)
      - [List Properties](#list-properties-1)
      - [Sample Code](#sample-code-4)
    - [Get Site Permissions](#get-site-permissions)
      - [Perm Properties](#perm-properties)
      - [Sample Code](#sample-code-5)
    - [Get Site Groups](#get-site-groups)
      - [Group Properties](#group-properties)
      - [Sample Code](#sample-code-6)
    - [Get Site Roles](#get-site-roles)
      - [Role Properties](#role-properties)
      - [Sample Code](#sample-code-7)
    - [Get Site Subsites](#get-site-subsites)
      - [Subsite Properties](#subsite-properties)
      - [Sample Code](#sample-code-8)
    - [Get Site Users](#get-site-users)
      - [User Properties](#user-properties)
      - [Sample Code](#sample-code-9)
  - [User Methods](#user-methods)
    - [User Query Properties](#user-query-properties)
    - [Get User Information (`SPUser`)](#get-user-information-spuser)
      - [Sample Code](#sample-code-10)
    - [Get User Groups (`SPGroup`)](#get-user-groups-spgroup)
      - [Sample Code](#sample-code-11)
    - [Get User Profile Properties (`SP.UserProfile.PersonProperties`)](#get-user-profile-properties-spuserprofilepersonproperties)
      - [Person Properties](#person-properties)
      - [Sample Code](#sample-code-12)
  - [Form Binding](#form-binding)
    - [Supported HTML Tags](#supported-html-tags)
    - [HTML Tag Properties](#html-tag-properties)
      - [HTML Tag Properties: Table](#html-tag-properties-table)
      - [HTML Tag Properties: Select](#html-tag-properties-select)
      - [HTML Tag Properties: Cols Options](#html-tag-properties-cols-options)
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
- [Integration with Other Libraries](#integration-with-other-libraries)
  - [Integration with Angular/Typescript/Webpack](#integration-with-angulartypescriptwebpack)
- [Issues / Suggestions](#issues--suggestions)
- [Special Thanks](#special-thanks)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

**************************************************************************************************
# Documentation

There's more than just the README!  
* View the online [API Reference](https://gitbrent.github.io/SpRestLib/docs/installation.html)

**************************************************************************************************
# Library Test Drive

## SpRestLib via Console
Want to try SpRestLib on your site?  
Just open an F12 developer window on any page under your SharePoint site and run the following snippet
to load the SpRestLib bundle script dynamically:

```javascript
// 1: Load SpRestLib via CDN
var script = document.createElement('script');
script.src = "https://cdn.rawgit.com/gitbrent/SpRestLib/v1.5.0/dist/sprestlib.bundle.js";
document.getElementsByTagName('head')[0].appendChild(script);

// 2: Test drive some library methods
// Show current user info
sprLib.user().info().then( objUser => (console.table ? console.table([objUser]) : console.log(objUser)) );
// Show all Lists/Libraries on the current Site
sprLib.site().lists().then( arrLists => (console.table ? console.table(arrLists) : console.log(arrLists)) );
```


**************************************************************************************************
# Promise You Will Love It

## JavaScript Promises Have Arrived

What makes a good library great?  The ability to chain and group asynchronous operations!

SpRestLib not only provides a simple REST interface, it also delivers next-generation
async operation handling via [ES6 Promises](http://www.datchley.name/es6-promises/).

SharePoint applications frequently perform lots of operations (e.g.: read from many lists at startup)
or perform sequential steps (e.g.: get an item, then do further operations depending upon the result).
Until recently, using callbacks was the standard way to handle async completion, but with Promises
(which all SpRestLib methods return) operations can be easily chained by using `then()`, making your code
much easier to write and maintain.

See the [Async Operations via Promises](#async-operations-via-promises) section for more information and examples.

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



**************************************************************************************************
# Installation

## Client-Side

### Include Local Scripts
```javascript
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.js"></script>
```
* *IE11 support requires a Promises polyfill as well (included in the `libs` folder)*

### Include Bundle Script
```javascript
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.bundle.js"></script>
```
* *`sprestlib.bundle.js` includes all required libraries (SpRestLib + Promises)*
```javascript
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib-ui.bundle.js"></script>
```
* *`sprestlib-ui.bundle.js` includes all required libraries plus UI (SpRestLib and SpRestLib-UI + jQuery and Promises)*

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
# Method Reference

**************************************************************************************************
## REST API Methods
Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

Use the `sprLib.rest()` interface to GET or POST to any of the dozens of available SP REST API Endpoints.

The available REST service endpoints can add Users to Groups, create columns in a List/Library, enumerate site properties
and other super useful functions.

Syntax:  
`sprLib.rest(options)`

Returns: Array of objects containing name/value pairs

### Options
| Option        | Type    | Default     | Description           | Possible Values / Returns           |
| :------------ | :------ | :---------- | :-------------------- | :---------------------------------- |
| `url`         | string  | current url | REST API endpoint     | full or relative url. See: [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx) |
| `type`        | string  | `GET`       | rest operation type   | `GET` or `POST`. Ex:`type: 'POST'` |
| `data`        | string  |             | data to be sent       | Ex:`data: {'type': 'SP.FieldDateTime'}` |
| `cache`       | boolean | `false`     | cache settings        | Ex:`cache: true` |
| `contentType` | string  | `application/json` | request header content-type | Only used with `type:'POST'` |
| `metadata`    | boolean | `false`     | whether to return `__metadata` | Ex:`metadata: true` |
| `queryCols`   | string  |             | fields/columns to get | any available field from the SP REST API |
| `queryFilter` | string  |             | query filter          | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) Ex:`queryFilter: 'Salary lt 99000'` |
| `queryLimit`  | string  | `1000`      | max items to return   | 1-5000. Ex:`queryLimit: 5000` |
| `queryOrderby`| string  |             | column(s) to order by | Ex:`queryOrderby: Name` |
| `requestDigest` | string | `$('#__REQUESTDIGEST`).val() | Form Digest Value | The `X-RequestDigest` header value (SP Auth) |

### Examples
```javascript
// EX: Get site collection groups
sprLib.rest({
    url:          '/sites/dev/_api/web/sitegroups',
    queryCols:    ['Title','LoginName','AllowMembersEditMembership'],
    queryFilter:  'AllowMembersEditMembership eq false',
    queryOrderby: 'Title',
    queryLimit:   10
})
.then(arrItems => console.table(arrItems))
.catch(errMsg => console.error(errMsg));
/*
.------------------------------------------------------------------------------.
|         Title          |       LoginName        | AllowMembersEditMembership |
|------------------------|------------------------|----------------------------|
| Dev Site Owners        | Dev Site Owners        | false                      |
| Dev Site Visitors      | Dev Site Visitors      | false                      |
| Excel Services Viewers | Excel Services Viewers | false                      |
'------------------------------------------------------------------------------'
*/

// EX: Add a new column to a list/library using the REST API
sprLib.rest({
    url:  "_api/web/lists/getbytitle('Employees')/fields",
    data: "{'__metadata':{'type':'SP.FieldDateTime'}, 'FieldTypeKind':4, 'Title':'Bonus Date', 'DisplayFormat':1 }",
    type: "POST"
})
.then(function(){ console.log("New column created!"); })
.catch(function(errMsg){ console.error(errMsg) });
```





**************************************************************************************************
## List/Library Methods (`SPList`)
Lists can be accessed by either their name or their GUID:  

Syntax: `sprLib.list(listName)`  
Syntax: `sprLib.list(listGUID)`  
Syntax: `sprLib.list({ name:name })`  
Syntax: `sprLib.list({ guid:GUID })`  
Syntax: `sprLib.list({ name:name, baseUrl:path })`  
Syntax: `sprLib.list({ name:name, baseUrl:path, requestDigest:formDigestValue })`  

### Options
| Prop            | Type   | Required? | Description                              | Possible Values                  |
| :-------------- | :----- | :-------- | :--------------------------------------- | :------------------------------- |
| `name`          | string |     Y     | list name or list GUID                   | Ex:`{'name': 'Employees'}`       |
| `guid`          | string |           | list GUID (convenience alias for name)   | Ex:`{'guid': '8675309-ab3d-ef87b08e09e1'}` |
| `baseUrl`       | string |           | the base url                             | Ex:`{'baseUrl': '/sites/dev'}`   |
| `requestDigest` | string |           | the request form digest security token   | Ex:`{'requestDigest': 'ABC123'}` |

#### Options: baseUrl
By default, the base URL is set to where the host webpart is located (`_spPageContextInfo.webServerRelativeUrl`).
However, there are occasions when reading from other locations - like a subsite - is desired. Use the `baseUrl`
parameter to specify the desired location.

#### Options: requestDigest
By default, the request digest is set to the `<input id="__REQUESTDIGEST">` form element value if one exists (e.g.: WebPart in an .aspx page).
Security tokens are required for certain SharePoint operations like creating or updating List items. If your application is not inside
a SharePoint .aspx page, you will need to obtain the digest value and pass it when it's needed.

Example: How to obtain a FormDigestValue
```javascript
sprLib.rest({ url:'_api/contextinfo', type:'POST' })
.then(arr => console.log(arr[0].GetContextWebInformation.FormDigestValue) );
```

### Get Items
Syntax:  
`sprLib.list(listName|listGUID).getItems(options)`

Returns:
* Array of objects containing name/value pairs
* `__metadata` is always included in the results array (to enable further operations, use of Etag, etc.)

#### Options
| Option        | Type     | Default   | Description                         | Possible Values / Returns                  |
| :------------ | :------- | :-------- | :---------------------------------- | :----------------------------------------- |
| `listCols`    | array    |           | array of column names (OData style) | `listCols: ['Name', 'Badge_x0020_Number']` |
| `listCols`    | object   |           | object with column properties       | `listCols: { badge: { dataName:'Badge_x0020_Number' } }` |
| `cache`       | boolean  | `false`   | cache settings                      | Ex:`cache: true` |
| `metadata`    | boolean  | `false`   | whether to return `__metadata`      | Ex:`metadata: true` |
| `queryFilter` | string   |           | query filter                        | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) |
| `queryLimit`  | string   |           | max items to return                    | 1-*N* |
| `queryNext`   | object   |           | object with Next/Skip options (paging) | `prevId` (1-N), `maxItems` (1-5000) Ex:`{ prevId:5000, maxItems:1000 }` |
| `queryOrderby`| string   |           | column(s) to order by                  | Ex:`queryOrderby:Name` |

NOTE: Omitting `listCols` will result in all List columns being returned (mimic SharePoint default behavior)

#### listCols Object
| Option        | Type     | Default   | Description           | Possible Values / Return Values     |
| :------------ | :------- | :-------- | :-------------------- | :---------------------------------- |
| `dataName`    | string   |           | the column name       | the fixed, back-end REST column name (use [Get List Column Properties](#get-list-column-properties)) |
| `dispName`    | string   |           | the name to use when displaying results in table headers, etc. |  |
| `dateFormat`  | string   |           | format to use when returning/displaying date | `INTL`, `INTLTIME`, `YYYYMMDD`, `ISO`, `US` |
| `dataFunc`    | function |           | function to use for returning a result | use a custom function to transform the query result (see below) |
| `getVersions` | boolean  | `false`   | return append text versions in array | `true` or `false` |

#### listCols dataFunc Option
There are many times where you'll need more than a simple column value.  For example, providing a link to the InfoPath
form so users can edit the item directly.

The `dataFunc` option allows you access to the entire result set, then return any type of value.  See the sample below where
an "editLink" is created.

#### Sample Code
```javascript
// EX: Simple array of column names
sprLib.list('Employees').getItems( ['Id','Name','Badge_x0020_Number'] )
.then(arrData => console.table(arrData))
.catch(errMsg => console.error(errMsg));

// Result:
/*
.---------------------------------------.
| Id  |    Name    | Badge_x0020_Number |
|-----|------------|--------------------|
| 253 | Hal Jordan |              12345 |
'---------------------------------------'
*/
```

```javascript
// EX: Using 'listCols' option with array of column names
sprLib.list('Employees').getItems({
    listCols: ['Name', 'Badge_x0020_Number', 'Hire_x0020_Date']
})
.then(arrData => console.table(arrData))
.catch(errMsg => console.error(errMsg));
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
        viewLink:   { dataFunc:function(objItem){ return '<a href="/sites/dev/Lists/Employees/DispForm.aspx?ID='+objItem.ID+'">View Emp</a>' } }
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
| empId | badgeNum |            appendText              |                                viewLink                                |
|-------|----------|------------------------------------|------------------------------------------------------------------------|
|   334 |  1497127 | ["20170624:Update","20170601:New"] | <a href="/sites/dev/Lists/Employees/DispForm.aspx?ID=334">View Emp</a> |
|   339 |  1497924 | ["Not here yet", "Emp created"]    | <a href="/sites/dev/Lists/Employees/DispForm.aspx?ID=339">View Emp</a> |
|   350 |  1497927 | ["Vice President promotion"]       | <a href="/sites/dev/Lists/Employees/DispForm.aspx?ID=350">View Emp</a> |
'--------------------------------------------------------------------------------------------------------------------------------'
*/
```

```javascript
// EX: Using paging/next/skip

// Anytime there are more results than what was returned, an `__next` object will be included. Keep passing these in subsequent queries to get all results.
sprLib.list('Departments').getItems({ listCols:['Id','Created'], queryLimit:5 });
// RESULT:
/*
.-----------------------------------------------------------.
|            __next             | Id |       Created        |
|-------------------------------|----|----------------------|
| {"prevId":"5","maxItems":"5"} |  1 | 2016-12-04T21:58:47Z |
| {"prevId":"5","maxItems":"5"} |  2 | 2016-12-04T21:59:07Z |
| {"prevId":"5","maxItems":"5"} |  3 | 2016-12-04T21:59:20Z |
| {"prevId":"5","maxItems":"5"} |  4 | 2016-12-04T21:59:36Z |
| {"prevId":"5","maxItems":"5"} |  5 | 2016-12-04T21:59:49Z |
'-----------------------------------------------------------'
*/

sprLib.list('Departments').getItems({
    listCols:  ['Id','Created'],
    queryNext: {'prevId':5, 'maxItems':5}
});
// RESULT:
/*
.------------------------------------------------------------.
|             __next             | Id |       Created        |
|--------------------------------|----|----------------------|
| {"prevId":"10","maxItems":"5"} |  6 | 2017-06-01T03:19:01Z |
| {"prevId":"10","maxItems":"5"} |  7 | 2017-12-14T05:00:10Z |
| {"prevId":"10","maxItems":"5"} |  8 | 2017-12-14T05:00:34Z |
| {"prevId":"10","maxItems":"5"} |  9 | 2017-12-14T05:00:59Z |
| {"prevId":"10","maxItems":"5"} | 10 | 2017-12-14T05:01:15Z |
'------------------------------------------------------------'
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

Returns:
ID of the item just deleted

Notes:
Permanently deletes the item (bypasses Recycle Bin; Is not recoverable)

Example:
```javascript
sprLib.list('Employees').delete(99)
.then(function(intId){ console.log('Deleted Item:'+intId); })
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
sprLib.list('Employees').recycle(99)
.then(function(intId){ console.log('Recycled Item:'+intId); })
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
sprLib.list('Employees').cols()
.then(function(arrayResults){ console.table(arrayResults) });

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
Syntax: `sprLib.list(listName|listGUID).info()`

Returns: Array of list properties

#### List Properties
| Property Name               | Type     | Description                                                 |
| :-------------------------- | :------- | :---------------------------------------------------------- |
| `AllowContentTypes`         | boolean  | Whether `Allow management of content types?` is enabled     |
| `BaseTemplate`              | integer  | `SPListTemplateType` SP Base Template ID number - ex: `100` |
| `BaseType`                  | integer  | SP Base Type ID number - ex: `0`                            |
| `Created`                   | string   | Date the List/Library was created (ISO format)              |
| `Description`               | string   | List/Library `Description`                                  |
| `DraftVersionVisibility`    | number   | whether draft versions can be seen                          |
| `EnableAttachments`         | boolean  | whether users can attach files to items in this list        |
| `EnableFolderCreation`      | boolean  | whether users can create folders in this list/library       |
| `EnableVersioning`          | boolean  | whether versioning is enabled for the items in this list    |
| `ForceCheckout`             | boolean  | Whether Force checkout is enabled                           |
| `Hidden`                    | boolean  | Whether List is hidden                                      |
| `Id`                        | GUID     | The SP GUID of the List                                     |
| `ItemCount`                 | number   | The number of Items in the List                             |
| `LastItemDeletedDate`       | string   | Date (ISO format) an item was last deleted                  |
| `LastItemModifiedDate`      | string   | Date (ISO format) an item was last modified                 |
| `LastItemUserModifiedDate`  | string   | Date (ISO format) an item was last modified by a User       |
| `ListItemEntityTypeFullName`| string   | `SP.List.listItemEntityTypeFullName` property               |
| `Title`                     | string   | The Title of the List/Library                               |

#### Sample Code
```javascript
sprLib.list('Employees').info()
.then(function(object){ console.table([object]) });

// RESULT:
/*
.-------------------------------------------------------------------.
|         Prop Name          |              Prop Value              |
|----------------------------|--------------------------------------|
| AllowContentTypes          | true                                 |
| BaseTemplate               | 100                                  |
| BaseType                   | 0                                    |
| Created                    | 2016-08-21T20:48:43Z                 |
| Description                |                                      |
| DraftVersionVisibility     | 0                                    |
| EnableAttachments          | true                                 |
| EnableFolderCreation       | false                                |
| EnableVersioning           | true                                 |
| ForceCheckout              | false                                |
| Hidden                     | false                                |
| Id                         | 8fda2799-dbbc-a420-9869-df87b08b09c1 |
| ItemCount                  | 238                                  |
| LastItemDeletedDate        | 2017-10-27T04:42:39Z                 |
| LastItemModifiedDate       | 2017-10-27T04:42:55Z                 |
| LastItemUserModifiedDate   | 2017-10-27T04:42:55Z                 |
| ListItemEntityTypeFullName | SP.Data.EmployeesListItem            |
| Title                      | Employees                            |
'-------------------------------------------------------------------'
*/
```





**************************************************************************************************
## Site Methods (`SPSite`)

### Get Site Info
Syntax:  
`sprLib.site().info()`  
`sprLib.site(siteUrl).info()`

Returns: Array of site properties

#### Site Properties
| Property Name             | Type     | Description                                              |
| :------------------------ | :------- | :------------------------------------------------------- |
| `AssociatedMemberGroup`   | object   | Object with Group properties (`Id`,`Title`,`OwnerTitle`) |
| `AssociatedOwnerGroup`    | object   | Object with Group properties (`Id`,`Title`,`OwnerTitle`) |
| `AssociatedVisitorGroup`  | object   | Object with Group properties (`Id`,`Title`,`OwnerTitle`) |
| `Created`                 | string   | Date (ISO format) the site was created                   |
| `Description`             | string   | Site Description                                         |
| `Id`                      | GUID     | The SP GUID of the Site                                  |
| `Language`                | number   | `SP.Language.lcid` property                              |
| `LastItemModifiedDate`    | string   | Date (ISO format) an item was last modified              |
| `LastItemUserModifiedDate`| string   | Date (ISO format) an item was last modified by a User    |
| `Owner`                   | object   | Object with Group properties (`Email`,`LoginName`,`Title`,`IsSiteAdmin`) |
| `RequestAccessEmail`      | string   | Email that receives access requests for this site/subsite |
| `SiteLogoUrl`             | string   | Relative URL to the site's logo image                     |
| `Title`                   | string   | The Title of the Site/Subsite                             |
| `Url`                     | string   | Absolute site URL                                         |
| `WebTemplate`             | string   | Web template name                                         |

#### Sample Code
```javascript
sprLib.site().info()
.then(function(objSite){ console.table([objSite]) });

/*
.-------------------------------------------------------------------------------------------------------------------------------------.
|        Prop Name         |                                                Prop Value                                                |
|--------------------------|----------------------------------------------------------------------------------------------------------|
| AssociatedMemberGroup    | {"Id":8,"Title":"Dev Site Members","OwnerTitle":"Dev Site Owners"}                                       |
| AssociatedOwnerGroup     | {"Id":6,"Title":"Dev Site Owners","OwnerTitle":"Dev Site Owners"}                                        |
| AssociatedVisitorGroup   | {"Id":7,"Title":"Dev Site Visitors","OwnerTitle":"Dev Site Owners"}                                      |
| Created                  | 2016-08-16T14:53:31.327                                                                                  |
| Description              | Main O365 Dev Site for SpRestLib.                                                                        |
| Id                       | 123b4f37-6a13-4bc8-869a-08b5e4b7c058                                                                     |
| Language                 | 1033                                                                                                     |
| LastItemModifiedDate     | 2017-10-28T23:06:13Z                                                                                     |
| LastItemUserModifiedDate | 2017-10-28T23:06:13Z                                                                                     |
| RequestAccessEmail       | someone@example.com                                                                                      |
| SiteLogoUrl              | /sites/dev/SiteAssets/images/sample_company_logo.png                                                     |
| Title                    | SpRestLib Dev Site                                                                                       |
| Url                      | https://brent.sharepoint.com/sites/dev                                                                   |
| WebTemplate              | STS                                                                                                      |
| Owner                    | {"LoginName":"brent@microsoft.com","Title":"Brent Ely","Email":"brent@microsoft.com","IsSiteAdmin":true} |
'-------------------------------------------------------------------------------------------------------------------------------------'
*/
```

### Get Site Lists
Syntax:  
`sprLib.site().lists()`  
`sprLib.site(siteUrl).lists()`

Returns: Array of site lists

#### List Properties
| Property Name    | Type     | Description                                      |
| :--------------- | :------- | :----------------------------------------------- |
| `BaseTemplate`   | number   | `SP.List.baseTemplate` property value            |
| `BaseType`       | number   | `SP.BaseType` property value                     |
| `Description`    | string   | Site Description                                 |
| `Hidden`         | boolean  | Is list hidden?                                  |
| `Id`             | GUID     | The SP GUID of the Site                          |
| `ImageUrl`       | string   | Relative URL to the site's SharePoint logo image |
| `ItemCount`      | number   | Total items in the List/Library                  |
| `ParentWebUrl`   | string   | Relative URL of parent web site                  |
| `RootFolder`     | string   | RootFolder.ServerRelativeUrl                     |
| `Title`          | string   | Title of the Site/Subsite                        |

#### Sample Code
```javascript
sprLib.site().lists()
.then(function(arr){ console.table([arr[0]]) });

/*
.-----------------------------------------------------.
|  Prop Name   |              Prop Value              |
|--------------|--------------------------------------|
| Id           | 8fda2798-daba-497d-9840-df87b08e09c1 |
| Title        | Employees                            |
| Description  |                                      |
| ParentWebUrl | /sites/dev                           |
| ItemCount    | 238                                  |
| Hidden       | false                                |
| ImageUrl     | /_layouts/15/images/itgen.png?rev=44 |
| BaseType     | 0                                    |
| BaseTemplate | 100                                  |
| RootFolder   | /sites/dev/Lists/Employees           |
'-----------------------------------------------------'
*/
```

### Get Site Permissions
Syntax:  
`sprLib.site().perms()`  
`sprLib.site(siteUrl).perms()`

Returns: Array of site permissions

#### Perm Properties
| Property Name    | Type     | Description                                                           |
| :--------------- | :------- | :-------------------------------------------------------------------- |
| `Member`         | object   | object with Member properties (`Title`,`PrincipalId`,`PrincipalType`) |
| `Roles`          | object   | array of Role objects with properties: (`Name`,`Hidden`)              |

#### Sample Code
```javascript
sprLib.site().perms()
.then(function(arrayResults){ console.table(arrayResults) });

/*
.-----------------------------------------------------------------------------------------------------------------------------------------------------------.
|                                        Member                                         |                               Roles                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| {"Title":"Excel Services Viewers","PrincipalType":"SharePoint Group","PrincipalId":5} | [{"Hidden":false,"Name":"View Only"}]                             |
| {"Title":"Dev Site Owners","PrincipalType":"SharePoint Group","PrincipalId":6}        | [{"Hidden":false,"Name":"Full Control"}]                          |
| {"Title":"Dev Site Visitors","PrincipalType":"SharePoint Group","PrincipalId":7}      | [{"Hidden":false,"Name":"Read"}]                                  |
| {"Title":"Dev Site Members","PrincipalType":"SharePoint Group","PrincipalId":8}       | [{"Hidden":false,"Name":"Design"},{"Hidden":false,"Name":"Edit"}] |
'-----------------------------------------------------------------------------------------------------------------------------------------------------------'
*/
```


### Get Site Groups
Syntax:  
`sprLib.site().groups()`  
`sprLib.site(siteUrl).groups()`

Returns: Array of site Groups

#### Group Properties
| Property Name                | Type     | Description                                      |
| :--------------------------- | :------- | :----------------------------------------------- |
| `AllowMembersEditMembership` | boolean  | Whether members can edit the group               |
| `Description`                | string   | Group Description                                |
| `Id`                         | GUID     | Group ID                                         |
| `OwnerTitle`                 | string   | Owner Title                                      |
| `PrincipalType`              | string   | Group, User, etc.                                |
| `Title`                      | string   | Title of the Group                               |
| `Users`                      | object   | array of User objects with properties: (`Id`,`LoginName`,`Title`) |

#### Sample Code
```javascript
sprLib.site().groups()
.then(function(arrayResults){ console.table(arrayResults) });

/*
.----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------.
| Id |         Title          |  PrincipalType   |             Description            |    OwnerTitle     | AllowMembersEditMembership |                     Users                                         |
|----|------------------------|------------------|------------------------------------|-------------------|----------------------------|-------------------------------------------------------------------|
|  8 | Dev Site Members       | SharePoint Group | contribute permissions: Dev Site   | Dev Site Owners   | true                       | []                                                                |
|  6 | Dev Site Owners        | SharePoint Group | full control permissions: Dev Site | SharePoint Group  | false                      | [{"Id":99,"LoginName":"brent@microsoft.com","Title":"Brent Ely"}] |
|  7 | Dev Site Visitors      | SharePoint Group | read permissions: Dev Site         | SharePoint Group  | false                      | []                                                                |
'----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------'
*/
```


### Get Site Roles
Syntax:  
`sprLib.site().roles()`  
`sprLib.site(siteUrl).roles()`

Returns: Array of SiteCollection Roles (result is the same if siteUrl is provided)

#### Role Properties
| Property Name                | Type     | Description                                      |
| :--------------------------- | :------- | :----------------------------------------------- |
| `Description`                | string   | Role Description                                 |
| `Hidden`                     | boolean  | Whether this Role is hidden or not               |
| `Id`                         | GUID     | Role ID                                          |
| `Name`                       | string   | Role Name                                        |
| `RoleTypeKind`               | number   | `SP.RoleDefinition.roleTypeKind` value           |

#### Sample Code
```javascript
sprLib.site().roles()
.then(function(arrayResults){ console.table(arrayResults) });

/*
.-------------------------------------------------------------------------------------------------------------------.
|     Id     |      Name      |                         Description                         | RoleTypeKind | Hidden |
|------------|----------------|-------------------------------------------------------------|--------------|--------|
| 1073741829 | Full Control   | Has full control.                                           |            5 | false  |
| 1073741828 | Design         | Can view, add, update, delete, approve, and customize.      |            4 | false  |
| 1073741830 | Edit           | Can add, edit and delete lists and items and documents.     |            6 | false  |
| 1073741827 | Contribute     | Can view, add, update, and delete list items and documents. |            3 | false  |
| 1073741826 | Read           | Can view pages and list items and download documents.       |            2 | false  |
| 1073741825 | Limited Access | Can view specific lists, document libraries, list items...  |            1 | true   |
| 1073741924 | View Only      | Can view pages, list items, and documents.                  |            0 | false  |
'-------------------------------------------------------------------------------------------------------------------'
*/
```


### Get Site Subsites
Syntax:  
`sprLib.site().subsites()`  
`sprLib.site(siteUrl).subsites()`

Returns: Array of subsites under the current or specified location

#### Subsite Properties
| Property Name    | Type     | Description                                        |
| :--------------- | :------- | :------------------------------------------------- |
| `Created`        | string   | Date (ISO format) that this Site was created       |
| `Id`             | GUID     | SP GUID for this site                              |
| `Language`       | number   | `SP.Language.lcid` property                        |
| `Modified`       | string   | Date (ISO format) that this Site was last modified |
| `Name`           | string   | Site Name                                          |
| `SiteLogoUrl`    | string   | relative URL to site logo image                    |
| `UrlAbs`         | string   | absolute URL of this site                          |
| `UrlRel`         | boolean  | relative URL of this site                          |


#### Sample Code
```javascript
sprLib.site().subsites()
.then(function(arrayResults){ console.table(arrayResults[0]) });

/*
// Subsite Object
.-----------------------------------------------------------------.
|  Prop Name  |                    Prop Value                     |
|-------------|---------------------------------------------------|
| Id          | 822555ab-9376-4a1b-925b-82dcc7bf3cbd              |
| Name        | Sandbox                                           |
| Created     | 2017-09-30T04:27:51                               |
| Modified    | 2017-10-25T03:48:39Z                              |
| Language    | 1033                                              |
| SiteLogoUrl | /sites/dev/SiteAssets/sprestlib-logo.png          |
| UrlAbs      | https://brent.sharepoint.com/sites/dev/sandbox    |
| UrlRel      | /sites/dev/sandbox                                |
'-----------------------------------------------------------------'
*/
```


### Get Site Users
Syntax:  
`sprLib.site().users()`  
`sprLib.site(siteUrl).users()`

Returns: Array of users under the current or specified location

Notes:
* If siteUrl is omitted, then all users in the entire SiteCollection are returned. Otherwise, only the users
under the given site are returned (all users with direct grants and all users within Groups that have site permissions).

#### User Properties
| Property Name                | Type     | Description                                                     |
| :--------------------------- | :------- | :-------------------------------------------------------------- |
| `Email`                      | string   | user email address                                              |
| `Groups`                     | array    | array of user's group objects with properties: (`Id`,`Title`)   |
| `Id`                         | number   | user Id                                                         |
| `IsSiteAdmin`                | object   | whether the user us a site collection admin (SCA)               |
| `LoginName`                  | string   | user LoginName                                                  |
| `Title`                      | string   | user Title                                                      |

#### Sample Code
```javascript
sprLib.site().users()
.then(function(arrayResults){ console.table(arrayResults) });

/*
.------------------------------------------------------------------------------------------------------------------------.
| Id |        Email        |          LoginName         |   Title   | IsSiteAdmin |                Groups                |
|----|---------------------|----------------------------|-----------|-------------|--------------------------------------|
|  9 | brent@microsoft.com | i:0#.f|brent@microsoft.com | Brent Ely | true        | [{"Id":6,"Title":"Dev Site Owners"}] |
'------------------------------------------------------------------------------------------------------------------------'
*/
```





**************************************************************************************************
## User Methods
Syntax:  
`sprLib.user()`  
`sprLib.user(options)`

Usage: Omitting options will return information about the current user, otherwise, the specified user is returned.  

### User Query Properties
| Prop      | Type   | Required? | Description           | Possible Values                                             |
| :-------- | :----- | :-------- | :-------------------- | :---------------------------------------------------------- |
| `baseUrl` | string |           | the base url          | Ex:`{'baseUrl': '/sites/dev'}`                              |
| `id`      | number |           | user id               | user id to query. Ex: `{id:99}`                             |
| `email`   | string |           | user email address    | user email to query. Ex: `{email:'brent@github.com'}`       |
| `login`   | string |           | user login name       | user loginName to query. Ex: `{login:'AMERICAS\Brent_Ely'}` |
| `title`   | string |           | user title            | user title to query. Ex: `{title:'Brent Ely'}`              |

### Get User Information (`SPUser`)
Syntax:  
`sprLib.user().info()`  
`sprLib.user(options).info()`

Returns: Object with SharePoint user (`SP.User`) properties.

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


### Get User Profile Properties (`SP.UserProfile.PersonProperties`)
Syntax:  
`sprLib.user().profile()`  
`sprLib.user(options).profile()`
`sprLib.user(options).profile('DirectReports')`
`sprLib.user(options).profile(['DirectReports', 'Email'])`

Usage: Current user is selected unless `options` is provided.

Returns: Object with [SP.UserProfile.PersonProperties](https://msdn.microsoft.com/en-us/library/jj712733.aspx)

Notes:
* The User Profile Service API is only available for enterprise licensed on-prem or Office online.
* Omit `profile` arguments to query all properties, or specify 1 or more as an array of property names

#### Person Properties
| Property Name           | Type     | Description                                                        |
| :---------------------- | :------- | :----------------------------------------------------------------- |
| `AccountName`           | string   | account name                                                       |
| `DirectReports`         | array    | array of user's direct reports                                     |
| `DisplayName`           | number   | display name                                                       |
| `Email`                 | object   | email address                                                      |
| `ExtendedManagers`      | string   | Extended Managers                                                  |
| `ExtendedReports`       | string   | Extended Reports                                                   |
| `IsFollowed`            | string   | Is Followed                                                        |
| `LatestPost`            | string   | Latest Post                                                        |
| `Peers`                 | string   | array of peer users                                                |
| `PersonalSiteHostUrl`   | string   | PersonalSiteHostUrl                                                |
| `PersonalUrl`           | string   | personal website url                                               |
| `PictureUrl`            | string   | profile picture url                                                |
| `Title`                 | string   | title                                                              |
| `UserProfileProperties` | object   | 100+ properties: `Manager`, `PhoneticFirstName`, `WorkPhone`, etc. |
| `UserUrl`               | string   | Person.aspx profile page url                                       |

#### Sample Code
```javascript
// EXAMPLE: Current User: Get all Profile properties
sprLib.user().profile()
.then(function(objProps){ console.table([objProps]) });

// RESULT:
/*
.-------------------------------------------------------------------------------------.
|       Prop Name       |                         Prop Value                          |
|-----------------------|-------------------------------------------------------------|
| AccountName           | i:0#.f|membership|brent@contoso.onmicrosoft.com             |
| DirectReports         | []                                                          |
| DisplayName           | Brent Ely                                                   |
| Email                 | brent@contoso.onmicrosoft.com                               |
| ExtendedManagers      | []                                                          |
| ExtendedReports       | ["i:0#.f|membership|brent@contoso.onmicrosoft.com"]         |
| IsFollowed            | null                                                        |
| LatestPost            | null                                                        |
| Peers                 | []                                                          |
| PersonalSiteHostUrl   | https://sharepoint.com:443/                                 |
| PersonalUrl           | https://sharepoint.com/personal/brent_onmicrosoft_com/      |
| PictureUrl            | https://sharepoint.com:443/Profile/MThumb.jpg?t=63635514080 |
| Title                 | null                                                        |
| UserProfileProperties | {"UserProfile_GUID":"712d9300-5d61-456b-12d3-399d29e5e0bc"} |
| UserUrl               | https://sharepoint.com:443/Person.aspx?accountname=         |
'-------------------------------------------------------------------------------------'
*/

// EXAMPLE: Specified User: Single Profile property
sprLib.user({ email:'brent@microsoft.com' }).profile('ExtendedReports')
.then(function(objProps){ console.table([objProps]) });

// RESULT:
/*
.-------------------------------------------------------------------------------------.
|       Prop Name       |                         Prop Value                          |
|-----------------------|-------------------------------------------------------------|
| ExtendedReports       | ["i:0#.f|membership|brent@contoso.onmicrosoft.com"]         |
'-------------------------------------------------------------------------------------'
*/
```


//



**************************************************************************************************
## Form Binding
Include the optional `sprestlib-ui.js` library to perform control/form binding with an
AngluarJS-like syntax made especially for SharePoint Web Services.

Many different HTML tags can be populated by adding an `data-sprlib` property to many HTML element types.

Syntax:
`<tag data-sprlib='{ options }'>`

### Supported HTML Tags

The following HTML element tags can be populated:
* select: `select` can be populated with various text/value options
* table: `table` or `tbody` can be populated with 1-n SharePoint List columns
* other: (`input`, `p`, `span`, etc.): populates a single, plain text value

### HTML Tag Properties
| Name          | Type    | Description                    | Possible Values                                      |
| :------------ | :------ | :----------------------------- | :--------------------------------------------------- |
| `list`        | string  | **REQUIRED** list/library name | Ex:`"list": "Employees"`                             |
| `cols`        | array   | columns to be selected         | Ex:`"cols": ["ID","Title"]`                          |
| `filter`      | string  | query filter value             | Ex:`"filter": {"col":"ID", "op":"eq", "val":"99"}`   |
| `limit`       | integer | max items to return            | Ex:`"limit": 100`                                    |
| `options`     | string  | table/tbody options            | (see below)                                          |
| `showBusy`    | boolean | show busy animation during load | (shows CSS animation before control loads)          |

* `cols` is an array of either strings (Ex: `cols: ["ID","Title"]`), objects (Ex: `cols: [{"name":"Title"}]`) or a combination of the two (see Options below)

#### HTML Tag Properties: Table
| Name          | Type    | Description                    | Possible Values                                                   |
| :------------ | :------ | :----------------------------- | :---------------------------------------------------------------- |
| `tablesorter` | string  | add jQuery TableSorter plugin  | (only for tables). Adds the jQuery tableSorter library to table   |

#### HTML Tag Properties: Select
| Name          | Type    | Description                    | Possible Values                                                   |
| :------------ | :------ | :----------------------------- | :---------------------------------------------------------------- |
| `text`        | string  | text string to show            | (only for select). Ex:`text:"Title"`                              |
| `value`       | string  | value string to show           | (only for select). Ex:`value:"ID"`                                |

#### HTML Tag Properties: Cols Options
| Name          | Type    | Description                    | Possible Values                                                   |
| :------------ | :------ | :----------------------------- | :---------------------------------------------------------------- |
| `name`        | string  | the OData column name          | Examples: `"Title"`, `"Hire_x0020_Date"`, `"AssignedTo/Email"`    |
| `class`       | string  | CSS class name to use          | Ex:`"class":"highlight"`                                          |
| `format`      | string  | date format option             | Any of: `US`,`DATE`,`INTL`,`INTLTIME`,`ISO`. Ex:`format: "INTL"`  |
| `label`       | string  | text for table header          | (only for table tags without thead) show "Hire Date" instead of "Hire_x0020_Date", etc. |
| `style`       | string  | CSS style to use               | Ex:`"style":"width:50%; color:red;"`                              |

### Examples
```html
<!-- table/tbody -->
<table data-sprlib='{ "list":"Employees", "cols":["Name"], "filter":{"col":"Active", "op":"eq", "val":true}} }'>
<table data-sprlib='{ "list":"Employees", "cols":["Name",{"name":"Utilization_x0020_Pct","label":"Util%"}] } }'></tbody>
<tbody data-sprlib='{ "list":"Departments", "cols":["Title",{"name":"Modified","format":"INTLTIME"}], "limit":10 }\'></table>

<!-- select -->
<select data-sprlib='{ "list":"Employees", "value":"Id", "text":"Name", "showBusy":true }'></select>

<!-- input -->
<input type="text" data-sprlib='{ "list":"Departments", "value":"Title" }' placeholder="Departments.Title"></input>

<!-- static elements span, div, etc. -->
<span data-sprlib='{ "list":"Employees", "value":"Name", "filter":{"col":"Name", "op":"eq", "val":"Brent Ely"} }'></span>
```



**************************************************************************************************
## Utility Methods
Refreshes the SharePoint page security digest token.  
`sprLib.renewSecurityToken()`

Starting in SP2013, `.aspx` pages include a security digest token in a hidden input element that will expire
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
* The old AJAX callback method model required a lot more code to do this very thing!

#### Example Code
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



**************************************************************************************************
# Integration with Other Libraries

## Integration with Angular/Typescript/Webpack

The library may detect your app as a Node.js application, which utilizes a different AJAX
call and authentication. If your application is embedded in an .aspx page, disable Node
detection to have the library operate in browser mode.  
`sprLib.nodeConfig({ nodeEnabled:false });`

Issue/Discussion: [Issue #9](https://github.com/gitbrent/SpRestLib/issues/9)



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

Copyright &copy; 2016-2018 [Brent Ely](https://github.com/gitbrent/SpRestLib)

[MIT](https://github.com/gitbrent/SpRestLib/blob/master/LICENSE)
