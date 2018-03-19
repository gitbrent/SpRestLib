---
id: api-site
title: Site (SPSite) Methods
---
**************************************************************************************************
Table of Contents
- [Syntax](#syntax)
- [Site Info](#get-site-info)
  - [Site Properties](#site-properties)
  - [Sample Code](#sample-code-3)
- [Site Lists](#get-site-lists)
  - [List Properties](#list-properties-1)
  - [Sample Code](#sample-code-4)
- [Site Permissions](#get-site-permissions)
  - [Perm Properties](#perm-properties)
  - [Sample Code](#sample-code-5)
- [Site Groups](#get-site-groups)
  - [Group Properties](#group-properties)
  - [Sample Code](#sample-code-6)
- [Site Roles](#get-site-roles)
  - [Role Properties](#role-properties)
  - [Sample Code](#sample-code-7)
- [Site Subsites](#get-site-subsites)
  - [Subsite Properties](#subsite-properties)
  - [Sample Code](#sample-code-8)
- [Site Users](#get-site-users)
  - [User Properties](#user-properties)
  - [Sample Code](#sample-code-9)
**************************************************************************************************

## Syntax
`sprLib.site().info()`  
`sprLib.site(siteUrl).info()`

Returns: Array of site properties

### Site Properties
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

### Sample Code
```javascript
sprLib.site().info()
.then(function(objSite){ console.table([objSite]) });

/*
.-------------------------------------------------------------------------------------------------------------------------------------.
|        Prop Name         |                                                Prop Value                                                |
|--------------------------|----------------------------------------------------------------------------------------------------------|
| Id                       | "123b4f37-6a13-4bc8-869a-08b5e4b7c058"                                                                   |
| Title                    | "SpRestLib Dev Site"                                                                                     |
| Description              | "Main O365 Dev Site for SpRestLib."                                                                      |
| Language                 | 1033                                                                                                     |
| Created                  | "2016-08-16T14:53:31.327"                                                                                |
| LastItemModifiedDate     | "2017-10-28T23:06:13Z"                                                                                   |
| LastItemUserModifiedDate | "2017-10-28T23:06:13Z"                                                                                   |
| RequestAccessEmail       | "someone@example.com"                                                                                    |
| SiteLogoUrl              | "/sites/dev/SiteAssets/images/sample_company_logo.png"                                                   |
| Url                      | "https://brent.sharepoint.com/sites/dev"                                                                 |
| WebTemplate              | "STS"                                                                                                    |
| AssociatedMemberGroup    | {"Id":8,"Title":"Dev Site Members","OwnerTitle":"Dev Site Owners"}                                       |
| AssociatedOwnerGroup     | {"Id":6,"Title":"Dev Site Owners","OwnerTitle":"Dev Site Owners"}                                        |
| AssociatedVisitorGroup   | {"Id":7,"Title":"Dev Site Visitors","OwnerTitle":"Dev Site Owners"}                                      |
| Owner                    | {"LoginName":"brent@microsoft.com","Title":"Brent Ely","Email":"brent@microsoft.com","IsSiteAdmin":true} |
'-------------------------------------------------------------------------------------------------------------------------------------'
*/
```

## Get Site Lists
Syntax:  
`sprLib.site().lists()`  
`sprLib.site(siteUrl).lists()`

Returns: Array of site lists

### List Properties
| Property Name       | Type     | Description                                                |
| :------------------ | :------- | :--------------------------------------------------------- |
| `BaseTemplate`      | number   | `SP.List.baseTemplate` property value - ex: `100`          |
| `BaseType`          | string   | `SP.BaseType` property value - ex: `"List"`                |
| `Description`       | string   | List Description                                           |
| `Hidden`            | boolean  | Is list hidden?                                            |
| `Id`                | GUID     | The SP GUID of the List                                    |
| `ImageUrl`          | string   | Relative URL to the list's logo image                      |
| `ItemCount`         | number   | Total items in the List/Library                            |
| `ParentWebUrl`      | string   | Relative URL of parent web site                            |
| `ServerRelativeUrl` | string   | Relative URL of the list itself - ex: `"/HR/Lists/Employees"` |
| `Title`             | string   | Title of the List                                          |

### Sample Code
```javascript
sprLib.site().lists()
.then(function(arr){ console.table([arr[0]]) });

/*
.------------------------------------------------------------.
|     Prop Name     |               Prop Value               |
|-------------------|----------------------------------------|
| Id                | "8fda2798-daba-497d-9840-df87b08e09c1" |
| Title             | "Employees"                            |
| Description       | "All company personnel"                |
| ItemCount         | 238                                    |
| BaseType          | "List"                                 |
| BaseTemplate      | 100                                    |
| Hidden            | false                                  |
| ImageUrl          | "/_layouts/15/images/itgen.png?rev=44" |
| ParentWebUrl      | "/sites/dev"                           |
| ServerRelativeUrl | "/sites/dev/Lists/Employees"           |
'------------------------------------------------------------'
*/
```

## Get Site Permissions
Syntax:  
`sprLib.site().perms()`  
`sprLib.site(siteUrl).perms()`

Returns: Array of site permissions

### Perm Properties
| Property Name    | Type     | Description                                                           |
| :--------------- | :------- | :-------------------------------------------------------------------- |
| `Member`         | object   | object with Member properties (`Title`,`PrincipalId`,`PrincipalType`) |
| `Roles`          | object   | array of Role objects with properties: (`Name`,`Hidden`)              |

### Sample Code
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


## Get Site Groups
Syntax:  
`sprLib.site().groups()`  
`sprLib.site(siteUrl).groups()`

Returns: Array of site Groups

### Group Properties
| Property Name                | Type     | Description                                      |
| :--------------------------- | :------- | :----------------------------------------------- |
| `AllowMembersEditMembership` | boolean  | Whether members can edit the group               |
| `Description`                | string   | Group Description                                |
| `Id`                         | GUID     | Group ID                                         |
| `OwnerTitle`                 | string   | Owner Title                                      |
| `PrincipalType`              | string   | Group, User, etc.                                |
| `Title`                      | string   | Title of the Group                               |
| `Users`                      | object   | array of User objects with properties: (`Id`,`LoginName`,`Title`) |

### Sample Code
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


## Get Site Roles
Syntax:  
`sprLib.site().roles()`  
`sprLib.site(siteUrl).roles()`

Returns: Array of SiteCollection Roles (result is the same if siteUrl is provided)

### Role Properties
| Property Name                | Type     | Description                                      |
| :--------------------------- | :------- | :----------------------------------------------- |
| `Description`                | string   | Role Description                                 |
| `Hidden`                     | boolean  | Whether this Role is hidden or not               |
| `Id`                         | GUID     | Role ID                                          |
| `Name`                       | string   | Role Name                                        |
| `RoleTypeKind`               | number   | `SP.RoleDefinition.roleTypeKind` value           |

### Sample Code
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


## Get Site Subsites
Syntax:  
`sprLib.site().subsites()`  
`sprLib.site(siteUrl).subsites()`

Returns: Array of subsites under the current or specified location

### Subsite Properties
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


### Sample Code
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


## Get Site Users
Syntax:  
`sprLib.site().users()`  
`sprLib.site(siteUrl).users()`

Returns: Array of users under the current or specified location

Notes:
* If siteUrl is omitted, then all users in the entire SiteCollection are returned. Otherwise, only the users
under the given site are returned (all users with direct grants and all users within Groups that have site permissions).

### User Properties
| Property Name                | Type     | Description                                                     |
| :--------------------------- | :------- | :-------------------------------------------------------------- |
| `Email`                      | string   | user email address                                              |
| `Groups`                     | array    | array of user's group objects with properties: (`Id`,`Title`)   |
| `Id`                         | number   | user Id                                                         |
| `IsSiteAdmin`                | object   | whether the user us a site collection admin (SCA)               |
| `LoginName`                  | string   | user LoginName                                                  |
| `Title`                      | string   | user Title                                                      |

### Sample Code
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
