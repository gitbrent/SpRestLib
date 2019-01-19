# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.10.0] - 2019-??-??
### Added
### Changed
- Updated library to use content-type `nometadata` instead of always using `verbose`, saving 25-50% of payload size of the JSON results ([gitbrent](https://github.com/gitbrent))
- Updated JSON result parsing to handle more cases/styles (nometadata, verbose, MS Graph) ([gitbrent](https://github.com/gitbrent))
- Updated construction of REST `headers` to make it more robust ([gitbrent](https://github.com/gitbrent))
- Updated Promise reject error message: Returned string now includes SharePoint `error.code` and no longer shows the "URL used:" string; Updated parsing code to be more robust; Now includes support for parsing Microsoft Graph REST API call errors. ([gitbrent](https://github.com/gitbrent))


## [1.9.0] - 2018-12-12
### Added
- New `file` API method: `checkin()` ([gitbrent](https://github.com/gitbrent))
- New `file` API method: `checkout()` ([gitbrent](https://github.com/gitbrent))
- New `file` API method: `delete()` ([gitbrent](https://github.com/gitbrent))
- New `file` API method: `recycle()` ([gitbrent](https://github.com/gitbrent))
- New `folder` API method: `add()` ([gitbrent](https://github.com/gitbrent))
- New `folder` API method: `delete()` ([gitbrent](https://github.com/gitbrent))
- New `folder` API method: `recycle()` ([gitbrent](https://github.com/gitbrent))
- New `folder` API method: `upload()` [\#18](https://github.com/gitbrent/sprestlib/issues/18) ([ra6hi9](https://github.com/ra6hi9))
- New `options()` method: replaces `baseUrl()` and `nodeConfig()` methods ([gitbrent](https://github.com/gitbrent))
### Changed
- Typescript: Modified declaration file [\#37](https://github.com/gitbrent/sprestlib/pull/37) ([kelvinbell](https://github.com/kelvinbell))
- Allow single UserProfile property to be queried [\#38](https://github.com/gitbrent/sprestlib/issues/38) ([YakQin](https://github.com/YakQin))
- The `rest()` method now includes the page's `__REQUESTDIGEST` value for POST types with custom headers that did not already include a value for `X-RequestDigest`
### Removed
*DEPRECATED* `baseUrl()` and `nodeConfig()` methods - use the new `options()` method instead.


## [v1.8.0](https://github.com/gitbrent/sprestlib/tree/v1.8.0) (2018-08-29)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.7.0...v1.8.0)

**Implemented Enhancements:**
- New File Methods: `get()`, `info()`, `perms()` [\#20](https://github.com/gitbrent/sprestlib/issues/20) ([ra6hi9](https://github.com/ra6hi9))([YakQin](https://github.com/YakQin))([gitbrent](https://github.com/gitbrent))
- New Folder Methods: `files()`, `folders()`, `info()`, `perms()` [\#20](https://github.com/gitbrent/sprestlib/issues/20) ([ra6hi9](https://github.com/ra6hi9))([YakQin](https://github.com/YakQin))([gitbrent](https://github.com/gitbrent))
- Added Typescript Definitions [\#24](https://github.com/gitbrent/sprestlib/issues/24) ([Wireliner](https://github.com/Wireliner))
- Added two new properties to `list().cols()` method: `choiceValues` and `allowFillInChoices`
- Added "browser" field to `package.json` to improve library integration

**Fixed Bugs:**
- The list() `baseUrl` option is ignored by the underlying versions query. [\#27](https://github.com/gitbrent/sprestlib/issues/27) ([gitbrent](https://github.com/gitbrent))
- sprLib.user(options).profile() using "post"? [\#30](https://github.com/gitbrent/sprestlib/issues/30) ([YakQin](https://github.com/YakQin))
- The `baseUrl` option no longer works in `user()` methods [\#31](https://github.com/gitbrent/sprestlib/issues/31) ([YakQin](https://github.com/YakQin))
- Typescript fix: listCols should be optional [\#33](https://github.com/gitbrent/sprestlib/pull/33) ([csoren](https://github.com/csoren))


## [v1.7.0](https://github.com/gitbrent/sprestlib/tree/v1.7.0) (2018-05-14)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.6.0...v1.7.0)

**Implemented Enhancements:**
- Renamed `getItems()` list method to `items()`.
- Modify user() method option names to be case insensitive [\#17](https://github.com/gitbrent/sprestlib/issues/17) ([gitbrent](https://github.com/gitbrent))
- Get members of a specific group given its name [\#19](https://github.com/gitbrent/sprestlib/issues/19) ([ra6hi9](https://github.com/ra6hi9))

**Fixed Bugs:**
- Added `catch()` to core REST method call to properly handle failed queries
- Updated Node detection to be more accurate and work with Angular, etc. (aka:"ERROR in ./node_modules/sprestlib/dist/sprestlib.js") [\#23](https://github.com/gitbrent/sprestlib/issues/23) ([azmatzuberi](https://github.com/azmatzuberi))


## [v1.6.0](https://github.com/gitbrent/sprestlib/tree/v1.6.0) (2018-03-05)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.5.0...v1.6.0)

**Implemented Enhancements:**
- Add support for SP User Profile API [\#14](https://github.com/gitbrent/sprestlib/issues/14) ([ra6hi9](https://github.com/ra6hi9))
- Removed jQuery methods from sprestlib.js - there are now ZERO library dependencies!
- Add async/await example [\#16](https://github.com/gitbrent/sprestlib/pull/16) ([wmertens](https://github.com/wmertens))
- Removed all ES6 code from `sprestlib-demo.html` (it is IE11 compatible now!), plus moved deps to CDN from local files.
- Improved error messages/feedback

**Fixed Bugs:**
- Fixed two issues with CRUD operations via Node.js
- Fixed a few minor issues with parsing no results in certain scenarios, etc.


## [v1.5.0](https://github.com/gitbrent/sprestlib/tree/v1.5.0) (2018-02-16)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.4.0...v1.5.0)

**Implemented Enhancements:**
- Form binding/population spun off into separate `sprestlib-ui.js` library
- Created a separate demo page for `sprestlib-ui.js` library
- Added new dist file (minified library): `sprestlib.min.js`

**Fixed Bugs:**
- Selecting the same field name twice results in undefined [\#15](https://github.com/gitbrent/sprestlib/issues/15) ([gitbrent](https://github.com/gitbrent))
- Fixed a null-check defect in REST result parsing


## [v1.4.0](https://github.com/gitbrent/sprestlib/tree/v1.4.0) (2018-01-08)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.3.0...v1.4.0)

**Implemented Enhancements:**
- Add paging/skip/next ability to getItems() [\#4](https://github.com/gitbrent/sprestlib/issues/4) ([Wireliner](https://github.com/Wireliner))
- Error in list(listname).create(data) [\#5](https://github.com/gitbrent/sprestlib/issues/5) ([Wireliner](https://github.com/Wireliner))
- Add new option for auth DigestToken [\#6](https://github.com/gitbrent/sprestlib/issues/6) ([Wireliner](https://github.com/Wireliner))
- Add new 'guid' option to list() [\#7](https://github.com/gitbrent/sprestlib/issues/7) ([YakQin](https://github.com/YakQin))
- Add new 'baseUrl' option to user() [\#8](https://github.com/gitbrent/sprestlib/issues/8) ([YakQin](https://github.com/YakQin))
- Add new 'nodeEnabled' option for Angular/etc [\#9](https://github.com/gitbrent/sprestlib/issues/9) ([ra6hi9](https://github.com/ra6hi9))


## [v1.3.0](https://github.com/gitbrent/sprestlib/tree/v1.3.0) (2017-11-27)
[Full Changelog](https://github.com/gitbrent/sprestlib/compare/v1.2.1...v1.3.0)

**Implemented Enhancements:**
- *BREAKING CHANGE*: `list().baseUrl()` removed! (new: `baseUrl` param to `list()`)
- *BREAKING CHANGE*: `version()` method removed! (new: `sprLib.version` property)
- `.list()` now accepts an object in addition to listname (string)
- Added new `metadata` option to `list().getItems()` and `rest()` methods
- Added new Site methods: `site()` - returns info, perms, users, groups, subsites, etc.


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

[Unreleased]: https://github.com/gitbrent/sprestlib/compare/v1.9.0...HEAD
[1.9.0]: https://github.com/gitbrent/sprestlib/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/gitbrent/sprestlib/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/gitbrent/sprestlib/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/gitbrent/sprestlib/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/gitbrent/sprestlib/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/gitbrent/sprestlib/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/gitbrent/sprestlib/compare/v1.2.0...v1.3.0
[1.2.1]: https://github.com/gitbrent/sprestlib/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/gitbrent/sprestlib/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/gitbrent/sprestlib/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/gitbrent/sprestlib/compare/v0.12.0...v1.0.0
[0.12.0]: https://github.com/gitbrent/sprestlib/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/gitbrent/sprestlib/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/gitbrent/sprestlib/compare/v0.9.0...v0.10.0
