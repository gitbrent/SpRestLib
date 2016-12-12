/*\
|*|  :: SpRestLib.js ::
|*|
|*|  JavaScript library for SharePoint web serices
|*|  https://github.com/gitbrent/SpRestLib
|*|
|*|  This library is released under the MIT Public License (MIT)
|*|
|*|  SpRestLib (C) 2016 Brent Ely -- https://github.com/gitbrent
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

/*
DEVLIST:
	* Add AppendText/Versions support (auto-query and populate most recent text when isAppend is TRUE)
	* Add logic we learned the hard way where FILTER cant have true/false but uses 0/1 due to MS bug
	* More filter functionality (only works with FOREACH+<table> for now)
	* add inline query/loop:
		* EX: <li data-bind:"foreach: {select:Hire_x0020_Date | filter:OwnerId eq 99 | expand: | orderBy: }">
	* Add support for using LIST-GUID (in addition to .listName) - `.listGUID`
FUTURE:
	* Support for turning LOOKUP values into a "text; text"-type output
*/

/*
CODE SAMPLE DUMPING GROUND (WIP):
---------------------------------
EX: Form Binding:
	<table data-bind='{ "foreach": {"model":"Reqs", "filter":{"col":"completed", "op":"eq", "val":false}}, "options":{"showBusySpinner":true} }'>
*/

(function(){
	// APP VERSION/BUILD
	var APP_VER = "0.9.0";
	var APP_BLD = "20161212";
	var DEBUG = false; // (verbose mode; lots of logging)
	// APP FUNCTIONALITY
	var APP_FILTEROPS = {
		"eq" : "==",
		"ne" : "!=",
		"gt" : ">",
		"gte": ">=",
		"lt" : "<",
		"lte": "<="
	};
	// APP DATA MODEL OBJECTS
	var APP_MODELS = {};
	// APP MESSAGE STRINGS (i18n Internationalization)
	var APP_STRINGS = {
		de: {
			"false" : "Nein",
			"noRows": "(Keine zeilen)",
			"true"  : "Ja"
		},
		en: {
			"false" : "No",
			"noRows": "(No rows)",
			"true"  : "Yes"
		},
		es: {
			"false" : "No",
			"noRows": "(No hay filas)",
			"true"  : "Sí"
		},
		fr: {
			"false" : "Non",
			"noRows": "(Aucune ligne)",
			"true"  : "Oui"
		},
		in: {
			"false" : "नहीं",
			"noRows": "(कोई पंक्तियाँ)",
			"true"  : "हाँ"
		}
	};

	// -----------------------------
	// USER-CONFIGURABLE: UI OPTIONS
	// -----------------------------
	var APP_OPTS = {
		baseUrl:         '..',
		busySpinnerHtml: '<div class="sprlib-spinner"><div class="sprlib-bounce1"></div><div class="sprlib-bounce2"></div><div class="sprlib-bounce3"></div></div>',
		cleanColHtml:    true,
		currencyChar:    '$',
		language:        'en',
		maxRetries:      5,
		maxRows:         1000,
		retryAfter:      1000
	};
	var APP_CSS = {
		updatingBeg: { 'background-color':'#e2e9ec' },
		updatingErr: { 'background-color':'#e2999c', 'color':'#fff' },
		updatingEnd: { 'background-color':'', 'color':'' }
	};

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

	function formatCurrency(n, c, d, t) {
		var c = isNaN(c = Math.abs(c)) ? 2 : c,
			d = (d == undefined)       ? "." : d,
			t = (t == undefined)       ? "," : t,
			s = (n < 0)                ? "-" : "",
			i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
			j = ((j = i.length) > 3)   ? (j % 3) : 0;
		return APP_OPTS.currencyChar + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	}

	function formatDate(inDate, inType) {
		var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

		// REALITY-CHECK:
		if ( !inDate ) return '';

		var dateLocal = new Date(inDate);
		dateMM = dateLocal.getMonth() + 1; dateDD = dateLocal.getDate(); dateYY = dateLocal.getFullYear();
		h = dateLocal.getHours(); m = dateLocal.getMinutes(); s = dateLocal.getSeconds();
		//
		if (inType == "US") {
			strFinalDate = (dateMM<=9 ? '0' + dateMM : dateMM) + "/" + (dateDD<=9 ? '0' + dateDD : dateDD) + "/" + dateYY + " " + (h<=9 ? '0' + h : h) + ":" + (m<=9 ? '0' + m : m) + ":" + (s<=9 ? '0' + s : s);
		}
		else if (inType == "DATE") {
			strFinalDate = (dateMM<=9 ? '0' + dateMM : dateMM) + "/" + (dateDD<=9 ? '0' + dateDD : dateDD) + "/" + dateYY;
		}
		else if (inType == "TIME") {
			strFinalDate = (h<=9 ? '0' + h : h) + ":" + (m<=9 ? '0' + m : m) + ":" + (s<=9 ? '0' + s : s);
		}
		else if (inType == "YYYYMMDD") {
			strFinalDate = dateYY +"-"+ (dateMM<=9 ? '0' + dateMM : dateMM) +"-"+ (dateDD<=9 ? '0' + dateDD : dateDD) + " " + (h<=9 ? '0' + h : h) + ":" + (m<=9 ? '0' + m : m) + ":" + (s<=9 ? '0' + s : s);
		}
		else if (inType == "INTLTIME") {
			strFinalDate = MONTHS[dateLocal.getMonth()] + " " + (dateDD<=9 ? '0' + dateDD : dateDD) + ", " + dateYY + " " + (h<=9 ? '0' + h : h) + ":" + (m<=9 ? '0' + m : m) + ":" + (s<=9 ? '0' + s : s);
		}
		else if (inType == "INTL") {
			strFinalDate = MONTHS[dateLocal.getMonth()] + " " + (dateDD<=9 ? '0' + dateDD : dateDD) + ", " + dateYY;
		}
		else if (inType == "ISO") {
			strFinalDate = dateYY +"-"+ (dateMM<=9 ? '0' + dateMM : dateMM) +"-"+ (dateDD<=9 ? '0' + dateDD : dateDD) +"T"+ (h<=9 ? '0' + h : h) + ":" + (m<=9 ? '0' + m : m) + ":" + (s<=9 ? '0' + s : s) + ".000Z";
		}

		if ( strFinalDate && (strFinalDate.indexOf("NaN") > -1 || strFinalDate.indexOf("undefined") > -1) ) return '';
		return strFinalDate;
	}

	/* ===============================================================================================
	|
	#                         #     #
	#       #  ####  #####    ##   ## ###### ##### #    #  ####  #####   ####
	#       # #        #      # # # # #        #   #    # #    # #    # #
	#       #  ####    #      #  #  # #####    #   ###### #    # #    #  ####
	#       #      #   #      #     # #        #   #    # #    # #    #      #
	#       # #    #   #      #     # #        #   #    # #    # #    # #    #
	####### #  ####    #      #     # ######   #   #    #  ####  #####   ####
	|
	==================================================================================================
	*/

	function univFailCallback(jqXHR, textStatus, errorThrown, funcCaller, inModel) {
		var strErrCode = jqXHR.status.toString();
		var strErrText = "("+ jqXHR.status +") "+ textStatus +": "+ errorThrown;
		var strSpeCode = "";

		// STEP 1: Increment retry counter
		inModel.retryCnt++;

		// STEP 2: Parse out SharePoint/IIS error code and message
		try {
			strSpeCode = $.parseJSON(jqXHR.responseText).error['code'].split(',')[0];
			strErrText = "(" + jqXHR.status + ") " + $.parseJSON(jqXHR.responseText).error['message'].value;
		} catch (ex) { console.log('FYI: Unable to parse SP jqXHR response:\n'+jqXHR.responseText); }

		// STEP 3: Handle fail conditions
		// REF: https://msdn.microsoft.com/en-us/library/dd963640(v=office.12).aspx
		if ( inModel.retryCnt <= APP_OPTS.maxRetries ) {
			// CASE '401': "Unauthorized"
			if ( strErrCode == '401' ) {
				inModel.retryCnt = 0;
				( inModel.onFail ) ? inModel.onFail(strErrText) : console.error(strErrText);
			}
			// CASE '403': SP2013-2016 Expired Token error: Microsoft.SharePoint.SPException (-2130575252): "X-RequestDigest expired form digest"
			else if ( strErrCode == '403' && strSpeCode == '-2130575252' ) {
				if ( UpdateFormDigest ) {
					// Use SP.js UpdateFormDigest function if available (if we're in a Content-Editor-WebPart or on an aspx page)
					UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, _spFormDigestRefreshInterval);
					setTimeout(funcCaller, APP_OPTS.retryAfter, inModel);
				}
				else {
					// Otherwise, there's nothing else to do - no REST will be accepted without new token, so just fail out
					objCurr.retryCnt = 0;
					objCurr.onFail('The page security token has expired (its been over 30 minutes since you submitted/refreshed)\nRefresh the page to continue.\n\n'+strErrText);
				}
			}
			// CASE '403': "Auth error (not expired token)"
			else if ( strErrCode == '403' ) {
				// '403' that is not an expired token is an Auth error, so dont bother retrying
				inModel.retryCnt = 0;
				( inModel.onFail ) ? inModel.onFail(strErrText) : console.error(strErrText);
			}
			// CASE '412': "Concurrency"
			else if ( strErrCode == '412' ) {
				// TODO: add option for "force etag/concurrency handling"
				inModel.spObjMeta[0].__metadata.etag = '"'+ (Number(inModel.spObjMeta.__metadata.etag.replace(/\"/gi,''))+1) +'"'; // Replace double quotes or Number/parseInt will fail (Eg: Number('"2"') == NaN)
				setTimeout( doSyncListData, 1000, inModel );
			}
			else {
				setTimeout(funcCaller, APP_OPTS.retryAfter, inModel);
			}
		}
		else {
			inModel.retryCnt = 0;
			( inModel.onFail ) ? inModel.onFail(strErrText) : console.error(strErrText);
		}
	}

	// STEP 1: Gather Metadata
	function doLoadListMetadata(inModel) {
		// STEP 1: Run onExec callback
		if ( inModel.onExec ) inModel.onExec();

		// STEP 2: Exec SharePoint REST Query
		$.ajax({
			url: APP_OPTS.baseUrl+"/_api/lists/getbytitle('"+ inModel.listName.replace(/\s/gi,'%20') +"')?$select=Fields/Title,Fields/InternalName,Fields/CanBeDeleted,Fields/TypeAsString,Fields/SchemaXml,Fields/AppendOnly&$expand=Fields",
			type: "GET",
			cache: false,
			headers: {"Accept":"application/json; odata=verbose"}
		})
		.done(function(data,textStatus){
			// A: Gather metadata
			$.each(data.d.Fields.results, function(i,result){
				// TODO-1.0: handle 'Account/Title' etc.
				$.each(inModel.listCols, function(key,col){
					// DESIGN: col.dataName is *optional*
					if ( col.dataName && col.dataName.split('/')[0] == result.InternalName ) {
						inModel.listCols[key].dataType = result.TypeAsString;
						inModel.listCols[key].dispName = ( inModel.listCols[key].dispName || result.Title ); // Fallback to SP.Title ("Display Name"]
						inModel.listCols[key].isAppend = ( result.AppendOnly || false );
						inModel.listCols[key].isNumPct = ( result.SchemaXml.toLowerCase().indexOf('percentage="true"') > -1 );
					}
				});
			});
			if (DEBUG) console.table( inModel.listCols );

			// B: Reset vars
			inModel.retryCnt = 0;

			// LAST:
			doLoadListData( inModel );
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doLoadListMetadata, inModel);
		});
	}

	// STEP 2: Gather Data
	function doLoadListData(inModel, inSyncObj) {
		var objAjax = {};
		var strAjaxUrl = "";
		var strExpands = "";

		// STEP 1: Var/UI updates
		inModel.retryCnt++;

		// STEP 2: Start bulding AJAX URL
		strAjaxUrl = APP_OPTS.baseUrl + "/_api/lists/getbytitle('"+ inModel.listName.replace(/\s/gi,'%20') +"')/items";
		// If columsn were provided, ensure we select `Id` for use in building our data model SP-array/object
		if ( inModel.listCols ) strAjaxUrl = strAjaxUrl+"?$select=Id,";

		// STEP 3: Continue building query
		// A: Add columns
		$.each(inModel.listCols, function(key,col){
			if ( !col.dataName ) { console.error('ERROR: cannot read ["dataName"] on '); console.error(col); return false; }
			// A:
			if ( strAjaxUrl.substring(strAjaxUrl.length-1) == '=' ) strAjaxUrl += col.dataName;
			else strAjaxUrl += ( strAjaxUrl.lastIndexOf(',') == strAjaxUrl.length-1 ? col.dataName : ','+col.dataName );
			// B:
			if ( col.dataName.indexOf('/') > -1 ) strExpands += (strExpands == '' ? '' : ',') + col.dataName.substring(0,col.dataName.indexOf('/'));
		});

		// B: Add maxrows as default in SP2013 is a paltry 100 rows
		strAjaxUrl += (strAjaxUrl.indexOf('?$') > -1 ? '&':'?') + '$top=' + ( inModel.ajaxMaxItems ? inModel.ajaxMaxItems : APP_OPTS.maxRows );

		// C: Add expand (if any)
		if ( strExpands ) strAjaxUrl += (strAjaxUrl.indexOf('?$') > -1 ? '&':'?') + '$expand=' + strExpands;

		// D: Add filter (if any)
		if ( inSyncObj && inSyncObj.id ) strAjaxUrl += (strAjaxUrl.indexOf('?$') > -1 ? '&':'?') + '$filter=Id%20eq%20' + inSyncObj.id;
		else if ( inModel.ajaxFilter ) {
			strAjaxUrl += (strAjaxUrl.indexOf('?$') > -1 ? '&':'?') + '$filter' + ( inModel.ajaxFilter.indexOf('%') == -1 ? encodeURI(inModel.ajaxFilter) : inModel.ajaxFilter );
		}

		// E: Add orderby (if any)
		if ( inModel.ajaxOrderby ) strAjaxUrl += (strAjaxUrl.indexOf('?$') > -1 ? '&':'?') + '$orderby=' + inModel.ajaxOrderby;

		// STEP 4: Fetch data from SP
		$.ajax({
			url: strAjaxUrl,
			type: (inModel.ajaxType || "GET"),
			cache: false,
			headers: { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
		})
		.done(function(data,textStatus){
			// A: Clear model data (if needed)
			if ( !inSyncObj ) inModel.spObjData = ( strAjaxUrl.indexOf('=Id') > -1 || strAjaxUrl.indexOf(',Id,') > -1 ? {} : [] );

			// B: Iterate over results
			$.each( (data.d.results || data), function(i,result){
				// A: Create row object JSON
				var objRow = {};
				if ( inModel.listCols ) {
					$.each(inModel.listCols, function(key,col){
						var arrCol = col.dataName.replace(/\//gi,'.').split('.');
						var colVal = ( arrCol.length > 1 ? result[arrCol[0]][arrCol[1]] : result[arrCol[0]] );
						// DESIGN: Not all values can be taken at return value - things like dates have to be turned into actual Date objects
						if ( col.dataType == 'DateTime' ) {
							objRow[key] = new Date(colVal);
						}
						else {
							objRow[key] = ( APP_OPTS.cleanColHtml && col.listDataType == 'string' ? colVal.replace(/<div(.|\n)*?>/gi,'').replace(/<\/div>/gi,'') : colVal );
						}
						// TODO-1.0: ^^ results like 'Account/Title' will be created above (!)
					});
				}
				else {
					$.each(result, function(key,val){
						if ( typeof val !== 'object' ) objRow[key] = val;
					});
				}

				// B: Store result JSON data and metadata
				inModel.spArrData.push( objRow );
				if ( result.Id ) {
					inModel.spObjData[result.Id] = objRow;
					inModel.spObjMeta[result.Id] = ( result.__metadata || {} );
				}
				else {
					inModel.spObjData.push( objRow );
				}
			});
			if (DEBUG && inModel.listCols) console.log( inModel.listCols );

			// C: Reset vars
			inModel.retryCnt = 0;

			// D: Call the inSyncObj.onDone (if any) as the one called by doShowListData is inModel.onDone, which is different
			if ( inSyncObj && inSyncObj.onDone ) inSyncObj.onDone();

			// LAST: Show data
			doShowListData(inModel);
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doLoadListData, inModel);
		});
	}

	// STEP 3: Gather AppendText (if any)
	function doLoadListAppendText(inModel) {
		// TODO: doLoadListAppendText()
		// TODO-DONE: capture LIST GUID duyring metadata for use with AppendText -- DONE!!! its in __metadata (id:"65528d90-8295-4491-adad-09f7c0a9f652") .replace(/\-/g, '%2D')
		/*
		var strAjaxUrl = "/sites/dev/_vti_bin/owssvr.dll?Cmd=Display&List="
			+ "%7B"+"LUID"+"%7D" + "&XMLDATA=TRUE&IncludeVersions=TRUE"
			+ '&Query=ID'+'%20'+'Start_x0020_Date'+'%20'+ "&SortField=Modified&SortDir=ASC";
		// STEP 1: Query SP
		$.ajax({ url:strAjaxUrl })
		.done(function(data,textStatus){
			$(data).find("z\\:row, row").each(function(){
				objCurr.StartDate = ( $(this).attr("ows_Critical_x0020_Issues") || '');
			)};
		)};
		*/
	}

	// STEP 4: Populate Data in HTML tags (if any)
	function doShowListData(inModel) {
		var isFilterPassed = false;
		var objTable = null;
		var objFilter = {};
		if (DEBUG) console.table(inModel.spObjData);

		// STEP 1: Find/Populate element bound to this LIST object
		$('[data-bind]').each(function(i,tag){
			// A: Skip non-object data-bind tags (they could be future ops like InsertItem or for other libraries etc.!)
			if ( typeof $(tag).data('bind') !== 'object' ) return;

			// B: Get bind data from this element
			// NOTE: jQuery returns an JSON-type object automatically (no JSON.parse required)
			/* EX:
				<span   data-bind='{"text"   : {"model":"Emps", "cols":"name"} }'></span>
				<select data-bind='{"foreach": {"model":"Emps", "text":"name", "value":"id"} }'></select>
				<table  data-bind='{"foreach": {"model":"Emps", "filter":{"col":"active", "op":"eq", "val":false}} }'></table>
			*/
			var bindJSON = $(tag).data('bind');
			var bindOper = Object.keys(bindJSON)[0].toLowerCase();
			// We allow "cols" to be both "name" and ["name","email"], so cast string to array when needed
			if ( bindJSON[bindOper].cols && typeof bindJSON[bindOper].cols == 'string' ) bindJSON[bindOper].cols = [bindJSON[bindOper].cols];
			var bindCol1 = (bindJSON[bindOper].cols) ? bindJSON[bindOper].cols[0] : '';
			if (DEBUG) console.log( '[loop: data-bind]> bindOper = '+bindOper+' / bindCol1 = '+ bindCol1 + ' -- [html tag] = '+ $(tag).prop('tagName') );

			// C: More parse-error checking
			if ( !APP_MODELS[bindJSON[bindOper].model] ) {
				// NOTE: Users may have forms that are have only <input data-bind='{"col":"Utilization"}'>, so just skip/'continue'!
				return;
			}
			if ( bindOper == 'text' && (!bindJSON[bindOper].cols || !bindJSON[bindOper].model) ) {
				var strTemp = 'PARSE ERROR:\n\n(text requires "model"/"cols")\n'
					+ 'Your code:\n'+ $(tag)['context'].outerHTML.replace(/\&quot\;/gi,'"') +'\n\n'
					+ 'Should look like this:\n<'+ $(tag).prop('tagName') + ' data-bind:\'{"text":{"model":"Emps", "cols":"firstName"}}\'>';
				( inModel.onFail ) ? inModel.onFail(strTemp) : console.error(strTemp);
				return;
			}
			else if ( bindOper == 'foreach' && !bindJSON[bindOper].model ) {
				var strTemp = 'PARSE ERROR:\n\n(foreach requires a "model" value)\n'
					+ 'Your code:\n'+ $(tag)['context'].outerHTML.replace(/\&quot\;/gi,'"') +'\n\n'
					+ 'Should look like this:\n<'+ $(tag).prop('tagName') + ' data-bind:\'{"text":{"model":"Emps", "cols":"firstName"}}\'>';
				( inModel.onFail ) ? inModel.onFail(strTemp) : console.error(strTemp);
				return;
			}

			// D: Handle FILTER
			if ( bindJSON[bindOper].filter ) {
				// A: Param Check -- NOTE: Dont use "!bindJSON[bindOper].filter.val" as actual value may be [false] or ""!
				if ( !bindJSON[bindOper].filter.col || !bindJSON[bindOper].filter.op || typeof bindJSON[bindOper].filter.val === 'undefined' ) {
					var strErr = 'FILTER ERROR:\n\nYour filter:\n'+ $(tag)['context'].outerHTML.replace(/\&quot\;/gi,'"') +'\n\nShould look like this:\n"filter":{"col":"name", "op":"eq", "val":"bill"}\'>';
					if ( inModel.onFail ) inModel.onFail(strErr);
					console.error(strErr);
					console.log(bindJSON[bindOper].filter);
					return false;
				}
				else if ( !APP_FILTEROPS[bindJSON[bindOper].filter.op] ) {
					var strErr = 'FILTER ERROR:\n\nOperation Unknown:\n'+ bindJSON[bindOper].filter.op +'>';
					if ( inModel.onFail ) inModel.onFail(strErr);
					console.error(strErr);
					console.log(bindJSON[bindOper].filter);
					return false;
				}

				// B:
				objFilter = bindJSON[bindOper].filter;
				if (DEBUG) { console.log('objFilter:'); console.log(objFilter); }
			}
			else {
				objFilter = {};
			}

			// E: Find/Populate element bound to this LIST object
			if ( bindJSON[bindOper].model == inModel.modelName ) {
				// 1: Remove any temporary UI items now that this element is being populated
				$(tag).find('.sprlibTemp').remove();

				// 2: Populate UI
				// TODO: apply css to object other than tables with FOREACH!
				if ( bindOper == 'text' ) {
					// A: Parsing error checking
					if ( !inModel.listCols[bindCol1] ) {
						var strTemp = 'ERROR: Unknown column: "'+ bindCol1 +'"\n\nSRC:\n' + $(tag)['context'].outerHTML.replace(/\&quot\;/gi,'"');
						if ( inModel.onFail ) inModel.onFail(strTemp);
						console.error(strTemp);
						return false;
					}

					// B: (NOTE: There may be more than one row of data, but if use bound a single text field, what else can we do - so we use [0]/first row)
					if ( $(tag).is('input[type="text"]') ) {
						( Object.keys(inModel.spObjData).length ) ? $(tag).val(inModel.spObjData[Object.keys(inModel.spObjData)[0]][bindCol1]) : $(tag).val('');
						inModel.listCols[bindCol1].htmlEle = $(tag);
					}
					else if ( $(tag).not('input') ) {
						( Object.keys(inModel.spObjData).length ) ? $(tag).text(inModel.spObjData[Object.keys(inModel.spObjData)[0]][bindCol1]) : $(tag).text('');
						inModel.listCols[bindCol1].htmlEle = $(tag);
					}
				}
				else if ( bindOper == 'foreach' ) {
					if ( $(tag).is('select') ) {
						// A:
						if ( !bindJSON[bindOper].text || !bindJSON[bindOper].value ) { var strErr = '<select> foreach requires both "text" and "value" fields!'; console.error(strErr); return; }
						// B:
						$.each(inModel.spObjData, function(i,row){ $(tag).append('<option value="'+ row[bindJSON[bindOper].value] +'">'+ row[bindJSON[bindOper].text] +'</option>'); });
					}
					else if ( $(tag).is('table') || $(tag).is('tbody') ) {
						// A: Build and/or clear THEAD/TBODY
						// CASE 1: <table>
						if ( $(tag).is('table') ) {
							// A: Remoev tablesorter before possilby destroying THEAD
							if ( inModel.tableSorter && $.tablesorter ) $(tag).trigger("destroy");

							// A: Add/Populate <thead>
							( $(tag).find('> thead').length == 0 ) ? $(tag).prepend('<thead/>') : $(tag).find('> thead').empty();
							var $row = $('<tr/>');
							$.each(inModel.listCols, function(key,col){ if (!col.hidden) $row.append('<th>'+ col.dispName +'</th>'); });
							$(tag).find('> thead').append( $row );

							// B: Add <tbody> (if necc)
							( $(tag).find('> tbody').length == 0 ) ? $(tag).append('<tbody/>') : $(tag).find('> tbody').empty();

							// LAST: Set loop fill object
							objTable = $(tag);
						}
						// CASE 2: <tbody>
						else if ( $(tag).is('tbody') ) {
							// A: Empty
							$(tag).empty();

							// LAST: Set loop fill object
							objTable = $(tag).parent('table');
						}

						// B: Add each table row
						$.each(inModel.spObjData, function(i,row){
							// A: Add row
							isFilterPassed = false;
							$row = $('<tr/>');

							// B: Add cells to new row
							$.each(row, function(key,val){
								// TODO: HELP: howto use these "op" lookups in an actual if? (eval?)
								// FIX: Filtering
								// "filter": {"col":"active", "op":"eq", "val":false}} }

								// A: Filtering:
								if ( !objFilter.col || ( objFilter.col == key && objFilter.op == "eq" && objFilter.val == val ) ) isFilterPassed = true;

								// B: Add row cells
								if ( !inModel.listCols[key].hidden ) {
									// Handle cases where tag contains {cols): only show the cols that user specified
									if ( bindJSON[bindOper].cols && $.inArray(key,bindJSON[bindOper].cols) == -1 ) return;

									// A: Stringify boolean values (true/false)
									if ( typeof val === 'boolean' ) val = val.toString().replace('true','Yes').replace('false','No');

									// B: Create cell
									var $cell = $('<td/>');
									if      ( val && inModel.listCols[key].isNumPct && !isNaN(val) )               $cell.text( Math.round(val*100)+'%' );
									else if ( val && inModel.listCols[key].dataType == 'Currency' && !isNaN(val) ) $cell.text( formatCurrency(val) );
									else if ( val && inModel.listCols[key].dataType == 'DateTime' )                $cell.text( formatDate(val, (inModel.listCols[key].dataFormat||'INTL')) );
									else                                                                           $cell.text( (val || '') );

									// C: Add CSS dispStyle and/or dispClass (if any)
									if ( inModel.listCols[key].dispClass ) { $cell.addClass( inModel.listCols[key].dispClass ); }
									if ( inModel.listCols[key].dispStyle ) {
										try {
											if ( typeof JSON.parse(inModel.listCols[key].dispStyle) === 'object' ) $cell.css( JSON.parse(inModel.listCols[key].dispStyle) );
										}
										catch(ex) {
											var strTemp = 'PARSE ERROR:\n'
												+ 'Unable to parse [JSON.parse] and/or set the css dispStyle for data model: '+ bindJSON[bindOper].model +'\n\n'
												+ '* model dispStyle value:\n'+ inModel.listCols[key].dispStyle +'\n'
												+ '* correct syntax ex:\n{"width":"1%", "white-space":"nowrap"}\n\n'
												+ ex;
											console.warn(strTemp);
										}
									}

									// D: Add cell to row
									$row.append( $cell );
								}
							});

							// C: Add new table row if filter matched and only if the cell(s) were populated
							if ( isFilterPassed && $row.find('td').length > 0 ) $(objTable).find('> tbody').append( $row );
						});

						// C: OPTIONS: Setup tablesorter
						if ( inModel.tableSorter && $.tablesorter ) {
							$(tag).tablesorter({ sortList:inModel.tableSorter.sortList }); // Sort by (Col#/Asc=0,Desc=1)
							inModel.tableSorter.htmlEle = $(objTable);
						}

						// D: Show message when no rows
						if ( $(objTable).find('tbody tr').length == 0 ) {
							$(objTable).find('tbody').append('<tr><td colspan="'+ $(objTable).find('thead th').length +'" style="color:#ccc; text-align:center;">'+ APP_STRINGS[APP_OPTS.language].noRows +'</td></tr>');
						}
					}
				}
			}
		});

		// LAST: Done!
		doDoneCallback(inModel);
	}

	// STEP 5: Fire onDone callback to return {data}
	function doDoneCallback(inModel) {
		if ( inModel.onDone ) inModel.onDone( inModel.data() );
	}

	/* ===============================================================================================
	|
	######                                        # #######
	#     # # #    # #####  # #    #  ####       #  #        ####  #####  #    #  ####
	#     # # ##   # #    # # ##   # #    #     #   #       #    # #    # ##  ## #
	######  # # #  # #    # # # #  # #         #    #####   #    # #    # # ## #  ####
	#     # # #  # # #    # # #  # # #  ###   #     #       #    # #####  #    #      #
	#     # # #   ## #    # # #   ## #    #  #      #       #    # #   #  #    # #    #
	######  # #    # #####  # #    #  ####  #       #        ####  #    # #    #  ####
	|
	==================================================================================================
	*/

	function doParseFormFieldsIntoJson(inModel, inEleId) {
		var objReturn = {
			jsonSpData: {},
			jsonFormat: {}
		};
		var strCol = "";

		// STEP 1: REALITY-CHECK:
		if ( $('#'+inEleId).length == 0 ) {
			var strTemp = 'parseForm ERROR:\n\n'+ inEleId +' does not exist!';
			( inModel.onFail ) ? inModel.onFail(strTemp) : console.error(strTemp);
			return null;
		}

		// STEP 2: Parse all form fields into SP-JSON and Formatted values
		$('#'+inEleId+' [data-bind]').each(function(i,tag){
			// A: Get column name for this field
			// Determine which type of binding we are dealing with:
			// CASE 1: <input type="text" data-bind='{"col":"firstName"}'>
			if ( $(this).data('bind').col )
				strCol = $(this).data('bind').col;
			// CASE 2: <input type="text" data-bind='{"text":{"model":"Employees", "cols":["firstName"]}}'>
			else if ( $(this).data('bind')[Object.keys($(this).data('bind'))[0]].cols && $.isArray($(this).data('bind')[Object.keys($(this).data('bind'))[0]].cols) )
				strCol = $(this).data('bind')[Object.keys($(this).data('bind'))[0]].cols[0];
			else return;

			// B: Handle fields not in Model (user may want some additional info inserted, etc.)
			var dataName = ( inModel.listCols[strCol] ? inModel.listCols[strCol].dataName : strCol );

			// C: Handle various element types
			// TODO: add new HTML5 tags

			// CASE: <checkbox>
			if ( $(this).is(':checkbox') ) {
				objReturn.jsonSpData[dataName] = $(this).prop('checked');
				objReturn.jsonFormat[strCol] = APP_STRINGS[APP_OPTS.language][$(this).prop('checked').toString()];
			}
			// CASE: <jquery-ui datepicker>
			else if ( $(this).val() && $(this).hasClass('hasDatepicker') ) {
				objReturn.jsonSpData[dataName] = $(this).datepicker('getDate').toISOString();
				objReturn.jsonFormat[strCol] = ( inModel.listCols[strCol].dataFormat ? bdeLib.localDateStrFromSP(null,$(this).datepicker('getDate'),inModel.listCols[strCol].dataFormat) : $(this).datepicker('getDate').toISOString() );
			}
			// CASE: <select:single>
			else if ( $(this).val() && $(this).prop('type') == 'select-one' ) {
				objReturn.jsonSpData[dataName] = ($(this).data('type') && ($(this).data('type') == 'num' || $(this).data('type') == 'pct')) ? Number($(this).val()) : $(this).val().toString();
				objReturn.jsonFormat[strCol] = objReturn.jsonSpData[dataName];
			}
			// CASE: <select:multiple>
			else if ( $(this).val() && $(this).prop('type') == 'select-multiple' ) {
				// TODO: This is for multi-lookup!  Multi-choice w/b different - add code!
				// EX: (SP2013/16): { "SkillsId": { "__metadata":{"type":"Collection(Edm.Int32)"}, "results":[1,2,3] } }
				var arrIds = [];
				$.each($(this).val(), function(i,val){ arrIds.push( Number(val) ); });
				objReturn.jsonSpData[dataName] = { "__metadata":{"type":"Collection(Edm.Int32)"}, "results":arrIds };
				objReturn.jsonFormat[strCol] = arrIds.toString();
			}
			// CASE: <radiobutton>
			else if ( $(this).val() && $(this).is(':radio') ) {
				// TODO: FUTURE: Add radiobutton, get value by name or whatever
			}
			// CASE: <textarea>
			else if ( $(this).text() && $(this).prop('tagName').toUpperCase() == 'TEXTAREA' ) {
				objReturn.jsonSpData[dataName] = $(this).text();
				objReturn.jsonFormat[strCol] = $(this).text();
			}
			// CASE: (everything else - excluding buttons)
			else if ( $(this).val() && $(this).prop('type') != 'submit' && $(this).prop('type') != 'reset' && $(this).prop('type') != 'button' ) {
				objReturn.jsonSpData[dataName] = $(this).val();
				objReturn.jsonFormat[strCol] = $(this).val();
			}
			// CASE: No value
			else {
				objReturn.jsonFormat[strCol] = '';
			}

			// D: Special Cases:
			if ( $(this).val() && inModel.listCols[strCol] && inModel.listCols[strCol].isNumPct ) {
				objReturn.jsonFormat[strCol] = ( Number( $(this).val() ) * 100 ) + '%';
			}
		});

		// LAST:
		return objReturn;
	}

	function doSyncListItem(inModel, inObj) {
		var jsonAjaxData = inObj.jsonData;

		// FIRST: REALITY-CHECK
		if (DEBUG) { console.log('doSyncListItem:'); console.log(inModel); console.log(inObj); }
		if ( !Object.keys(inModel.spObjData).length || !Object.keys(inModel.spObjMeta).length ) {
			var strErr = "ERROR: Model has not been initialied yet (it's data/meta are empty).";
			( inObj.onFail ) ? inObj.onFail(strErr) : console.error(strErr);
			return;
		}

		// STEP 1: Var/UI updates
		inModel.retryCnt++;

		// STEP 2: Set AJAX headers and add reqd metadata
		jsonAjaxData['__metadata'] = inModel.spObjMeta[inObj.id];

		// STEP 3: Update item
		$.ajax({
			type       : "POST",
			url        : APP_OPTS.baseUrl+"/_api/lists/getbytitle('"+ inModel.listName +"')/items("+ inObj.id +")",
			data       : JSON.stringify(jsonAjaxData),
			contentType: "application/json;odata=verbose",
			headers    : {
				"Accept":          "application/json; odata=verbose",
				"X-RequestDigest": $("#__REQUESTDIGEST").val(),
				"X-HTTP-Method":   "MERGE",
				"IF-MATCH":        inModel.spObjMeta[inObj.id].etag
			}
		})
		.done(function(data,textStatus){
			// A: Update vars
			inModel.retryCnt = 0;

			// LAST: Refresh data, then refresh UI
			doLoadListData(inModel, inObj);
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doSyncListData, inModel);
		});
	}

	/* ===============================================================================================
	|
	#     #                                   #  #####
	#     #  ####  ###### #####   ####       #  #     # #####   ####  #    # #####   ####
	#     # #      #      #    # #          #   #       #    # #    # #    # #    # #
	#     #  ####  #####  #    #  ####     #    #  #### #    # #    # #    # #    #  ####
	#     #      # #      #####       #   #     #     # #####  #    # #    # #####       #
	#     # #    # #      #   #  #    #  #      #     # #   #  #    # #    # #      #    #
	 #####   ####  ###### #    #  ####  #        #####  #    #  ####   ####  #       ####
	|
	==================================================================================================
	*/

	function doGetCurrentUser(inObj) {
		var jsonData = {};

		// STEP 1: Run onExec callback
		if ( inObj.onExec ) inObj.onExec();

		// STEP 2: Exec SharePoint REST Query
		// NOTE: Use CurrentUser service as it is included in SP-Foundation and will work for everyone (Users will need SP-Enterprise for UserProfiles service to work)
		$.ajax({
			url: APP_OPTS.baseUrl+"/_api/Web/CurrentUser?$select=Id,LoginName,Title,Email",
			type: "GET",
			cache: false,
			headers: {"Accept":"application/json; odata=verbose"}
		})
		.done(function(data,textStatus){
			// A: Gather user data
			$.each(data.d, function(key,result){ jsonData[key] = result; });

			// LAST:
			if ( inObj.onDone ) inObj.onDone( jsonData );
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doGetCurrentUser, inObj);
		});
	}

	function doGetCurrentUserGroups(inObj) {
		// STEP 1: Run onExec callback
		if ( inObj.onExec ) inObj.onExec();

		// STEP 2: Exec SharePoint REST Query
		// NOTE: Use CurrentUser service as it is included in SP-Foundation and will work for everyone (Users will need SP-Enterprise for UserProfiles service to work)
		$.ajax({
			url: APP_OPTS.baseUrl+"/_api/Web/CurrentUser?$select=Groups/Title&$expand=Groups",
			type: "GET",
			cache: false,
			headers: {"Accept":"application/json; odata=verbose"}
		})
		.done(function(data,textStatus){
			// STEP 1: Gather groups
			var arrGroups = [];
			$.each(data.d.Groups.results, function(idx,group){ arrGroups.push({ Id:group.Id, Title:group.Title }); });

			// LAST: Call onDone
			if ( inObj.onDone ) inObj.onDone( arrGroups );
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doGetCurrentUser, inObj);
		});
	}

	function doGetUserById(inObj) {
		var jsonData = {};

		// FIRST: Reqd Field Check
		if ( !inObj.userId ) { ( inObj.onFail ) ? inObj.onFail('ERROR: userId is required!') : console.error('ERROR: userId is required!'); return null; }

		// STEP 1: Run onExec callback
		if ( inObj.onExec ) inObj.onExec();

		// STEP 2: Exec SharePoint REST Query
		// NOTE: Use CurrentUser service as it is included in SP-Foundation and will work for everyone (Users will need SP-Enterprise for UserProfiles service to work)
		$.ajax({
			url: APP_OPTS.baseUrl+"/_api/Web/GetUserById("+inObj.userId+")?$select=Id,LoginName,Title,Email,PrincipalType,IsSiteAdmin",
			type: "GET",
			cache: false,
			headers: {"Accept":"application/json; odata=verbose"}
		})
		.done(function(data,textStatus){
			// A: Gather user data
			$.each(data.d, function(key,result){ jsonData[key] = result; });

			// LAST:
			if ( inObj.onDone ) inObj.onDone( jsonData );
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doGetUserById, inObj);
		});
	}

	/* ===============================================================================================
	|
	#     #                     #     #                                ######  #######  #####  #######
	##    #  ####  #    #       ##   ##  ####  #####  ###### #         #     # #       #     #    #
	# #   # #    # ##   #       # # # # #    # #    # #      #         #     # #       #          #
	#  #  # #    # # #  # ##### #  #  # #    # #    # #####  #         ######  #####    #####     #
	#   # # #    # #  # #       #     # #    # #    # #      #         #   #   #             #    #
	#    ## #    # #   ##       #     # #    # #    # #      #         #    #  #       #     #    #
	#     #  ####  #    #       #     #  ####  #####  ###### ######    #     # #######  #####     #
	|
	==================================================================================================
	// STAND-ALONE, AD-HOC METHODS: (Not tied to a DataModel)
	*/

	function doRestCall(inRestObj) {
		var objAjax = {};
		var strAjaxUrl = "", strExpands = "";

		// STEP 1: Var/UI updates
		inRestObj.spArrData = [];
		inRestObj.retryCnt++;

		// STEP 2: Start bulding URL
		if      ( inRestObj.restUrl.indexOf('/_api') == 0 )							strAjaxUrl = APP_OPTS.baseUrl + inRestObj.restUrl;
		else if ( inRestObj.restUrl.indexOf('_api')  == 0 )							strAjaxUrl = APP_OPTS.baseUrl + "/" + inRestObj.restUrl;
		else if ( inRestObj.restUrl.indexOf('/')     == 0 &&  inRestObj.queryCols )	strAjaxUrl = inRestObj.restUrl + "?$select=";
		else if ( inRestObj.restUrl.indexOf('/')     == 0 && !inRestObj.queryCols )	strAjaxUrl = inRestObj.restUrl;
		else if ( inRestObj.restUrl.indexOf('http')  == 0 &&  inRestObj.queryCols )	strAjaxUrl = inRestObj.restUrl + "?$select=";
		else if ( inRestObj.restUrl.indexOf('http')  == 0 && !inRestObj.queryCols )	strAjaxUrl = inRestObj.restUrl;
		//else																		strAjaxUrl = APP_OPTS.baseUrl + "/_api/lists/getbytitle('"+ inRestObj.restUrl.replace(/\s/gi,'%20') +"')/items?$select=Id,"
		// TODO: ^^^ what about an else?

		// STEP 3: Continue building URL when selecting columns
		if ( strAjaxUrl.indexOf('$select') > -1 ) {
			// A: Add columns
			$.each(inRestObj.queryCols, function(key,col){
				if ( !col.dataName ) return; // Skip columns without a 'dataName' key
				// A:
				if ( strAjaxUrl.substring(strAjaxUrl.length-1) == '=' ) strAjaxUrl += col.dataName;
				else strAjaxUrl += ( strAjaxUrl.lastIndexOf(',') == strAjaxUrl.length-1 ? col.dataName : ','+col.dataName );
				// B:
				if ( col.dataName.indexOf('/') > -1 ) strExpands += ( strExpands == '' ? col.dataName.substring(0,col.dataName.indexOf('/')) : ','+col.dataName.substring(0,col.dataName.indexOf('/')) );
			});

			// B: Add maxrows as default in SP2013 is a paltry 100 rows
			strAjaxUrl += '&$top=' + ( inRestObj.queryMaxItems ? inRestObj.queryMaxItems : APP_OPTS.maxRows );

			// C: Add expand (if any)
			if ( strExpands ) strAjaxUrl += '&$expand=' + strExpands;

			// D: Add filter (if any)
			else if ( inRestObj.queryFilter ) strAjaxUrl += '&$filter=' + ( inRestObj.queryFilter.indexOf('%') == -1 ? encodeURI(inRestObj.queryFilter) : inRestObj.queryFilter );

			// E: Add orderby (if any)
			if ( inRestObj.queryOrderby ) strAjaxUrl += '&$orderby=' + inRestObj.queryOrderby;
		}

		// STEP 4: Fetch data from SP
		$.ajax({
			url: strAjaxUrl,
			type: (inRestObj.ajaxType || "GET"),
			cache: false,
			headers: { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
		})
		.done(function(data,textStatus){
			// A: Gather results
			$.each( (data.d.results || data), function(i,result){
				var objRow = {};
				if ( inRestObj.queryCols ) {
					$.each(inRestObj.queryCols, function(key,col){
						var arrCol = col.dataName.replace(/\//gi,'.').split('.');
						var colVal = ( arrCol.length > 1 ? result[arrCol[0]][arrCol[1]] : result[arrCol[0]] );
						// DESIGN: Not all values can be taken at return value - things like dates have to be turned into actual Date objects
						if ( col.dataType == 'DateTime' ) objRow[key] = new Date(colVal);
						else objRow[key] = ( APP_OPTS.cleanColHtml && col.listDataType == 'string' ? colVal.replace(/<div(.|\n)*?>/gi,'').replace(/<\/div>/gi,'') : colVal );
						// TODO-1.0: ^^ results like 'Account/Title' will be created above (!)
					});
				}
				else {
					$.each(result, function(key,val){
						objRow[key] = val;
					});
				}
				inRestObj.spArrData.push( objRow );
			});
			if (DEBUG && inRestObj.queryCols) console.log( inRestObj.queryCols );

			// B: Reset vars
			inRestObj.retryCnt = 0;

			// LAST: Call the inSyncObj.onDone (if any)
			if ( inRestObj.onDone ) inRestObj.onDone( inRestObj.spArrData );
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doRestCall, inRestObj);
		});
	}

	function doInsertListItem(inObj) {
		// STEP 1: Var/UI updates
		inObj.retryCnt++;

		// STEP 2: Do insert
		$.ajax({
			type       : "POST",
			contentType: "application/json;odata=verbose",
			url        : APP_OPTS.baseUrl+"/_api/lists/getbytitle('"+ inObj.listName +"')/items",
			headers    : { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() },
			data       : JSON.stringify(inObj.jsonData)
		})
		.done(function(data,textStatus){
			// A: Reset vars
			inObj.retryCnt = 0;

			// LAST: Done callback
			if ( inObj.onDone ) inObj.onDone( data.d );
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doInsertListItem, inObj);
		});
	}

	function doUpdateListItem(inObj) {
		var strErrText = "";

		// STEP 1: Validation
		if      ( !inObj.listName ) strErrText = "ERROR: listName is required!";
		else if ( !inObj.jsonData ) strErrText = "ERROR: jsonData is required!";
		else if ( !inObj.jsonData.Id ) strErrText = "ERROR: jsonData must have an 'Id' key/val pair!";
		else if ( !inObj.jsonData.__metadata ) strErrText = "ERROR: jsonData must have an '__metadata' key/val pair!";
		else if ( !inObj.jsonData.__metadata.etag ) strErrText = "ERROR: jsonData.__metadata must have an 'etag' key/val pair!";
		//
		if ( strErrText ) { ( inObj.onFail ) ? inObj.onFail(strErrText) : console.error(strErrText); return null; }

		// STEP 2: Var/UI updates
		inObj.retryCnt++;

		// STEP 3: Do Update
		$.ajax({
			url        : APP_OPTS.baseUrl+"/_api/lists/getbytitle('"+ inObj.listName +"')/items("+ inObj.jsonData.Id +")",
			type       : "POST",
			data       : JSON.stringify(inObj.jsonData),
			contentType: "application/json;odata=verbose",
			headers    : { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val(), "X-HTTP-Method":"MERGE", "IF-MATCH":inObj.jsonData.__metadata.etag }
		})
		.done(function(data,textStatus){
			// A: Reset vars
			inObj.retryCnt = 0;

			// LAST: Done callback
			if ( inObj.onDone ) inObj.onDone( inObj.jsonData );
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doUpdateListItem, inObj);
		});
	}

	// TODO: function doDeleteListItem(inObj){}
	function doDeleteListItem(inObj) {
		var strErrText = "";

		// STEP 1: Validation
		if      ( !inObj.listName ) strErrText = "ERROR: listName is required!";
		else if ( !inObj.jsonData ) strErrText = "ERROR: jsonData is required!";
		else if ( !inObj.jsonData.Id ) strErrText = "ERROR: jsonData must have an 'Id' key/val pair!";
		else if ( !inObj.jsonData.__metadata ) strErrText = "ERROR: jsonData must have an '__metadata' key/val pair!";
		else if ( !inObj.jsonData.__metadata.etag ) strErrText = "ERROR: jsonData.__metadata must have an 'etag' key/val pair!";
		//
		if ( strErrText ) { ( inObj.onFail ) ? inObj.onFail(strErrText) : console.error(strErrText); return null; }

		// STEP 2: Var/UI updates
		inObj.retryCnt++;

		// STEP 3: Do Update
		$.ajax({
			url        : APP_OPTS.baseUrl+"/_api/lists/getbytitle('"+ inObj.listName +"')/items("+ inObj.jsonData.Id +")",
			type       : "DELETE",
			contentType: "application/json;odata=verbose",
			headers    : { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val(), "X-HTTP-Method":"MERGE", "IF-MATCH":inObj.jsonData.__metadata.etag }
		})
		.done(function(data,textStatus){
			// A: Reset vars
			inObj.retryCnt = 0;

			// LAST: Done callback
			if ( inObj.onDone ) inObj.onDone();
		})
		.fail(function(jqXHR,textStatus,errorThrown){
			univFailCallback(jqXHR, textStatus, errorThrown, doDeleteListItem, inObj);
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

	// MAIN INIT METHOD
	/**
	* MAIN FUNC: Creates dataModel object and associated methods
	*
	* APP_MODELS.dataModel.listCols
	* @example:
	* listName: 'ListName'
	* listCols: { [[see below]] }
	* queryFilter: "",
	* queryOrderby: "",
	* queryLimit: "10",
	* onExec: function(){ console.log('FYI: onExec...'); },
	* onDone: function(arrData){ console.log('Got data! Array length:'+arrData.length); },
	* onFail: function(errMesg){ console.error('ERROR:'+errMesg); }
	*
	* APP_MODELS.dataModel.listCols
	* @example:
	* listCols: {
	*   name:  { dataName:'Name'               },
	*   badge: { dataName:'Badge_x0020_Number' }
	* }
	* | property     | type    | reqd  | description       | example/allowed vals |
	* |--------------|---------|-------|-------------------|----------------------|
	* | `dataName`   | string  | no    | SP.InternalName   | 'Hire_x0020_Date'    |
	* | `dispName`   | string  | no    | display name      | 'Hire Date'          |
	* | `dataFormat` | string  | no    | date format       | `INTL`, `INTLTIME` TODO |
	* | `dataType`   | string  | (app) | SP.FieldType      | `Integer`, `Text, `Note, `DateTime`, `Choice`, `Lookup`, `Boolean`, `Currency` et al. |
	* | `isAppend`   | boolean | (app) | Append Text Field | `true` or `false`    |
	* | `isNumPct`   | boolean | (app) | "Show as Percent" | `true` or `false`    |
	*
	* @see: Field Ref: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx
	* @see: FieldTypes: https://msdn.microsoft.com/en-us/library/office/microsoft.sharepoint.client.fieldtype.aspx
	*/
	sprLib.model = function model(inName) {
		// FIRST: REALITY-CHECK:
		if ( !inName || typeof inName !== 'string' ) { console.error("ERROR: modelName[string] is required!"); return null; }

		// STEP 1: Add new model if necessary
		if ( !APP_MODELS[inName] ) {
			// A: Create new MODEL
			var objNew = {
				modelName: inName,
				retryCnt : 0,
				spObjMeta: {},
				spArrData: [],
				spObjData: {}
			};

			// B: Attach Model methods
			objNew.add = function add(inObj){
				// Overloading: Cols can be objects or a plain array or strings (field names)
				if ( $.isArray(inObj.listCols) ) {
					var listCols = {};
					$.each(inObj.listCols, function(i,colStr){ listCols[colStr] = { dataName:colStr }; });
					inObj.listCols = listCols;
				}

				// A: Add all key/val from passed object
				$.each(inObj, function(key,val){ objNew[key] = val });

				// B: Gather/Populate data
				doLoadListMetadata( objNew );
			};
			objNew.data = function data(inStrType){
				if      ( inStrType == 'a' || inStrType == 'arr' || inStrType == 'array'  ) return $.extend(true, [], APP_MODELS[inName].spArrData);
				else if ( inStrType == 'o' || inStrType == 'obj' || inStrType == 'object' ) return $.extend(true, {}, APP_MODELS[inName].spObjData);

				return $.extend(true, [], APP_MODELS[inName].spArrData);
			}
			objNew.meta = function meta(){
				return $.extend(true, {}, APP_MODELS[inName].spObjMeta);
			}
			objNew.parseForm = function parseForm(inEleName){
				return doParseFormFieldsIntoJson( objNew, inEleName );
			};
			/* one-way (page->model) at present */
			objNew.sync = function sync(){
				// TODO: clients can call .sync() on top of each other! - find a way to cancel any current ops before starting a new one!
				doLoadListData( objNew );
			};
			/* EX:
			sprLib.model('Employees').syncItem({
				id      : $('#itemId').val(),
				jsonData: sprLib.model('Employees').parseForm('editForm').jsonSpData,
				onFail  : function(msg){ $('#failDialog').dialog('show'); },
				onDone  : function(data){ $('#editDialog').dialog('close'); }
			});
			*/
			objNew.syncItem = function syncItem(inObj){
				// STEP 1: REALITY-CHECK:
				if ( !inObj || typeof inObj !== 'object' || !inObj.id || !inObj.jsonData ) {
					console.error('ERROR: id(string) and jsonData(object) are both required!');
					return null;
				}

				// STEP 2: Pass objects to method
				doSyncListItem(objNew, inObj);
			};

			// C: Add to app models
			APP_MODELS[inName] = objNew;
		}

		// LAST: Return this (enable chaining)
		return APP_MODELS[inName];
	};

	// LIST CRUD METHODS

	/**
	* TODO:
	*/
	sprLib.getListItems = function getListItems(inObj) {
		// STEP 1: REALITY-CHECK

		// STEP 2: Create internal object
		var objNew = {
			retryCnt : 0,
			spObjMeta: {},
			spArrData: [],
			spObjData: {}
		};

		objNew.data = function data(inStrType){
			return $.extend(true, [], objNew.spArrData);
		}

		// STEP 3: Setup columns
		// A: Overloading: Cols can be objects or a plain array or strings (field names)
		if ( $.isArray(inObj.listCols) ) {
			var listCols = {};
			$.each(inObj.listCols, function(i,colStr){ listCols[colStr] = { dataName:colStr }; });
			inObj.listCols = listCols;
		}
		// B: Add all key/val from passed object
		$.each(inObj, function(key,val){ objNew[key] = val });

		// STEP 4: Gather/Populate data
		doLoadListMetadata( objNew );
	}

	/**
    * Insert a new item into SP List/Library
	*
	* @example
	* sprLib.insertItem({
	*   listName: "Employees",
	*   jsonData: {
	* 	  __metadata: { type:"SP.Data.EmployeesListItem" },
	* 	  Full_x0020_Name: 'Marty McFly',
	* 	  Hire_x0020_Date: new Date()
	*   },
	*   onExec: function(){ console.log('Here we go...'); },
	*   onDone: function(data){ alert('insert done! new id = ' + data.Id); },
	*   onFail: function(mesg){ console.error(mesg); }
	* });
	*
	* @param {object} inObj - The item to insert, in regular SharePoint JSON format
	*                 Parameters:
	*                 @param listName {string} (required)
	*                 @param jsonData {object} (required) - col name/value key pairs
	*                 @param onExec {function} - callback function for start of operation
	*                 @param onDone {function} - callback function for completion of operation (returns data)
	*                 @param onFail {function} - callback function for operation failure (returns parsed error message)
	* @return {object} Return newly created item in JSON format (return the data result from SharePoint).
	*/
	sprLib.insertItem = function insertItem(inObj) {
		// STEP 1: REALITY-CHECK
		if ( !inObj.listName || !inObj.jsonData ) {
			var strTemp = 'insertItem ERROR:\n\n'+ inEleId +'object parameter must contain: listName and jsonData!';
			( inObj.onFail ) ? inObj.onFail(strTemp) : console.error(strTemp);
			return null;
		}

		// STEP 2: Add internal variables/methods
		inObj.retryCnt = 0;

		// STEP 3: Insert item
		doInsertListItem(inObj);
	};

	/**
	* Update an existing item in a SP List/Library
	*
	* @example
	* sprLib.updateItem({
	* 	listName: "Employees",
	* 	jsonData: {
	* 		__metadata: { type:"SP.Data.EmployeesListItem", etag:1 },
	* 		Id: 1001,
	* 		Full_x0020_Name: 'Marty McFly',
	* 		Hire_x0020_Date: new Date()
	* 	},
	* 	onDone: function(data){ alert('insert done! new id = ' + data.Id); },
	* 	onFail: function(mesg){ console.error(mesg); }
	* });
	*
	* @param {object} inObj - The item to update, in regular SharePoint JSON format
	* @return {object} Return newly created item in JSON format (return the data result from SharePoint).
	*/
	sprLib.updateItem = function updateItem(inObj) {
		// STEP 1: REALITY-CHECK
		if ( !inObj.listName || !inObj.jsonData || !inObj.jsonData.Id ) {
			var strTemp = 'updateItem ERROR:\n\n object parameter must contain: listName, jsonData, jsonData.Id!';
			( inObj.onFail ) ? inObj.onFail(strTemp) : console.error(strTemp);
			return null;
		}

		// STEP 2: Add internal variables/methods
		inObj.retryCnt = 0;

		// STEP 3: Update item
		doUpdateListItem( inObj );
	};

	/**
	* Delete an item from a SP List/Library
		sprLib.deleteItem({
			listName: "Employees",
			jsonData: {
				__metadata: { type:"SP.Data.EmployeesListItem" },
				Id        : 99
			},
			onDone: function(){ alert('Done!); },
			onFail: function(mesg){ console.error(mesg); }
		});

 	*/
	sprLib.deleteItem = function deleteItem(inObj) {
		// STEP 1: REALITY-CHECK
		if ( !inObj.listName || !inObj.jsonData || !inObj.jsonData.Id ) {
			var strTemp = 'updateItem ERROR:\n\nobject parameter must contain: listName, jsonData, jsonData.Id!';
			( inObj.onFail ) ? inObj.onFail(strTemp) : console.error(strTemp);
			return null;
		}

		// STEP 2: Add internal variables/methods
		inObj.retryCnt = 0;

		// STEP 3: Insert item
		doDeleteListItem( inObj );
	};

	// LIST API METHODS

	// TODO: function that returns all the keys that SP provides via:  ../_api/web/GetByTitle
	// super useful for writing our own listCols objects and/or seeing all List cols/types!
	// This method will return a metadata-like object: {dataName: dataType: isNumPct etc! }

	/**
	* Execute an ad-hoc REST API query to one of many endpoints
	*
	* @example
	sprLib.restCall({
		restUrl: '/sites/dev/_api/web/sitegroups',
		restType: ["GET" | "POST"],
		queryCols: {
			title: { dataName:'Title' },
			loginName: { dataName:'LoginName' },
			editAllowed: { dataName:'AllowMembersEditMembership' }
		},
		queryFilter:   "AllowMembersEditMembership eq 1",
		queryOrderby:  "Title",
		queryMaxItems: 10,
		onDone: function(arrayResults){ console.table(arrayResults) }
	});
	*/
	// EX: https://gitbrent.sharepoint.com/sites/dev/_api/web/lists/getbytitle('Employees')/
	// EX: https://gitbrent.sharepoint.com/sites/dev/_api/web/sitegroups
	sprLib.restCall = function restCall(inObj) {
		// STEP 1: REALITY-CHECK
		if ( !inObj.restUrl ) {
			var strTemp = 'restQuery ERROR:\n\n object parameter must contain: restUrl';
			( inObj.onFail ) ? inObj.onFail(strTemp) : console.error(strTemp);
			return null;
		}

		// STEP 2: Add internal vars/methods
		inObj.retryCnt = 0;

		// STEP 3: Exec query
		doRestCall(inObj);
	}


	// USER/GROUP METHODS

	/**
	* Get current user data
	sprLib.getCurrentUser({ onDone: function(data){ console.log(data.Id +"/"+ data.Title +"/"+ data.Email); } });
	*/
	sprLib.getCurrentUser = function getCurrentUser(inObj) {
		doGetCurrentUser(inObj);
	}

	/**
	* Get current user's Group titles
	* EX:
		sprLib.getCurrentUserGroups({
			onDone: function(data){ if ( $.inArray('Leadership', data) > -1 ) gBoolHasPriv = true; }
		});
	*/
	sprLib.getCurrentUserGroups = function getCurrentUserGroups(inObj) {
		doGetCurrentUserGroups(inObj);
	}

	/**
	* Get user info by Id
	* EX:
		sprLib.getUserById({
			userId: 1001,
			onDone: function(objUser){ console.log(objUser.Title +" / "+ objUser.Email); }
		});
	*/
	sprLib.getUserById = function getUserById(inObj) { doGetUserById(inObj); }
	// TODO: sprLib.getUserGroupsById = function getUserGroupsById(inObj) { doGetUserGroupsById(inObj); }

	// SITE METHODS
	// TODO: Get Site Groups, Usage etc. - some good common methods here

	// OPTIONS

	/**
	* Getter/Setter for the app option APP_OPTS.baseUrl (our _api call base)
	*
	* @example
	* // Set baseUrl
	* sprLib.baseUrl('/sites/devtest');
	* // Get baseUrl - returns '/sites/devtest'
	* sprLib.baseUrl();
	*
	* @param {string} inStrDate - URL to use as the root of API calls
	* @return {string} Return value of APP_OPTS.baseUrl
	*/
	sprLib.baseUrl = function setBaseUrl(inStr) {
		// CASE 1: Act as a GETTER when no value passed
		if ( typeof inStr !== 'string' || inStr == '' || !inStr ) return APP_OPTS.baseUrl;

		// CASE 2: Act as a SETTER
		APP_OPTS.baseUrl = inStr;
		if (DEBUG) console.log('APP_OPTS.baseUrl set to: '+inStr);
	}

	// MISC METHODS

	/**
	* Gets the version of this library
	*/
	sprLib.getVersion = function getVersion() {
		return APP_VER;
	};

	/*
	* ==================================================================================================================
	* ONLOAD FUNCTIONS
	* ==================================================================================================================
	*/

	$(document).ready(function(){
		// FUNC-1: Show "Loading" busy spinners for TABLEs (if any)
		{
			$('table[data-bind]').each(function(i,tag){
				if ( $(this).data('bind').options && $(this).data('bind').options.showBusySpinner ) {
					$(this).append('<tbody class="sprlibTemp"><tr><td style="text-align:center">'+ APP_OPTS.busySpinnerHtml +'</td></tr></tbody>');
				}
			});
			$('tbody[data-bind]').each(function(i,tag){
				if ( $(this).data('bind').options && $(this).data('bind').options.showBusySpinner ) {
					$(this).append('<tr class="sprlibTemp"><td colspan="'+ ($(this).parents('table').find('thead th').length || 1) +'" style="text-align:center">'+ APP_OPTS.busySpinnerHtml +'</td></tr>');
				}
			});
		}
	});
})();
