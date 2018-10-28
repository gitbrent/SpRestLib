---
author: Brent Ely
authorURL: https://github.com/gitbrent/
title: SharePoint List Unique Permissions REST Query
---

How to determine if a SharePoint List/Library has unique, non-inherited permissions (role assignments).

<!--truncate-->

*****************************

## Example
```javascript
sprLib.list('Site Assets').info()
.then(objInfo => console.log(objInfo))
.catch(strErr => console.error(strErr));
```

## Results
```
.-----------------------------------------------------------------------.
|         Prop Name          |                Prop Value                |
|----------------------------|------------------------------------------|
| AllowContentTypes          | true                                     |
| BaseTemplate               | 101                                      |
| BaseType                   | 1                                        |
| Created                    | "2016-07-29T02:48:24Z"                   |
| Description                | "Use this library to store files ..."    |
| DraftVersionVisibility     | 0                                        |
| EnableAttachments          | false                                    |
| EnableFolderCreation       | true                                     |
| EnableVersioning           | true                                     |
| ForceCheckout              | false                                    |
| HasUniqueRoleAssignments   | false                                    |
| Hidden                     | false                                    |
| Id                         | "ada18ff5-ab9f-4e05-89ff-7656f4d7325e"   |
| ItemCount                  | 142                                      |
| LastItemDeletedDate        | "2018-08-29T02:43:19Z"                   |
| LastItemModifiedDate       | "2018-10-27T22:14:31Z"                   |
| LastItemUserModifiedDate   | "2018-10-17T02:00:58Z"                   |
| ListItemEntityTypeFullName | "SP.Data.SiteAssetsItem"                 |
| Title                      | "Site Assets"                            |
'-----------------------------------------------------------------------'
```

## Usage
The `info()` SpRestLib method returns several useful List properties, one of which is `HasUniqueRoleAssignments`.  This boolean value will tell you if a Lis/tLibrary has unique permissions.
