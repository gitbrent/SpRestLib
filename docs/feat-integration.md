---
id: feat-integration
title: Library Integration
---

## Integration with Angular/Typescript/Webpack

The library may detect your app as a Node.js application, which utilizes a different AJAX
call and authentication scheme.

You can override Node detection to have the library operate in browser mode by calling `nodeConfig`.  
`sprLib.nodeConfig({ nodeEnabled:false });`

Issue/Discussion: [Issue #9](https://github.com/gitbrent/SpRestLib/issues/9)
