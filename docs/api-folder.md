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
sprLib.folder('/sites/dev/SiteAssets/').info()
.then(function(objInfo){ console.table([objInfo]) });
```
