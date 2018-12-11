---
id: api-folder
title: Folder Methods (SP.Folder)
---

## Syntax
Folders can be accessed by either their full or relative path:  

`sprLib.folder('SiteAssets')`  
`sprLib.folder('SiteAssets/img')`  
`sprLib.folder('/sites/dev/Shared Documents')`  



## Folder Information

### Folder Properties
`sprLib.folder("FolderName").info()`

Returns: Array of folder properties

#### Folder Properties
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

#### Sample Code
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

### Folder Permissions
`sprLib.folder("FolderName").perms()`

Returns: Array of file permissions

#### Folder Permission Properties
| Property Name    | Type     | Description                                                           |
| :--------------- | :------- | :-------------------------------------------------------------------- |
| `Member`         | object   | object with Member properties (`Title`,`PrincipalId`,`PrincipalType`) |
| `Roles`          | object   | array of Role objects with properties: (`Name`,`Hidden`)              |

#### Folder Permissions Sample Code
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

## Folder Contents

### Child Files
`sprLib.folder("FolderName").files()`

Returns: Array of `SP.File` objects in this Folder (see [File Properties](/SpRestLib/docs/api-file.html#file-properties))

#### Child Files Sample Code
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



### Child Folders
`sprLib.folder("FolderName").folders()`

Returns: Array of `SP.Folder` objects in this Folder (see [Folder Properties](#folder-properties))

#### Child Folders Sample Code
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
```


## Folder Manipulation

### Add Folder
`sprLib.folder("FolderName").add("NewFolder")`

Returns: The new folder as an `SP.Folder` object

#### Add Folder Sample Code
```javascript
sprLib.folder('/sites/dev/Shared Documents/').add('New Folder')
.then(objFolder => console.log('new folder created!') );
```

### Delete Folder
`sprLib.folder("SiteAssets/img/junk").delete()`

Bypasses Recycle Bin (permanently deletes the folder)

Returns: Boolean result

#### Delete Folder Sample Code
```javascript
sprLib.folder('SiteAssets/img/junk').delete()
.then(boolResult => console.log('folder deleted!') );
```

### Recycle Folder
`sprLib.folder("SiteAssets/img/junk").recycle()`

Sends folder to the site Recycle Bin

Returns: Boolean result

#### Recycle Folder Sample Code
```javascript
sprLib.folder('SiteAssets/img/junk').recycle()
.then(boolResult => console.log('folder recycled!') );
```

## Folder Upload

### Upload File to Folder
EXAMPLE: Client web browser (using `<input id="filePicker" type="file">`)
```javascript
// STEP 1: Use FilePicker to read file
var reader = new FileReader();
reader.readAsArrayBuffer( $('#filePicker')[0].files[0] );
reader.onloadend = function(e){
    var parts = $('#filePicker')[0].value.split("\\");
    var strFileName = parts[parts.length - 1];
    var bufferData = e.target.result;

    // STEP 2: Upload file to SharePoint
    sprLib.folder('/sites/dev/Documents').upload({
        name: strFileName,
        data: bufferData,
        overwrite: true
    })
    .then(function(objFile){
        console.log('SUCCESS: `'+ objFile.Name +'` uploaded to: `'+ objFile.ServerRelativeUrl +'`' );
    })
    .catch(function(strErr){
        console.error(strErr);
    });
});
```

EXAMPLE: NodeJS
```javascript
sprLib.folder('/sites/dev/Documents').upload({
    name: 'jeff_teper_secret_plan.docx',
    data: fs.readFileSync('./docs/jeff_teper_secret_plan.docx'),
    requestDigest: gStrReqDig,
    overwrite: true
})
.then((objFile) => {
    console.log('SUCCESS: `'+ objFile.Name +'` uploaded to: `'+ objFile.ServerRelativeUrl +'`' );
})
.catch((strErr) => {
    console.error(strErr);
});
```
See [Uploading a file to a SharePoint library using JavaScript](/SpRestLib/blog/2018/12/10/upload-file-to-sharepoint-library.html) for a working demo.
