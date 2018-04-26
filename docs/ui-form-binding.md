---
id: ui-form-binding
title: Form Binding
---

## About
Include the optional `sprestlib-ui.js` library to perform control/form binding with an
AngluarJS-like syntax made especially for SharePoint Web Services.

Many different HTML tags can be populated by adding an `data-sprlib` property to many HTML element types.

Syntax:
`<tag data-sprlib='{ options }'>`

### Supported HTML Tags

The following HTML element tags can be populated:
* select: `select` can be populated with various text/value options
* table: `table` or `tbody` can be populated with 1-n SharePoint List columns
* other: (`input`, `p`, `span`, etc.): populates a single, plain text value

### HTML Tag Properties
| Name          | Type    | Description                    | Possible Values                                      |
| :------------ | :------ | :----------------------------- | :--------------------------------------------------- |
| `list`        | string  | **REQUIRED** list/library name | Ex:`"list": "Employees"`                             |
| `cols`        | array   | columns to be selected         | Ex:`"cols": ["ID","Title"]`                          |
| `filter`      | string  | query filter value             | Ex:`"filter": {"col":"ID", "op":"eq", "val":"99"}`   |
| `limit`       | integer | max items to return            | Ex:`"limit": 100`                                    |
| `options`     | string  | table/tbody options            | (see below)                                          |
| `showBusy`    | boolean | show busy animation during load | (shows CSS animation before control loads)          |

* `cols` is an array of either strings (Ex: `cols: ["ID","Title"]`), objects (Ex: `cols: [{"name":"Title"}]`) or a combination of the two (see Options below)

#### HTML Tag Properties: Table
| Name          | Type    | Description                    | Possible Values                                                   |
| :------------ | :------ | :----------------------------- | :---------------------------------------------------------------- |
| `tablesorter` | string  | add jQuery TableSorter plugin  | (only for tables). Adds the jQuery tableSorter library to table   |

#### HTML Tag Properties: Select
| Name          | Type    | Description                    | Possible Values                                                   |
| :------------ | :------ | :----------------------------- | :---------------------------------------------------------------- |
| `text`        | string  | text string to show            | (only for select). Ex:`text:"Title"`                              |
| `value`       | string  | value string to show           | (only for select). Ex:`value:"ID"`                                |

#### HTML Tag Properties: Cols Options
| Name          | Type    | Description                    | Possible Values                                                   |
| :------------ | :------ | :----------------------------- | :---------------------------------------------------------------- |
| `name`        | string  | the OData column name          | Examples: `"Title"`, `"Hire_x0020_Date"`, `"AssignedTo/Email"`    |
| `class`       | string  | CSS class name to use          | Ex:`"class":"highlight"`                                          |
| `format`      | string  | date format option             | Any of: `US`,`DATE`,`INTL`,`INTLTIME`,`ISO`. Ex:`format: "INTL"`  |
| `label`       | string  | text for table header          | (only for table tags without thead) show "Hire Date" instead of "Hire_x0020_Date", etc. |
| `style`       | string  | CSS style to use               | Ex:`"style":"width:50%; color:red;"`                              |

### Examples
```html
<!-- table/tbody -->
<table data-sprlib='{ "list":"Employees", "cols":["Name"], "filter":{"col":"Active", "op":"eq", "val":true}} }'>
<table data-sprlib='{ "list":"Employees", "cols":["Name",{"name":"Utilization_x0020_Pct","label":"Util%"}] } }'></tbody>
<tbody data-sprlib='{
    "list": "Departments",
    "cols": ["Title",{"name":"Modified","format":"INTLTIME"}],
    "limit": 10 }\'>
</table>

<!-- select -->
<select
    data-sprlib='{ "list":"Employees", "value":"Id", "text":"Name", "showBusy":true }'>
</select>

<!-- input -->
<input type="text" data-sprlib='{ "list":"Departments", "value":"Title" }' placeholder="Departments.Title"></input>

<!-- static elements span, div, etc. -->
<span data-sprlib='{ "list":"Employees", "value":"Name", "filter":{"col":"Name", "op":"eq", "val":"Brent Ely"} }'></span>
```
