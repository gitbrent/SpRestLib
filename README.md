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
* Site Interface - Get information about the current site and security (permission groups and members)
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

## NPM
```javascript
npm install sprestlib
```

**************************************************************************************************
# Methods

## List/Library: Get Items
* `sprLib.list(listName).getItems(options)` - Returns the specified columns from a List/Library

## List/Library: Create/Update/Delete (CRUD Operations)
* `sprLib.list(listName).create(item)` - Add the new item to the List/Library
* `sprLib.list(listName).update(item)` - Update the existing item using the data provided
* `sprLib.list(listName).delete(item)` - Delete the item (placed into the Recycle Bin)

## REST Calls
* `sprLib.rest(options)` - Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

## Site
* `sprLib.site().perms()` - Returns an array of List/Library Permissions ...
* `sprLib.site().groups()` - Returns an array of Permission Groups ...

## User
* `sprLib.user().info()` - Returns information about the current [SPUser](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spuser.aspx)
* `sprLib.user().groups()` - Returns an of SPGroup objects with information about the current users Groups


**************************************************************************************************
# API Documentation


**************************************************************************************************
# User

`sprLib.user()`

## Get Current User Information
`sprLib.user().info()`
* Returns information about the current user
* *Uses the basic SP User service (not the Enterprise licensed User Profile service)*

### Sample Code
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


## List/Library CRUD Operations

### Get List/Library Data
* Returns List/Library column values
* Omitting `listCols` will result in every column being returned (mimics SharePoint default behavior)

#### Options
| Option       | Type     | Required? | Description           | Possible Values / Returns           |
| :----------- | :------- | :-------- | :-------------------- | :---------------------------------- |
| `listName`   | string   | yes       | the List/Library name |     |
| `listCols`   | array *OR* object |  | column names to be returned | array of column names *OR* object (see below) |
| `queryFilter` | string   |          | query filter          | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) |
| `queryMaxItems` | string |          | max items to return   | 1-*N* |
| `queryOrderby`  | string |          | column(s) to order by |  |

#### listCols Object
| Option       | Type     | Required? | Description           | Possible Values / Return Values     |
| :----------- | :------- | :-------- | :-------------------- | :---------------------------------- |
| `dataName`   | string   |           | the column name       | the fixed, back-end REST column name (use descList() if unknown) |
| `dispName`   | string   |           | the name to use when displaying results in table headers, etc. |  |
| `dateFormat` | string   |           | format to use when returning/displaying date | `INTL`, `INTLTIME`, `YYYYMMDD`, `ISO`, 'US' |
| `dataFunc`   | function |           | function to use for returning a result | use a custom function to transform the query result (see below) |

#### listCols dataFunc
There are many times where you'll need more than a simple column value.  For example, I often provide a link to the InfoPath
form so users can edit the item directly.

The `dataFunc` option allows you access to the entire result set and to return any type of value.  See sample below where
editLink is created.

#### Sample Code



**************************************************************************************************
# Tips &amp; Tricks

You can chain asynchronous calls by placing subsequent SpRestLib calls inside the parent done function.


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
