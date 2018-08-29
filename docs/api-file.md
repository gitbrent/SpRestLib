---
id: api-file
title: File (SPFile) Methods
---

## Syntax
Files can be accessed by either their full or relative path:  

`sprLib.file('sample.pptx')`  
`sprLib.file('/sites/dev/Shared Documents/sample.pptx')`  



## File Information
`sprLib.file("filename").info()`

Returns: Array of file properties

### File Properties
### List Properties
| Property Name               | Type     | Description                                                 |
| :-------------------------- | :------- | :---------------------------------------------------------- |
| `Author`                    | object   | object containing the `id` of the author - ex: {"Id":9}     |
| `CheckInComment`            | string   | the latest CheckIn comment                                  |
| `CheckOutType`              | number   | the item's check-out type |
| `CheckedOutByUser`          | object   | object containing the `id` of the author - ex: {"Id":9}     |
| `ETag`                      | string   | the ETag value - ex: "{8921212D-7E83-5AF1-CB51-5431BAD43233},12" |
Exists
Length
LockedByUser
MajorVersion
MinorVersion
| `ModifiedBy`                | object   | object containing the `id` of the author - ex: {"Id":9}     |
Name
ServerRelativeUrl
TimeCreated
TimeLastModified
UIVersionLabel
UniqueId
...

| `BaseTemplate`              | integer  | `SPListTemplateType` SP Base Template ID number - ex: `100` |
| `BaseType`                  | integer  | SP Base Type ID number - ex: `0`                            |
| `Created`                   | string   | Date the List/Library was created (ISO format)              |
| `DraftVersionVisibility`    | number   | whether draft versions can be seen                          |
| `EnableAttachments`         | boolean  | whether users can attach files to items in this list        |
| `EnableFolderCreation`      | boolean  | whether users can create folders in this list/library       |
| `EnableVersioning`          | boolean  | whether versioning is enabled for the items in this list    |
| `ForceCheckout`             | boolean  | Whether Force checkout is enabled                           |
| `HasUniqueRoleAssignments`  | boolean  | Whether list has unique (non-inherited) permissions         |
| `Hidden`                    | boolean  | Whether List is hidden                                      |
| `Id`                        | GUID     | The SP GUID of the List                                     |
| `ItemCount`                 | number   | The number of Items in the List                             |
| `LastItemDeletedDate`       | string   | Date (ISO format) an item was last deleted                  |
| `LastItemModifiedDate`      | string   | Date (ISO format) an item was last modified                 |
| `LastItemUserModifiedDate`  | string   | Date (ISO format) an item was last modified by a User       |
| `ListItemEntityTypeFullName`| string   | `SP.List.listItemEntityTypeFullName` property               |
| `Title`                     | string   | The Title of the List/Library                               |


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
sprLib.file('/sites/dev/SiteAssets/jquery.min.js').info()
.then(function(objInfo){ console.table([objInfo]) });
```
