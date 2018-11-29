---
id: feat-utilities
title: Utility Methods
---
## Options
Get/Set global defaults and library properties using the options method.

### Syntax: Get
`sprLib.options()`

### Syntax: Set
`sprLib.options({ baseUrl:'/sites/dev' })`  

### Options Properties
| Prop          | Type    | Description           | Possible Values                    |
| :------------ | :------ | :-------------------- | :--------------------------------- |
| `baseUrl`     | string  | the base url          | Ex: `{'baseUrl':'/sites/dev'}`     |
| `nodeCookie`  | string  | user email address    | Ex: `{email:'brent@github.com'}`   |
| `nodeEnabled` | boolean | user id               | Ex: `{id:99}`                      |
| `nodeServer`  | string  | user login name       | Ex: `{login:'AMERICAS\Brent_Ely'}` |
| `queryLimit`  | number  | user title            | Ex: `{title:'Brent Ely'}`          |

### Options Descriptions
`baseUrl`
* Sets the root/base URL for SharePoint operations.
* This way the library can be run against any location.
* Useful when querying subsites or when you don't want to have to include the `baseUrl` with every sprLib call.

### Options Example
```javascript
// Get options
var objOptions = sprLib.options();

// Set option: baseUrl
sprLib.options({ baseUrl:'/sites/devtest' });
```



## Renew Security Token

### Syntax
`sprLib.renewSecurityToken()`

### Description
Refreshes the SharePoint page security digest token.  

Starting in SP2013, `.aspx` pages include a security digest token in a hidden input element that will expire
after 30 minutes (by default).

This method allows the refresh of this value, which can be useful in certain cases.  An example would
be an application that provides a tool-like interface (e.g.: List Mass Updater) where the page token could
expire before all operations have completed.

NOTE: SpRestLib will refresh the token automatically as needed during CRUD operations.



## Library Version

### Syntax
`sprLib.version`  
`sprLib.ui.version`

### Description
Returns the version and build for the library currently loaded.

### Example
```javascript
sprLib.version
"1.8.0-20181101"

sprLib.ui.version
"1.0.0-20180202"
```
