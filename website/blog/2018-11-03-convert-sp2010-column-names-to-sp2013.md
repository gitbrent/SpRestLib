---
author: Brent Ely
authorURL: https://gitbrent.github.io/SpRestLib/
title: Converting SharePoint 2010 API column names to SharePoint 2013 API column names
---

Converting SharePoint 2010 API (`ListData.svc`) column names to SharePoint 2013 API (`_api`).

<!--truncate-->

*****************************
## Summary
The SP2010 ListData.svc REST API looks for column names in a different style than the new SP2013 API. This
script will provide a mapping of old to new names, which helps a lot when converting old code!

Common column remaps are performed automatically, so `ModifiedBy` now becomes `Editor`.  

For example, the "Due Date" column is used in ListData.svc REST calls as:
* SP2010: `_vti_bin/listdata.svc/Tasks?$select=DueDate`
* SP2013: `_api/web/lists/getbytitle('Tasks')/Items/?$select=Due_x0020_Date`

## Example
Provide a list name or GUID to get a mapping for column names.

### Mapping Script
```javascript
var arrMap = [];
sprLib.list('Employees').cols()
.then(arrCols => {
	// A:
	arrCols.forEach(col => {
		arrMap.push({
			sp2010: col.dispName.replace(/[\W\s]/gi,'') + ( col.dataType == 'Choice' ? 'Value' : '' ),
			sp2013: col.dataName
		});
	});
	// B:
	var objMap = {};
	arrMap.forEach(item => {
		objMap[item.sp2010] = item.sp2013;
	});
	console.log( JSON.stringify(objMap,null,4) );
});
```

### Script Results
```
.---------------------------------------------------------.
| SharePoint 2010 Name |      SharePoint 2013+ Name       |
|----------------------|----------------------------------|
| Active               | Active_x003f_                    |
| AppCreatedBy         | AppAuthor                        |
| AppModifiedBy        | AppEditor                        |
| Attachments          | Attachments                      |
| BadgeNumber          | Badge_x0020_Number               |
| CalcCol              | CalcCol                          |
| Comments             | Comments                         |
| ComplianceAssetId    | ComplianceAssetId                |
| ContentType          | ContentType                      |
| Created              | Created                          |
| CreatedBy            | Author                           |
| DepartmentsSupported | Departments_x0020_Supported      |
| Extension            | Extension                        |
| FolderChildCount     | FolderChildCount                 |
| HireDate             | Hire_x0020_Date                  |
| ID                   | ID                               |
| ItemChildCount       | ItemChildCount                   |
| JobGrade             | Job_x0020_Grade                  |
| Manager              | Manager                          |
| MentoredTeamMembers  | Mentored_x0020_Team_x0020_Member |
| Modified             | Modified                         |
| ModifiedBy           | Editor                           |
| Name                 | Name                             |
| Salary               | Salary                           |
| SiteLink             | Site_x0020_Link                  |
| Title                | LinkTitle                        |
| UtilizationPct       | Utilization_x0020_Pct            |
| VersionedComments    | Versioned_x0020_Comments         |
'---------------------------------------------------------'
```

### Script Notes
* This may not be correct 100% of the time :-)
