/*
 * NAME: nodejs-demo.js
 * AUTH: Brent Ely (https://github.com/gitbrent/)
 * DATE: May 10, 2017
 * DESC: Demonstrate SpRestLib on Node.js
 * REQS: Node 4.x + `npm install sprestlib`
 * EXEC: `node nodejs-demo.js`
 * REFS: HOWTO: Authenticate to SharePoint Online (*.sharepoint.com)
 * - https://allthatjs.com/2012/03/28/remote-authentication-in-sharepoint-online/
 * - http://paulryan.com.au/2014/spo-remote-authentication-rest/
 * - https://github.com/s-KaiNet/node-spoauth
 */
console.log(`Starting demo...`);

// SETUP: Load sprestlib and show version to verify everything loaded correctly
// ============================================================================
var https = require('https'); // this Library is the basis for the remote auth solution
var sprLib = require('../dist/sprestlib.js'); // for LOCAL TESTING
//var sprLib = require("sprestlib");
console.log(` * sprestlib version: ${sprLib.version()}\n`); // Loaded okay?

// TODO: here for testing SpRestLib calls at the end
//sprLib.baseUrl('https://MYNAME.sharepoint.com/sites/dev/');


// Office365 SETUP
var O365_BASE = "MYNAME"; // TODO:
var O365_PASS = "MYPASS"; // TODO:
var O365_HOST = "https://"+O365_BASE+".sharepoint.com/";
var O365_USER = "admin@"+O365_BASE+".onmicrosoft.com";
var gBinarySecurityToken = "";
var gAuthCookie1 = "";
var gAuthCookie2 = "";

Promise.resolve()
.then(function(){
	// STEP 1: Login to MS with user/pass and get SecurityToken
	return new Promise(function(resolve,reject) {
		var xmlRequest = '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\n'
			+ '  <s:Header>'
			+ '    <a:Action s:mustUnderstand="1">http://schemas.xmlsoap.org/ws/2005/02/trust/RST/Issue</a:Action>'
			+ '    <a:ReplyTo><a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address></a:ReplyTo>'
			+ '    <a:To s:mustUnderstand="1">https://login.microsoftonline.com/extSTS.srf</a:To>'
			+ '    <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">'
			+ '      <o:UsernameToken>'
			+ '        <o:Username>'+ O365_USER +'</o:Username>'
			+ '        <o:Password>'+ O365_PASS +'</o:Password>'
			+ '      </o:UsernameToken>'
			+ '    </o:Security>'
			+ '  </s:Header>'
			+ '  <s:Body>'
			+ '    <t:RequestSecurityToken xmlns:t="http://schemas.xmlsoap.org/ws/2005/02/trust">'
			+ '      <wsp:AppliesTo xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy">'
			+ '        <a:EndpointReference><a:Address>'+ O365_HOST +'</a:Address></a:EndpointReference>'
			+ '      </wsp:AppliesTo>'
			+ '      <t:KeyType>http://schemas.xmlsoap.org/ws/2005/05/identity/NoProofKey</t:KeyType>'
			+ '      <t:RequestType>http://schemas.xmlsoap.org/ws/2005/02/trust/Issue</t:RequestType>'
			+ '      <t:TokenType>urn:oasis:names:tc:SAML:1.0:assertion</t:TokenType>'
			+ '    </t:RequestSecurityToken>'
			+ '  </s:Body>'
			+ '</s:Envelope>';
		var options = {
			hostname: 'login.microsoftonline.com',
			path    : "/extSTS.srf",
			method  : 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': xmlRequest.length
			}
		};

		var request = https.request(options, (res) => {
			let rawData = '';
			res.setEncoding('utf8');
			res.on('data', (chunk) => rawData += chunk);
			res.on('end', () => {
				var DOMParser = require('xmldom').DOMParser;
				var doc = new DOMParser().parseFromString(rawData, "text/xml");
				// KEY 1: Get SecurityToken
				gBinarySecurityToken = doc.documentElement.getElementsByTagName('wsse:BinarySecurityToken').item(0).firstChild.nodeValue;
				resolve();
			});
		});
		request.on('error', (e) => {
			console.log(`problem with request: ${e.message}`);
			reject();
		});
		request.write(xmlRequest);
		request.end();
	});
})
.then(function(){
	// STEP 2: Provide SecurityToken to SP site and get 2 Auth Cookies
	return new Promise(function(resolve,reject) {
		var options = {
			hostname: O365_BASE+'.sharepoint.com',
			agent: false,
			path: "/_forms/default.aspx?wa=wsignin1.0",
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': gBinarySecurityToken.length,
				'Host': O365_BASE+'.sharepoint.com'
			}
		};

		// IMPORTANT: SharePoint online will only return the 2 auth cookies with https queries (it will respond to http, but not include cookies!)
		var request = https.request(options, (response) => {
			// KEY 2: Get 2 auth cookie values
			gAuthCookie1 = response.headers['set-cookie'][0].substring(0,response.headers['set-cookie'][0].indexOf(';'));
			gAuthCookie2 = response.headers['set-cookie'][1].substring(0,response.headers['set-cookie'][1].indexOf(';'));
			resolve();
		});
		request.on('error', (e) => {
			console.log(`problem with request: ${e.message}`);
			reject(e);
		});
		request.write(gBinarySecurityToken);
		request.end();
	});
})
.then(function(data){
	// STEP 3: Send requests including authentication cookies
	// EX: `Cookie: FedAuth=77u/PD....LzwvU1A+; rtFA=0U1zw+TnL......AAAA==`
	return new Promise(function(resolve,reject) {
		console.log('BAM!!! We authenticated into SharePoint Online!\n');
		console.log(`gAuthCookie1:\n${gAuthCookie1}\n`);
		console.log(`gAuthCookie2:\n${gAuthCookie2}\n`);

		// TEST: Using Node.js `https` package (works great!!!)
		var options = {
			host: O365_BASE+'.sharepoint.com',
			path: "/sites/dev/_api/web/lists/getbytitle('Employees')?$select=Fields&$expand=Fields",
			method: 'GET',
			headers: {
				"Accept": "application/json;odata=verbose",
				"Cookie": gAuthCookie1+' ;'+gAuthCookie2,
			}
		};
		var request = https.request(options, (res) => {
			let rawData = '';
			res.setEncoding('utf8');
			res.on('data', (chunk) => rawData += chunk);
			res.on('end', () => {
				console.log('TEST: using `https` results:\n');
				console.log('============================\n');
				console.log( rawData.substring(0,100)+'...' );
			});
		});
		request.end();


		// TEST BELOW: ----------------------------- doesnt work! ("unauthorized" from SP)
		// CAUSE: jQuery $.ajax() wont send the cookies!!! It works great when using `https.request` calls!!!!!!
		/*
		sprLib.list('Employees').cols()
		.then(function(data){
			console.log('DONE!');
			console.log(data);
			resolve();
		})
		.catch(function(jqXHR,textStatus,errorThrown){
			console.log('.....nodejs test FAIL:');
			reject({ 'jqXHR':jqXHR, 'textStatus':textStatus, 'errorThrown':errorThrown });
		});
		*/
	});
})
.catch(function(strErr){
	console.error('\n!!! ERROR !!!');
	console.error(strErr);
	return;
});







/*
// USER:
// ============================================================================
sprLib.user().info()
.then(function(objUser){ console.table(objUser) })
.catch(function(errStr){ console.error(errStr)  });
*/

// ============================================================================
console.log(`done!`);
// ============================================================================
