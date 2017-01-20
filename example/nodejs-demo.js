/*
 * NAME: nodejs-demo.js
 * AUTH: Brent Ely (https://github.com/gitbrent/)
 * DATE: Jan 19, 2017
 * DESC: Demonstrate SpRestLib on Node.js
 * REQS: Node 4.x + `npm install sprestlib`
 * EXEC: `node nodejs-demo.js`
 */
console.log(`Starting demo...`);

// SETUP: Load sprestlib and show version to verify everything loaded correctly
// ============================================================================

var sprLib = require('../dist/sprestlib.js'); // for LOCAL TESTING
//var sprLib = require("sprestlib");
console.log(` * sprestlib version: ${sprLib.version()}`); // Loaded okay?

sprLib.baseUrl('https://gitbrent.sharepoint.com/sites/dev/');

// Node doesnt run in an authenticated webpage, so auth is needed...
// https://msdn.microsoft.com/en-us/library/dn762763#AccessTokens


// USER:
// ============================================================================
sprLib.user().info()
.then(function(objUser){ console.table(objUser) })
.catch(function(errStr){ console.error(errStr)  });

// ============================================================================
console.log(`done!`);
// ============================================================================
