---
id: api-rest
title: REST API Methods
---

Returns the results of a given REST call to any [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx)

Use the `sprLib.rest()` interface to GET or POST to any of the dozens of available SP REST API Endpoints.

The available REST service endpoints can add Users to Groups, create columns in a List/Library, enumerate site properties
and other super useful functions.

Syntax:  
`sprLib.rest(options)`

Returns: Array of objects containing name/value pairs

## Options
| Option        | Type    | Default     | Description           | Possible Values / Returns           |
| :------------ | :------ | :---------- | :-------------------- | :---------------------------------- |
| `url`         | string  | current url | REST API endpoint     | full or relative url. See: [SharePoint REST API](https://msdn.microsoft.com/en-us/library/office/dn268594.aspx) |
| `type`        | string  | `GET`       | rest operation type   | `GET` or `POST`. Ex:`type: 'POST'` |
| `data`        | string  |             | data to be sent       | Ex:`data: {'type': 'SP.FieldDateTime'}` |
| `cache`       | boolean | `false`     | cache settings        | Ex:`cache: true` |
| `contentType` | string  | `application/json` | request header content-type | Only used with `type:'POST'` |
| `headers`     | string  |             | query headers         | Pass any headers. Ex:`{Accept:'application/json'}` |
| `metadata`    | boolean | `false`     | whether to return `__metadata` | Ex:`metadata: true` |
| `queryCols`   | string  |             | fields/columns to get | any available field from the SP REST API |
| `queryFilter` | string  |             | query filter          | utilizes OData style [Query Operators](https://msdn.microsoft.com/en-us/library/office/fp142385.aspx#Anchor_7) Ex:`queryFilter: 'Salary lt 99000'` |
| `queryLimit`  | string  | `1000`      | max items to return   | 1-5000. Ex:`queryLimit: 5000` |
| `queryOrderby`| string  |             | column(s) to order by | Ex:`queryOrderby: Name` |
| `requestDigest` | string | `$('#__REQUESTDIGEST`).val() | Form Digest Value | The `X-RequestDigest` header value (SP Auth) |

## Examples
```javascript
// EX: Get site collection groups
sprLib.rest({
    url:          '/sites/dev/_api/web/sitegroups',
    queryCols:    ['Title','LoginName','AllowMembersEditMembership'],
    queryFilter:  'AllowMembersEditMembership eq false',
    queryOrderby: 'Title',
    queryLimit:   10
})
.then(arrItems => console.table(arrItems))
.catch(errMsg => console.error(errMsg));
/*
.------------------------------------------------------------------------------.
|         Title          |       LoginName        | AllowMembersEditMembership |
|------------------------|------------------------|----------------------------|
| Dev Site Owners        | Dev Site Owners        | false                      |
| Dev Site Visitors      | Dev Site Visitors      | false                      |
| Excel Services Viewers | Excel Services Viewers | false                      |
'------------------------------------------------------------------------------'
*/

// EX: Add a new column to a list/library using the REST API
sprLib.rest({
    url:  "_api/web/lists/getbytitle('Employees')/fields",
    data: "{'__metadata':{'type':'SP.FieldDateTime'}, 'FieldTypeKind':4, 'Title':'Bonus Date', 'DisplayFormat':1 }",
    type: "POST"
})
.then(function(){ console.log("New column created!"); })
.catch(function(errMsg){ console.error(errMsg) });
```
