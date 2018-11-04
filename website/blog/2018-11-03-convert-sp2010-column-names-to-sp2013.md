2018-11-03-convert-sp2010-column-names-to-sp2013
---
author: Brent Ely
authorURL: https://github.com/gitbrent/
title: SharePoint List Unique Permissions REST Query
---

How to determine if a SharePoint List/Library has unique, non-inherited permissions (role assignments).

<!--truncate-->

*****************************

## Example
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
	//arrMap.forEach(item => console.log(item));
	var objMap = {};
	arrMap.forEach(item => {
		objMap[item.sp2010] = item.sp2013;
	});
	console.log( JSON.stringify(objMap,null,4) );
});
```

## Results
```
.---------------------------------------------------------.
| SharePoint 2010 Name |      SharePoint 2013+ Name       |
|----------------------|----------------------------------|
| Name                 | Name                             |
| Manager              | Manager                          |
| BadgeNumber          | Badge_x0020_Number               |
| JobGrade             | Job_x0020_Grade                  |
| HireDate             | Hire_x0020_Date                  |
| Salary               | Salary                           |
| Extension            | Extension                        |
| DepartmentsSupported | Departments_x0020_Supported      |
| Comments             | Comments                         |
| VersionedComments    | Versioned_x0020_Comments         |
| UtilizationPct       | Utilization_x0020_Pct            |
| Active               | Active_x003f_                    |
| CalcCol              | CalcCol                          |
| Title                | LinkTitle                        |
| SiteLink             | Site_x0020_Link                  |
| MentoredTeamMembers  | Mentored_x0020_Team_x0020_Member |
| ComplianceAssetId    | ComplianceAssetId                |
| ID                   | ID                               |
| ContentType          | ContentType                      |
| Modified             | Modified                         |
| Created              | Created                          |
| CreatedBy            | Author                           |
| ModifiedBy           | Editor                           |
| Attachments          | Attachments                      |
| ItemChildCount       | ItemChildCount                   |
| FolderChildCount     | FolderChildCount                 |
| AppCreatedBy         | AppAuthor                        |
| AppModifiedBy        | AppEditor                        |
'---------------------------------------------------------'
```

## Usage
The `info()` SpRestLib method returns several useful List properties, one of which is `HasUniqueRoleAssignments`.  This boolean value will tell you if a Lis/tLibrary has unique permissions.
