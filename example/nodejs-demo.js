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

var httpntlm = require('httpntlm');
var credentials = {
	username: '****@****.onmicrosoft.com',
	password: '******',
	domain: '****'
};
var webUrl = "https://****.sharepoint.com";
var fileUrl = "/sites/dev/Shared Documents/AnimGif.pptx";

httpntlm.get({
    url: "https://****.sharepoint.com/sites/dev/_api/web/sitegroups",
    username: credentials.username,
    password: credentials.password,
    domain: credentials.domain
}, function (err, res) {
	if (err) console.log(err);
	console.log(res.body); //print data
});





// USER:
// ============================================================================
sprLib.user().info()
.then(function(objUser){ console.table(objUser) })
.catch(function(errStr){ console.error(errStr)  });

// ============================================================================
console.log(`done!`);
// ============================================================================
