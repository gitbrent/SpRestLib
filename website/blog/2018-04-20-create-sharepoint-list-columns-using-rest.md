---
author: Brent Ely
authorURL: https://github.com/gitbrent/
title: Creating SharePoint List Columns Using REST
---

List and Library fields/columns can be created using the REST API.  A feature
which is especially useful in many scenarios, such as having to update many subsites with new fields,
doing migration work, etc.

<!--truncate-->

*****************************

All of the various field types can be created using REST: choice fields, date time fields, and lots of
other common types.

Create a field by POST-ing to the list's `/fields` endpoint with a SP field definition and options.

## Example: Create a new single line text field on "Accounts"
```javascript
var objNewField = {
	'__metadata': {'type':'SP.FieldText'},
	'FieldTypeKind': 2,
	'Title': 'single line of text'
};

sprLib.rest({
    url : "_api/lists/getbytitle('Accounts')/fields",
    type: "POST",
    data: JSON.stringify(objNewField)
})
.then( () => console.log('Column created!') )
.catch( strErr => console.error(strErr) );
```

## Other Field Type Objects:
```javascript
// Text
var objText = {
	'__metadata': {'type':'SP.FieldText'},
	'FieldTypeKind': 2,
	'Title': 'Expense Title'
};
// Date/DateTime
var objDate = {
	'__metadata': {'type':'SP.FieldDateTime'},
	'FieldTypeKind': 4,
	'Title': 'Phase 1 Date',
	'DisplayFormat': 0 // (DateOnly = 0, DateTime = 1)
};
// Number
var objNumb = {
	'__metadata': {'type':'SP.FieldNumber'},
	'FieldTypeKind': 9,
	'Title': 'Cost Center',
	'MinimumValue': 1,
	'MaximumValue': 1000
};
// Currency
var objCurr = {
	'__metadata': {'type':'SP.FieldCurrency'},
	'FieldTypeKind': 10,
	'Title': 'Expenses Total'
};
```

## Reference
Check the [Fields REST API Reference](https://msdn.microsoft.com/en-us/library/office/dn600182.aspx) for more types.
