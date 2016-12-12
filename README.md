[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/) [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
# Introduction

## SpRestLib is a client-side jQuery JavaScript library for SharePoint web services

### Main Features:
* **REST Easy:** Perform SharePoint List/Library CRUD operations with a single function call using a simple object
* **SP One-Liners:** Reduces common web service calls to a single line (e.g.: Get Current User)
* **Form Binding:** Populates, parses and provides one-way data-binding on form input elements

### Additional Features:
* Bind form elements to your SharePoint DataModel using data-bind declarative binding
* Populate form elements using data-bind declarative binding system like Knockout or AngluarJS

### Library Design:
* Modern: Built for [SharePoint 2013 API](https://msdn.microsoft.com/en-us/library/office/jj860569.aspx) / [OData v3](http://www.odata.org/documentation/odata-version-3-0/)
* Lightweight: Small but feature-rich (~30kb minified)
* Simple: Pure JavaScript REST calls (no JSOM or CSOM)
* Robust: Handles network issues by retrying failed requests and handles expired form digest/session tokens
* Built for SharePoint:
 * List CRUD interfaces are described using simple javascript objects
 * List column metadata (datatype lookup expansion, etc.) is read automatically from SharePoint and managed for you
 * Built to detect and handle common SharePoint-specific authentication, expiration and other errors

### Supported Environments:
* SharePoint Online (O365), SharePoint 2013 (SP2013), SharePoint 2016 (SP2016)
* Note: Enterprise license not required

**************************************************************************************************
# Installation
SpRestLib requires only one additional JavaScript library to function:
```javascript
<script lang="javascript" src="SpRestLib/libs/jquery.min.js"></script>
<script lang="javascript" src="SpRestLib/sprestlib.js"></script>
```

**************************************************************************************************
# Functionality

## Users / Groups

### Current User
Get the current user Id, Name and Email
NOTE: Uses the basic SP User service - not the Enterprise-licensed User Profile service).
```javascript
sprLib.getCurrUser({
	onDone: function(data){ console.log("Id:" + data.Id +", Title:"+ data.Title +", Email:"+ data.Email); }
});
RESULT: Id:7, Title:Brent Ely, Email:brent@site.onmicrosoft.com
```

### Current User Groups
```javascript
sprLib.getCurrUserGroups({
	onDone: function(data){ console.log("Current User Groups: " + data.toString()); }
});
RESULT: Current User Groups: Dev Site Owners, Site Owners
```

### User Info (by ID)
```javascript
sprLib.getUserInfo({
	userId: 9,
	onDone: function(data){ console.log("Title:" + data.Title + ", Email:"+ data.Email); }
});
RESULT: Title:Brent Ely, Email:brent@site.onmicrosoft.com
```

## List/Library CRUD Operations

### Read Data
```javascript
sprLib.model('Employees').add({
	objName: 'Employees',
	objCols: {
		name:     { dataName:'Name'                                                           },
		badgeNum: { dataName:'Badge_x0020_Number'                                             },
		hireDate: { dataName:'Hire_x0020_Date',       dispName:'Hire Date', dataFormat:'INTL' },
		utilPct:  { dataName:'Utilization_x0020_Pct', dispName:'Util %'                       },
		profile:  { dataName:'Job_x0020_Profile'                                              },
		comments: { dataName:'Comments'                                                       }
	},
	ajaxFilter: "Job_x0020_Profile eq 'Manager'",
	ajaxMaxItems: "10",
	ajaxOrderby: "Name",
	onExec: function(){ console.log('Employees onExec...'); },
	onDone: function(data){ console.log('Employees onDone! Data length:'+data.length); },
	onFail: function(mssg){ console.error('ERROR:'+mesg); }
});
```

### Insert Data
```javascript
sprLib.insertItem({
	objName: 'Employees',
	jsonData: {
		__metadata: { type:"SP.Data."+ 'Employees' +"ListItem" },
		Name: 'Mr. SP REST Library',
		Badge_x0020_Number: 123,
		Hire_x0020_Date: new Date(),
		Salary: 12345.49,
		Active_x003f_: true
	},
	onDone: function(data){ alert('insert done! new id = '+data.id); },
	onFail: function(mesg){ console.error('ERROR: '+mesg); }
});
```

### Updatye Data
```javascript
sprLib.updateItem({
	onFail: function(mesg){ console.error('ERROR: '+mesg); }
});
```

### Delete Data
```javascript
sprLib.deleteItem({
	onFail: function(mesg){ console.error('ERROR: '+mesg); }
});
```

## HTML Form Functions: (WIP)
```javascript
doParseFormFieldsIntoJson(inModel,inEleId);
```

## One-Way Data Binding (WIP)
```javascript
doSyncListItem(inModel, inObj);
```

## Form Population
Populate a &lt;select&gt; form element with "name"/"id" (option text/value) of all items in the `Employees` List:
```html
<select id="selEmployees" data-bind='{"foreach":{"model":"Employees", "text":"name", "value":"id"}}'></select>
```
```html
<input type="text" data-bind='{"col":"name"}'>
<input type="text" data-bind='{"text":{"model":"Employees", "cols":["badgeNum"]}}'>
```
(WIP)

# Model Methods (WIP)
add
data
meta
parseForm
sync
syncItem


**************************************************************************************************
# Tips &amp; Tricks

You can chain asynchronous calls by placing subsequent SpRestLib calls inside the parent done function.

Example:
```javascript
sprLib.getCurrUser({
	onDone: function(data){
		sprLib.getUserInfo({
			userId: data.Id,
			onDone: function(data){
				console.log("Silly example, but it shows how to solve the async wait issue!");
			}
		});
	}
});
```


**************************************************************************************************
# Configurable!
var APP_OPTS and APP_CSS can be edited to set base URL, max rows returned, etc easily


**************************************************************************************************
# Issues / Suggestions

Please file issues or suggestions on the [issues page on github](https://github.com/gitbrent/SpRestLib/issues/new), or even better, [submit a pull request](https://github.com/gitbrent/SpRestLib/pulls)!

When reporting bugs or issues, if you could include a link to a simple jsbin or similar demonstrating the issue, that'd be really helpful.

**************************************************************************************************
# Special Thanks

Built in the spirit of SPServices by [Marc D Anderson](http://sympmarc.com/).

**************************************************************************************************
# License

Copyright &copy; 2016-2017 [Brent Ely](https://github.com/gitbrent/SpRestLib)

[MIT](https://github.com/gitbrent/SpRestLib/blob/master/LICENSE)
