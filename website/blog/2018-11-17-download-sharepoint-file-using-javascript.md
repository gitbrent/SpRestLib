---
author: Brent Ely
authorURL: https://gitbrent.github.io/SpRestLib/
title: Downloading a file from SharePoint library using JavaScript and REST API
---

Howto download a file from SharePoint Library using REST. This technique produces
a BLOB that can be streamed/saved directly from a web browser and works with both
text and binary files.

<!--truncate-->

*****************************

## Example: Using client browser to download a file
`sprLib.file("Path/SomeFileName").get()`  

Returns: Blob containing the file (either text or binary).

## Sample Code: Download a file from SharePoint
```javascript
// Example: Client-browser code to download file from SharePoint using JavaScript and REST
sprLib.file('SiteAssets/img/sprestlib.png').get()
.then(function(blob){
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", _fileName);
    link.style = "visibility:hidden";
    document.body.appendChild(link);
    link.click();
    setTimeout(function(){ document.body.removeChild(link); }, 500);
});
```
![Example](/SpRestLib/docs/assets/file-download-example.png)


## More Information
See [File API](/SpRestLib/docs/api-file.html) for a working demo.
