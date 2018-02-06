---
id: api-user
title: User Methods
---
**************************************************************************************************
Table of Contents
- [User Query Properties](#user-query-properties)
- [Get User Information (`SPUser`)](#get-user-information-spuser)
  - [Sample Code](#sample-code-10)
- [Get User Groups (`SPGroup`)](#get-user-groups-spgroup)
  - [Sample Code](#sample-code-11)
**************************************************************************************************

## Syntax
`sprLib.user()`  
`sprLib.user(options)`

Usage: Omitting options will return information about the current user, otherwise, the specified user is returned.  

## User Query Properties
| Prop      | Type   | Required? | Description           | Possible Values                                             |
| :-------- | :----- | :-------- | :-------------------- | :---------------------------------------------------------- |
| `baseUrl` | string |           | the base url          | Ex:`{'baseUrl': '/sites/dev'}`                              |
| `id`      | number |           | user id               | user id to query. Ex: `{id:99}`                             |
| `email`   | string |           | user email address    | user email to query. Ex: `{email:'brent@github.com'}`       |
| `login`   | string |           | user login name       | user loginName to query. Ex: `{login:'AMERICAS\Brent_Ely'}` |
| `title`   | string |           | user title            | user title to query. Ex: `{title:'Brent Ely'}`              |

## Get User Information (`SPUser`)
Syntax:  
`sprLib.user().info()`  
`sprLib.user(options).info()`

Returns: Object with SharePoint user (`SP.User`) properties.

Note: *Uses the basic SP User service (not the Enterprise licensed User Profile service)*

### Sample Code
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

## Get User Groups (`SPGroup`)
Syntax:  
`sprLib.user().groups()`  
`sprLib.user(options).groups()`

Returns: Array of objects containing the user's SharePoint groups [SPGroup](https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spgroup.aspx)

### Sample Code
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
