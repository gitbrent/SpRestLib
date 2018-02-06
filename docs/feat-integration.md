---
id: feat-integration
title: Library Integration
---
**************************************************************************************************
Table of Contents
- [Integration with Angular/Typescript/Webpack](#integration-with-angulartypescriptwebpack)
**************************************************************************************************

## Integration with Angular/Typescript/Webpack

The library may detect your app as a Node.js application, which utilizes a different AJAX
call and authentication scheme.

If your application is embedded in an .aspx page, disable Node detection to have the library
operate in browser mode.  

`sprLib.nodeConfig({ nodeEnabled:false });`

Issue/Discussion: [Issue #9](https://github.com/gitbrent/SpRestLib/issues/9)
