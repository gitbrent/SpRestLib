[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/) [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
# SpRestLib

## JavaScript Library for SharePoint Web Services

### Main Features:
* **List/Library Methods:** Read, create, update and delete items with a single line of code
* **Common Tasks:** Reduces everyday app model web service calls to a simple
* **Form Population:** Populate form elements using data-bind declarative binding system like Knockout or AngluarJS

### Library Design:
* Promises: Utilizes the new [ES6 Promise](http://www.datchley.name/es6-promises/) architecture to enable chaining of asynchronous operations
* Modern: Built for [SharePoint 2013 API](https://msdn.microsoft.com/en-us/library/office/jj860569.aspx) / [OData v3](http://www.odata.org/documentation/odata-version-3-0/)
* Lightweight: Small but feature-rich (~30kb minified)
* Simple: JavaScript and REST solution (no CSOM or any libraries required)
* Robust: Handles network issues by retrying failed requests and handles expired form digest/session tokens
* Built for SharePoint:
 * List CRUD interfaces are described using simple javascript objects
 * List column metadata (datatype lookup expansion, etc.) is read automatically from SharePoint and managed for you
 * Monitors the SharePoint authentication token and refreshes it after expiration preventing nasty errors and "reload page" messages

### Supported Environments:
* SharePoint Online (O365), SharePoint 2013 (SP2013), SharePoint 2016 (SP2016)
* Note: Enterprise license not required

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
* `sprLib.rest(options)` - Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx) with parameters provided

## Site
* `sprLib.site().perms()` - Returns an array of SP. ...
* `sprLib.site().groups()` - Returns an array of SP. ...

## User
* `sprLib.user().info()` - Returns a SP.User object with information about the current user (Id, Name, Title, Email, etc.)
* `sprLib.user().groups()` - Returns an of SP.Group objects with information about the current users Groups (Id, Title, etc.)


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
* Returns information about the current user
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
