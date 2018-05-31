[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/) [![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php) [![npm version](https://img.shields.io/npm/v/sprestlib.svg)](https://www.npmjs.com/package/sprestlib)

# SpRestLib

## JavaScript Library for SharePoint REST Web Services
Provides a clean, concise API that greatly simplifies asynchronous REST interaction with SharePoint. Easily read/write List
items (CRUD), execute REST calls, and gather site/user/group information. Enables rapid development of SharePoint Apps/Add-ins
using the JavaScript SharePoint App Model.  

### Library Features:
* Simple  - Most REST/Web Service interaction can be done in a few lines of code
* Modern  - Lightweight, pure JavaScript solution with no dependencies
* Elegant - Utilizes the new [ES6 Promise](http://www.datchley.name/es6-promises/) architecture for asynchronous operations
* Robust  - Built for [SharePoint 2013 API](https://msdn.microsoft.com/en-us/library/office/jj860569.aspx) and [OData v3](http://www.odata.org/documentation/odata-version-3-0/)

### SharePoint Interfaces:
* List Methods - Create, read, update, and delete (CRUD) List/Library items with a single line of code
* User Methods - Get User information: Basic (ID, Email, LoginName, etc.) and UserProfile (Manager, 100+ Properties)
* Site Methods - Get Site information (Lists, Groups, Users, Roles, Subsites and Permissions)
* REST Methods - Call any available [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx) endpoint
* Form Population - Populate form elements using data-bind declarative binding system like Knockout or AngluarJS

### Supported Environments:
* SharePoint 2013 (SP2013), SharePoint 2016 (SP2016), SharePoint Online (O365)


**************************************************************************************************
# Method Overview

## REST API
* `sprLib.rest(options)` - Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

## List/Library
* `sprLib.list(listName).items(options)` - Returns an array of item objects using a variety of possible options
* `sprLib.list(listName).create(item)`   - Create a new list item using JSON data
* `sprLib.list(listName).update(item)`   - Update an existing item using JSON data
* `sprLib.list(listName).delete(item)`   - Delete an existing item using JSON data (permanently delete)
* `sprLib.list(listName).recycle(item)`  - Recycle an existing item using JSON data (move to Recycle Bin)
* `sprLib.list(listName).cols()`         - Returns an array of column objects with useful info (name, datatype, etc.)
* `sprLib.list(listName).info()`         - Returns information about the List/Library (GUID, numberOfItems, etc.)
* `sprLib.list(listName).perms()`        - Returns an array of the list's Member/Roles objects

## Site Collection/Subsite
* `sprLib.site(siteUrl).groups()`   - Returns an array of the site's Groups and Members
* `sprLib.site(siteUrl).info()`     - Returns over a dozen site properties (ID, Owner, Language, Logo, etc.)
* `sprLib.site(siteUrl).lists()`    - Returns an array of the site's Lists/Libraries
* `sprLib.site(siteUrl).perms()`    - Returns an array of the site's Member/Roles objects
* `sprLib.site(siteUrl).roles()`    - Returns an array of the site's Roles
* `sprLib.site(siteUrl).subsites()` - Returns an array of the site's Subsites
* `sprLib.site(siteUrl).users()`    - Returns an array of the site's Users and their base permissions

## User Groups/Info/Profile
* `sprLib.user(options).groups()`  - Returns an object with `SP.Group` group properties (Id, Owner, Title, etc.)
* `sprLib.user(options).info()`    - Returns an object with `SP.User` user properties (Id, Email, Login, Title, etc.)
* `sprLib.user(options).profile()` - Returns `SP.UserProfile.PersonProperties` (DirectReports, PictureUrl, etc.)

## Utility Methods
* `sprLib.renewSecurityToken()` - Refreshes the SharePoint page security digest token

## SpRestLib-UI :: Form Population
* `data-sprlib{options}` - Populates the parent tag using the options provided



**************************************************************************************************
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Library Test Drive](#library-test-drive)
  - [SpRestLib via Console](#sprestlib-via-console)
- [Installation](#installation)
  - [Client-Side](#client-side)
    - [Include Local Scripts](#include-local-scripts)
    - [Include Bundle Script](#include-bundle-script)
    - [Install With Bower](#install-with-bower)
  - [Node.js](#nodejs)
- [Method Reference](#method-reference)
  - [REST API Methods](#rest-api-methods)
  - [List/Library Methods (`SPList`)](#listlibrary-methods-splist)
  - [Site Methods (`SPSite`)](#site-methods-spsite)
  - [User Methods](#user-methods)
  - [Form Binding (SpRestLib UI)](#form-binding-sprestlib-ui)
  - [Utility Methods](#utility-methods)
- [SharePoint Authentication Notes](#sharepoint-authentication-notes)
- [Integration with Other Libraries](#integration-with-other-libraries)
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
  - [Authentication](#authentication)
  - [Bugs](#bugs)
- [Special Thanks](#special-thanks)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


**************************************************************************************************
# Library Test Drive

## SpRestLib via Console
You should test drive SpRestLib!  It's super easy:  
Just open your browser's Developer Tools window anywhere on your SharePoint site,
then run the following code snippet which will load the SpRestLib bundle script dynamically:

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

## REST API Methods
[REST API Methods](https://gitbrent.github.io/SpRestLib/docs/api-rest.html)

## List/Library Methods (`SPList`)
[List/Library Methods](https://gitbrent.github.io/SpRestLib/docs/api-list.html)

## Site Methods (`SPSite`)
[Site Methods](https://gitbrent.github.io/SpRestLib/docs/api-site.html)

## User Methods
[User Methods](https://gitbrent.github.io/SpRestLib/docs/api-user.html)


**************************************************************************************************
## Form Binding (SpRestLib UI)
[Form Binding](https://gitbrent.github.io/SpRestLib/docs/ui-form-binding.html)


**************************************************************************************************
## Utility Methods
[Utility Methods](https://gitbrent.github.io/SpRestLib/docs/feat-utilities.html)


**************************************************************************************************
# SharePoint Authentication Notes
[SharePoint Authentication Notes](https://gitbrent.github.io/SpRestLib/docs/sp-auth-notes.html)


**************************************************************************************************
# Integration with Other Libraries

Using SpRestLib with React, Angular, etc.
[Integration with Other Libraries](https://gitbrent.github.io/SpRestLib/docs/feat-integration.html)


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
# Issues / Suggestions

## Authentication
See [SharePoint Authentication Notes](https://gitbrent.github.io/SpRestLib/docs/sp-auth-notes.html) for issues with authentication.

## Bugs
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
