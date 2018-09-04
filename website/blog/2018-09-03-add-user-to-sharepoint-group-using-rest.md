---
author: Brent Ely
authorURL: https://github.com/gitbrent/
title: Adding a User to SharePoint Group Using REST with SpRestLib
---

Adding a User to an existing SharePoint Group can be done using a SpRestLib REST call in
just a few lines of code.

<!--truncate-->

*****************************

## Example
```javascript
// HowTo: Get the GroupID if you dont already have it
sprLib.site().groups({ title:'Dev Site Members' })
.then(arrResults => { console.log('Group Id = '+arrResults[0].Id) })

// EX: Add a User to Group
sprLib.rest({
	url: '/sites/dev/_api/web/sitegroups(123)/users',
	type: 'POST',
	data: JSON.stringify({ "__metadata":{"type":"SP.User"}, "LoginName":"domain\\userID" })
})
.then(arrResults => console.log(arrResults))
.catch(strErr => console.error(strErr));
```

## Notes
The value for `LoginName` can vary wildly across Microsoft SP implementations/tenants.

Here are a few examples of possible values - usually only one of these will work.
* "domain\brent_ely"
* "domain\123456"
* "i:0#.w|domain\123456"
* "i:0#.w|domain\brent_ely"
