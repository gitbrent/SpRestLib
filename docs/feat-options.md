---
id: feat-options
title: Library Options
---
Get/Set global defaults and library properties using the options method.

## Options Syntax

### Get Options
`sprLib.options()`

### Set Options
`sprLib.options({ baseUrl:'/sites/dev' })`  

## Options Properties
| Prop          | Type    | Description           | Possible Values                    |
| :------------ | :------ | :-------------------- | :--------------------------------- |
| `baseUrl`     | string  | the base url          | Ex: `{'baseUrl':'/sites/dev'}`     |
| `nodeCookie`  | string  | user email address    | Ex: `{email:'brent@github.com'}`   |
| `nodeEnabled` | boolean | user id               | Ex: `{id:99}`                      |
| `nodeServer`  | string  | user login name       | Ex: `{login:'AMERICAS\Brent_Ely'}` |
| `queryLimit`  | number  | user title            | Ex: `{title:'Brent Ely'}`          |

## Options Descriptions
`baseUrl`
* Sets the root/base URL for SharePoint operations
* This way the library can be run against any location
* Useful when querying subsites or when you don't want to have to include the `baseUrl` with every sprLib call

`queryLimit`
* Sets the default queryLimit
* Used by any query where `queryLimit` is omitted
* Helps to avoid the common error of neglecting to specify `queryLimit` and having SP only return the first 100 items

## Options Examples
```javascript
// Get options
var objOptions = sprLib.options();

// Set option: baseUrl
sprLib.options({ baseUrl:'/sites/devtest' });

// Set option: queryLimit
sprLib.options({ queryLimit:5000 });
```
