/*\
|*|  :: SpRestLib.js ::
|*|
|*|  JavaScript Library for SharePoint Web Serices
|*|  https://github.com/gitbrent/SpRestLib
|*|
|*|  This library is released under the MIT Public License (MIT)
|*|
|*|  SpRestLib (C) 2016-present Brent Ely (https://github.com/gitbrent)
|*|
|*|  Permission is hereby granted, free of charge, to any person obtaining a copy
|*|  of this software and associated documentation files (the "Software"), to deal
|*|  in the Software without restriction, including without limitation the rights
|*|  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
|*|  copies of the Software, and to permit persons to whom the Software is
|*|  furnished to do so, subject to the following conditions:
|*|
|*|  The above copyright notice and this permission notice shall be included in all
|*|  copies or substantial portions of the Software.
|*|
|*|  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
|*|  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
|*|  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
|*|  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
|*|  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
|*|  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
|*|  SOFTWARE.
\*/

(function(){
	// APP VERSION/BUILD
	var APP_VER = "1.8.0-beta";
	var APP_BLD = "20180815";
	var DEBUG = false; // (verbose mode/lots of logging)
	// ENUMERATIONS
	// REF: [`SP.BaseType`](https://msdn.microsoft.com/en-us/library/office/jj246925.aspx)
	var ENUM_BASETYPES = {
		"0": "List",
		"1": "Library",
		"3": "Discussion Board",
		"4": "Survey",
		"5": "Issue"
	};
	// REF: [`SP.Utilities.PrincipalType`](https://msdn.microsoft.com/en-us/library/ee553710(v=office.14).aspx)
	var ENUM_PRINCIPALTYPES = {
		"0" : "None",
		"1" : "User",
		"2" : "Distribution List",
		"4" : "Security Group",
		"8" : "SharePoint Group",
		"15": "All"
	};
	// APP FUNCTIONALITY
	var APP_FILTEROPS = {
		"eq" : "==",
		"ne" : "!=",
		"gt" : ">",
		"gte": ">=",
		"lt" : "<",
		"lte": "<="
	};
	// APP OPTIONS
	var APP_OPTS = {
		baseUrl:         '..',
		busySpinnerHtml: '<div class="sprlib-spinner"><div class="sprlib-bounce1"></div><div class="sprlib-bounce2"></div><div class="sprlib-bounce3"></div></div>',
		cache:           false,
		cleanColHtml:    true,
		currencyChar:    '$',
		language:        'en',
		maxRetries:      2,
		maxRows:         5000,
		metadata:        false,
		isNodeEnabled:   false,
		nodeCookie:      '',
		nodeServer:      '',
		retryAfter:      1000
	};
	// LIBRARY DEPS
	var https = null;
	// GLOBAL VARS
	var gRegexGUID = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
	var gRetryCounter = 0;

	/* ===============================================================================================
	|
	#     #
	#     #  ######  #       #####   ######  #####    ####
	#     #  #       #       #    #  #       #    #  #
	#######  #####   #       #    #  #####   #    #   ####
	#     #  #       #       #####   #       #####        #
	#     #  #       #       #       #       #   #   #    #
	#     #  ######  ######  #       ######  #    #   ####
	|
	==================================================================================================
	*/

	/**
	* Parse XHR Response Headers for SharePoint codes/error messages and return them as a string.
	*
	* @return {string} "(404) List not found."
	*/
	function parseErrorMessage(jqXHR) {
		// STEP 1:
		jqXHR = jqXHR || {};

		// STEP 2:
		var strErrText = "("+ jqXHR.status +") "+ jqXHR.responseText;
		var strSpeCode = "";

		// STPE 3: Parse out SharePoint/IIS error code and message
		try {
			strSpeCode = JSON.parse(jqXHR.responseText).error['code'].split(',')[0];
			strErrText = "(" + jqXHR.status + ") " + JSON.parse(jqXHR.responseText).error['message'].value;
		}
		catch (ex) {
			if (DEBUG) { console.warn('Unable to parse jqXHR response:\n' + jqXHR.responseText); }
		}

		// Done!
		return strErrText;
	}

	/**
	* Query SharePoint for a current `__REQUESTDIGEST`/contextinfo token used in `X-RequestDigest` headers
	* Sets the form value for `__REQUESTDIGEST` if it exists
	*
	* @return {string} "0x1925741C8C2A5DA6BA9338[...C8ED,18 Apr 2018 03:19:26 -0000"
	*/
	function doRenewDigestToken() {
		return new Promise(function(resolve,reject) {
			/* OLD:
			// Use SP.js UpdateFormDigest function if available
			// @see http://www.wictorwilen.se/sharepoint-2013-how-to-refresh-the-request-digest-value-in-javascript
			// UpdateFormDigest() is syncronous per this SharePoint MVP, so just run and return
			// DEFAULT: UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, _spFormDigestRefreshInterval);
			// Use a very short refresh interval to force token renewal (otherwise, unless it's been 30 min or whatever, no new token will be provided by SP)
			UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, 10);
			resolve();
			*/
			sprLib.rest({ url:'_api/contextinfo', type:'POST' })
			.then(function(arrData){
				var strToken = (arrData && arrData[0] && arrData[0].GetContextWebInformation && arrData[0].GetContextWebInformation.FormDigestValue ? arrData[0].GetContextWebInformation.FormDigestValue : null);

				// A: Update the page token if it exists
				if ( typeof document !== 'undefined' && document.getElementById('__REQUESTDIGEST') ) {
					document.getElementById('__REQUESTDIGEST').value = strToken;
				}

				// B: Return the digest value
				resolve( strToken );
			})
			.catch(function(strErr){
				reject( strErr );
			});
		});
	}

	/* ===============================================================================================
	|
	######                                             #     ######   ###
	#     #  #    #  #####   #       #   ####         # #    #     #   #
	#     #  #    #  #    #  #       #  #    #       #   #   #     #   #
	######   #    #  #####   #       #  #           #     #  ######    #
	#        #    #  #    #  #       #  #           #######  #         #
	#        #    #  #    #  #       #  #    #      #     #  #         #
	#         ####   #####   ######  #   ####       #     #  #        ###
	|
	==================================================================================================
	*/

	this.sprLib = {};
	sprLib.version = APP_VER+'-'+APP_BLD;

	// API: OPTIONS
	/**
	* Getter/Setter for the app option APP_OPTS.baseUrl (our _api call base)
	*
	* @param {string} `inStr` - URL to use as the root of API calls
	* @example - set baseUrl - `sprLib.baseUrl('/sites/devtest');`
	* @example - get baseUrl - `sprLib.baseUrl();`
	* @return {string} Return value of APP_OPTS.baseUrl
	*/
	sprLib.baseUrl = function baseUrl(inStr) {
		// CASE 1: Act as a GETTER when no value passed
		if ( typeof inStr !== 'string' || inStr == '' || !inStr ) return APP_OPTS.baseUrl;

		// CASE 2: Act as a SETTER
		APP_OPTS.baseUrl = inStr.replace(/\/+$/,'');
		if (DEBUG) console.log('APP_OPTS.baseUrl = '+APP_OPTS.baseUrl);
	}

	// API: FILE
	/**
	* SharePoint Library File Resource methods
	* "Represents a file in a SharePoint Web site that can be a Web Part Page, an item in a document library, or a file in a folder."
	*
	* @param `inOpt` (object)/(string) - required - (`name` prop reqd)
	* @example - `sprLib.file('/sites/dev/Shared%20Documents/SomeFolder/MyDoc.docx');`
	* @example - `sprLib.file({ 'name':'/sites/dev/Shared%20Documents/SomeFolder/MyDoc.docx' });`
	* @example - `sprLib.file({ 'name':'/MyDocuments/MyDoc.docx', 'requestDigest':'ABC1234567890' });`
	* @since 1.8.0
	* @see: [File API](https://gitbrent.github.io/SpRestLib/docs/api-file.html)
	* @see: [Files and folders REST API reference](https://msdn.microsoft.com/en-us/library/office/dn450841.aspx)
	*/
	sprLib.file = function file(inOpt) {
		// A: Options setup
		inOpt = inOpt || {};
		var _newFile = {};
		var _fullName = "", _fldName = "", _dirName = "";
		var _requestDigest = (inOpt.requestDigest || (typeof document !== 'undefined' && document.getElementById('__REQUESTDIGEST') ? document.getElementById('__REQUESTDIGEST').value : null));

		// TODO: 20180701: need to honor `_baseUrl`
		// TODO: include `baseUrl` param? OR do we parse URL from file and use that? (e.g.: `filePath` is the baseUrl)
		// EX: sprLib.file({ 'name':'Shared%20Documents/SomeFolder/MyDoc.docx' });
		// We dont want to require a full path, right?
		// Use `getfilebyserverrelativeurl()`?? @see: https://msdn.microsoft.com/en-us/library/office/dn450841.aspx#bk_FileRequestExamples

		// B: Param check
		if ( inOpt && typeof inOpt === 'string' ) {
			_fullName = encodeURI(inOpt);
		}
		else if ( inOpt && typeof inOpt === 'object' && inOpt.hasOwnProperty('name') ) {
			_fullName = encodeURI(inOpt.name);
		}
		else {
			console.error("ERROR: A 'fileName' is required! EX: `sprLib.file('Documents/Sample.docx')` or `sprLib.file({ 'name':'Documents/Sample.docx' })`");
			console.error('ARGS:');
			console.error(inOpt);
			return null;
		}

		// C: Ensure `_fullName` does not end with a slash ("/")
		_fullName = _fullName.replace(/\/$/gi,'');
		//_pathName = _fullName.substring(0, _fullName.lastIndexOf('/'));
		_fileName = _fullName.substring(_fullName.lastIndexOf('/')+1);

		// D: Ensure a full path
		// Allow relative names for web users
		if ( _fullName.indexOf('/') != 0 && _spPageContextInfo && _spPageContextInfo.webServerRelativeUrl ) {
			_fullName = _spPageContextInfo.webServerRelativeUrl + _fullName;
		}

		// Add Public Methods
		// .checkin/checkout -- @see: https://msdn.microsoft.com/en-us/library/office/dn450841.aspx#bk_FileCheckOut
		// https://msdn.microsoft.com/en-us/library/office/dn450841.aspx#bk_FileCheckIn
		// .delete() // headers: { "X-HTTP-Method":"DELETE" },
		// .recycle()
		// .get() (?) // _api/web/GetFolderByServerRelativeUrl('')/Files/get(url='')
		// @see: https://msdn.microsoft.com/en-us/library/office/dn450841.aspx#bk_FileCollection
		// "The GetFileByServerRelativeUrl endpoint is recommended way to get a file. See SP.File request examples."

		/**
		* Get a File (binary or text)
		*
		* @returns: a File as a Blob
		* @see: https://msdn.microsoft.com/en-us/library/office/dn450841.aspx#bk_FileRequestExamples
		*/
		_newFile.get = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: "_api/web/GetFileByServerRelativeUrl('"+ _fullName +"')/$value",
					headers: {'binaryStringResponseBody':true}
				})
				.then(function(data){
					if ( typeof Blob !== 'undefined' ) {
						// Web browser: Return blob from ArrayBuffer
						resolve( new Blob([data], {type:"application/octet-stream"}) );
					}
					else {
						// TODO: FIXME: only text files work with this buffer setup - binary files are corrupted
						// @see: https://stackoverflow.com/questions/17836438/getting-binary-content-in-node-js-with-http-request
						// @see: https://stackoverflow.com/questions/14653349/node-js-can%C2%B4t-create-blobs
						// @see: https://nodejs.org/api/buffer.html#buffer_class_method_buffer_from_buffer

						// Nodejs: Return ArrayBuffer
						//resolve( Uint8Array.from(Buffer.from(data)).buffer );

						//console.log( Buffer.from(data,'utf8').length );
						//console.log( Buffer.from(data,'base64').length );
						//console.log(data);
						//console.log( data.toString('utf8') );
						/*
						console.log( Buffer.from(data,'ascii').length );
						console.log( Buffer.from(data,'binary').byteLength );
						console.log( Buffer.from(data,'utf16le').length );
						console.log( Buffer.from(data).byteLength );
						*/

						//console.log( Uint8Array.from(Buffer.from(data,'binary')).length );
						//console.log( Buffer.from(Uint8Array.from(data)).length );
						//console.log( Buffer.from(data,'hex').length );
						//resolve( Buffer.from(data,'binary') ); // works for text
						//resolve( Buffer.from(data) );
						//resolve( Buffer.from(data,'binary') ); // works for text
						//resolve( Buffer.from(data) ); // works for text

						// NOTE: FIXME: Below used for 1.8.0
						resolve( Buffer.from(data,'binary') ); // works for text
					}
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get information about a File
		* Optionally include a version tag to get info about a certain file version
		*
		* @param `inOpt` (object) - (`version` prop optional)
		* @returns: an object containing information about the current File
		* @example: sprLib.file('/site/Documents/MyDoc.docx').info()
		* @example: sprLib.file('/site/Documents/MyDoc.docx').info({ version:12 })
		*/
		_newFile.info = function(inOpt) {
			return new Promise(function(resolve, reject) {
				var objData = {};

				// A: Check opts
				if ( inOpt && inOpt.hasOwnProperty('version') && isNaN(Number(inOpt.version)) ) {
					console.error("ERROR: 'version' should be a number! EX: `sprLib.file('Sample.docx').info({ version:12 })`");
					console.error("ARGS:");
					console.error(inOpt);
					return null;
				}

				// B: Get file info
				sprLib.rest({
					url: "_api/web/GetFileByServerRelativeUrl('"+ _fullName +"')",
					queryCols: ['Author/Id','CheckedOutByUser/Id','LockedByUser/Id','ModifiedBy/Id',
						'CheckInComment','CheckOutType','ETag','Exists','Length','Level','MajorVersion','MinorVersion',
						'Name','ServerRelativeUrl','TimeCreated','TimeLastModified','UniqueId','UIVersionLabel'],
					metadata: false
				})
				.then(function(arrData){
					// A: Capture info
					objData = ( arrData && arrData.length > 0 ? arrData[0] : {} ); // FYI: Empty object is correct return type when file-not-found

					// B: Remove junk
					['Author', 'CheckedOutByUser', 'LockedByUser', 'ModifiedBy'].forEach(function(field){
						if ( objData[field] && objData[field].__deferred ) delete objData[field].__deferred;
						if ( objData[field] && objData[field].__metadata ) delete objData[field].__metadata;
					});

					// C: Handle version option
					if ( inOpt && inOpt.version ) {
						return sprLib.rest({
							url: "_api/web/GetFileByServerRelativeUrl('"+ _fullName +"')/versions("+ (Number(inOpt.version)*512) +")",
							queryCols: ['CheckInComment','Created','IsCurrentVersion','Length','VersionLabel'],
							metadata: false
						})
						.catch(function(strErr){
							throw strErr;
						})
					}
					else {
						return null;
					}
				})
				.then(function(arrVersion){
					if ( arrVersion && arrVersion[0] ) {
						// Gather version metadata
						Object.keys(arrVersion[0]).forEach(function(key){
							if ( key != 'VersionLabel' ) objData[key] = arrVersion[0][key];
						});

						// Update version metdata from first query
						objData.MajorVersion = arrVersion[0].VersionLabel.split('.')[0];
						objData.MinorVersion = arrVersion[0].VersionLabel.split('.')[1];
						objData.UIVersionLabel = arrVersion[0].VersionLabel;
					}

					// Done
					resolve( objData );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get File permissions
		*
		* @returns: array of objects with `Member` and `Roles` properties
		* @example: sprLib.file('/site/Documents/MyDoc.docx').perms().then( arr => console.log(arr) );
		* .--------------------------------------------------------------------------------------------------------------------------------------------------------------------------.
		* |                                        Member                                         |                                      Roles                                       |
		* |---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
		* | {"Title":"Dev Site Members","PrincipalType":"SharePoint Group","PrincipalId":8}       | [{"Hidden":false,"Name":"Design"},{"Hidden":false,"Name":"Edit"}]                |
		* | {"Title":"Dev Site Owners","PrincipalType":"SharePoint Group","PrincipalId":6}        | [{"Hidden":false,"Name":"Full Control"},{"Hidden":true,"Name":"Limited Access"}] |
		* | {"Title":"Dev Site Visitors","PrincipalType":"SharePoint Group","PrincipalId":7}      | [{"Hidden":false,"Name":"Read"}]                                                 |
		* | {"Title":"Excel Services Viewers","PrincipalType":"SharePoint Group","PrincipalId":5} | [{"Hidden":false,"Name":"View Only"}]                                            |
		* '--------------------------------------------------------------------------------------------------------------------------------------------------------------------------'
		*/
		_newFile.perms = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: "_api/web/GetFileByServerRelativeUrl('"+ _fullName +"')/ListItemAllFields/RoleAssignments",
					queryCols: ['PrincipalId','Member/PrincipalType','Member/Title','RoleDefinitionBindings/Name','RoleDefinitionBindings/Hidden']
				})
				.then(function(arrData){
					// STEP 1: Transform: Results s/b 2 keys with props inside each
					arrData.forEach(function(objItem,idx){
						// A: "Rename" the `RoleDefinitionBindings` key to be user-friendly
						Object.defineProperty(objItem, 'Roles', Object.getOwnPropertyDescriptor(objItem, 'RoleDefinitionBindings'));
						delete objItem.RoleDefinitionBindings;

						// B: Move `PrincipalId` inside {Member}
						objItem.Member.PrincipalId = objItem.PrincipalId;
						delete objItem.PrincipalId;

						// C: Decode PrincipalType into text
						objItem.Member.PrincipalType = ENUM_PRINCIPALTYPES[objItem.Member.PrincipalType] || objItem.Member.PrincipalType;
					});

					// STEP 2: Resolve results (NOTE: empty array is the correct default result)
					resolve( arrData || [] );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		// WIP BELOW:

		// TODO: WIP: .upload({ data:arrayBuffer/FilePicker/whatev, overwrite:BOOL })
		/**
		* @see: https://msdn.microsoft.com/en-us/library/office/dn450841.aspx#bk_FileCollectionAdd
		*/
		//_newFile.upload = function() {
		//	return new Promise(function(resolve, reject) {
				// CASE 1: NODE.JS
				/*
				// TODO: _fullName -> split for vars below!
				var strFilePath = "/sites/dev/Shared%20Documents/upload";
				var strFileName = "sprestlib-demo.html";
				//var _dirName = _fullName.substring(0, _fullName.lastIndexOf('/'));
				//var _fldName = _fullName.substring(_fullName.lastIndexOf('/')+1);
				var strUrl = "_api/web/GetFolderByServerRelativeUrl('"+strFilePath+"')/Files/add(url='"+strFileName+"',overwrite=true)";
				// IMPORTANT: path must be escaped or "TypeError: Request path contains unescaped characters"

				sprLib.rest({
					url: strUrl,
					type: "POST",
					requestDigest: gStrReqDig,
					data: new Buffer( fs.readFileSync('./'+strFileName, 'utf8') )
				});
				.then((arrResults) => {
					console.log('SUCCESS: "'+ arrResults[0].Name +'" uploaded to: '+ arrResults[0].ServerRelativeUrl );
				});
				*/

				// CASE 2: CLIENT BROWSER: ask for a FilePicker or array buffer
				/*
				else if ( !$('#filePicker') || !$('#filePicker')[0] || !$('#filePicker')[0].value ) {
					alert("Please select a file with the File Picker!");
					return;
				}

				// STEP 2: Status update
				$('#console').append('Starting file upload... <br>');

				// STEP 3: Get the local file as an array buffer
				var reader = new FileReader();
				reader.readAsArrayBuffer( $('#filePicker')[0].files[0] );
				reader.onloadend = function(e){
					var parts = $('#filePicker')[0].value.split('\\');
					var fileName = parts[parts.length - 1];
					var strAjaxUrl = _spPageContextInfo.siteAbsoluteUrl
						+ "/_api/web/lists/getByTitle('"+ $('#selDestLib').val() +"')"
						+ "/RootFolder/files/add(overwrite=true,url='"+ fileName +"')";

					sprLib.rest({
						url: strAjaxUrl,
						type: "POST",
						data: e.target.result
					})
					.then(function(arr){
						$('#console').append('SUCCESS: "'+ arr[0].Name +'" uploaded to: '+ arr[0].ServerRelativeUrl +'<br>');
					})

				*/
		//	});
		//};

		// LAST: Return this new File
		return _newFile;
	}

	// API: FOLDER
	/**
	* @param `inOpt` (object)/(string) - required - (`name` prop reqd)
	* @example - `sprLib.folder('/sites/dev/SiteAssets/');`
	* @example - `sprLib.folder({ 'name':'/sites/dev/SiteAssets/' });`
	* @since 1.8.0
	* @see: [File API](https://gitbrent.github.io/SpRestLib/docs/api-folder.html)
	* @see: [Files and folders REST API reference](https://msdn.microsoft.com/en-us/library/office/dn450841.aspx#bk_Folder)
	*/
	sprLib.folder = function folder(inOpt) {
		// A: Options setup
		inOpt = inOpt || {};
		var _newFolder = {};
		var _fullName = "";

		// B: Options check/set
		if ( inOpt && typeof inOpt === 'string' ) {
			_fullName = encodeURI(inOpt);
		}
		else if ( inOpt && typeof inOpt === 'object' && inOpt.hasOwnProperty('name') ) {
			_fullName = encodeURI(inOpt.name);
		}
		else {
			console.error("ERROR: A 'folderName' is required! EX: `sprLib.folder('Documents/Finance')` or `sprLib.folder({ 'name':'Documents/Finance' })`");
			console.error('ARGS:');
			console.error(inOpt);
			return null;
		}

		// C: Ensure `_fullName` does not end with a slash ("/")
		_fullName = _fullName.replace(/\/$/gi,'');

		// D: Public Methods ----------------------------------------------
		// .perms()
		// .create() // .add()?
		// .delete() // headers: { "X-HTTP-Method":"DELETE" },
		// .recycle() // POST to: /recycle
		//
		// a unique folder:
		// /sites/dev/_api/web/GetFolderByServerRelativeUrl('/sites/dev/SiteAssets/js')

		/**
		* Get information (properties) for a Folder
		*
		* @example: sprLib.folder('/site/Documents/Finance').info()
		* @returns: Object with Folder properties
		*/
		_newFolder.info = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: "_api/web/GetFolderByServerRelativeUrl('"+ _fullName +"')",
					queryCols: [
						'Name','ItemCount','ServerRelativeUrl','StorageMetrics/TotalSize',
						'Properties/vti_x005f_timecreated','Properties/vti_x005f_timelastmodified','Properties/vti_x005f_hassubdirs',
						'Properties/vti_x005f_isbrowsable','Properties/vti_x005f_foldersubfolderitemcount','Properties/vti_x005f_listname'
					],
					metadata: false
				})
				.then(function(arrData){
					// A: Capture info
					var objFolder = ( arrData && arrData.length > 0 ? arrData[0] : {} ); // FYI: Empty object is correct return type when file-not-found

					// B: Remap properties
					if ( objFolder.Properties ) {
						objFolder.Created     = ( objFolder.Properties.vti_x005f_timecreated ? objFolder.Properties.vti_x005f_timecreated : null );
						objFolder.FolderCount = ( objFolder.Properties.vti_x005f_foldersubfolderitemcount ? objFolder.Properties.vti_x005f_foldersubfolderitemcount : 0 );
						objFolder.ItemCount   = ( objFolder.ItemCount ? objFolder.ItemCount : 0 );
						objFolder.GUID        = ( objFolder.Properties.vti_x005f_listname ? objFolder.Properties.vti_x005f_listname : null );
						objFolder.HasSubdirs  = ( objFolder.Properties.vti_x005f_hassubdirs ? objFolder.Properties.vti_x005f_hassubdirs == "true" : false );
						objFolder.Hidden      = ( objFolder.Properties.vti_x005f_isbrowsable ? objFolder.Properties.vti_x005f_isbrowsable == "false" : false );
						objFolder.Level       = ( objFolder.Properties.vti_x005f_level ? objFolder.Properties.vti_x005f_level : 1 );
						objFolder.Modified    = ( objFolder.Properties.vti_x005f_timelastmodified ? objFolder.Properties.vti_x005f_timelastmodified : null );

						delete objFolder.Properties;
					}

					// C: Remap storage metrics
					if ( objFolder.StorageMetrics && objFolder.StorageMetrics.TotalSize ) {
						objFolder.TotalSize = Number(objFolder.StorageMetrics.TotalSize) || 0;

						delete objFolder.StorageMetrics;
					}

					// Done
					resolve( objFolder );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get Files and their properties
		*
		* @example - relative URL: `sprLib.folder('Shared Documents').files()`
		* @example - absolute URL: `sprLib.folder('/sites/dev/Shared Documents').files()`
		* @returns: Promise<Object[]> with Files and their properties
		*/
		_newFolder.files = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: "_api/web/GetFolderByServerRelativeUrl('"+ _fullName +"')/Files",
					queryCols: [
						'Author/Id','CheckedOutByUser/Id','LockedByUser/Id','ModifiedBy/Id',
						'Author/Title','CheckedOutByUser/Title','LockedByUser/Title','ModifiedBy/Title',
						'CheckInComment','CheckOutType','ETag','Exists','Length','Level','MajorVersion','MinorVersion',
						'Name','ServerRelativeUrl','TimeCreated','TimeLastModified','Title','UniqueId'
					],
					metadata: false
				})
				.then(function(arrData){
					// STEP 1: Transform results
					arrData.forEach(function(file){
						// A: Rename some cols
						file.Created  = file.TimeCreated;      delete file.TimeCreated;
						file.Modified = file.TimeLastModified; delete file.TimeLastModified;

						// B: Convert numbers
						if ( file.Length && !isNaN(Number(file.Length)) ) file.Length = Number(file.Length);

						// C: These 2 values come back as `[]` when there's no value, and that sucks, so fix them
						if ( file.CheckedOutByUser && Array.isArray(file.CheckedOutByUser) && file.CheckedOutByUser.length == 0 ) file.CheckedOutByUser = null;
						if ( file.LockedByUser && Array.isArray(file.LockedByUser) && file.LockedByUser.length == 0 ) file.LockedByUser = null;
					})

					// STEP 2: Resolve results (NOTE: empty array is the correct default result)
					resolve( arrData || [] );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get Folders and their properties
		*
		* @example - relative URL: `sprLib.folder('Shared Documents').folders()`
		* @example - absolute URL: `sprLib.folder('/sites/dev/Shared Documents').folders()`
		* @returns: Promise<Object[]> with Folders and their properties
		*/
		_newFolder.folders = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: "_api/web/GetFolderByServerRelativeUrl('"+ _fullName +"')/Folders",
					queryCols: [
						'Name','ItemCount','ServerRelativeUrl',
						'Properties/vti_x005f_timecreated','Properties/vti_x005f_timelastmodified','Properties/vti_x005f_hassubdirs',
						'Properties/vti_x005f_isbrowsable','Properties/vti_x005f_foldersubfolderitemcount','Properties/vti_x005f_listname'
					],
					metadata: false
				})
				.then(function(arrData){
					// STEP 1: Transform results
					arrData.forEach(function(objFolder){
						// A: Remap properties
						if ( objFolder.Properties ) {
							objFolder.Created     = ( objFolder.Properties.vti_x005f_timecreated ? objFolder.Properties.vti_x005f_timecreated : null );
							objFolder.FolderCount = ( objFolder.Properties.vti_x005f_foldersubfolderitemcount ? objFolder.Properties.vti_x005f_foldersubfolderitemcount : 0 );
							objFolder.ItemCount   = ( objFolder.ItemCount ? objFolder.ItemCount : 0 );
							objFolder.GUID        = ( objFolder.Properties.vti_x005f_listname ? objFolder.Properties.vti_x005f_listname : null );
							objFolder.HasSubdirs  = ( objFolder.Properties.vti_x005f_hassubdirs ? objFolder.Properties.vti_x005f_hassubdirs == "true" : false );
							objFolder.Hidden      = ( objFolder.Properties.vti_x005f_isbrowsable ? objFolder.Properties.vti_x005f_isbrowsable == "false" : false );
							objFolder.Level       = ( objFolder.Properties.vti_x005f_level ? objFolder.Properties.vti_x005f_level : 1 );
							objFolder.Modified    = ( objFolder.Properties.vti_x005f_timelastmodified ? objFolder.Properties.vti_x005f_timelastmodified : null );

							delete folder.Properties;
						}
					});

					// STEP 2: Resolve results (NOTE: empty array is the correct default result)
					resolve( arrData || [] );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		// LAST: Return this new Folder
		return _newFolder;
	}

	// API: LIST (CRUD, select, recycle)
	/**
	* @param `inOpt` (string) - required - ListName or ListGUID
	* @example - string - sprLib.list('Documents');
	*
	* @param `inOpt` (object) - required - { `name`, [`baseUrl`] }
	* @example - string - sprLib.list({ name:'23846527-228a-41a2-b5c1-7b55b6fea1a3' });
	* @example - string - sprLib.list({ guid:'23846527-228a-41a2-b5c1-7b55b6fea1a3' });
	* @example - string - sprLib.list({ name:'Documents' });
	* @example - string - sprLib.list({ name:'Documents', baseUrl:'/sites/dev/sandbox' });
	* @example - string - sprLib.list({ name:'Documents', baseUrl:'/sites/dev/sandbox', requestDigest:'8675309,05 Dec 2017 01:23:45 -0000' });
	* @since 1.0.0
	*/
	sprLib.list = function list(inOpt) {
		// A: Options setup
		inOpt = inOpt || {};
		var _newList = {};
		var _urlBase = "_api/lists";
		var _requestDigest = (inOpt.requestDigest || (typeof document !== 'undefined' && document.getElementById('__REQUESTDIGEST') ? document.getElementById('__REQUESTDIGEST').value : null));
		if ( inOpt.guid ) inOpt.name = inOpt.guid; // Allow `guid` as a synonym for `name` per user request

		// B: Param check
		if ( inOpt && typeof inOpt === 'string' ) {
			// DESIGN: Accept either [ListName] or [ListGUID]
			_urlBase += ( gRegexGUID.test(inOpt) ? "(guid'"+ inOpt +"')" : "/getbytitle('"+ inOpt.replace(/\s/gi,'%20') +"')" );
		}
		else if ( inOpt && typeof inOpt === 'object' && inOpt.hasOwnProperty('name') ) {
			_urlBase = (inOpt.baseUrl ? inOpt.baseUrl.replace(/\/+$/,'')+'/_api/lists' : _urlBase);
			_urlBase += ( gRegexGUID.test(inOpt.name) ? "(guid'"+ inOpt.name +"')" : "/getbytitle('"+ inOpt.name.replace(/\s/gi,'%20') +"')" );
		}
		else {
			console.error("ERROR: A 'listName' or 'listGUID' is required! EX: `sprLib.list('Employees')` or `sprLib.list({ 'name':'Employees' })`");
			console.error('ARGS:');
			console.error(inOpt);
			return null;
		}

		/**
		* Used after `.create()` if no {type} was provided (enables ontinued use of the object in subsequent operations)
		* Used internally when users send CRUD methods objects without a `__metadata.type` value
		*/
		function getListItemType() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: _urlBase+"?$select=ListItemEntityTypeFullName"
				})
				.then(function(result){
					if (result && Array.isArray(result) && result.length == 1) resolve( {"type":result[0].ListItemEntityTypeFullName } );
					else reject('Invalid result!');
				})
				.catch(function(err){
					reject(err);
				});
			});
		}

		// STEP 1: Add public methods

		/**
		* Return array of column objects with info about each (title, REST/internal name, type, etc.)
		*
		* @example: sprLib.list('Employees').cols().then(function(cols){ console.table(cols) });
		*/
		_newList.cols = function() {
			// FieldTypeKind enumeration:
			// https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.client.fieldtype.aspx
			// https://msdn.microsoft.com/en-us/library/office/jj245826.aspx#properties
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: _urlBase+"?$select=Fields&$expand=Fields",
					metadata: false
				})
				.then(function(arrData){
					var arrColumns = [];

					// STEP 1: Gather fields
					( arrData && arrData[0] && arrData[0].Fields && arrData[0].Fields.results ? arrData[0].Fields.results : [] )
					.forEach(function(result,i){
						// Filter: No Edit/Icon or internal cols (eg: '_ComplianceFlags')
						if ( !result.Hidden && result.InternalName != 'Edit' && result.InternalName != 'DocIcon' && result.InternalName.indexOf('_') != 0 ) {
							arrColumns.push({
								dispName:     result.Title,
								dataName:     result.InternalName,
								dataType:     result.TypeAsString,
								isAppend:     ( result.AppendOnly || false ),
								isNumPct:     ( result.SchemaXml.toLowerCase().indexOf('percentage="true"') > -1 ),
								isReadOnly:   result.ReadOnlyField,
								isRequired:   result.Required,
								isUnique:     result.EnforceUniqueValues,
								defaultValue: ( result.DefaultValue || null ),
								maxLength:    ( result.MaxLength || null )
							});
						}
					});

					// STEP 2: Resolve Promise
					resolve( arrColumns );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Return an object containing information about the current List/Library
		*
		* @example: sprLib.list('Employees').info().then( objInfo => console.table(objInfo) );
		*/
		_newList.info = function() {
			return new Promise(function(resolve, reject) {
				var strFields = 'Id,AllowContentTypes,BaseTemplate,BaseType,Created,Description,DraftVersionVisibility,'
					+ 'EnableAttachments,EnableFolderCreation,EnableVersioning,ForceCheckout,HasUniqueRoleAssignments,Hidden,ItemCount,'
					+ 'LastItemDeletedDate,LastItemModifiedDate,LastItemUserModifiedDate,ListItemEntityTypeFullName,Title';

				sprLib.rest({
					url: _urlBase+"?$select="+strFields,
					metadata: false
				})
				.then(function(arrData){
					resolve( (arrData && arrData.length > 0 ? arrData[0] : []) );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get List permissions
		* Returns array of objects with `Member` and `Roles` properties
		*
		* @example - sprLib.list('Employees').perms().then( arr => console.log(arr) );
		* //.--------------------------------------------------------------------------------------------------------------------------------------------------------------------------.
		* //|                                        Member                                         |                                      Roles                                       |
		* //|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
		* //| {"Title":"Dev Site Members","PrincipalType":"SharePoint Group","PrincipalId":8}       | [{"Hidden":false,"Name":"Design"},{"Hidden":false,"Name":"Edit"}]                |
		* //| {"Title":"Dev Site Owners","PrincipalType":"SharePoint Group","PrincipalId":6}        | [{"Hidden":false,"Name":"Full Control"},{"Hidden":true,"Name":"Limited Access"}] |
		* //| {"Title":"Dev Site Visitors","PrincipalType":"SharePoint Group","PrincipalId":7}      | [{"Hidden":false,"Name":"Read"}]                                                 |
		* //| {"Title":"Excel Services Viewers","PrincipalType":"SharePoint Group","PrincipalId":5} | [{"Hidden":false,"Name":"View Only"}]                                            |
		* //'--------------------------------------------------------------------------------------------------------------------------------------------------------------------------'
		*/
		_newList.perms = function(inOpt) {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: _urlBase+'/RoleAssignments?$select=',
					queryCols: ['PrincipalId','Member/PrincipalType','Member/Title','RoleDefinitionBindings/Name','RoleDefinitionBindings/Hidden']
				})
				.then(function(arrData){
					// STEP 1: Transform: Results s/b 2 keys with props inside each
					arrData.forEach(function(objItem,idx){
						// A: "Rename" the `RoleDefinitionBindings` key to be user-friendly
						Object.defineProperty(objItem, 'Roles', Object.getOwnPropertyDescriptor(objItem, 'RoleDefinitionBindings'));
						delete objItem.RoleDefinitionBindings;

						// B: Move `PrincipalId` inside {Member}
						objItem.Member.PrincipalId = objItem.PrincipalId;
						delete objItem.PrincipalId;

						// C: Decode PrincipalType into text
						objItem.Member.PrincipalType = ENUM_PRINCIPALTYPES[objItem.Member.PrincipalType] || objItem.Member.PrincipalType;
					});

					// STEP 2: Resolve results (NOTE: empty array is the correct default result)
					resolve( arrData || [] );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		// SELECT -------------------------------------------------------------------

		/**
		* Get specified or all List/Library column values - optionally: filter, sort, limit
		*
		* @param options - array of column names
		*
		* Options:
		*
		* | property      | type    | reqd  | description       | example/allowed vals |
		* |---------------|---------|-------|-------------------|----------------------|
		* | `listCols`    | array   | no    | array of column names in OData style | `listCols: ['Name', 'Badge_x0020_Number']` |
		* | `listCols`    | object  | no    | object with column properties | `listCols: { badge: { dataName:'Badge_x0020_Number' } }` |
		* | `metadata`    | boolean | no    | whether to return `__metadata` | `metadata: true` |
		* | `queryFilter` | string  | no    | OData style filter    | `ID eq 1`, `Badge_x0020_Number eq 1234` |
		* | `queryLimit`  | number  | no    | OData style row limit | `10` would limit number of rows returned to 10 |
		* | `queryNext`   | object  | no    | Next/Skip options (paging) | `{ prevId:500, maxItems:1000 }` |
		* | `queryOrderby`| string  | no    | OData style order by  | `Badge_x0020_Number`, `Badge_x0020_Number desc` [asc sort is SP2013 default] |
		*
		* @example - no args - omitting listCols/arguments means "return all" (mirrors SP behavior)
		* sprLib.list('Employees').getItems()
		*
		* @example - simple array of column names
		* sprLib.list('Employees').getItems(['Name', 'Badge_x0020_Number', 'Hire_x0020_Date'])
		*
		* @example using `listCols` - simple array of column names
		* sprLib.list('Employees').getItems({
		*   listCols: ['Name', 'Badge_x0020_Number', 'Hire_x0020_Date']
		* })
		*
		* @example using `listCols` - object with user designated key names and column options
		* sprLib.list('Employees').getItems({
		*   listCols: {
		*     name:  { dataName:'Name'               },
		*     badge: { dataName:'Badge_x0020_Number' }
		*   }
		* })
		*
		* @example - with some options
		* sprLib.list('Employees').getItems({
		*   listCols:     { badgeNum: { dataName:'Badge_x0020_Number' } },
		*   queryFilter:  "Salary gt 100000",
		*   queryOrderby: "Hire_x0020_Date",
		*   queryLimit:   100,
		*   metadata:     true
		* })
		*
		* listCols properties:
		*
		* | property         | type    | reqd  | description       | example/allowed vals |
		* |------------------|---------|-------|-------------------|----------------------|
		* | `dataName`       | string  | no    | SP.InternalName   | 'Hire_x0020_Date'    |
		* | `dispName`       | string  | no    | display name      | 'Hire Date'          |
		* | `currencyFormat` | string  | no    | date format       | `INTL`, `INTLTIME` |
		* | `dateFormat`     | string  | no    | date format       | `INTL`, `INTLTIME`  |
		* // TODO: ^^^ lets combine to `format` and be context-sensitive (currency only works with currency etc.)
		*
		* listCols properties: used by Library internally
		*
		* | property     | type    | reqd  | description       | example/allowed vals |
		* |--------------|---------|-------|-------------------|----------------------|
		* | `dataType`   | string  | (app) | SP.FieldType      | `Integer`, `Text, `Note, `DateTime`, `Choice`, `Lookup`, `Boolean`, `Currency` et al. |
		* | `isAppend`   | boolean | (app) | Append Text Field | `true` or `false`    |
		* | `isNumPct`   | boolean | (app) | "Show as Percent" | `true` or `false`    |
		*
		* @see: Field Ref.: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx
		* @see: FieldTypes: https://msdn.microsoft.com/en-us/library/office/microsoft.sharepoint.client.fieldtype.aspx
		* @see: DOCS: https://gitbrent.github.io/SpRestLib/docs/api-list.html
		* @since 1.0
		*/
		_newList.items = function(inObj) {
			var listGUID = '';
			return new Promise(function(resolve, reject) {
				// STEP 1: Create/Init Params
				inObj = inObj || {};
				// Deal with garbage here instead of in parse
				if ( inObj == '' || inObj == [] ) inObj = {};
				// Handle: `$filter` only accepts single quote (%27), double-quote (%22) will fail, so transform as needed
				if ( inObj.queryFilter ) inObj.queryFilter = inObj.queryFilter.replace(/\"/gi,"'");

				// STEP 2: Parse options/cols / Set Internal Arrays
				// NOTE: Duplicate col names dont bother SP, so there is no test/fix for that condition below
				{
					// CASE 1: Option: single string col name
					if ( typeof inObj === 'string' || typeof inObj === 'number' ) {
						var objCol = {};
						objCol[ inObj.toString() ] = { dataName:inObj.toString() };
						inObj = { listCols:objCol };
					}
					// CASE 2: Options: array of col names
					else if ( Array.isArray(inObj) ) {
						var objListCols = {};
						inObj.forEach(function(colStr,i){
							var strTmp = ( colStr.indexOf('/') > -1 ? colStr.substring(0,colStr.indexOf('/')) : colStr );
							// Handle cases where there are 2 expands from same column. Ex: 'Manager/Id' and 'Manager/Title'
							if ( colStr ) objListCols[strTmp] = ( objListCols[strTmp] ? { dataName:objListCols[strTmp].dataName+','+colStr } : { dataName:colStr } );
						});
						inObj = { listCols: objListCols };
					}
					// CASE 3: Options: `listCols` is a simple string
					else if ( typeof inObj.listCols === 'string' ) {
						var objNew = {};
						Object.keys(inObj).forEach(function(key,idx){ objNew[key] = inObj[key]; });
						inObj.listCols = [inObj.listCols];
						var objListCols = {};
						inObj.listCols.forEach(function(colStr,i){
							var strTmp = ( colStr.indexOf('/') > -1 ? colStr.substring(0,colStr.indexOf('/')) : colStr );
							// Handle cases where there are 2 expands from same column. Ex: 'Manager/Id' and 'Manager/Title'
							if ( colStr ) objListCols[strTmp] = ( objListCols[strTmp] ? { dataName:objListCols[strTmp].dataName+','+colStr } : { dataName:colStr } );
						});
						objNew.listCols = objListCols;
						inObj = objNew;
					}
					// CASE 4: Options: `listCols` is a simple array of col names
					else if ( Array.isArray(inObj.listCols) ) {
						var objNew = {};
						Object.keys(inObj).forEach(function(key,idx){ objNew[key] = inObj[key]; });
						var objListCols = {};
						// Filter returns unique values (otherwise, dupes will cause issues below. e.g.:['Id','Id'] will return nulls)
						inObj.listCols.filter(function(value,index,self){ return self.indexOf(value) === index }).forEach(function(colStr,i){
							var strTmp = ( colStr.indexOf('/') > -1 ? colStr.substring(0,colStr.indexOf('/')) : colStr );
							// Handle cases where there are 2 expands from same column. Ex: 'Manager/Id' and 'Manager/Title'
							if ( colStr ) objListCols[strTmp] = ( objListCols[strTmp] ? { dataName:objListCols[strTmp].dataName+','+colStr } : { dataName:colStr } );
						});
						objNew.listCols = objListCols;
						inObj = objNew;
					}
					// CASE 5: No listCols - create when needed
					else if ( !inObj.listCols ) inObj.listCols = {};

					// Add internal data objects
					inObj.spArrData = [];
					inObj.spObjData = {};
				}

				// STEP 3: Check for `getVersions` option, as we need to force 'inObj.metadata' to true to get the List GUID of owssvr query next
				if ( typeof inObj.listCols === 'object' && Object.keys(inObj.listCols).length > 0 ) {
					Object.keys(inObj.listCols).forEach(function(key){
						var obj = inObj.listCols[key];
						if ( obj.getVersions ) inObj.metadata = true;
					});
				}

				// STEP 4: Start data fetch Promise chain
				Promise.resolve()
				.then(function(){
					return new Promise(function(resolve, reject) {
						var objAjaxQuery = {
							url     : _urlBase+"/items",
							type    : "GET",
							cache   : inObj.cache || APP_OPTS.cache,
							metadata: inObj.metadata || APP_OPTS.metadata,
							headers : { "Accept":"application/json;odata=verbose", "X-RequestDigest":_requestDigest }
						};
						var arrExpands = [], strExpands = "";

						// STEP 1: Deal with next/paging
						if ( inObj.queryNext ) {
							// REQ-CHECK:
							if ( typeof inObj.queryNext !== 'object' || !inObj.queryNext.prevId || !inObj.queryNext.maxItems ) {
								inObj.queryNext = null;
								console.log('ERROR: queryNext should be an object with `prevId` and `maxItems`. EX: `{"prevId":200,"maxItems":100}`');
							}
						}

						// STEP 2: Start building REST Endpoint URL
						{
							// Next requires a special URL
							if ( inObj.queryNext && inObj.listCols && Object.keys(inObj.listCols).length > 0 ) objAjaxQuery.url += '?%24skiptoken=Paged%3dTRUE%26p_ID%3d'+ inObj.queryNext.prevId +'&%24select=';
							// If columns were provided, start a select query
							else if ( inObj.listCols && Object.keys(inObj.listCols).length > 0 ) objAjaxQuery.url += "?$select=";
						}

						// STEP 3: Keep building REST Endpoint URL
						{
							// A: Add columns
							Object.keys(inObj.listCols).forEach(function(key){
								var col = inObj.listCols[key];

								if ( !col.dataName ) return; // Skip columns without a 'dataName' key
								// 1:
								if ( objAjaxQuery.url.substring(objAjaxQuery.url.length-1) == '=' ) objAjaxQuery.url += col.dataName;
								else objAjaxQuery.url += ( objAjaxQuery.url.lastIndexOf(',') == objAjaxQuery.url.length-1 ? col.dataName : ','+col.dataName );
								// 2:
								if ( col.dataName.indexOf('/') > -1 ) {
									var strFieldName = col.dataName.substring(0, col.dataName.indexOf('/'));
									if ( arrExpands.indexOf(strFieldName) == -1 ) {
										arrExpands.push( strFieldName );
										strExpands += (strExpands == '' ? '' : ',') + strFieldName;
									}
								}
							});

							// B: Add expand (if any)
							if ( strExpands ) objAjaxQuery.url += (objAjaxQuery.url.indexOf('?') > -1 ? '&':'?') + '$expand=' + strExpands;

							// C: Add filter (if any)
							if ( inObj.queryFilter ) {
								objAjaxQuery.url += (objAjaxQuery.url.indexOf('?') > -1 ? '&':'?') + '$filter=' + ( inObj.queryFilter.indexOf('%') == -1 ? encodeURI(inObj.queryFilter) : inObj.queryFilter );
							}

							// D: Add orderby (if any)
							if ( inObj.queryOrderby ) objAjaxQuery.url += (objAjaxQuery.url.indexOf('?') > -1 ? '&':'?') + '$orderby=' + inObj.queryOrderby;

							// E: Add maxrows / Next support
							if ( inObj.queryNext ) {
								objAjaxQuery.url += '&p_ID='+ inObj.queryNext.prevId +'&$top='+ inObj.queryNext.maxItems;
							}
							else if ( inObj.queryLimit ) {
								objAjaxQuery.url += ( (objAjaxQuery.url.indexOf('?$') > -1 ? '&':'?') + '$top=' + inObj.queryLimit );
							}
						}

						// STEP 4: Send AJAX REST query
						sprLib.rest(objAjaxQuery)
						.then(function(arrResults){
							// A: Add all cols is none provided (aka:"fetch all")
							if ( (!inObj.listCols || Object.keys(inObj.listCols).length == 0) && arrResults.length > 0 ) {
								var objListCols = {};
								Object.keys(arrResults[0]).forEach(function(colStr,idx){
									// DESIGN: Dont include those first few junky fields from SP that point to FieldsAsHTML etc
									if ( arrResults[0][colStr] && typeof arrResults[0][colStr] === 'object' && arrResults[0][colStr].__deferred ) {
										if (DEBUG) console.log('FYI: Skipping "select all" column: '+colStr);
									}
									else {
										objListCols[colStr] = { dataName:colStr };
									}
								});
								inObj.listCols = objListCols;
							}

							// B: Iterate over results and capture them
							arrResults.forEach(function(result,idx){
								// B.1: Create row object
								var objRow = {};
								var intID = 0;

								// B.2: Capture `Id` and `__metadata` (if any)
								if ( result.__metadata ) {
									// Capture metadata
									objRow['__metadata'] = result.__metadata;

									// Grab item `ID` and list `GUID` if possible
									if ( result.__metadata.uri ) {
										if ( result.__metadata.uri.indexOf('/Items(') > -1 ) {
											intID = Number(result.__metadata.uri.split('/Items(').pop().replace(')',''));
										}
										if ( !listGUID && result.__metadata.uri.indexOf("guid'") > -1 ) {
											listGUID = result.__metadata.uri.split("guid'").pop().split("')/")[0];
										}
									}
								}

								// B.3: Skip/Next/Paging support
								if ( result.__next ) {
									objRow['__next'] = result.__next;
								}

								// B.4: Capture query results
								Object.keys(inObj.listCols).forEach(function(key){
									var col = inObj.listCols[key];
									var arrCol = [];
									var colVal = "";

									// B.3.1: Get value(s) for this key
									// Handle LookupMulti columns
									if ( col.dataName && col.dataName.indexOf('/') > -1 && result[col.dataName.split('/')[0]].results ) {
										// A:
										// NOTE: `listCols` can have "Dept/Id" and "Dept/Title", but SP only returns *ONE* result
										// ....: So, skip any subsequnt listCol once results have been captured
										if ( objRow[key] ) return;

										// B: Default for this column type is empty array
										colVal = [];

										// C: Add any results
										result[col.dataName.split('/')[0]].results.forEach(function(objResult,idx){
											// EX: {__metadata:Object, Id:2, Title:"Human Resources"}
											if ( objResult.__metadata ) delete objResult.__metadata;
											// Capture any-and-all columns returned (aside from removal of above)
											colVal.push( objResult );
										});
									}
									// Handle Lookup/Person/Url/etc. Ex: 'Manager/Title'
									else if ( col.dataName && col.dataName.indexOf('/') > -1 ) {
										// A: Split lookup info object/field
										arrCol = col.dataName.split('/');
										// B: Remove extraneous `__metadata`
										if ( result[arrCol[0]].__metadata ) delete result[arrCol[0]].__metadata;
										// B: Same for `__deferred`.
										// NOTE: Empty Multi-Person returns `{__deferred:{uri:'http...'}}` (ugh!)
										if ( result[arrCol[0]].__deferred ) delete result[arrCol[0]].__deferred;
										// C: Capture value
										// CASE 1: `dataName` was used - in this case return the actual field user asked for
										// Detect use of names listCols by comparing key to dataName
										if ( key != arrCol[0] && key != col.dataName ) colVal = result[arrCol[0]][arrCol[1]];
										// CASE 2: Other - in this case return the complete object (Ex: { Title:'Manager' })
										// IMPORTANT: This de facto returns all the *other* fields queried. Eg: 'Manager/Id' and 'Manager/Title' were in cols
										// We want to return a *single* object with these 2 elements, so they can be derefereced using 'Manger.Title' etc.
										// Capture any-and-all columns returned (aside from removal of above)
										else colVal = result[arrCol[0]];

										// D: Fix result if needed: Empty person fields will be `{__proto__:{}}` at this point
										if ( colVal && typeof colVal === 'object' && !Array.isArray(colVal) && Object.keys(colVal).length == 0 ) colVal = null;
									}
									else if ( col.dataName ) {
										colVal = result[col.dataName];
									}
									else if ( col.dataFunc ) {
										colVal = col.dataFunc(result);
									}

									// B.3.2: Set value for this key
									// If dataType is known, then convert
									if ( col.dataType == 'DateTime' ) {
										objRow[key] = new Date(colVal);
									}
									else {
										objRow[key] = ( APP_OPTS.cleanColHtml && col.listDataType == 'string' ? colVal.replace(/<div(.|\n)*?>/gi,'').replace(/<\/div>/gi,'') : colVal );
									}

									// B.3.3: Handle `getVersions`
									// Results of an append-text query is an array of Note versions in desc order
									if ( col.getVersions ) objRow[key] = [];
								});

								// B.5: Set data
								// 4.A: Result row
								inObj.spArrData.push( objRow );
								// B.5: Create data object if we have ID (for lookups w/o spArrData.filter)
								if ( intID ) {
									inObj.spObjData[intID] = objRow;
								}
							});

							// LAST:
							resolve();
						})
						.catch(function(strErr){
							reject( strErr );
						});
					});
				})
				.then(function(){
					var arrAppendCols = [], arrAppendColNames = [];

					// STEP 1: Gather any append cols that need to be queried
					Object.keys(inObj.listCols).forEach(function(key){
						var col = inObj.listCols[key];

						if ( col.getVersions ) {
							col.keyName = key; // Store this column's key to avoid complex (slow) filtering below when we need to save by this key name
							arrAppendCols.push( col );
							arrAppendColNames.push( col.dataName );
						}
					});

					// STEP 2: Get data for any found cols
					if ( listGUID && arrAppendCols.length ) {
						// STEP 1: Query SharePoint
						// Convert our dataName array into a comma-delim string, then replace ',' with '%20' and our query string is constrcuted!
						sprLib.rest({
							url: (inOpt.baseUrl ? inOpt.baseUrl+'/' : '')+"_vti_bin/owssvr.dll?Cmd=Display&List="
								+ "%7B"+ listGUID +"%7D"+"&XMLDATA=TRUE&IncludeVersions=TRUE"
								+ "&Query=ID%20"+ arrAppendColNames.toString().replace(/\,/g,'%20') +"%20"
								+ "Modified%20Editor%20"
								+ "&SortField=Modified&SortDir=ASC"
						})
						.then(function(result){
							if ( result && result[0] && result[0].documentElement ) {
								// Query is order by oldest->newest, so always capture the result and the last one captured will always be the most recent
								result[0].documentElement.querySelectorAll('row').forEach(function(row){
									arrAppendCols.forEach(function(objCol,idx){
										var intID = row.getAttribute("ows_ID");
										var prvComm = "";

										// NOTE: LOGIC: Versions doesnt filter like getItems, so we may get many more items than our dataset has
										if ( inObj.spObjData[intID] && row.getAttribute('ows_'+objCol.dataName) ) {
											var rowNote = row.getAttribute('ows_'+objCol.dataName) || '';
											if ( rowNote ) {
												if ( rowNote != prvComm ) {
													// IE11: Convert date to ISO-8601 format or IE will fail using date like '2017-01-02 12:34:55'
													inObj.spObjData[intID][objCol.keyName].push({
														verDate: new Date(row.getAttribute('ows_Modified').replace(' ','T')).toISOString(),
														verName: row.getAttribute('ows_Editor').substring(row.getAttribute('ows_Editor').indexOf("#")+1),
														verText: rowNote
													});
													prvComm = rowNote;
												}
												else {
													// When note content is the same, replace the previous version
													// (so author and date are correct - older ones are ModifiedBy folks who Modified *OTHER* fields! - oldest is true author!)
													inObj.spObjData[intID][objCol.keyName].pop();
													inObj.spObjData[intID][objCol.keyName].push({
														verDate: new Date(row.getAttribute('ows_Modified').replace(' ','T')).toISOString(),
														verName: row.getAttribute('ows_Editor').substring(row.getAttribute('ows_Editor').indexOf("#")+1),
														verText: rowNote
													});
												}
											}
										}
									});
								});
							}

							// LAST: Return List data
							resolve(inObj.spArrData);
						})
						.catch(function(strErr){
							reject( strErr );
						});
					}
					else {
						resolve(inObj.spArrData);
					}
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		// DEPRECATED:
		// TODO-2.0
		_newList.getItems = _newList.items;

		// CRUD ---------------------------------------------------------------------

		/**
	    * Create/Insert a new item into SP List/Library
		*
		* @example
		* sprLib.list('Employees').create({
		*   __metadata: { type:"SP.Data.EmployeesListItem" },
		*   Name: 'Marty McFly',
		*   Hire_x0020_Date: new Date()
		* });
		*
		* @param {object} `jsonData` - The item to insert, in regular SharePoint JSON format (ex: `{Full_x0020_Name:'Brent Ely'}`)
		*
		* @return {Promise} - Return `Promise` containing newly created item in JSON format (return the data result from SharePoint).
		*/
		_newList.create = function(jsonData) {
			return new Promise(function(resolve, reject) {
				// FIRST: Param checks
				if ( !jsonData || Array.isArray(jsonData) || typeof jsonData !== 'object' || Object.keys(jsonData).length == 0 ) reject("Object type expected! Ex: `{Title:'New Emp'}`");
				try { var test = JSON.stringify(jsonData) } catch(ex) { reject("`JSON.stringify(jsonData)` failed! Send valid JSON Please. Ex: `{'Name':'Brent'}`") }

				// STEP 1: Param Setup
				// B: DESIGN/OPTION: If no etag is provided, consider it a force (a faux {OPTION})
				jsonData.__metadata = jsonData.__metadata || {};
				delete jsonData.__metadata.etag; // Ensure we dont pass an etag
				delete jsonData.__next; // sprLib may return `next` which in turn may be passed here subsequently - its invalid, so remove it

				// STEP 2: Create item
				Promise.resolve()
				.then(function(){
					return ( jsonData.__metadata.type ? null : getListItemType() );
				})
				.then(function(objMetadata){
					// 1: Add __metadata if provided
					if ( objMetadata && objMetadata.type ) jsonData.__metadata = objMetadata;

					// 2: Create item
					sprLib.rest({
						type    : "POST",
						url     : _urlBase +"/items",
						data    : JSON.stringify(jsonData),
						metadata: true,
						headers : { "Accept":"application/json;odata=verbose", "X-RequestDigest":_requestDigest }
					})
					.then(function(arrData){
						if ( arrData && arrData[0] ) {
							// A: Populate new ID (both 'Id' and 'ID' to mimic SP)
							jsonData.Id = arrData[0].Id;
							jsonData.ID = arrData[0].ID;

							// B: Populate metadata
							jsonData.__metadata = jsonData.__metadata || arrData[0].__metadata || {};
							jsonData.__metadata.etag = jsonData.__metadata.etag || (arrData[0].__metadata ? arrData[0].__metadata.etag : null);
						}
						else {
							jsonData = null;
						}

						// LAST: Return new item
						resolve( jsonData );
					})
					.catch(function(strErr){
						reject( strErr );
					});
				})
				.catch(function(err){ reject(err) });
			});
		};

		/**
		* Update an existing item in a SP List/Library
		*
		* @example
		* sprLib.list('Employees').update({
		*   __metadata: { type:"SP.Data.EmployeesListItem", etag:10 },
		*   Id: 1,
		*   Name: 'updated by sprLib.list().update()',
		*   Hire_x0020_Date: new Date()
		* })
		* .then(function(objItem){ console.table(objItem) })
		* .catch(function(strErr){ console.error(strErr)  });
		*
		* @param {object} `jsonData` - The item to update, in regular SharePoint JSON format
		*
		* @return {object} Return newly created item in JSON format (return the data result from SharePoint).
		*/
		_newList.update = function(jsonData) {
			return new Promise(function(resolve, reject) {
				// FIRST: Param checks
				if ( !jsonData || Array.isArray(jsonData) || typeof jsonData !== 'object' || Object.keys(jsonData).length == 0 ) reject("Object type expected! Ex: `{Title:'Brent'}`");
				if ( !jsonData['ID'] && !jsonData['Id'] && !jsonData['iD'] && !jsonData['id'] ) reject("Object must have an `Id` property! Ex: `{Id:99}`");
				try { var test = JSON.stringify(jsonData) } catch(ex) { reject("`JSON.stringify(jsonData)` failed! Send valid object. Ex: `{'Title':'Brent'}`") }

				// STEP 1: Param Setup
				// A: Set our `Id` value (users may send an of 4 different cases), then remove as ID is not updateable in SP
				var intID = jsonData['ID'] || jsonData['Id'] || jsonData['iD'] || jsonData['id'];
				delete jsonData.ID; delete jsonData.Id; delete jsonData.iD; delete jsonData.id;
				// B: DESIGN/OPTION: If no etag is provided, consider it a force (a faux {OPTION})
				jsonData.__metadata = jsonData.__metadata || {};
				if ( jsonData.__metadata.etag == "" || jsonData.__metadata.etag == null ) delete jsonData.__metadata.etag; // Ensure junk isnt passed, as etag on SP will error
				delete jsonData.__next; // sprLib may return `next` which in turn may be passed here subsequently - its invalid, so remove it

				// STEP 2: Update item
				Promise.resolve()
				.then(function(){
					return ( jsonData.__metadata.type ? null : getListItemType() );
				})
				.then(function(objMetadata){
					// 1: Add `__metadata.type` if needed
					if ( objMetadata && objMetadata.type ) jsonData.__metadata.type = objMetadata.type;

					// 2: Update item
					sprLib.rest({
						type    : "POST",
						url     : _urlBase +"/items("+ intID +")",
						data    : JSON.stringify(jsonData),
						metadata: true,
						headers : {
							"X-HTTP-Method"  : "MERGE",
							"Accept"         : "application/json;odata=verbose",
							"X-RequestDigest": _requestDigest,
							"IF-MATCH"       : ( jsonData.__metadata.etag ? jsonData.__metadata.etag : "*" )
						}
					})
					.then(function(arrData){
						// A: SP doesnt return anything for Merge/Update, so return original jsonData object so users can chain, etc.
						// Populate both 'Id' and 'ID' to mimic SP2013
						jsonData.Id = intID; jsonData.ID = intID;

						// B: Increment etag (if one was provided, otherwise, we cant know what it is without querying for it!)
						if ( jsonData.__metadata.etag ) jsonData.__metadata.etag = '"'+ (Number(jsonData.__metadata.etag.replace(/[\'\"]+/gi, ''))+1) +'"';

						// LAST: Return item
						resolve( jsonData );
					})
					.catch(function(strErr){
						reject( strErr );
					});
				});
			});
		};

		/**
		* Delete an item from a SP List/Library
		* This operation is permanent (item bypasses the Recycle Bin)!
		*
		* @example - with `etag`
		* sprLib.list('Employees').delete({ "__metadata":{"etag":10}, "Id":1 }).then(intID => console.log('Deleted #'+intID));
		*
		* @example - without `etag` (force delete)
		* sprLib.list('Employees').delete({ "ID":123 }).then(intID => console.log('Deleted #'+intID));
		*
		* @return {number} Return the `id` just deleted
		*/
		_newList.delete = function(jsonData) {
			return new Promise(function(resolve,reject) {
				// FIRST: Param checks
				if ( !jsonData || Array.isArray(jsonData) || typeof jsonData !== 'object' || Object.keys(jsonData).length == 0 ) reject("Object type expected! Ex: `{'ID':123}`");
				if ( !jsonData['ID'] && !jsonData['Id'] && !jsonData['iD'] && !jsonData['id'] ) reject("Object data must have an `Id` property! Ex: `{'ID':123}`");
				try { var test = JSON.stringify(jsonData) } catch(ex) { reject("`JSON.stringify(jsonData)` failed! Please pass a valid object. Ex: `{'ID':123}`") }

				// STEP 1: Param Setup
				// A: Set our `Id` value (users may send an of 4 different cases), then remove as ID is not updateable in SP
				var intID = jsonData['ID'] || jsonData['Id'] || jsonData['iD'] || jsonData['id'];
				delete jsonData.ID; delete jsonData.Id; delete jsonData.iD; delete jsonData.id;
				// B: DESIGN/OPTION: If no etag is provided, consider it a force (a faux {OPTION})
				jsonData.__metadata = jsonData.__metadata || {};
				if ( jsonData.__metadata.etag == "" || jsonData.__metadata.etag == null ) delete jsonData.__metadata.etag; // Ensure junk isnt passed, as etag on SP will error
				delete jsonData.__next; // sprLib may return `next` which in turn may be passed here subsequently - its invalid, so remove it

				// STEP 2: Delete item
				Promise.resolve()
				.then(function(){
					return ( jsonData.__metadata.type ? null : getListItemType() );
				})
				.then(function(objMetadata){
					// 1: Add `__metadata.type` if needed
					if ( objMetadata && objMetadata.type ) jsonData.__metadata.type = objMetadata.type;

					// 2: Update item
					sprLib.rest({
						type    : "DELETE",
						url     : _urlBase +"/items("+ intID +")",
						metadata: true,
						headers : {
							"Accept"         : "application/json;odata=verbose",
							"X-RequestDigest": _requestDigest,
							"X-HTTP-Method"  : "MERGE",
							"IF-MATCH"       : ( jsonData.__metadata.etag ? jsonData.__metadata.etag : "*" )
						}
					})
					.then(function(){
						// SP doesnt return anything for Deletes, but SpRestLib returns ID
						resolve( intID );
					})
					.catch(function(strErr){
						reject( strErr );
					});
				});
			});
		};

		/**
		* Recycle an item from a SP List/Library
		* This operation sends the item to Recycle Bin (item is recoverable)
		*
		* @example
		* sprLib.list('Employees').recycle({ "ID":123 })
		*
		* @return {number} Return the `id` just recycled
		*/
		_newList.recycle = function(jsonData) {
			return new Promise(function(resolve,reject) {
				// FIRST: Param checks
				if ( !jsonData || Array.isArray(jsonData) || typeof jsonData !== 'object' || Object.keys(jsonData).length == 0 ) reject("Object type expected! Ex: `{'ID':123}`");
				if ( !jsonData['ID'] && !jsonData['Id'] && !jsonData['iD'] && !jsonData['id'] ) reject("Object data must have an `Id` property! Ex: `{'ID':123}`");
				try { var test = JSON.stringify(jsonData) } catch(ex) { reject("`JSON.stringify(jsonData)` failed! Please pass a valid object. Ex: `{'ID':123}`") }

				// STEP 1: Param Setup
				// A: Set our `Id` value (users may send an of 4 different cases), then remove as ID is not updateable in SP
				var intID = jsonData['ID'] || jsonData['Id'] || jsonData['iD'] || jsonData['id'];
				delete jsonData.ID; delete jsonData.Id; delete jsonData.iD; delete jsonData.id;
				// B: DESIGN/OPTION: If no etag is provided, consider it a force (a faux {OPTION})
				jsonData.__metadata = jsonData.__metadata || {};
				if ( jsonData.__metadata.etag == "" || jsonData.__metadata.etag == null ) delete jsonData.__metadata.etag; // Ensure junk isnt passed, as etag on SP will error
				delete jsonData.__next; // sprLib may return `next` which in turn may be passed here subsequently - its invalid, so remove it

				// STEP 2: Recycle item
				sprLib.rest({
					type    : "POST",
					url     : _urlBase +"/items("+ intID +")/recycle()",
					metadata: true,
					headers : {
						"Accept"         : "application/json;odata=verbose",
						"X-RequestDigest": _requestDigest
					}
				})
				.then(function(){
					// SP returns the item guid for Recycle operations
					// EX: {"d":{"Recycle":"ed504e3d-f8ab-4dd4-bb22-6ddaa78bd117"}}
					resolve( Number(intID) );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		};

		// LAST: Return this new List
		return _newList;
	};

	// API: REST (Runs internal AJAX ops *and* provides direct/ad-hoc interface to users)
	/**
	* Execute an ad-hoc REST query to one of many endpoints
	*
	* @example - sprLib.rest({ url:'/sites/dev/_api/web/webs', metadata:true });
	* @example - sprLib.rest({ url:'/sites/dev/_api/web/webs', queryCols:['ID','Title'] });
	* @example
	sprLib.rest({
		url: '/sites/dev/_api/web/sitegroups',
		type: ['GET' | 'POST'],
		queryCols: {
			title:       { dataName:'Title' },
			loginName:   { dataName:'LoginName' },
			editAllowed: { dataName:'AllowMembersEditMembership' }
		},
		queryFilter:  "AllowMembersEditMembership eq 1",
		queryOrderby: "Title",
		queryLimit:   10
	})
	.then(function(arrayResults){ console.table(arrayResults) });
	*
	* @since 1.0.0
	*/
	// sprLib.rest({ url:"/sites/dev/_api/web/sitegroups" }).then(function(data){ console.table(data); }); (data.d.results)
	// sprLib.rest({ url:"/_api/web/lists/getbytitle('Employees')" }).then(function(data){ console.table(data); }); (data.d)
	//
	// EX: https://siteurl.sharepoint.com/sites/dev/_api/web/lists/getbytitle('Employees')/
	// EX: https://siteurl.sharepoint.com/sites/dev/_api/web/sitegroups
	sprLib.rest = function rest(inOpt) {
		return new Promise(function(resolve, reject) {
			// STEP 1: Options setup
			inOpt = inOpt || {};
			inOpt.spArrData = [];
			inOpt.cache    = inOpt.cache    || APP_OPTS.cache;
			inOpt.digest   = (inOpt.requestDigest || (typeof document !== 'undefined' && document.getElementById('__REQUESTDIGEST') ? document.getElementById('__REQUESTDIGEST').value : null));
			inOpt.metadata = (typeof inOpt.metadata !== 'undefined' && inOpt.metadata != null ? inOpt.metadata : APP_OPTS.metadata);
			inOpt.type     = inOpt.restType || inOpt.type || "GET";
			inOpt.url      = (inOpt.restUrl || inOpt.url || APP_OPTS.baseUrl).replace(/\"/g, "'");

			// STEP 2: Setup vars
			var arrExpands = [], strExpands = "";
			var objAjaxQuery = {
				url    : inOpt.url,
				type   : inOpt.type,
				cache  : inOpt.cache,
				headers: inOpt.headers || { "Accept":"application/json;odata=verbose", "X-RequestDigest":inOpt.digest }
			};
			// Add `data` if included
			if ( inOpt.data ) objAjaxQuery.data = inOpt.data;
			// Add default `context-type` for POST if none was specified
			if ( objAjaxQuery.type == 'POST' && !objAjaxQuery.headers.contentType ) objAjaxQuery.headers['content-type'] = 'application/json;odata=verbose';

			// STEP 3: Construct Base URL: `url` can be presented in many different forms...
			objAjaxQuery.url = (inOpt.url.toLowerCase().indexOf('http') == 0 || inOpt.url.indexOf('/') == 0 ? '' : APP_OPTS.baseUrl);
			objAjaxQuery.url += (inOpt.url.toLowerCase().indexOf('http') != 0 && inOpt.url.indexOf('/') != 0 ? '/' : '') + inOpt.url;

			// STEP 4: Continue building up `url` with any options provided
			{
				// queryCols: Start 'select query'
				if ( inOpt.queryCols ) {
					// A: Start 'select query'
					if ( objAjaxQuery.url.toLowerCase().indexOf('$select') == -1 ) objAjaxQuery.url += '?$select=';

					// B: parse `queryCols` (can be: string, array of strings, or objects)
					// Convert single string column into an array for use below
					if ( typeof inOpt.queryCols === 'string' ) inOpt.queryCols = [ inOpt.queryCols ];

					// C: Build query object if `queryCols` array exists - create 'expands'
					if ( Array.isArray(inOpt.queryCols) ) {
						var objListCols = {};
						inOpt.queryCols.forEach(function(colStr,i){
							var strFieldName = ( colStr.indexOf('/') > -1 ? colStr.substring(0,colStr.indexOf('/')) : colStr );
							// Handle cases where there are 2 expands from same column. Ex: 'Manager/Id' and 'Manager/Title'
							// When fieldName already exists, just add subsequent fields to dataName so $select gets them - Ex: "Manager/Id,Manager/Title"
							objListCols[strFieldName] = ( objListCols[strFieldName] ? { dataName:objListCols[strFieldName].dataName+','+colStr } : { dataName:colStr } );
						});
						inOpt.queryCols = objListCols;
					}

					// D: Add columns
					if ( typeof inOpt.queryCols === 'object' ) {
						// A: Add columns
						Object.keys(inOpt.queryCols).forEach(function(key){
							var col = inOpt.queryCols[key];

							if ( !col.dataName ) return; // Skip columns without a 'dataName' key
							// 1:
							if ( objAjaxQuery.url.substring(objAjaxQuery.url.length-1) == '=' ) objAjaxQuery.url += col.dataName;
							else objAjaxQuery.url += ( objAjaxQuery.url.lastIndexOf(',') == objAjaxQuery.url.length-1 ? col.dataName : ','+col.dataName );
							// 2:
							if ( col.dataName.indexOf('/') > -1 ) {
								// `dataName` will be complete value passed in (Ex: 'Members/User/Id')
								var strFieldName = col.dataName.substring(0, col.dataName.indexOf('/'));      // EX: 'Members/User/Id' -> 'Members'
								var strExpandName = col.dataName.substring(0, col.dataName.lastIndexOf('/')); // EX: 'Members/User/Id' -> 'Members/User'
								if ( arrExpands.indexOf(strExpandName) == -1 ) {
									arrExpands.push( strExpandName );
									strExpands += (strExpands == '' ? '' : ',') + strExpandName;
								}
							}
						});
					}
				}

				// NOTE: Only applies to GET [select] queries (POST with this param are obv. invalid!)
				if (
					(inOpt.queryFilter || objAjaxQuery.url.toLowerCase().indexOf('$select') > -1)
					&& inOpt.type == "GET"
					&& inOpt.url.toLowerCase().indexOf('$top') == -1
					&& inOpt.queryLimit
				) {
					objAjaxQuery.url += ( (objAjaxQuery.url.indexOf('?')>0?'&':'?') + '$top=' + inOpt.queryLimit );
				}

				// queryFilter: Add filter (if any)
				if ( inOpt.url.toLowerCase().indexOf('$filter') == -1 && inOpt.queryFilter ) {
					objAjaxQuery.url += ( (objAjaxQuery.url.indexOf('?')>0?'&':'?')+'$filter=' + ( inOpt.queryFilter.indexOf('%') == -1 ? encodeURI(inOpt.queryFilter) : inOpt.queryFilter ) );
				}

				// queryOrderby: Add orderby (if any)
				if ( inOpt.url.toLowerCase().indexOf('$orderby') == -1 && inOpt.queryOrderby ) {
					objAjaxQuery.url += ( (objAjaxQuery.url.indexOf('?')>0?'&':'?')+'$orderby=' + inOpt.queryOrderby );
				}

				// Expands: Add expand (if any)
				if ( inOpt.url.toLowerCase().indexOf('$expand') == -1 && strExpands ) {
					objAjaxQuery.url += ( (objAjaxQuery.url.indexOf('?')>0?'&':'?')+'$expand=' + strExpands );
				}
			}

			// STEP 5: Execute REST call
			Promise.resolve()
			.then(function(){
				return new Promise(function(resolve, reject) {
					if ( APP_OPTS.isNodeEnabled ) {
						if ( !https ) {
							// Declare https on-demand so APP_OPTS applies (if we init `https` with the library Angular/React/etc will fail on load as users have not had a chance to select any options)
							try { https = require("https"); } catch(ex){ console.error("Unable to load `https`"); throw 'LIB-MISSING-HTTPS'; }
						}

						// AUTH: Cookie is required for GET and POST
						objAjaxQuery.headers["Cookie"] = APP_OPTS.nodeCookie;
						// IMPORTANT: 'Content-Length' is required for file upload (etc.), otherwise, SP drops the connection immediately: (-1, System.IO.IOException)
						if (objAjaxQuery.data) objAjaxQuery.headers["Content-Length"] = objAjaxQuery.data.length;
						var options = {
							hostname: APP_OPTS.nodeServer,
							path:     objAjaxQuery.url,
							method:   objAjaxQuery.type,
							headers:  objAjaxQuery.headers
						};
						var request = https.request(options, function(res){
							var rawData = '';
							res.setEncoding('utf8');
							res.on('data', function(chunk){ rawData += chunk; });
							res.on('end', function(){
								// NOTE: SP errors come here, not `res.on(error)`, so check for errors!
								if ( rawData.indexOf('HTTP Error') > -1 ) {
									/* EX: bad URL is returned as
										<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN""http://www.w3.org/TR/html4/strict.dtd">
										<HTML><HEAD><TITLE>Bad Request</TITLE>
										<META HTTP-EQUIV="Content-Type" Content="text/html; charset=us-ascii"></HEAD>
										<BODY><h2>Bad Request - Invalid URL</h2>
										<hr><p>HTTP Error 400. The request URL is invalid.</p>
										</BODY></HTML>
									*/
									reject();
								}
								else if ( rawData.indexOf('{"error"') > -1 && rawData.indexOf('{"code"') > -1 ) {
									// EX: {"error":{"code":"-1, Microsoft.SharePoint.SPException","message":{"lang":"en-US","value":"The field or property 'ColDoesntExist' does not exist."}}}
									// EX: {"error":{"code":"-1, Microsoft.SharePoint.Client.InvalidClientQueryException","message":{"lang":"en-US","value":"A node of type 'EndOfInput' was read from the JSON reader when trying to read the start of an entry. A 'StartObject' node was expected."}}}
									reject( JSON.parse(rawData).error.message.value + "\n\nURL used: " + objAjaxQuery.url );
								}
								else {
									resolve(rawData);
								}
							});
							res.on('error', function(e){
								reject( JSON.parse(rawData).error.message.value + "\n\nURL used: " + objAjaxQuery.url );
							});
						});
						// POST: Data is sent to SP via `write`
						if ( objAjaxQuery.data ) request.write(objAjaxQuery.data);
						request.end();
					}
					else {
						// A:
						var request = new XMLHttpRequest();
						if ( inOpt.headers && inOpt.headers.binaryStringResponseBody ) request.responseType = 'arraybuffer';

						request.open(objAjaxQuery.type, objAjaxQuery.url, true);

						// B:
						Object.keys(objAjaxQuery.headers || {}).forEach(function(key){
							request.setRequestHeader(key, objAjaxQuery.headers[key]);
						});

						// C:
						request.onload = function() {
							if ( request.status >= 200 && request.status < 400 ) {
								if ( inOpt.headers && inOpt.headers.binaryStringResponseBody ) {
									resolve(request.response); // ArrayBuffer
								}
								else {
									// Try XML first as `owssvr` (versions) query returns a true XML document
									resolve(request.responseXML || request.responseText);
								}
							}
							else {
								reject(parseErrorMessage(request) + "\n\nURL used: " + objAjaxQuery.url);
							}
						};

						// D:
						request.onerror = function() {
							reject( parseErrorMessage(request) + "\n\nURL used: " + objAjaxQuery.url );
						};

						// E:
						request.send( objAjaxQuery.data ? objAjaxQuery.data : null );
					}
				})
				.catch(function(strErr){
					reject(strErr);
				});
			})
			.then(function(data){
				// Handle `binaryStringResponseBody` option (data is base64 string)
				if ( inOpt.headers && inOpt.headers.binaryStringResponseBody ) {
					resolve( data );
				}
				else {
					// A: Parse string to JSON if needed
					data = ( typeof data === 'string' && data.indexOf('{') == 0 ? JSON.parse(data) : data );

					// B: If result is a single object, make it an array for pasing below (Ex: '_api/site/Owner/Id')
					var arrObjResult = ( data && data.d && !data.d.results && typeof data.d === 'object' && Object.keys(data.d).length > 0 ? [data.d] : [] );

					// C: Iterate over results
					// NOTE: Depending upon which REST endpoint used, SP can return results in various forms (!)
					// EX..: data.d.results is an [] of {}: [ {Title:'Brent Ely', Email:'Brent.Ely@microsoft.com'}, {}, {} ]
					// NOTE: Ensure results are an object because SP will return an entire HTML page as a result in some error cases!
					if ( objAjaxQuery.url.toLowerCase().indexOf('owssvr.dll') > -1 && objAjaxQuery.url.toLowerCase().indexOf('includeversions=true') > -1 ) {
						// IE11: When using jQuery AJAX for AppendText/Versions/getVersions, the `data` result must be parsed directly (no conversion) using `(data).find("z:row")`
						inOpt.spArrData.push( data );
					}
					else if ( arrObjResult.length > 0 || (data && data.d && data.d.results && typeof data.d.results === 'object') ) {
						(arrObjResult.length > 0 ? arrObjResult : data.d.results).forEach(function(result){
							var objRow = {};

							// A: Add select columns
							if ( inOpt.queryCols ) {
								// NOTE: `queryCols` can be either an object or an array
								if ( Array.isArray(inOpt.queryCols) ) {
									inOpt.queryCols.forEach(function(key){
										objRow[key] = ( APP_OPTS.cleanColHtml && col.listDataType == 'string' ? colVal.replace(/<div(.|\n)*?>/gi,'').replace(/<\/div>/gi,'') : colVal );
									});
								}
								else {
									Object.keys(inOpt.queryCols).forEach(function(key){
										var col = inOpt.queryCols[key];
										var arrCol = [];
										var colVal = "";

										// B.3.1: Get value(s) for this key

										// Handle Lookups that return an array of 'results' (eg: `LookupMulti`)
										if ( col.dataName && col.dataName.indexOf('/') > -1
											&& result[col.dataName.split('/')[0]] && result[col.dataName.split('/')[0]].results )
										{
											// A:
											// NOTE: `listCols` can have "Dept/Id" and "Dept/Title", but SP only returns *ONE* result with both vals
											// ....: So, skip any subsequent listCol's once results have been captured
											if ( objRow[key] ) return;

											// B: Default for this column type is empty array as multi-lookup returns an array of `results`
											colVal = [];

											// C: Add any results
											result[col.dataName.split('/')[0]].results.forEach(function(objResult,idx){
												// EX: {__metadata:Object, Id:2, Title:"Human Resources"}
												if ( objResult.__metadata ) delete objResult.__metadata;
												// Capture any-and-all columns returned (aside from removal of above)
												colVal.push( objResult );
											});
										}
										// Handle Lookup/Person/Url/etc. Ex: 'Manager/Title'
										else if ( col.dataName && col.dataName.indexOf('/') > -1 ) {
											// NOTE: While most lookups are single-level ('Manager/Title') there can be deeper levels as well ('Users/Member/Id')
											// NOTE: dataName will be comma-sep fields when colName is an object with fields. (Ex: "Member/Users/Id,Member/Users/Title")
											// Loop over each field. Ex: 'Member/Id,Member/Title'->['Member/Id','Member/Title']
											col.dataName.split(',').forEach(function(strField,idx){
												// A: Split lookup name
												var arrKeys = strField.split('/');

												// B: Remove extraneous `__metadata` and `__deferred` objects
												if ( result[arrKeys[0]] && result[arrKeys[0]].__metadata ) delete result[arrKeys[0]].__metadata;
												if ( result[arrKeys[0]] && result[arrKeys[0]].__deferred ) delete result[arrKeys[0]].__deferred;

												// C: Some lookups return arrays. Ex: 'Member/Users/Id' result => { Member:{ Users:{ results:[] } } }
												// HACK(ish): Avoid complex algorithm and only support up to 2-5 levels deep
												var lastChild = null;
												if ( arrKeys.length == 2 ) {
													// C.1:
													lastChild = result[arrKeys[0]];
													if ( lastChild && typeof lastChild === 'object' && Object.keys(lastChild)[0] == 'results' ) {
														result[arrKeys[0]] = lastChild.results;
													}
													// C.2: Capture value
													// CASE 1: `dataName` was passed in by user: return the actual field user asked for.
													// EXAMPLE: `Title: { dataName:'Member/Title' }` = return Title:Title (not a Member.Title object)
													// NOTE: Detect use of names listCols by comparing key to dataName
													if ( key != arrKeys[0] && key != col.dataName ) colVal = result[arrKeys[0]][arrKeys[1]];
													// CASE 2: Other - in this case return the complete object (Ex: { Title:'Manager' })
													// IMPORTANT: This de facto returns all the *other* fields queried. Eg: 'Manager/Id' and 'Manager/Title' were in cols
													// We want to return a *single* object with these 2 elements, so they can be derefereced using 'Manger.Title' etc.
													// Capture any-and-all columns returned (aside from removal of above)
													else colVal = result[arrKeys[0]];
												}
												else if ( arrKeys.length == 3 ) {
													// C.1:
													lastChild = result[arrKeys[0]][arrKeys[1]];
													if ( lastChild && typeof lastChild === 'object' && Object.keys(lastChild)[0] == 'results' ) {
														result[arrKeys[0]][arrKeys[1]] = lastChild.results;
													}
													// C.2: Capture value
													colVal = ( key != arrKeys[0] && key != col.dataName ? result[arrKeys[0]][arrKeys[1]][arrKeys[2]] : result[arrKeys[0]] );
												}
												else if ( arrKeys.length == 4 ) {
													// C.1:
													lastChild = result[arrKeys[0]][arrKeys[1]][arrKeys[2]];
													if ( lastChild && typeof lastChild === 'object' && Object.keys(lastChild)[0] == 'results' ) {
														result[arrKeys[0]][arrKeys[1]][arrKeys[2]] = lastChild.results;
													}
													// C.2: Capture value
													colVal = ( key != arrKeys[0] && key != col.dataName ? result[arrKeys[0]][arrKeys[1]][arrKeys[2]][arrKeys[3]] : result[arrKeys[0]] );
												}
												else if ( arrKeys.length > 4 ) {
													console.log('This is madness!!');
												}
											});

											// D: Value clean-up (things like empty multi-person fields may end up being `{}`)
											if ( typeof colVal === 'object' && !Array.isArray(colVal) && Object.keys(colVal).length == 0 ) colVal = [];
										}
										else if ( col.dataName ) {
											arrCol = col.dataName.split('/');
											colVal = ( arrCol.length > 1 ? result[arrCol[0]][arrCol[1]] : result[arrCol[0]] );
										}

										// DESIGN: If `dataType` exists, then transform result
										// TODO: vvv this is old right?
										if ( col.dataType == 'DateTime' ) objRow[key] = new Date(colVal);
										else objRow[key] = ( APP_OPTS.cleanColHtml && col.listDataType == 'string' ? colVal.replace(/<div(.|\n)*?>/gi,'').replace(/<\/div>/gi,'') : colVal );
									});
								}
							}
							else {
								Object.keys(result).forEach(function(key){
									var val = result[key];
									objRow[key] = val;
								});
							}

							// B: Remove metadata unless the option to return it is set
							if ( objRow.__metadata && !inOpt.metadata ) delete objRow.__metadata;

							// C: Support "next" functionality
							if ( data.d.__next ) {
								var objSkip = { prevId:'', maxItems:'' };
								data.d.__next.split('&').forEach(function(str,idx){
									if ( str.indexOf('p_ID%3d') > -1 ) {
										objSkip.prevId = str.split('&')[0].split('%3d')[2];
									}
									else if ( str.indexOf('%24top=') > -1 ) {
										objSkip.maxItems = str.substring(str.lastIndexOf('=')+1);
									}
								});
								if ( objSkip.prevId && objSkip.maxItems ) objRow.__next = objSkip;
							}

							// D: Add this row
							inOpt.spArrData.push( objRow );
						});
					}
					// EX..: data.d or data is an [object]: { listTitle:'Game Systems', numberOfItems:25 }
					else if ( (data && data.d ? data.d : (data ? data : false)) && typeof (data.d || data) === 'object' && Object.keys(data.d || data).length > 0 ) {
						var objRow = {};
						var objData = (data.d || data);

						Object.keys(objData).forEach(function(key){
							var result = objData[key];
							objRow[key] = result;
						});

						if ( objRow.__metadata && !inOpt.metadata ) delete objRow.__metadata;
						inOpt.spArrData.push( objRow );
					}

					// D:
					resolve( inOpt.spArrData );
				}
			})
			.catch(function(strErr){
				// ROBUST: Renew token when needed (use `gRetryCounter` to prevent race condition)
				// CASE '403': SP2013-2016 Expired Token error: Microsoft.SharePoint.SPException (-2130575252): "X-RequestDigest expired form digest"
				// var strErrCode = jqXHR.status.toString();
				// var strSpeCode = JSON.parse(jqXHR.responseText).error['code'].split(',')[0];
				// INFO: ( strErrCode == '403' && strSpeCode == '-2130575252' )
				if ( !APP_OPTS.isNodeEnabled && typeof strErr == 'string' && strErr.indexOf('(403)') > -1 && gRetryCounter <= APP_OPTS.maxRetries ) {
					Promise.resolve()
					.then(function(){
						return sprLib.renewSecurityToken();
					})
					.then(function(){
						var digest = (document && document.getElementById('__REQUESTDIGEST') ? document.getElementById('__REQUESTDIGEST').value : null);
						if (DEBUG) console.log('err-403: token renewed');
						// Some operations (ex: CRUD) will include the token value in header. It must be refreshed as well (or the new tolem is pointless!)
						if ( inOpt.headers && inOpt.headers['X-RequestDigest'] ) inOpt.headers['X-RequestDigest'] = digest;
						gRetryCounter++;
						sprLib.rest(inOpt);
					});
				}
				else {
					gRetryCounter = 0;
					reject(strErr);
				}
			});
		});
	}

	// API: SITE (or WEB)
	/**
	* NOTE: `site` and `web` may be used interchangably (`/_api/site` is the top-level Web site and all its subsites)
	* `web` is a securable web resource (aka: a SP website)
	* https://msdn.microsoft.com/library/microsoft.sharepoint.spsite "top-level Web site and all its subsites. Each SPSite object, or site collection, is represented within an SPSiteCollection object"
	*/
	sprLib.site = function site(inUrl) {
		// Variables
		var _newSite = {};
		var _urlBase = (inUrl ? (inUrl+'/').replace(/\/+$/g,'/') : ''); // Guarantee that baseUrl will end with a forward slash

		/**
		* Get Site information:
		* Keys: (AssociatedMemberGroup, AssociatedOwnerGroup, AssociatedVisitorGroup, Created, Description, Id, Language, LastItemModifiedDate, LastItemUserModifiedDate, Owner, RequestAccessEmail, SiteLogoUrl, Title, Url, WebTemplate)
		*
		* @example - no args - omitting arguments means "current site"
		* sprLib.site().info().then( objSite => console.table([objSite]) );
		*
		* @example - get site by ID
		* sprLib.site({ id:'12345-abcd-12345' }).info().then(objSite => console.table([objSite]));
		*
		* @return {Promise} - return `Promise` containing Site info object
		*/
		_newSite.info = function() {
			return new Promise(function(resolve, reject) {
				Promise.all([
					sprLib.rest({
						url: _urlBase+'_api/web',
						queryCols: ['Id','Title','Description','Language','Created',
							'LastItemModifiedDate','LastItemUserModifiedDate','RequestAccessEmail','SiteLogoUrl','Url','WebTemplate',
							'AssociatedOwnerGroup/Id',        'AssociatedMemberGroup/Id',        'AssociatedVisitorGroup/Id',
							'AssociatedOwnerGroup/OwnerTitle','AssociatedMemberGroup/OwnerTitle','AssociatedVisitorGroup/OwnerTitle',
							'AssociatedOwnerGroup/Title',     'AssociatedMemberGroup/Title',     'AssociatedVisitorGroup/Title'
						],
						cache: false
					}),
					sprLib.rest({
						url: _urlBase+'_api/site',
						queryCols: ['Owner/Email','Owner/LoginName','Owner/Title','Owner/IsSiteAdmin'],
						cache: false
					})
				])
				.then(function(arrAllArrays){
					// A: Combine results into one object
					var objSite = arrAllArrays[0][0];
					objSite.Owner = arrAllArrays[1][0].Owner;

					// B: Remove junky metadata
					delete objSite.Owner.__metadata;
					delete objSite.AssociatedMemberGroup.__metadata;
					delete objSite.AssociatedOwnerGroup.__metadata;
					delete objSite.AssociatedVisitorGroup.__metadata;

					// C: Remove columns that may not be present
					// `LastItemUserModifiedDate` exists in SP2016/SharePoint-Online, but not in SP2013 on-prem
					if ( objSite.hasOwnProperty('LastItemUserModifiedDate') && !objSite.LastItemUserModifiedDate ) delete objSite.LastItemUserModifiedDate;

					// D: Resolve results (NOTE: if site was not found, an empty object is the correct result)
					resolve( objSite );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get Site Lists/Libraries (name and about 12 other fields)
		*
		* @example
		* sprLib.site().lists().then( function(arr){ console.table(arr) } );
		*
		* @return {Promise} - Return `Promise` containing Site Lists/Libraries
		*/
		_newSite.lists = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: _urlBase+'_api/web/lists',
					queryCols: [
						'Id','Title','Description','ItemCount','BaseType','BaseTemplate','Hidden','ImageUrl','ParentWebUrl','RootFolder/ServerRelativeUrl'
					]
				})
				.then(function(arrData){
					// A: Modify some values
					arrData.forEach(function(item,idx){
						// A: Flatten/Elevate `ServerRelativeUrl` value
						item.ServerRelativeUrl = (item.RootFolder && item.RootFolder.ServerRelativeUrl ? item.RootFolder.ServerRelativeUrl : null);
						if ( item.RootFolder ) delete item.RootFolder;

						// B: Decode type
						item.BaseType = ENUM_BASETYPES[item.BaseType] || item.BaseType;
					});

					// B: Resolve results (NOTE: empty array is the correct default result)
					resolve( arrData || [] );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get Subsites
		*
		* @return {Promise} - return `Promise` containing Subsites
		*/
		_newSite.subsites = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: _urlBase+'_api/web/webs',
					queryCols: {
						Id:				{ dataName:'Id'						,dispName:'Id'					},
						Name:			{ dataName:'Title'					,dispName:'Subsite Name'		},
						UrlAbs:			{ dataName:'Url'					,dispName:'Absolute URL'		},
						UrlRel:			{ dataName:'ServerRelativeUrl'      ,dispName:'Relative URL'		},
						Created:		{ dataName:'Created'				,dispName:'Date Created'		},
						Modified:		{ dataName:'LastItemModifiedDate'	,dispName:'Date Last Modified'	},
						Language:		{ dataName:'Language'				,dispName:'Language'			},
						SiteLogoUrl:	{ dataName:'SiteLogoUrl'			,dispName:'Site Logo URL'		}
					}
				})
				.then(function(arrData){
					// A: Resolve results (NOTE: empty array is the correct default result)
					resolve( arrData || [] );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get Site base permissions
		* Returns array of objects with `Member` and `Roles` properties
		*
		* @example - sprLib.site().perms().then( arr => console.table(arr) );
		* //.--------------------------------------------------------------------------------------------------------------------------------------------------.
		* //|                                    Member                                    |                               Roles                               |
		* //|------------------------------------------------------------------------------|-------------------------------------------------------------------|
		* //| {"Title":"Brent Ely",   "PrincipalType":"User",            "PrincipalId":9}  | [{"Hidden":false,"Name":"Design"},{"Hidden":false,"Name":"Edit"}] |
		* //| {"Title":"Dev Owners",  "PrincipalType":"SharePoint Group","PrincipalId":14} | [{"Hidden":false,"Name":"Full Control"}]                          |
		* //| {"Title":"Dev Members", "PrincipalType":"SharePoint Group","PrincipalId":15} | [{"Hidden":false,"Name":"Edit"}]                                  |
		* //| {"Title":"Dev Visitors","PrincipalType":"SharePoint Group","PrincipalId":16} | [{"Hidden":false,"Name":"Read"}]                                  |
		* //'--------------------------------------------------------------------------------------------------------------------------------------------------'
		*
		* @return {Promise} - return `Promise` containing Site Permission object { Member:{}, Roles:[] }
		*/
		_newSite.perms = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: _urlBase+'_api/web/roleAssignments',
					queryCols: ['PrincipalId','Member/PrincipalType','Member/Title','RoleDefinitionBindings/Name','RoleDefinitionBindings/Hidden']
				})
				.then(function(arrData){
					// STEP 1: Transform: Results s/b 2 keys with props inside each
					arrData.forEach(function(objItem,idx){
						// A: "Rename" the `RoleDefinitionBindings` key to be user-friendly
						Object.defineProperty(objItem, 'Roles', Object.getOwnPropertyDescriptor(objItem, 'RoleDefinitionBindings'));
						delete objItem.RoleDefinitionBindings;

						// B: Move `PrincipalId` inside {Member}
						objItem.Member.PrincipalId = objItem.PrincipalId;
						delete objItem.PrincipalId;

						// C: Decode PrincipalType into text
						objItem.Member.PrincipalType = ENUM_PRINCIPALTYPES[objItem.Member.PrincipalType] || objItem.Member.PrincipalType;
					});

					// TODO?: OPTION: "Show Group Members", then do lookups below, otherwise, just show users/group names
					// TODO?: use PrincipalType to find groups and query for thier users, then the full picture is done!
					//.then(arrOwnerId => { return sprLib.rest({ url:site.UrlAbs+'/_api/web/SiteGroups/GetById('+ arrOwnerId[0].Id +')/Users', queryCols:['Title','Email'] }) })
					//.then(arrUsers   => arrUsers.forEach((user,idx) => site.OwnersGroupUsers += ('<div class="itemBox">'+ user.Title +'<span style="display:none">; </span></div>') ))

					// STEP 2: Resolve results (NOTE: empty array is the correct default result)
					resolve( arrData || [] );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get SiteCollection Roles
		*
		* @return {Promise} - return `Promise` containing Roles
		*/
		_newSite.roles = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: _urlBase+'_api/web/roleDefinitions',
					queryCols: ['Id','Name','Description','RoleTypeKind','Hidden']
				})
				.then(function(arrData){
					// A: Resolve results (NOTE: empty array is the correct default result)
					resolve( arrData || [] );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get all Groups under the SiteCollection or the Groups under a given Subsite
		*
		* @example
		* //.----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------.
		* //| Id |             Description            |         Title          |    OwnerTitle     |  PrincipalType   | AllowMembersEditMembership |                     Users                                         |
		* //|----|------------------------------------|------------------------|-------------------|------------------|----------------------------|-------------------------------------------------------------------|
		* //|  8 | contribute permissions: Dev Site   | Dev Site Members       | Dev Site Owners   | SharePoint Group | true                       | []                                                                |
		* //|  6 | full control permissions: Dev Site | Dev Site Owners        | Dev Site Owners   | SharePoint Group | false                      | [{"Id":99,"LoginName":"brent@microsoft.com","Title":"Brent Ely"}] |
		* //|  7 | read permissions: Dev Site         | Dev Site Visitors      | Dev Site Owners   | SharePoint Group | false                      | []                                                                |
		* //.----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------.
		*
		* @return {Promise} - return `Promise` containing Groups
		*/
		_newSite.groups = function(inOpt) {
			return new Promise(function(resolve, reject) {
				var arrData = [];
				var arrQuery = [];

				// STEP 1: Options check
				if ( inOpt && Object.keys(inOpt).length > 0 && !inOpt.hasOwnProperty('id') && !inOpt.hasOwnProperty('title') ) {
					console.warn('Warning..: Check your options! Available `site().groups()` options are: `id`,`title`');
					console.warn('Result...: Invalid filter option: All site groups will be returned');
					// NOTE: Treat junk filter as null (return all Groups)
					inOpt = null;
				}

				// TODO: Add all the keys SiteGroups/RoleAssignments (not just the few we specify - SP returns like 10)

				// STEP 2: Query group(s)
				// LOGIC: If `inUrl` exists, then just get the Groups from that site, otherwise, return SiteCollection Groups
				if ( inUrl ) {
					var strFilter = 'Member/PrincipalType eq 8'; // Default is all groups (type=8)
					if ( inOpt && inOpt.id ) strFilter = "Member/Id eq "+inOpt.id;
					else if ( inOpt && inOpt.title ) strFilter = "Member/Title eq '"+inOpt.title+"'";

					// STEP 1: Get Groups
					sprLib.rest({
						url: _urlBase+'_api/web/RoleAssignments',
						queryCols: [
							'Member/Id','Member/Title','Member/Description','Member/OwnerTitle',
							'Member/PrincipalType','Member/AllowMembersEditMembership',
							'Member/Users/Id','Member/Users/LoginName','Member/Users/Title'
						],
						queryFilter: strFilter,
						queryLimit: APP_OPTS.maxRows
					})
					.then(function(arrGroups){
						// TODO: in `// A: Filter internal/junk groups` below, we filter and not here

						// A: Create/Populate array of Groups and Promises
						arrGroups.forEach(function(grp,idx){
							arrData.push({
								Id: grp.Member.Id,
								Title: grp.Member.Title,
								Description: grp.Member.Description,
								OwnerTitle: grp.Member.OwnerTitle,
								PrincipalType: (ENUM_PRINCIPALTYPES[grp.Member.PrincipalType] || grp.Member.PrincipalType),
								AllowMembersEditMembership: grp.Member.AllowMembersEditMembership,
								Users: grp.Member.Users.map(function(user){ if (user.__metadata) delete user.__metadata; return user; })
							});
						});

						// Resolve results (NOTE: empty array is the correct default result)
						resolve( arrData || [] );
					})
					.catch(function(strErr){
						reject( strErr );
					});
				}
				else {
					var strFilter = ''; // Default is empty filter
					if ( inOpt && inOpt.id ) strFilter = "Id eq "+inOpt.id;
					else if ( inOpt && inOpt.title ) strFilter = "Title eq '"+inOpt.title+"'";

					sprLib.rest({
						url: _urlBase+'_api/web/SiteGroups',
						queryCols: [
							'Id','Title','Description','OwnerTitle',
							'PrincipalType','AllowMembersEditMembership',
							'Users/Id','Users/LoginName','Users/Title'
						],
						queryFilter: strFilter,
						queryLimit: APP_OPTS.maxRows
					})
					.then(function(arrData){
						// A: Filter internal/junk groups
						if ( arrData && Array.isArray(arrData) ) {
							arrData = arrData.filter(function(group){ return group.Title.indexOf('SharingLinks') == -1 });
						}

						// B: Decode PrincipalType
						arrData.forEach(function(item,idx){ item.PrincipalType = ENUM_PRINCIPALTYPES[item.PrincipalType] || item.PrincipalType });

						// C: Resolve results (NOTE: empty array is the correct default result)
						resolve( arrData || [] );
					})
					.catch(function(strErr){
						reject( strErr );
					});
				}
			});
		}

		/**
		* Get SiteCollection (all) Users or Site (subsite) Users
		*
		* @example
		* //.--------------------------------------------------------------------------------------------------------------------------------------.
		* //| Id |               LoginName               |   Title   |        Email        | IsSiteAdmin |                 Groups                  |
		* //|----|---------------------------------------|-----------|---------------------|-------------|-----------------------------------------|
		* //|  9 | i:0#.f|membership|brent@microsoft.com | Brent Ely | brent@microsoft.com | true        | [{"Id":14,"Title":"Child Site Owners"}] |
		* //'--------------------------------------------------------------------------------------------------------------------------------------'
		*
		* @return {Promise} - return `Promise` containing Users
		*/
		_newSite.users = function(inOpt) {
			return new Promise(function(resolve, reject) {
				// STEP 1: Options check
				if ( inOpt && Object.keys(inOpt).length > 0 && !inOpt.hasOwnProperty('id') && !inOpt.hasOwnProperty('title') ) {
					console.warn('Warning..: Check your options! Available `site().users()` options are: `id`,`title`');
					console.warn('Result...: Invalid filter option: All site users will be returned');
					// NOTE: Treat junk filter as null (return all Groups)
					inOpt = null;
				}

				// STEP 2: Query group(s)
				// LOGIC: If `inUrl` exists, then just get the Groups from that site, otherwise, return SiteCollection Groups
				if ( inUrl ) {
					// NOTE: Site `users` are: Users with RoleAssignments -plus- all users in Groups with RoleAssignments
					// A: Get User [direct] grants/perms
					// B: Get Group Members [Users] that have grants/perms from group membership
					// FIXME: LIMIT: Library only supports up to APP_OPTS.maxRows results! TODO: add paging
					Promise.all([
						sprLib.rest({
							url: _urlBase+'_api/web/RoleAssignments',
							queryCols: ['Member/Id','Member/Email','Member/LoginName','Member/Title','Member/IsSiteAdmin'],
							queryFilter: 'Member/PrincipalType eq 1',
							queryLimit: APP_OPTS.maxRows
						}),
						sprLib.rest({
							url: _urlBase+'_api/web/RoleAssignments',
							queryCols: ['Member/Id','Member/Title','Member/Users/Id','Member/Users/Email','Member/Users/LoginName','Member/Users/Title','Member/Users/IsSiteAdmin'],
							queryFilter: 'Member/PrincipalType eq 8',
							queryLimit: APP_OPTS.maxRows
						})
					])
					.then(function(arrAllArrays){
						// STEP 1: Compile results
						var arrSiteUsers = [];
						var objTempUsers = {};

						// A: Result is an array of user objects
						// EX: [ {Member: {Id:9,Title:'Brent'}}, {Member:[...]} ]
						arrAllArrays[0].forEach(function(obj){
							obj.Member.Groups = [];
							if (
								!inOpt
								|| ( inOpt && inOpt.id    && inOpt.id    == obj.Member.Id    )
								|| ( inOpt && inOpt.title && inOpt.title == obj.Member.Title )
							) {
								arrSiteUsers.push( obj.Member );
								objTempUsers[obj.Member.Id] = obj.Member;
							}
						});

						// B: Result is an array of `Member` objects
						// EX: [ {Member: {Id:1, Title:'Members', Users:[{Id:9,Title:'Brent'},{Id:10,Title:'Elon Musk'}]}}, {Member:[...]} ]
						arrAllArrays[1].forEach(function(obj){
							if ( obj.Member.Users && obj.Member.Users.length > 0 ) {
								obj.Member.Users.forEach(function(user){
									// A: Remove __metadata (if any - since it's in a sub-object, `metadata:false` will not guarantee absence)
									if ( user.__metadata ) delete user.__metadata;

									if (
										!inOpt
										|| ( inOpt && inOpt.id    && inOpt.id    == user.Id    )
										|| ( inOpt && inOpt.title && inOpt.title == user.Title )
									) {
										// B: Add group
										if ( !user.Groups ) user.Groups = [];
										user.Groups.push({ Id:obj.Member.Id, Title:obj.Member.Title });

										// C: Add User or Add this Group to existing User (ensure uniqueness)
										if ( !objTempUsers[user.Id] ) {
											arrSiteUsers.push( user );
											objTempUsers[user.Id] = obj.Member;
										}
										else {
											if ( !objTempUsers[user.Id].Groups ) objTempUsers[user.Id].Groups = [];
											objTempUsers[user.Id].Groups.push({ Id:obj.Member.Id, Title:obj.Member.Title });
										}
									}
								});
							}
						});

						// LAST: Resolve results (NOTE: empty array is the correct default result)
						resolve( arrSiteUsers || [] );
					})
					.catch(function(strErr){
						reject( strErr );
					});
				}
				else {
					// SiteCollection [All] Users
					sprLib.rest({
						url: _urlBase+'_api/web/SiteUsers',
						queryCols: ['Id','Email','LoginName','Title','IsSiteAdmin','Groups/Id','Groups/Title'],
						queryFilter: 'PrincipalType eq 1',
						queryLimit: APP_OPTS.maxRows
					})
					.then(function(arrData){
						var arrSiteUsers = [];

						// A: Compile results
						arrData.forEach(function(user){
							if (
								!inOpt
								|| ( inOpt && inOpt.id    && inOpt.id    == user.Id    )
								|| ( inOpt && inOpt.title && inOpt.title == user.Title )
							) {
								// B: Filter internal/junk users
								if ( user.Title.indexOf('spocrwl') == -1 && user.Id < 1000000000 ) arrSiteUsers.push(user)
							}
						});

						// B: Resolve results (NOTE: empty array is the correct default result)
						resolve( arrSiteUsers || [] );
					})
					.catch(function(strErr){
						reject( strErr );
					});
				}
			});
		}

		// TODO: FUTURE: contentTypes & Features
		/*
			_newSite.contentTypes = function() {
				// ContentTypes: https://contoso.sharepoint.com/sites/dev/_api/web/ContentTypes
			}
			_newSite.features = function() {
				// Features: https://contoso.sharepoint.com/sites/dev/_api/site/Features
			}
		*/

		// TODO: FUTURE: Usage
		/*
			FYI:
			/sites/dev/_api/site/Usage
			/sites/dev/sandbox/_api/site/Usage
			^^^ same result (Storage is whole site collection - not individual webs!)

			sprLib.rest({
				url: '_api/site/usage',
				queryCols: ['Usage/Storage','Usage/StoragePercentageUsed']
			})
			<d:Usage xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:georss="http://www.georss.org/georss" xmlns:gml="http://www.opengis.net/gml" m:type="SP.UsageInfo">
				<d:Bandwidth m:type="Edm.Int64">0</d:Bandwidth>
				<d:DiscussionStorage m:type="Edm.Int64">0</d:DiscussionStorage>
				<d:Hits m:type="Edm.Int64">0</d:Hits>
				<d:Storage m:type="Edm.Int64">512050423</d:Storage>
				<d:StoragePercentageUsed m:type="Edm.Double">1.8628285870363472E-05</d:StoragePercentageUsed>
				<d:Visits m:type="Edm.Int64">0</d:Visits>
			</d:Usage>
		*/

		// LAST: Return this List to enable chaining
		return _newSite;
	}

	// API: USER (Current or Query User by Props)
	sprLib.user = function user(inOpt) {
		var _newUser = {};
		var _urlBase = "_api/Web";
		var _urlProf = "_api";
		var _urlRest = "/CurrentUser?"; // Default to current user if no options were provided

		// STEP 1: Options setup/check
		// A: Options check
		// Check for existance of any keys to filter out `{}` that is sometimes passed - dont warn about those, treat as empty
		if ( inOpt && Object.keys(inOpt).length > 0
			&& !inOpt.hasOwnProperty('id') && !inOpt.hasOwnProperty('email')
			&& !inOpt.hasOwnProperty('login') && !inOpt.hasOwnProperty('title') && !inOpt.hasOwnProperty('baseUrl') )
		{
			console.warn('Warning: Unknown option(s) passed. Available `user()` options are: `baseUrl`,`id`,`email`,`login`,`title`');
			console.warn('Result: The current user is being returned');
			inOpt = {}; // NOTE: Treat junk params as null (Clear options to remove junk entries)
		}
		// B: Ensure an `inOpt` value going forward
		inOpt = inOpt || {};

		// STEP 2: Set `baseUrl`
		if ( inOpt.hasOwnProperty('baseUrl') ) {
			_urlBase = ( inOpt.baseUrl.toString().replace(/\/+$/,'') + '/_api/Web');
			_urlProf = ( inOpt.baseUrl.toString().replace(/\/+$/,'') + '/_api');
		}

		// STEP 3: Build query URL based on whether its current user (no parameter) or a passed in object
		// NOTE: Use CurrentUser service as it is included in SP-Foundation and will work for everyone
		// ....: (Users will need SP-Enterprise for UserProfiles service to work)
		// NOTE: `_api/Web/GetUserById()` for non-existant users results in a heinous error 500 that chokes jQuery.ajax.fail(),
		// ....: so dont use it, or check user id with `siteusers?$filter` first!
		if      ( inOpt && inOpt.id    ) _urlRest = "/siteusers?$filter=Id%20eq%20"+           inOpt.id    +"&";
		else if ( inOpt && inOpt.email ) _urlRest = "/siteusers?$filter=Email%20eq%20%27"+     inOpt.email +"%27&";
		else if ( inOpt && inOpt.login ) _urlRest = "/siteusers?$filter=LoginName%20eq%20%27"+ inOpt.login.replace(/#/g,'%23') +"%27&";
		else if ( inOpt && inOpt.title ) _urlRest = "/siteusers?$filter=Title%20eq%20%27"+     inOpt.title +"%27&";

		// STEP 4: Build complete URL
		_urlRest = _urlBase + _urlRest;

		/**
		* Get user info: (`Id`, `Email`, `IsSiteAdmin`, `LoginName`, `PrincipalType`, `Title`)
		*
		* @example - no args - omitting arguments means "current user"
		* sprLib.user().info().then( function(objUser){ console.table(objUser) } );
		*
		* @example - get user by ID
		* sprLib.user({ id:1234 }).info().then( function(objUser){ console.table(objUser) } );
		*
		* @return {Promise} - return `Promise` containing User info object
		*/
		_newUser.info = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url    : _urlRest + "$select=Id,Title,Email,LoginName,IsSiteAdmin,PrincipalType",
					headers: { "Accept":"application/json;odata=verbose" },
					type   : "GET",
					cache  : false
				})
				.then(function(arrData){
					var objUser = {};

					// A: Gather user properties
					( arrData && Array.isArray(arrData) && arrData[0] && Object.keys(arrData[0]).length > 0 ? Object.keys(arrData[0]) : [] )
					.forEach(function(key,idx){
						objUser[key] = arrData[0][key];
					});

					// B: Resolve results - if user was not found, an empty object is the correct result
					resolve( objUser );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get user's groups (`Id`, `Title`)
		*
		* @example
		* sprLib.user().groups().then( function(objUser){ console.table(objUser) } );
		* sprLib.user(1234).groups().then( function(objUser){ console.table(objUser) } );
		*
		* @return {Promise} - Return `Promise` containing Group(s) info (`Id`, `Title`)
		*/
		_newUser.groups = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url    : _urlRest + "$select=Groups/Id,Groups/Title,Groups/Description,Groups/LoginName,Groups/OwnerTitle&$expand=Groups",
					headers: { "Accept":"application/json;odata=verbose" },
					type   : "GET",
					cache  : false
				})
				.then(function(arrData){
					var arrGroups = [];

					// A: Gather groups
					( arrData && arrData[0] && arrData[0].Groups && arrData[0].Groups.results ? arrData[0].Groups.results : [] )
					.forEach(function(group,idx){
						arrGroups.push({
							Id: group.Id,
							Title: group.Title,
							Description: group.Description,
							OwnerTitle: group.OwnerTitle,
							LoginName: group.LoginName
						});
					});

					// B: Resolve results
					resolve( arrGroups );
				})
				.catch(function(strErr){
					reject( strErr );
				});
			});
		}

		/**
		* Get User Profile properties (SP.UserProfiles.PersonProperties)
		*
		* @example sprLib.user().profile()
		* @example sprLib.user({ id:9 }).profile()
		* @example sprLib.user().profile('AccountName')
		* @example sprLib.user().profile(['AccountName','DisplayName'])
		*
		* @return {Promise} - Return `Promise` containing User Profile info
		*
		* @see: http://sharepoint.stackexchange.com/questions/207422/getting-user-profile-property-with-dash-in-name-with-rest-api
		* @see: [User Profile service](https://msdn.microsoft.com/en-us/library/office/dn790354.aspx)
		* also:
		* /sites/dev/_api/sp.userprofiles.profileloader.getprofileloader/getuserprofile - (The user profile of the current user)
		* /sites/dev/_api/sp.userprofiles.profileloader.getprofileloader/getuserprofile/AccountName
		* /sites/dev/_api/sp.userprofiles.profileloader.getowneruserprofile
		* http://siteurl/_api/SP.UserProfiles.PeopleManager/GetUserProfilePropertyFor(accountName=@v,propertyName='LastName')?@v='i:0%23.f|membership|brent@siteurl.onmicrosoft.com'
		* http://siteurl/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=PictureUrl,AccountName
		* sprLib.rest({
		*     url:  '_api/SP.UserProfiles.PeopleManager/GetMyProperties',
		*     queryCols: ['PictureUrl','AccountName']
		* })
		*/
		_newUser.profile = function(arrProfileKeys) {
			return new Promise(function(resolve, reject) {
				var arrQueryKeys = (Array.isArray(arrProfileKeys) ? arrProfileKeys : (typeof arrProfileKeys === 'string' ? [arrProfileKeys] : null));
				var userAcctName = (inOpt && inOpt.login ? encodeURIComponent(inOpt.login) : null);

				// STEP 1: Fetch current/specified User Profile Props
				Promise.resolve()
				.then(function(){
					// Per MSDN, the only way to select props is using `AccountName`, so fetch it if it was not passed in
					// Get Login/AccountName when something was passed (as opposed to null/'current user'), but not the AccountName
					if ( inOpt && !inOpt.login ) return sprLib.user( inOpt ).info();
				})
				.then(function(objUser){
					// A: Use LoginName if it was just queried
					if ( objUser ) userAcctName = encodeURIComponent(objUser.LoginName);

					// B: Fetch props
					// NOTE: Just fetch all props (no filter below) as `GetMyProperties?select=SID` returns nothing, but it's present when querying all props
					// NOTE: Both of these queries returns an object of [PersonProperties](https://msdn.microsoft.com/en-us/library/office/dn790354.aspx#bk_PersonProperties)
					if ( !userAcctName ) {
						return sprLib.rest({
							url: _urlProf+"/SP.UserProfiles.PeopleManager/GetMyProperties",
							metadata: false
						});
					}
					else {
						// NOTE: Encode "#" to "%23" or query fails!
						// NOTE: Per MSDN we can only query with `accountName`
						return sprLib.rest({
							url: _urlProf+"/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='"+userAcctName+"'",
							metadata: false
						});
					}
				})
				.then(function(arrProfileProps){
					var objProfile = {};

					// A: Cases where this fails (bad user, maybe no license?) REST returns {'GetPropertiesFor':null}
					if ( arrProfileProps && arrProfileProps[0] && arrProfileProps[0].hasOwnProperty('GetPropertiesFor') ) resolve( {} );

					// B: Capture all cols or just the ones specified
					if ( arrProfileProps[0] && Array.isArray(arrQueryKeys) && arrQueryKeys.length > 0 ) {
						arrQueryKeys.forEach(function(key){
							objProfile[key] = arrProfileProps[0][key] || 'ERROR: No such property exists in SP.UserProfiles.PeopleManager';
						});
					}
					else if ( arrProfileProps[0] ) {
						objProfile = arrProfileProps[0];
					}
					else {
						if (DEBUG) console.log('??? `arrProfileProps[0]` does not exist!');
					}

					// C: Clean data
					Object.keys(objProfile).forEach(function(key){
						// B.A: Remove `__metadata` and `ValueType` from each property
						if ( objProfile[key] && objProfile[key].__metadata ) delete objProfile[key].__metadata;
						if ( objProfile[key] && objProfile[key].ValueType  ) delete objProfile[key].ValueType;

						// B.B: Cleanup lookup-type prop values with their own `results` array
						if ( key == 'UserProfileProperties' ) { objProfile[key] = objProfile[key].results; }

						// B.C: Elevate `results` to the prop value. EX: `Peers:{__metadata:{...}, results:[]}`` -> `Peers:[]`
						if ( objProfile[key] && objProfile[key].results ) { objProfile[key] = objProfile[key].results; }
					});

					// D: Reduce `UserProfileProperties` array of objects to prop name/value
					// EX: [{"__metadata":{"type":"SP.KeyValue"},"Key":"UserProfile_GUID","Value":"712d9300-5d61-456b-95d1-123d29e5e0bc","ValueType":"Edm.String"},...]
					if ( objProfile.UserProfileProperties ) {
						var objProfileProps = {};
						objProfile.UserProfileProperties.forEach(function(obj){ objProfileProps[obj.Key] = obj.Value; });
						objProfile.UserProfileProperties = objProfileProps;
					}

					// E: Done
					resolve( Object.keys(objProfile).length == 0 ? {} : objProfile );
				})
				.catch(function(strErr){
					reject(strErr);
				});
			});
		}

		// LAST: Return this User to enable chaining
		return _newUser;
	}

	// API: UTILITY: Token
	sprLib.renewSecurityToken = function renewSecurityToken() {
		return doRenewDigestToken();
	}

	// API: NODEJS: Setup
	sprLib.nodeConfig = function nodeConfig(inOpt) {
		inOpt = (inOpt && typeof inOpt === 'object' ? inOpt : {});
		APP_OPTS.isNodeEnabled = (typeof inOpt.nodeEnabled !== 'undefined' ? inOpt.nodeEnabled : true);
		APP_OPTS.nodeCookie = inOpt.cookie || '';
		APP_OPTS.nodeServer = inOpt.server || '';
	}
})();

// IE11 Polyfill
if ( typeof window !== 'undefined' && window.NodeList && !NodeList.prototype.forEach ) {
	NodeList.prototype.forEach = function(callback, thisArg) {
		thisArg = thisArg || window;
		for (var i = 0; i < this.length; i++){ callback.call(thisArg, this[i], i, this); }
	};
}

// Export library if possible
if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = sprLib;
}
