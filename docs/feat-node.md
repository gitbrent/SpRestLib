---
id: feat-node
title: SharePoint via Node.js  
---

## Connect To Office 365/SharePoint Online With Node.js
SpRestLib can be utilized via Node.js to perform powerful operations, generate reports, etc.

## Demo
See `example/nodejs-demo.js` for a complete, working demo of connecting to SharePoint Online.

```bash
[brent@macbook 22:26:35] ~/Documents/GitHub/SpRestLib/example
$ node nodejs-demo.js [spUsername] [spPassword] [spHostUrl]

Starting demo...
================================================================================
> SpRestLib version: 1.4.0

 * STEP 1/2: Auth into login.microsoftonline.com ...
 * STEP 2/2: Auth into SharePoint ...
 * SUCCESS!! Authenticated into "sample.sharepoint.com"

TEST 1: sprLib.user().info()
----------------------------
Id.........: 99
Title......: Brent Ely
LoginName..: i:0#.f|membership|gitbrent@sample.onmicrosoft.com
Email......: gitbrent@sample.onmicrosoft.com

================================================================================
...demo complete.
```
