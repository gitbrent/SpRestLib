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
| Property Name            | Type     | Description                                                      |
| :----------------------- | :------- | :--------------------------------------------------------------- |
| `Created`                | string   | the Date (ISO format) a file was created                         |
| `FolderCount`            | integer  | the number of child folders under this folder                    |
| `HasSubdirs`             | boolean  | whether the folder has any child folders                         |
| `HasUniqueRoleAssignments`| boolean | whether the folder has any child folders                         |
| `Hidden`                 | boolean  | whether the folder is hidden                                     |
| `ItemCount`              | integer  | the number of files within this folder                           |
| `ListGUID`               | GUID     | GUID for the parent List/Library                                 |
| `ListTitle`              | string   | the parent list title                  |
// TODO: ^^^ WTH?
| `Modified`               | string   | the Date (ISO format) an item was last modified                  |
| `Name`                   | string   | the name of the file - ex: "Sample.pptx"                         |
| `ParentGUID`             | GUID     | GUID for the file - ex: 8921212D-7E83-5AF1-CB51-5431BAD43233     |
| `ServerRelativeUrl`      | string   | the server relative URL - ex: "/sites/dev/Documents/Demo.xlsx"   |
| `TotalSize`              | integer  | the size of the file in bytes - ex: 55100                        |

### Sample Code
```javascript
sprLib.folder('/sites/dev/Shared Documents/').info()
.then(function(objInfo){ console.table([objInfo]) });

// Result:
/*
.---------------------------------------------------------------------.
|        Prop Name         |               Prop Value                 |
|--------------------------|------------------------------------------|
| Name                     | "Shared Documents"                       |
| ItemCount                | 135                                      |
| ServerRelativeUrl        | "/sites/dev/Shared Documents"            |
| Created                  | "2016-07-29T02:48:26"                    |
| FolderCount              | 2                                        |
| ParentGUID               | "{2E8FFBF8-ED98-5F0A-883B-4EF3DB89FFFC}" |
| HasSubdirs               | true                                     |
| Hidden                   | false                                    |
| ListGUID                 | "{01DFF502-B0FC-20D0-A419-6C7BC5486D89}" |
| ListTitle                | "Documents"                              |
| Modified                 | "2018-08-29T03:08:02"                    |
| TotalSize                | 555374435                                |
| HasUniqueRoleAssignments | true                                     |
'---------------------------------------------------------------------'
*/
```

## Folder Permissions
`sprLib.folder("FolderName").perms()`


## Folder Contents: Files
`sprLib.folder("FolderName").files()`


## Folder Contents: Folders
`sprLib.folder("FolderName").folders()`
