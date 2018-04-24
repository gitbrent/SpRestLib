---
id: api-list
title: List/Library (SPList) Methods
---

## Syntax
Lists can be accessed by either their name or their GUID:  

`sprLib.list(listName)`  
`sprLib.list(listGUID)`  
`sprLib.list({ name:name })`  
`sprLib.list({ guid:GUID })`  
`sprLib.list({ name:name, baseUrl:path, requestDigest:formDigestValue })`  

## Options
| Prop            | Type   | Required? | Description                              | Possible Values                  |
| :-------------- | :----- | :-------- | :--------------------------------------- | :------------------------------- |
| `name`          | string |     Y     | list name or list GUID                   | Ex:`{'name': 'Employees'}`       |
| `guid`          | string |           | list GUID (convenience alias for name)   | Ex:`{'guid': '8675309-ab3d-ef87b08e09e1'}` |
| `baseUrl`       | string |           | the base url                             | Ex:`{'baseUrl': '/sites/dev'}`   |
| `requestDigest` | string |           | the request form digest security token   | Ex:`{'requestDigest': 'ABC123'}` |

### Options: baseUrl
By default, the base URL is set to where the host webpart is located (`_spPageContextInfo.webServerRelativeUrl`).
However, there are occasions when reading from other locations - like a subsite - is desired. Use the `baseUrl`
parameter to specify the desired location.

### Options: requestDigest
By default, the request digest is set to the `<input id="__REQUESTDIGEST">` form element value if one exists (e.g.: WebPart in an .aspx page).
Security tokens are required for certain SharePoint operations like creating or updating List items. If your application is not inside
a SharePoint .aspx page, you will need to obtain the digest value and pass it when it's needed.

Example: How to obtain a FormDigestValue
```javascript
sprLib.rest({ url:'_api/contextinfo', type:'POST' })
.then(arr => console.log(arr[0].GetContextWebInformation.FormDigestValue) );
```

## Get Items
Syntax:  
`sprLib.list(listName|listGUID).items(options)`

Returns:
* Array of objects containing column name/value pairs

Notes:  
* Omitting the `listCols` option will result in all List columns being returned (mimic SharePoint default behavior)

### Options
| Option        | Type     | Default   | Description                         | Possible Values / Returns                  |
| :------------ | :------- | :-------- | :---------------------------------- | :----------------------------------------- |
| `listCols`    | array    |           | array of column names (OData style) | `listCols: ['Name', 'Badge_x0020_Number']` |
| `listCols`    | object   |           | object with column properties       | `listCols: { badge: { dataName:'Badge_x0020_Number' } }` |
| `cache`       | boolean  | `false`   | cache settings                      | Ex:`cache: true` |
| `queryFilter` | string   |           | query filter                        | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) |
| `queryLimit`  | string   |           | max items to return                    | 1-*N* |
| `queryNext`   | object   |           | object with Next/Skip options (paging) | `prevId` (1-N), `maxItems` (1-5000) Ex:`{ prevId:5000, maxItems:1000 }` |
| `queryOrderby`| string   |           | column(s) to order by                  | Ex:`queryOrderby:Name` |
| `metadata`    | boolean  | `false`   | whether to return `__metadata`      | The `__metadata` property can be included in the results array (to enable further operations, use of Etag, etc.) by using `metadata:true` |

### listCols Object
| Option        | Type     | Default   | Description           | Possible Values / Return Values     |
| :------------ | :------- | :-------- | :-------------------- | :---------------------------------- |
| `dataName`    | string   |           | the column name       | the fixed, back-end REST column name (use [Get List Column Properties](#get-list-column-properties)) |
| `dispName`    | string   |           | the name to use when displaying results in table headers, etc. |  |
| `dateFormat`  | string   |           | format to use when returning/displaying date | `INTL`, `INTLTIME`, `YYYYMMDD`, `ISO`, `US` |
| `dataFunc`    | function |           | function to use for returning a result | use a custom function to transform the query result (see below) |
| `getVersions` | boolean  | `false`   | return append text versions in array | `true` or `false` |

### listCols dataFunc Option
There are many times where you'll need more than a simple column value.  For example, providing a link to the InfoPath
form so users can edit the item directly.

The `dataFunc` option allows you access to the entire result set, then return any type of value.  See the sample below where
an "editLink" is created.

### Sample Code
```javascript
// EX: Simple array of column names
sprLib.list('Employees').items( ['Id','Name','Badge_x0020_Number'] )
.then(arrData => console.table(arrData))
.catch(errMsg => console.error(errMsg));

// Result:
/*
.---------------------------------------.
| Id  |    Name    | Badge_x0020_Number |
|-----|------------|--------------------|
| 253 | Hal Jordan |              12345 |
'---------------------------------------'
*/
```

```javascript
// EX: Using 'listCols' option with array of column names
sprLib.list('Employees').items({
    listCols: ['Name', 'Badge_x0020_Number', 'Hire_x0020_Date']
})
.then(arrData => console.table(arrData))
.catch(errMsg => console.error(errMsg));
```

```javascript
// EX: Using 'listCols' option to name our columns
// EX: Using 'getVersions' to gather all "Append Text"/Versioned Text into an array
// EX: Using 'dataFunc' option to return a dynamic, generated value (an html link)
// EX: Using query options: filter, order, limit
sprLib.list('Employees').items({
    listCols: {
        empId:      { dataName:'ID' },
        badgeNum:   { dataName:'Badge_x0020_Number' },
        appendText: { dataName:'Versioned_x0020_Comments', getVersions:true },
        viewLink:   { dataFunc:function(objItem){ return '<a href="/sites/dev/Lists/Employees/DispForm.aspx?ID='+objItem.ID+'">View Emp</a>' } }
    },
    queryFilter:  'Salary gt 100000',
    queryOrderby: 'Hire_x0020_Date',
    queryLimit:   3
})
.then(function(arrData){ console.table(arrData) })
.catch(function(errMsg){ console.error(errMsg) });

// RESULT:
/*
.--------------------------------------------------------------------------------------------------------------------------------.
| empId | badgeNum |            appendText              |                                viewLink                                |
|-------|----------|------------------------------------|------------------------------------------------------------------------|
|   334 |  1497127 | ["20170624:Update","20170601:New"] | <a href="/sites/dev/Lists/Employees/DispForm.aspx?ID=334">View Emp</a> |
|   339 |  1497924 | ["Not here yet", "Emp created"]    | <a href="/sites/dev/Lists/Employees/DispForm.aspx?ID=339">View Emp</a> |
|   350 |  1497927 | ["Vice President promotion"]       | <a href="/sites/dev/Lists/Employees/DispForm.aspx?ID=350">View Emp</a> |
'--------------------------------------------------------------------------------------------------------------------------------'
*/
```

```javascript
// EX: Using paging/next/skip

// Anytime there are more results than what was returned, an `__next` object will be included. Keep passing these in subsequent queries to get all results.
sprLib.list('Departments').items({ listCols:['Id','Created'], queryLimit:5 });
// RESULT:
/*
.-----------------------------------------------------------.
|            __next             | Id |       Created        |
|-------------------------------|----|----------------------|
| {"prevId":"5","maxItems":"5"} |  1 | 2016-12-04T21:58:47Z |
| {"prevId":"5","maxItems":"5"} |  2 | 2016-12-04T21:59:07Z |
| {"prevId":"5","maxItems":"5"} |  3 | 2016-12-04T21:59:20Z |
| {"prevId":"5","maxItems":"5"} |  4 | 2016-12-04T21:59:36Z |
| {"prevId":"5","maxItems":"5"} |  5 | 2016-12-04T21:59:49Z |
'-----------------------------------------------------------'
*/

sprLib.list('Departments').items({
    listCols:  ['Id','Created'],
    queryNext: {'prevId':5, 'maxItems':5}
});
// RESULT:
/*
.------------------------------------------------------------.
|             __next             | Id |       Created        |
|--------------------------------|----|----------------------|
| {"prevId":"10","maxItems":"5"} |  6 | 2017-06-01T03:19:01Z |
| {"prevId":"10","maxItems":"5"} |  7 | 2017-12-14T05:00:10Z |
| {"prevId":"10","maxItems":"5"} |  8 | 2017-12-14T05:00:34Z |
| {"prevId":"10","maxItems":"5"} |  9 | 2017-12-14T05:00:59Z |
| {"prevId":"10","maxItems":"5"} | 10 | 2017-12-14T05:01:15Z |
'------------------------------------------------------------'
*/
```


## Create Item
Syntax: `sprLib.list(listName|listGUID).create(itemObject)`

Options: An object with internal name/value pairs to be inserted

Returns: Object with column name/value pairs

Example:
```javascript
sprLib.list('Employees')
.create({
    Name: 'Marty McFly',
    Badge_x0020_Number: 12345,
    Hire_x0020_Date: new Date(),
    Active: true
})
.then(function(objItem){
    console.log('New Item:');
    console.table(objItem);
})
.catch(function(strErr){ console.error(strErr); });
```


## Update Item
Syntax:
`sprLib.list(listName|listGUID).update(itemObject)`

Options:
* An object with internal name/value pairs to be inserted
* if `__metadata.etag` is not provided, this is equivalent to force:true (`etag:'"*"'` is used)

Returns:
The object provided

Example:
```javascript
sprLib.list('Employees')
.update({
    ID: 99,
    Name: 'Marty McFly',
    Active: false
})
.then(function(objItem){
    console.log('Updated Item:');
    console.table(objItem);
})
.catch(function(strErr){ console.error(strErr); });
```


## Delete Item
Syntax:
`sprLib.list(listName|listGUID).delete(itemObject)`

Returns:
ID of the item just deleted

Notes:
Permanently deletes the item (bypasses Recycle Bin - not recoverable)

Example:
```javascript
sprLib.list('Employees').delete({ "ID":123 })
.then(function(intId){ console.log('Deleted Item #'+intId); })
.catch(function(strErr){ console.error(strErr); });
```


## Recycle Item
Syntax:
`sprLib.list(listName|listGUID).recycle(itemObject)`

Returns:
ID of the item just recycled

Notes:
Moves the item into the Site Recycle Bin

Example:
```javascript
sprLib.list('Employees').recycle({ "ID":123 })
.then(function(intId){ console.log('Recycled Item #'+intId); })
.catch(function(strErr){ console.error(strErr); });
```



## Get List Column Properties
Syntax:
`sprLib.list(listName|listGUID).cols()`

Returns: Array of columns with name value pairs of property values

### Column Properties
| Property       | Type     | Description                                |
| :------------- | :------- | :----------------------------------------- |
| `dispName`     | string   | display name                               |
| `dataName`     | string   | internal name - used in REST queries and in `listCols` arguments |
| `dataType`     | string   | column type (FieldTypeKind) values: `Boolean`, `Calculated`, `Currency`, `DateTime`, `Note`, `Number`, `Text` |
| `defaultValue` | boolean  | the default value (if any)                 |
| `isAppend`     | boolean  | is this an append text column?             |
| `isNumPct`     | boolean  | is this a percentage number column?        |
| `isReadOnly`   | boolean  | is this an read only column?               |
| `isRequired`   | boolean  | is a value required in this column?        |
| `isUnique`     | boolean  | are unique values enforced on this column? |
| `maxLength`    | boolean  | the maximum length of the column value     |

### Sample Code
```javascript
sprLib.list('Announcements').cols()
.then(function(arrayResults){ console.table(arrayResults) });

// Result:
/*
.---------------------------------------------------------------------------------------------------------------------------------------------.
|      dispName       |     dataName      |  dataType   | isAppend | isNumPct | isReadOnly | isRequired | isUnique | defaultValue | maxLength |
|---------------------|-------------------|-------------|----------|----------|------------|------------|----------|--------------|-----------|
| ID                  | ID                | Counter     | false    | false    | true       | false      | false    | null         | null      |
| Content Type        | ContentType       | Computed    | false    | false    | false      | false      | false    | null         | null      |
| Title               | Title             | Text        | false    | false    | false      | true       | false    | null         |       255 |
| Modified            | Modified          | DateTime    | false    | false    | true       | false      | false    | null         | null      |
| Created             | Created           | DateTime    | false    | false    | true       | false      | false    | null         | null      |
| Created By          | Author            | User        | false    | false    | true       | false      | false    | null         | null      |
| Modified By         | Editor            | User        | false    | false    | true       | false      | false    | null         | null      |
| Attachments         | Attachments       | Attachments | false    | false    | false      | false      | false    | null         | null      |
| Title               | LinkTitleNoMenu   | Computed    | false    | false    | true       | false      | false    | null         | null      |
| Title               | LinkTitle         | Computed    | false    | false    | true       | false      | false    | null         | null      |
| Item Child Count    | ItemChildCount    | Lookup      | false    | false    | true       | false      | false    | null         | null      |
| Folder Child Count  | FolderChildCount  | Lookup      | false    | false    | true       | false      | false    | null         | null      |
| App Created By      | AppAuthor         | Lookup      | false    | false    | true       | false      | false    | null         | null      |
| App Modified By     | AppEditor         | Lookup      | false    | false    | true       | false      | false    | null         | null      |
| Compliance Asset Id | ComplianceAssetId | Text        | false    | false    | true       | false      | false    | null         |       255 |
| Body                | Body              | Note        | false    | false    | false      | false      | false    | null         | null      |
| Expires             | Expires           | DateTime    | false    | false    | false      | false      | false    | null         | null      |
'---------------------------------------------------------------------------------------------------------------------------------------------'
*/
```

## Get List Info
Syntax: `sprLib.list(listName|listGUID).info()`

Returns: Array of list properties

### List Properties
| Property Name               | Type     | Description                                                 |
| :-------------------------- | :------- | :---------------------------------------------------------- |
| `AllowContentTypes`         | boolean  | Whether `Allow management of content types?` is enabled     |
| `BaseTemplate`              | integer  | `SPListTemplateType` SP Base Template ID number - ex: `100` |
| `BaseType`                  | integer  | SP Base Type ID number - ex: `0`                            |
| `Created`                   | string   | Date the List/Library was created (ISO format)              |
| `Description`               | string   | List/Library `Description`                                  |
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

### Sample Code
```javascript
sprLib.list('Employees').info()
.then(function(object){ console.table([object]) });

// RESULT:
/*
.---------------------------------------------------------------------.
|         Prop Name          |               Prop Value               |
|----------------------------|----------------------------------------|
| AllowContentTypes          | true                                   |
| BaseTemplate               | 100                                    |
| BaseType                   | 0                                      |
| Created                    | "2017-08-21T20:48:43Z"                 |
| Description                |                                        |
| DraftVersionVisibility     | 0                                      |
| EnableAttachments          | true                                   |
| EnableFolderCreation       | false                                  |
| EnableVersioning           | true                                   |
| ForceCheckout              | false                                  |
| HasUniqueRoleAssignments   | false                                  |
| Hidden                     | false                                  |
| Id                         | "8fda2799-dbbc-a420-9869-df87b08b09c1" |
| ItemCount                  | 238                                    |
| LastItemDeletedDate        | "2017-10-27T04:42:39Z"                 |
| LastItemModifiedDate       | "2017-10-27T04:42:55Z"                 |
| LastItemUserModifiedDate   | "2017-10-27T04:42:55Z"                 |
| ListItemEntityTypeFullName | "SP.Data.EmployeesListItem"            |
| Title                      | "Employees"                            |
'---------------------------------------------------------------------'
*/
```



### Get List Permissions
Syntax: `sprLib.list(listName|listGUID).perms()`

Returns: Array of list permissions

#### Perm Properties
| Property Name    | Type     | Description                                                           |
| :--------------- | :------- | :-------------------------------------------------------------------- |
| `Member`         | object   | object with Member properties (`Title`,`PrincipalId`,`PrincipalType`) |
| `Roles`          | object   | array of Role objects with properties: (`Name`,`Hidden`)              |

#### Sample Code
```javascript
sprLib.list('Employees').perms()
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

#### Sample Code
Easily Reproduce the "List Permissions" page ('/\_layouts/15/user.aspx')
```javascript
sprLib.list('Employees').perms()
.then(function(arrPerms){
    arrPerms.forEach(function(perm){
        var $row = $('<tr/>');
        $row.append('<td><a href="../_layouts/15/people.aspx?MembershipGroupId='+ perm.Member.PrincipalId +'">'+ perm.Member.Title +'</a></td>');
        $row.append('<td>'+ perm.Member.PrincipalType +'</td>');
        $row.append('<td/>');
        perm.Roles.forEach(function(role){ if ( !role.Hidden ) $row.find('td:last-child').append(role.Name); });
        $('#tabListPerms tbody').append( $row );
    });
});

/*
.----------------------------------------------------------.
|          Name          |      Type        |    Roles     |
|------------------------|------------------|--------------|
| Dev Site Members       | SharePoint Group | Design, Edit |
| Dev Site Owners        | SharePoint Group | Full Control |
| Dev Site Visitors      | SharePoint Group | Read         |
| Excel Services Viewers | SharePoint Group | View Only    |
'----------------------------------------------------------'
*/
```
