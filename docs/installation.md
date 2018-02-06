---
id: installation
title: Installation
sidebar_label: Installation
---
**************************************************************************************************
Table of Contents
- [Client-Side](#client-side)
  - [Include Local Scripts](#include-local-scripts)
  - [Include Bundle Script](#include-bundle-script)
  - [Install With Bower](#install-with-bower)
- [Node.js](#nodejs)
**************************************************************************************************

## Client-Side

### Include Local Scripts
```javascript
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/jquery.min.js"></script>
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.js"></script>
```
* *IE11 support requires a Promises polyfill as well (included in the `libs` folder)*

### Include Bundle Script
```javascript
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.bundle.js"></script>
```
* *`sprestlib.bundle.js` includes all required libraries (SpRestLib + jQuery and Promises)*
```javascript
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib-ui.bundle.js"></script>
```
* *`sprestlib-ui.bundle.js` includes all required libraries plus UI (SpRestLib and SpRestLib-UI + jQuery and Promises)*

### Install With Bower
```javascript
bower install sprestlib
```

## Node.js
```javascript
npm install sprestlib

var sprLib = require("sprestlib");
```
* Desktop: Compatible with Electron applications.
