---
id: api-folder
title: Folder (SPFolder) Methods
---

## Syntax
Folders can be accessed by either their full or relative path:  

`sprLib.folder('sample.pptx')`  
`sprLib.folder('/sites/dev/Shared Documents/sample.pptx')`  



## Folder Information
`sprLib.folder("FolderName").info()`

Returns: Array of folder properties

### Folder Properties
| Property Name             | Type     | Description                                                      |
| :------------------------ | :------- | :--------------------------------------------------------------- |
| `Created`                 | string   | the Date (ISO format) a file was created                         |
| `FolderCount`             | integer  | the number of child folders under this folder                    |
| `HasSubdirs`              | boolean  | whether the folder has any child folders                         |
| `HasUniqueRoleAssignments`| boolean  | whether the folder has any child folders                         |
| `Hidden`                  | boolean  | whether the folder is hidden                                     |
| `ItemCount`               | integer  | the number of files within this folder                           |
| `ListGUID`                | GUID     | root library GUID                                                |
| `Modified`                | string   | the Date (ISO format) an item was last modified                  |
| `ServerRelativeUrl`       | string   | the server relative URL - ex: "/sites/dev/SiteAssets"            |
| `TotalSize`               | integer  | the size of the folder's contents in bytes - ex: 55100           |

### Sample Code
```javascript
sprLib.folder('/sites/dev/Shared Documents/').info()
.then(function(objInfo){ console.table([objInfo]) });

// Result:
/*
.---------------------------------------------------------------------.
|        Prop Name         |                Prop Value                |
|--------------------------|------------------------------------------|
| Name                     | "Shared Documents"                       |
| ItemCount                | 135                                      |
| ServerRelativeUrl        | "/sites/dev/Shared Documents"            |
| Created                  | "2016-07-29T02:48:26"                    |
| FolderCount              | 2                                        |
| ListGUID                 | "{01DFF502-A0FC-49D0-A819-6C7BC5486D89}" |
| HasSubdirs               | true                                     |
| Hidden                   | false                                    |
| Modified                 | "2018-08-29T03:08:02"                    |
| TotalSize                | 555374475                                |
| HasUniqueRoleAssignments | true                                     |
'---------------------------------------------------------------------'
*/
```

## Folder Permissions
`sprLib.folder("FolderName").perms()`

Returns: Array of file permissions

### Perm Properties
| Property Name    | Type     | Description                                                           |
| :--------------- | :------- | :-------------------------------------------------------------------- |
| `Member`         | object   | object with Member properties (`Title`,`PrincipalId`,`PrincipalType`) |
| `Roles`          | object   | array of Role objects with properties: (`Name`,`Hidden`)              |

### Sample Code
```javascript
sprLib.folder('/sites/dev/Shared Documents/').perms()
.then(function(arrayResults){ console.table(arrayResults) });

/*
.-----------------------------------------------------------------------------------------------------------------------------------------------------------.
|                                        Member                                         |                               Roles                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| {"Title":"Dev Site Members","PrincipalType":"SharePoint Group","PrincipalId":8}       | [{"Hidden":false,"Name":"Design"},{"Hidden":false,"Name":"Edit"}] |
| {"Title":"Dev Site Owners","PrincipalType":"SharePoint Group","PrincipalId":6}        | [{"Hidden":false,"Name":"Full Control"}]                          |
| {"Title":"Dev Site Visitors","PrincipalType":"SharePoint Group","PrincipalId":7}      | [{"Hidden":false,"Name":"Read"}]                                  |
| {"Title":"Excel Services Viewers","PrincipalType":"SharePoint Group","PrincipalId":5} | [{"Hidden":false,"Name":"View Only"}]                             |
'-----------------------------------------------------------------------------------------------------------------------------------------------------------'
*/
```



## Folder Contents: Files
`sprLib.folder("FolderName").files()`

Returns: Array of `SP.File` objects in this Folder (see [File Properties](/SpRestLib/docs/api-file.html#file-properties))

### Sample Code
```javascript
sprLib.folder('/sites/dev/Shared Documents/').files()
.then(function(arrayResults){ console.table(arrayResults) });

/*
.-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------.
|            Author            | CheckedOutByUser | LockedByUser |          ModifiedBy          | CheckInComment | CheckOutType |                    ETag                     | Exists | Length | MajorVersion | MinorVersion |        Name         |                ServerRelativeUrl                |         Title          |               UniqueId               |       Created        |       Modified       |
|------------------------------|------------------|--------------|------------------------------|----------------|--------------|---------------------------------------------|--------|--------|--------------|--------------|---------------------|-------------------------------------------------|------------------------|--------------------------------------|----------------------|----------------------|
| {"Id":9,"Title":"Brent Ely"} | null             | null         | {"Id":9,"Title":"Brent Ely"} |                |            2 | "{3C721739-23E2-4B4D-69FD-16E7693ABE5A},16" | true   |  39172 |            5 |            0 | sprestlib-demo.pptx | /sites/dev/Shared Documents/sprestlib-demo.pptx | PptxGenJS Presentation | 3c721739-23f2-4b4d-84fd-16e7693abe5a | 2018-01-01T21:55:33Z | 2018-08-26T23:23:57Z |
'-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------'
*/
```



## Folder Contents: Folders
`sprLib.folder("FolderName").folders()`

Returns: Array of `SP.Folder` objects in this Folder (see [Folder Properties](#folder-properties))

### Sample Code
```javascript
sprLib.folder('/sites/dev/Shared Documents/').folders()
.then(function(arrayResults){ console.table(arrayResults) });

/*
.--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------.
|    Name     | ItemCount |         ServerRelativeUrl         |       Created       | FolderCount |                  GUID                  | HasSubdirs | Hidden |      Modified       |
|-------------|-----------|-----------------------------------|---------------------|-------------|----------------------------------------|------------|--------|---------------------|
| js          |        16 | /sites/dev/SiteAssets/js          | 2016-08-16T14:56:47 |           0 | {ADA19FF5-BA9F-4D05-89FF-7656F4D7325E} | true       | false  | 2018-08-29T02:43:23 |
| BACKUPS     |         9 | /sites/dev/SiteAssets/BACKUPS     | 2017-10-28T23:12:41 |           0 | {ADA19FF5-BA9F-4D05-89FF-7656F4D7325E} | true       | false  | 2018-08-22T03:21:42 |
| images      |         5 | /sites/dev/SiteAssets/images      | 2016-08-17T00:10:57 |           0 | {ADA19FF5-BA9F-4D05-89FF-7656F4D7325E} | true       | false  | 2017-10-09T23:43:19 |
| stylesheets |        11 | /sites/dev/SiteAssets/stylesheets | 2016-08-17T00:02:49 |           0 | {ADA19FF5-BA9F-4D05-89FF-7656F4D7325E} | true       | false  | 2017-10-25T03:42:32 |
'--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------'
*/
