---
author: Brent Ely
authorURL: https://gitbrent.github.io/SpRestLib/
title: Uploading a file to a SharePoint library using REST
---

Howto upload a file into a SharePoint Library using REST.  Both Node.js and
client browsers can encode and upload files easily.

<!--truncate-->

*****************************

Provide a source file using a file picker element in web browsers, or use a file path in Node.js.

There are options for overwriting existing files and to select the destination folder.

## Example: Using Node.js to upload a file
```javascript
// see "nodejs-demo.js" for code on how to acquire a DigestToken `gStrReqDig`
var strFileName = "./someFile.docx";

sprLib.rest({
    url: "_api/web/lists/getByTitle('Documents')/RootFolder/files/add(overwrite=true,url='"+strFileName+"')",
    type: "POST",
    requestDigest: gStrReqDig,
    data: new Buffer( fs.readFileSync(strFileName, 'utf8') )
})
.then((arrResults) => {
    console.log('SUCCESS: "'+ arrResults[0].Name +'" uploaded to: '+ arrResults[0].ServerRelativeUrl );
})
.catch(function(strErr){
    console.error(strErr);
});
```

## Example: Using client browser to upload a file
Given an HTML file picker (`<input type="file" id="filePicker">`):
![screen shot 2018-03-18 at 23 38 17](https://user-images.githubusercontent.com/7218970/37578233-7a309bb8-2b05-11e8-9f4d-6a770fa8e097.png)

```javascript
var reader = new FileReader();
reader.readAsArrayBuffer( $('#filePicker')[0].files[0] );
reader.onloadend = function(e){
    var parts = $('#filePicker')[0].value.split('\\');
    var fileName = parts[parts.length - 1];
    var strAjaxUrl = _spPageContextInfo.siteAbsoluteUrl
        + "/_api/web/lists/getByTitle('Site Assets')"
        + "/RootFolder/files/add(overwrite=true,url='"+ fileName +"')";

    sprLib.rest({
        url: strAjaxUrl,
        type: "POST",
        data: e.target.result
    })
    .then(function(arr){
        $('#console').append('SUCCESS: "'+ arr[0].Name +'" uploaded to: '+ arr[0].ServerRelativeUrl +'<br>');
    })
    .catch(function(strErr){
        console.error(strErr);
    });
};
reader.onerror = function(e){
    alert(e.target.error.responseText);
    console.error(e.target.error);
};
```

## More Examples
See [`examples/sprestlib-demo-file-upload.html`](https://github.com/gitbrent/SpRestLib/tree/master/example) for a working demo.
