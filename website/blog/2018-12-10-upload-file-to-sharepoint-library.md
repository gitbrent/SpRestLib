---
author: Brent Ely
authorURL: https://gitbrent.github.io/SpRestLib/
title: Uploading a file to a SharePoint library using JavaScript
---

Howto upload a file into a SharePoint Library using SpRestLib.  The `upload()` method
accepts an ArrayBuffer from both Node.js and client browsers.

<!--truncate-->

*****************************

The `sprLib.folder().upload()` method accepts a filename and file data as an ArrayBuffer.

Provide file `data` via an HTML file picker or via `fs` in Node.

* There are options for security tokens and overwriting existing files
* See [Folder API](/SpRestLib/docs/api-folder.html) for a complete documentation

## Using client browser to upload a file
Given an HTML file picker `<input id="filePicker" type="file">`:
![screen shot 2018-03-18 at 23 38 17](https://user-images.githubusercontent.com/7218970/37578233-7a309bb8-2b05-11e8-9f4d-6a770fa8e097.png)

### Sample Code
```javascript
// STEP 1: Use FilePicker to read file
var reader = new FileReader();
reader.readAsArrayBuffer( $('#filePicker')[0].files[0] );
reader.onloadend = function(e){
    var parts = $('#filePicker')[0].value.split("\\");
    var fileName = parts[parts.length - 1];

    // STEP 2: Upload file to SharePoint
    sprLib.folder('/sites/dev/Documents').upload({
        name: fileName,
        data: e.target.result,
        overwrite: true
    });
});
```

### Working Demo
See [example/sprestlib-demo-file-upload.html](https://github.com/gitbrent/SpRestLib/tree/master/example) for a working demo.

![howto-sprestlib-upload file](https://user-images.githubusercontent.com/7218970/49771984-2d0c6c80-fcb1-11e8-818a-2d867e7c74cb.png)



## Using Node.js to upload a file
As node runs outside of an `aspx` page, you'll need to provide an authorization RequestDigest to SharePoint
(see node-js-demo.js for a working example of getting auth tokens from SharePoint using node).

### Sample Code
```javascript
sprLib.folder(gStrFilePath).upload({
    name: 'jeff_teper_secret_plan.docx',
    data: fs.readFileSync('./docs/jeff_teper_secret_plan.docx'),
    requestDigest: gStrReqDig,
    overwrite: true
})
.then((objFile) => {
	console.log('SUCCESS: `'+ objFile.Name +'` uploaded to: `'+ objFile.ServerRelativeUrl +'`' );
})
.catch((strErr) => {
    console.error(strErr);
});
```

### Working Demo
See [example/nodejs-demo.js](https://github.com/gitbrent/SpRestLib/tree/master/example) for a working demo.
