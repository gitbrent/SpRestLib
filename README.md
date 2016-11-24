[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/) [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
# SpRestLib
###JavaScript SharePoint REST Library

jQuery library for SharePoint web services

* Does the grunt work for you.  E.g.: Gets the current user in one line of code
* Perform ad-hoc List/Library CRUD operations with a few lines of code
* Fills, parses and provides one-way data binding to SP Lists

Supported Environments:
* SharePoint 2013-2016 on-prem and O365-hosted (SP2013 and SP2016)

Features:
* Modern:
 * Uses the newest REST API calls (not the old SP2010 web services)
* Lightweight:
 * Small, but feature-rich
 * List interfaces are described using simple javascript objects
* Standards-compliant:
 * Uses vanilla JavaScript for AJAX/REST calls (no JSOM or CSOM code is used)
* Robust:
 * Reads List column metadata from SharePoint so you don't spend time defining/maintaining fields
 * Automatically retries failed requests
 * Detects expired form digest/session tokens, requests a new token asynchronously, then continues the original operation.
* Built for SharePoint:
 * Built to detect and handle common SharePoint-specific authentication errors

**************************************************************************************************
# Installation
SpRestLib requires only one additional JavaScript library to function.
```javascript
<script lang="javascript" src="js/SpRestLib/jquery.min.js"></script>
<script lang="javascript" src="js/SpRestLib/sprestlib.js"></script>
```

**************************************************************************************************
# Functionality

Get the current user (Id, Name and Email)
NOTE: Uses the basic SP User service, not the Enterprise-licensed User Profile, so the Library can be used in any environment.

## Current User / Current User Groups
```javascript
sprLib.getCurrUser({
	onDone: function(data){ console.log(data.Id +" - "+ data.Title +" - "+ data.Email); }
});
```

## Ad-hoc CRUD
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

## Form Population
Populate a &lt;select&gt; form element with "name"/"id" (option text/value) of all items in the `Employees` List:
```html
<select id="selEmployees" data-bind='{"foreach":{"model":"Employees", "text":"name", "value":"id"}}'></select>
```
```html
<input type="text" data-bind='{"col":"name"}'>
<input type="text" data-bind='{"text":{"model":"Employees", "cols":["badgeNum"]}}'>
```




**************************************************************************************************
# Bugs & Issues

When reporting bugs or issues, if you could include a link to a simple jsbin or similar demonstrating the issue, that'd be really helpful.

**************************************************************************************************
# License

Built in the spirit of SPServices by [Marc D Anderson](http://sympmarc.com/).

**************************************************************************************************
# License

[MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015-2016 Brent Ely, [https://github.com/GitBrent/SpRestLib](https://github.com/GitBrent/SpRestLib)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
