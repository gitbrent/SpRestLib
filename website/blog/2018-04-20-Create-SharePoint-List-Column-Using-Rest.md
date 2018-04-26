---
author: Brent Ely
authorURL: https://github.com/gitbrent/
title: Creating a SharePoint List Column Using REST
---

Send a REST call to any List or Library to create any type of column

Very useful!

<!--truncate-->

```javascript

sprLib.rest({
	url: '',
	type: 'POST'
	data: "{ __type: }"
})
.then(() => {
	console.log('Column created!');
})
```
