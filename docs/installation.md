---
id: installation
title: Installation
sidebar_label: Installation
---

## Client-Side

### Include Local Scripts
```html
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.js"></script>
```
* *IE11 support requires a Promises polyfill as well (included in the `libs` folder)*

### Include Bundle Script
```html
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib.bundle.js"></script>
```
* *`sprestlib.bundle.js` includes all required libraries (SpRestLib + Promises)*
```html
<script lang="javascript" src="https://yourhost.com/subsite/SiteAssets/js/sprestlib-ui.bundle.js"></script>
```
* *`sprestlib-ui.bundle.js` includes all required libraries plus UI (SpRestLib and SpRestLib-UI + jQuery and Promises)*

### Install With Bower
```bash
bower install sprestlib
```

## Node.js
```bash
npm install sprestlib

var sprLib = require("sprestlib");
```
* Desktop: Compatible with Electron applications.

See [Library Integration](/SpRestLib/docs/feat-integration.html) for more on using Angular, React, etc.
