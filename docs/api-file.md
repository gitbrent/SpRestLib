---
id: api-file
title: File Methods (SP.File)
---

## Syntax
Files can be accessed by either their full or relative path:  

`sprLib.file('sample.pptx')`  
`sprLib.file('/sites/dev/Shared Documents/sample.pptx')`  


## File CheckIn
`sprLib.file("filename").checkin()`  
`sprLib.file("filename").checkin({ comment:"All done!" })`  
`sprLib.file("filename").checkin({ comment:"All done!", type:"Major" })`  

Returns: True on success

### File CheckIn Options
| Option        | Type     | Default   | Description                                                  |
| :------------ | :------- | :-------- | :----------------------------------------------------------- |
| `comment`     | string   |           | CheckIn comment. Ex: `{ 'comment':"updated due date" }`      |
| `type`        | string   | `Major`   | CheckIn type. Possible values: `Major`, `Minor`, `Overwrite` |



## File CheckOut
`sprLib.file("filename").checkout()`  

Returns: True on success



## File Delete
`sprLib.file("filename").delete()`  

Bypasses Recycle Bin (permanently deletes the file)

Returns: True on success



## File Recycle
`sprLib.file("filename").delete()`  

Sends file to the site Recycle Bin

Returns: True on success



## File Information
`sprLib.file("filename").info()`

Returns: Object containing file properties

### File Properties Enumeration
| Property Name          | Type     | Description                                                      |
| :--------------------- | :------- | :--------------------------------------------------------------- |
| `Author`               | object   | object containing the `id` of the author - ex: {"Id":9}          |
| `CheckInComment`       | string   | the latest CheckIn comment                                       |
| `CheckOutType`         | number   | the item's check-out type (`2`=none, `1`=offline, `0`=online)    |
| `CheckedOutByUser`     | object   | object containing the `id` of the user who checked out the file (empty object if file is not checked out) |
| `Created`              | string   | the Date (ISO format) a file was created                         |
| `ETag`                 | string   | the ETag value - ex: "{8921212D-7E83-5AF1-CB51-5431BAD43233},12" |
| `Exists`               | boolean  | whether the file exists                                          |
| `Length`               | integer  | the size of the file in bytes - ex: 55100                        |
| `LockedByUser`         | object   | object containing the `id` of the locking user - ex: {"Id":9}    |
| `MajorVersion`         | integer  | major version number - ex: 30                                    |
| `MinorVersion`         | integer  | minor version number - ex: 1                                     |
| `Modified`             | string   | the Date (ISO format) an item was last modified                  |
| `ModifiedBy`           | object   | object containing the `id` of the author - ex: {"Id":9}          |
| `Name`                 | string   | the name of the file - ex: "Sample.pptx"                         |
| `ServerRelativeUrl`    | string   | the server relative URL - ex: "/sites/dev/Documents/Demo.xlsx"   |
| `UIVersionLabel`       | string   | major.minor version - ex: "30.0"                                 |
| `UniqueId`             | GUID     | GUID for the file - ex: 8921212D-7E83-5AF1-CB51-5431BAD43233     |

### Sample Code
```javascript
sprLib.file('/sites/dev/Shared Documents/sample.xlsx').info()
.then(function(objInfo){ console.table([objInfo]) });

// Result:
/*
.----------------------------------------------------------------.
|     Prop Name     |                 Prop Value                 |
|-------------------|--------------------------------------------|
| Author            | {"Id":9}                                   |
| CheckedOutByUser  | {}                                         |
| LockedByUser      | {}                                         |
| ModifiedBy        | {"Id":9}                                   |
| CheckInComment    |                                            |
| CheckOutType      | 2                                          |
| ETag              | "{C8093E01-1044-51E2-9DC7-8524012E9111},1" |
| Exists            | true                                       |
| Length            | 14234                                      |
| MajorVersion      | 1                                          |
| MinorVersion      | 0                                          |
| Name              | "sample.xlsx"                              |
| ServerRelativeUrl | "/sites/dev/Shared Documents/sample.xlsx"  |
| TimeCreated       | "2017-08-06T01:33:37Z"                     |
| TimeLastModified  | "2017-08-06T01:33:37Z"                     |
| UniqueId          | "c8093f01-1044-51e2-9dc7-8524012e9111"     |
| UIVersionLabel    | "1.0"                                      |
'----------------------------------------------------------------'
*/
```



## File Permissions
`sprLib.file("filename").perms()`

Returns: Array of file permissions

### Perm Properties
| Property Name    | Type     | Description                                                           |
| :--------------- | :------- | :-------------------------------------------------------------------- |
| `Member`         | object   | object with Member properties (`Title`,`PrincipalId`,`PrincipalType`) |
| `Roles`          | object   | array of Role objects with properties: (`Name`,`Hidden`)              |

### Sample Code
```javascript
sprLib.file('/sites/dev/Shared Documents/sample.xlsx').perms()
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



## File Download
`sprLib.file("filename").get()`

Returns a blob containing the file (either text or binary).

### Sample Code
See either `example/sprestlib-demo.html` or `example/nodejs-demo.js` for working examples of downloading a file using a web browser or Node.
