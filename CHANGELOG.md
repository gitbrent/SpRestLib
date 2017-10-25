# Change Log

## [v1.3.0](https://github.com/gitbrent/sprestlib/tree/v1.3.0) (2017-11-??)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.2.1...v1.3.0)

**Fixed Bugs:**
**Implemented Enhancements:**
- `.list()` now accepts an object in addition to listname (string)




## [v1.2.1](https://github.com/gitbrent/sprestlib/tree/v1.2.1) (2017-10-12)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.2.0...v1.2.1)

**Fixed Bugs:**
- Url param passing .rest() with 'http'/'https' is not being parsed correctly [\#2](https://github.com/gitbrent/sprestlib/issues/2) ([gitbrent](https://github.com/gitbrent))
- Query options passed to .rest() are only parsed when 'queryCols' exists [\#3](https://github.com/gitbrent/sprestlib/issues/3) ([gitbrent](https://github.com/gitbrent))



## [v1.2.0](https://github.com/gitbrent/sprestlib/tree/v1.2.0) (2017-10-05)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.1.0...v1.2.0)

**Implemented Enhancements:**
- Added Electron compatibility
- Moved Qunit and SpRestLib script loading to dynamic for demo and qunit pages.

**Fixed Bugs:**
- The sprLib.rest() method is not parsing queryCols correctly [\#1](https://github.com/gitbrent/sprestlib/issues/1) ([gitbrent](https://github.com/gitbrent))



## [v1.1.0](https://github.com/gitbrent/sprestlib/tree/v1.1.0) (2017-09-07)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.0.0...v1.1.0)

**Fixed Bugs:**
- Fixed bug in error messages introduced in last release
- Fixed error handling in Node.js
- Fixed return of empty array for null Person/lookup fields



## [v1.0.0](https://github.com/gitbrent/sprestlib/tree/v1.0.0) (2017-08-08)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v0.12.0...v1.0.0)

**Implemented Enhancements:**
- Added ability to lookup users by `login`
- Node connectivity to SharePoint (Office 365) works now
- Last bit of cleanup work to arrive at v1.0.0

## [v0.12.0](https://github.com/gitbrent/sprestlib/tree/v0.12.0) (2017-07-05)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v0.11.0...v0.12.0)

**Fixed Bugs:**
- Lots of code cleanup and bug fixes

## [v0.11.0](https://github.com/gitbrent/sprestlib/tree/v0.11.0) (2017-06-25)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v0.10.0...v0.11.0)

**Fixed Bugs:**
- Misc bug fixes

**Implemented Enhancements:**
- Added `baseUrl` method to List API to dynamically set baseUrl on a per-call basis
- Added `cache`, `contentType` and `type`='POST' options to `rest()` API
- Added ability to get user info by `title` or `email`
- Added new `.recycle()` List method
- Added sprestlib.bundle.js file (using gulp)
- Added bower support

## [v0.10.0](https://github.com/gitbrent/sprestlib/tree/v1.0.0) (2017-05-11)

**Code Cleanup**
**New Features**

## [v0.9.0](https://github.com/gitbrent/sprestlib/tree/v1.0.0) (2017-01-31)

**Initial Release**
