---
id: api-user
title: User Methods
---
**************************************************************************************************
Table of Contents
- [Syntax](#syntax)
- [User Query Properties](#user-query-properties)
- [Get User Information (`SPUser`)](#get-user-information-spuser)
  - [Sample Code](#sample-code-10)
- [Get User Groups (`SPGroup`)](#get-user-groups-spgroup)
  - [Sample Code](#sample-code-11)
- [Get User Profile Properties (`SP.UserProfile.PersonProperties`)](#get-user-profile-properties-spuserprofilepersonproperties)
  - [Person Properties](#person-properties)
  - [Sample Code](#sample-code-12)
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

## Get User Profile Properties (`SP.UserProfile.PersonProperties`)
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

### Person Properties
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

### Sample Code
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
