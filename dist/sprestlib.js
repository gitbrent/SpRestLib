/*\
|*|  :: SpRestLib.js ::
|*|
|*|  JavaScript Library for SharePoint Web Serices
|*|  https://github.com/gitbrent/SpRestLib
|*|
|*|  This library is released under the MIT Public License (MIT)
|*|
|*|  SpRestLib (C) 2016-2017 Brent Ely -- https://github.com/gitbrent
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
- Add `$skip` (https://sharepoint.stackexchange.com/questions/45719/paging-using-rest-odata-with-sp-2013)
-- @see: https://dev.office.com/sharepoint/docs/sp-add-ins/use-odata-query-operations-in-sharepoint-rest-requests#page-through-returned-items
? SOLN: use new opts: `skipId` & `skipLimit`
? SOLN: then we can construct: "items?$skiptoken=Paged=TRUE&p_ID="+ 2 +"&$select=ID&$orderby=ID&$top=" + 2

 - Add `Intl` (i18n) support (its supported in IE11!!) - Date and Currency formats are awesome (add Direction for our R->L users too?)
*/

// Detect Node.js
var NODEJS = ( typeof module !== 'undefined' && module.exports );

(function(){
	// APP VERSION/BUILD
	var APP_VER = "1.3.0";
	var APP_BLD = "20171122";
	var DEBUG = false; // (verbose mode/lots of logging)
	// ENUMERATIONS
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
	// APP MESSAGE STRINGS (Internationalization)
	var APP_STRINGS = {
		"de": {
			"false" : "Nein",
			"noRows": "(Keine zeilen)",
			"true"  : "Ja"
		},
		"en": {
			"false" : "No",
			"noRows": "(No rows)",
			"true"  : "Yes"
		},
		"es": {
			"false" : "No",
			"noRows": "(No hay filas)",
			"true"  : "Sí"
		},
		"fr": {
			"false" : "Non",
			"noRows": "(Aucune ligne)",
			"true"  : "Oui"
		},
		"in": {
			"false" : "नहीं",
			"noRows": "(कोई पंक्तियाँ)",
			"true"  : "हाँ"
		},
		"jp": {
			"false" : "偽",
			"noRows": "(行がありません)",
			"true"  : "真実"
		}
	};
	// USER-CONFIGURABLE: UI OPTIONS
	var APP_OPTS = {
		baseUrl:         '..',
		busySpinnerHtml: '<div class="sprlib-spinner"><div class="sprlib-bounce1"></div><div class="sprlib-bounce2"></div><div class="sprlib-bounce3"></div></div>',
		cleanColHtml:    true,
		currencyChar:    '$',
		language:        'en',
		maxRetries:      2,
		maxRows:         1000,
		nodeCookie:      '',
		nodeServer:      '',
		retryAfter:      1000
	};
	var APP_CSS = {
		updatingBeg: { 'background-color':'#e2e9ec' },
		updatingErr: { 'background-color':'#e2999c', 'color':'#fff' },
		updatingEnd: { 'background-color':'', 'color':'' }
	};
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

	function parseErrorMessage(jqXHR, textStatus, errorThrown) {
		// STEP 1:
		jqXHR       = jqXHR       || {};
		textStatus  = textStatus  || "";
		errorThrown = errorThrown || "";

		// STEP 2:
		var strErrText = "("+ jqXHR.status +") "+ textStatus +": "+ errorThrown;
		var strSpeCode = "";

		// STPE 3: Parse out SharePoint/IIS error code and message
		try {
			strSpeCode = $.parseJSON(jqXHR.responseText).error['code'].split(',')[0];
			strErrText = "(" + jqXHR.status + ") " + $.parseJSON(jqXHR.responseText).error['message'].value;
		}
		catch (ex) {
			if (DEBUG) console.warn('Unable to parse jqXHR response:\n' + jqXHR.responseText);
		}

		// Done!
		return strErrText;
	}

	function doRenewDigestToken() {
		return new Promise(function(resolve,reject) {
			// Use SP.js UpdateFormDigest function if available
			// @see http://www.wictorwilen.se/sharepoint-2013-how-to-refresh-the-request-digest-value-in-javascript
			// UpdateFormDigest() is syncronous per this SharePoint MVP, so just run and return
			// DEFAULT: UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, _spFormDigestRefreshInterval);
			// Use a very short refresh interval to force token renewal (otherwise, unless it's been 30 min or whatever, no new token will be provided by SP)
			UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, 10);
			resolve();
		});
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

	function doShowBusySpinners() {
		// STEP 1: TABLE
		$('table[data-bind]').each(function(i,tag){
			if ( $(this).data('bind').options && $(this).data('bind').options.showBusySpinner ) {
				$(this).append('<tbody class="sprlibTemp"><tr><td style="text-align:center">'+ APP_OPTS.busySpinnerHtml +'</td></tr></tbody>');
			}
		});

		// STEP 2: TBODY
		$('tbody[data-bind]').each(function(i,tag){
			if ( $(this).data('bind').options && $(this).data('bind').options.showBusySpinner ) {
				$(this).append('<tr class="sprlibTemp"><td colspan="'+ ($(this).parents('table').find('thead th').length || 1) +'" style="text-align:center">'+ APP_OPTS.busySpinnerHtml +'</td></tr>');
			}
		});
	}

	function doPopulateDataBinds() {
		var arrTags = [], arrPromises = [];
		var isFilterPassed = false;
		var objListData = {}, objFilter = {}, objTable = null;

		return new Promise(function(resolve, reject) {
			// STEP 1: Gather all tags with sprlib binding

			/* EXAMPLES:
			<table  data-sprlib='{ "list":"Departments", "cols":["Title"], "showBusy":true }'></table>
			<span   data-sprlib='{ "list":"Employees", "value":"name", "filter":"ID eq 2" }'></span>
			<select data-sprlib='{ "list":"Employees", "value":"Title", "text":"Id" }'></select>
			*/
			$('[data-sprlib]').each(function(i,tag){
				if (DEBUG) { console.log('--------------------'); console.log('Found tag: '+$(tag).prop('tagName')+' - id: '+$(tag).prop('id')); }

				// A: Parse bind data from html tags
				var data = {};
				try {
					// NOTE: jQuery returns an JSON-type object automatically (no JSON.parse required)
					data = $(tag).data('sprlib');
					// Ignore garbage or tags w/o a LIST
					if ( typeof data !== 'object' || !data.list ) {
						if (DEBUG) {
							console.log('**Warning** this tag has `data-sprlib` but its data isnt an object or its lacks `list` arg');
							console.log(data);
							console.log(typeof data);
							console.log( (data.list ? data.list : 'data.list does not exist') );
						}
						return; // aka:next
					}
				}
				catch(ex) {
					console.log( 'Unable to ingest data-sprlib!' + '\n' );
					console.log( 'tag.: ' + $(tag)[0].outerHTML + '\n' );
					console.log( 'data: ' );
					console.log( $(tag).data('sprlib') );
					/* TODO: better err msg?
					var strTemp = 'PARSE ERROR:\n\n(text requires "model"/"cols")\n'
						+ 'Your code:\n'+ $(tag)['context'].outerHTML.replace(/\&quot\;/gi,'"') +'\n\n'
						+ 'Should look like this:\n<'+ $(tag).prop('tagName') + ' data-bind:\'{"text":{"model":"Emps", "cols":"firstName"}}\'>';
					*/

					return;
				}
				if (DEBUG) { console.log('tag data: '); console.log(data); }

				// TODO: Check select for text/value (fallback to cols if exists), etc.!
				// TODO: REQD field checks here (we need cols right?)
				if ( !Array.isArray(data.cols) ) data.cols = null;

				// B: Store valid tags+data
				arrTags.push({
					tag:    $(tag),
					list:   data.list,
					data:   [],
					cols:   ( data.cols   || [] ),
					text:   ( data.text   || '' ),
					value:  ( data.value  || '' ),
					filter: ( data.filter || null ),
					tablesorter: ( data.tablesorter || null )
				});

				// C: Add this List to unique array of Lists and their combined column needs
				if ( !objListData[data.list] ) objListData[data.list] = { cols:(data.cols || []) };

				// D: Add columns to query list if needed - there's 4 ways cols come in:
				(data.cols || []).forEach(function(col,i){
					if (objListData[data.list].cols.indexOf(col) == -1) objListData[data.list].cols.push( col );
				});
				if ( data.filter && data.filter.col && objListData[data.list].cols.indexOf(data.filter.col) == -1 )
					objListData[data.list].cols.push( data.filter.col );
				if ( data.text  && objListData[data.list].cols.indexOf(data.text)  == -1 )
					objListData[data.list].cols.push( data.text  );
				if ( data.value && objListData[data.list].cols.indexOf(data.value) == -1 )
					objListData[data.list].cols.push( data.value );
			});
			if (DEBUG) { console.log('objListData\n'); console.log(objListData); }

			// STEP 2: Create a Promise query for each List and add to array for use in Promise.all
			$.each(objListData, function(list,opts){
				arrPromises.push(
					sprLib.list(list)
					.getItems({ listCols:opts.cols })
					.then(function(data){
						arrTags.filter(function(tag){ return tag.list == list }).map(function(tag){ tag.data = data });
					})
					.catch(function(err){
						console.log('TODO: bad list! or some err! set data to null and keep going!');
					})
				);
			});
			if (DEBUG) { console.log('objListData\n'); console.log(arrPromises); }

			// STEP 3: Wait for each List query to provide all the data needed to fill all tags
			Promise.all( arrPromises )
			.then(function(){
				if (DEBUG) { console.log('arrTags:\n'); console.table(arrTags); }
				// Populate each tag
				arrTags.forEach(function(objTag,idx){
					// A: Remove any temporary UI items now that this element is being populated
					objTag.tag.find('.sprlibTemp').remove();

					// B: Handle FILTER
					objFilter = {};
					if ( objTag.filter ) {
						// A: Param Check -- NOTE: Dont use "!objTag.filter.val" as actual value may be [false] or ""!
						if ( !objTag.filter.col || !objTag.filter.op || typeof objTag.filter.val === 'undefined' ) {
							reject('FILTER ERROR:\n\nYour filter:\n'+ objTag.tag['context'].outerHTML.replace(/\&quot\;/gi,'"') +'\n\nShould look like this:\n"filter":{"col":"name", "op":"eq", "val":"bill"}\'>');
						}
						else if ( !APP_FILTEROPS[objTag.filter.op] ) {
							reject('FILTER ERROR:\n\nOperation Unknown:\n'+ objTag.filter.op +'>');
						}

						// B:
						objFilter = objTag.filter;
						if (DEBUG) { console.log('objFilter:'); console.log(objFilter); }
					}

					// C: Find/Populate element bound to this LIST object
					if ( objTag.tag.is('select') || objTag.tag.is('table') || objTag.tag.is('tbody') ) {
						if ( objTag.tag.is('select') ) {
							if ( !objTag.text && !objTag.value ) {
								reject('<select> requires `text` and `value`.\nEx: <select data-sprlib=\'{ "list":"Employees", "value":"Title", "text":"Id" }\'></select>');
							}

							$.each(objTag.data, function(i,data){
								objTag.tag.append('<option value="'+ data[objTag.value] +'">'+ data[objTag.text] +'</option>');
							});
						}
						else if ( objTag.tag.is('table') || objTag.tag.is('tbody') ) {
							// A: Prepare table
							// CASE 1: <table>
							if ( objTag.tag.is('table') ) {
								// A: Destroy tablesorter before modifying table
								if ( objTag.tableSorter && $.tablesorter ) objTag.tag.trigger("destroy");

								// B: Add or Empty <thead>
								( objTag.tag.find('> thead').length == 0 ) ? objTag.tag.prepend('<thead/>') : objTag.tag.find('> thead').empty();

								// C: Populate <thead>
								var $row = $('<tr/>');
								$.each(objTag.cols, function(key,col){
									if ( !col.hidden ) $row.append('<th>'+ (col.dispName || col) +'</th>');
								});
								objTag.tag.find('> thead').append( $row );

								// D: Add or Empty <tbody>
								( objTag.tag.find('> tbody').length == 0 ) ? objTag.tag.append('<tbody/>') : objTag.tag.find('> tbody').empty();

								// E: Set loop fill object
								objTable = objTag.tag;
							}
							// CASE 2: <tbody>
							else if ( objTag.tag.is('tbody') ) {
								objTag.tag.empty();
								objTable = objTag.tag.parent('table');
							}

							// B: Add each table row
							objTag.data.forEach(function(arrData,i){
								// 1: Add row
								isFilterPassed = false;
								var $newRow = $('<tr/>');

								// 2: Add cells to new row (add blank and populate instead of .append'ing them bc we need to guarantee order eg: col->col)
								objTag.cols.forEach(function(idx,col){ $newRow.append('<td/>') });

								// 3: Populate row cells
								$.each(arrData, function(key,val){
									// TODO: HELP: howto use these "op" lookups in an actual if? (eval?)
									// FIXME: Filtering: "filter": {"col":"active", "op":"eq", "val":false}} }

									// A: Filtering: Check if filtering, if not give green light
									if ( !objFilter.col || ( objFilter.col == key && objFilter.op == "eq" && objFilter.val == val ) ) isFilterPassed = true;

									// B: Add row cells
									// If's b/c we could be given a simple array of col names or a complex object
									if ( objTag.cols.indexOf(key) > -1 ) {
										$newRow.find('td:nth-child('+ (objTag.cols.indexOf(key)+1) +')').text( val );
									}
									else if ( objTag.cols[key] && !objTag.cols[key].hidden ) {
										// A: Stringify boolean values (true/false)
										if ( typeof val === 'boolean' ) val = val.toString().replace('true','Yes').replace('false','No');

										// B: Create cell
										var $cell = $('<td/>');
										if      ( val && objTag.cols[key].isNumPct && !isNaN(val) )               $cell.text( Math.round(val*100)+'%' );
										else if ( val && objTag.cols[key].dataType == 'Currency' && !isNaN(val) ) $cell.text( formatCurrency(val) );
										else if ( val && objTag.cols[key].dataType == 'DateTime' )                $cell.text( formatDate(val, (objTag.cols[key].dateFormat||'INTL')) );
										else                                                                      $cell.text( (val || '') );

										// C: Add CSS dispStyle and/or dispClass (if any)
										if ( objTag.cols[key].dispClass ) { $cell.addClass( objTag.cols[key].dispClass ); }
										if ( objTag.cols[key].dispStyle ) {
											try {
												if ( typeof JSON.parse(objTag.cols[key].dispStyle) === 'object' ) $cell.css( JSON.parse(objTag.cols[key].dispStyle) );
											}
											catch(ex) {
												var strTemp = 'PARSE ERROR:\n'
													+ 'Unable to parse [JSON.parse] and/or set the css dispStyle for data model: '+ bindJSON[bindOper].model +'\n\n'
													+ '* model dispStyle value:\n'+ objTag.cols[key].dispStyle +'\n'
													+ '* correct syntax ex:\n{"width":"1%", "white-space":"nowrap"}\n\n'
													+ ex;
												reject(strTemp);
											}
										}

										// D: Add cell to row
										//$newRow.append( $cell );
										// TODO: TEST Below!! where we use above works great
										$newRow.find('td:nth-child('+ (objTag.cols.indexOf(key)+1) +')').text( val );
									}
								});

								// 3: Add new table row if filter matched and only if the cell(s) were populated
								//if ( isFilterPassed && $newRow.find('td').length > 0 ) $(objTable).find('> tbody').append( $newRow );
								if ( isFilterPassed ) $(objTable).find('> tbody').append( $newRow );
							});

							// C: OPTIONS: Setup tablesorter
							if ( objTag.tableSorter && $.tablesorter ) {
								objTag.tag.tablesorter({ sortList:objTag.tableSorter.sortList }); // Sort by (Col#/Asc=0,Desc=1)
								objTag.tableSorter.htmlEle = $(objTable);
							}

							// D: Show message when no rows
							if ( $(objTable).find('tbody tr').length == 0 ) {
								$(objTable).find('tbody').append('<tr><td colspan="'+ $(objTable).find('thead th').length +'" style="color:#ccc; text-align:center;">'+ APP_STRINGS[APP_OPTS.language].noRows +'</td></tr>');
							}
						}
					}
					else {
						// B: (NOTE: There may be more than one row of data, but if use bound a single text field, what else can we do - so we use [0]/first row)
						if ( objTag.tag.is('input[type="text"]') ) objTag.tag.val( objTag.data[0][objTag.value] );
						else if ( objTag.tag.not('input') ) objTag.tag.text( objTag.data[0][objTag.value] );
					}
				});

				// Done
				resolve();
			})
			.catch(function(err){
				reject(err);
				if (DEBUG) console.error(err);
				// TODO: better console.error here?
			});
		});
	}

	function doParseFormIntoJson(inModel, inEleId) {
		// TODO: Validate/Update/Document for post-1.0.0
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
				objReturn.jsonFormat[strCol] = ( inModel.listCols[strCol].dateFormat ? bdeLib.localDateStrFromSP(null,$(this).datepicker('getDate'),inModel.listCols[strCol].dateFormat) : $(this).datepicker('getDate').toISOString() );
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
	* @example - set baseUrl
	* sprLib.baseUrl('/sites/devtest');
	*
	* @example - get baseUrl
	* sprLib.baseUrl();
	* @returns '/sites/devtest'
	*
	* @param {string} inStrDate - URL to use as the root of API calls
	* @return {string} Return value of APP_OPTS.baseUrl
	*/
	sprLib.baseUrl = function baseUrl(inStr) {
		// CASE 1: Act as a GETTER when no value passed
		if ( typeof inStr !== 'string' || inStr == '' || !inStr ) return APP_OPTS.baseUrl;

		// CASE 2: Act as a SETTER
		APP_OPTS.baseUrl = inStr;
		if (DEBUG) console.log('APP_OPTS.baseUrl set to: '+inStr);
	}

	// API: LIST (CRUD + getItems)
	/**
	* @param inOpts (string) - required - List Name or List GUID
	* @example - string - sprLib.list('Documents');
	*
	* @param inOpts (object) - required - { `name`, [`baseUrl`] }
	* @example - string - sprLib.list({ name:'23846527-228a-41a2-b5c1-7b55b6fea1a3' });
	* @example - string - sprLib.list({ name:'Documents' });
	* @example - string - sprLib.list({ name:'Documents', baseUrl:'/sites/dev/sandbox' });
	*/
	sprLib.list = function list(inOpts) {
		var _newList = {};
		var _urlBase = "_api/lists";

		// A: Param check
		if ( inOpts && typeof inOpts === 'string' ) {
			// DESIGN: Accept either [ListName] or [ListGUID]
			_urlBase += ( gRegexGUID.test(inOpts) ? "(guid'"+ inOpts +"')" : "/getbytitle('"+ inOpts.replace(/\s/gi,'%20') +"')" );
		}
		else if ( inOpts && typeof inOpts === 'object' && Object.keys(inOpts).length > 0 && inOpts.name ) {
			_urlBase = (inOpts.baseUrl ? inOpts.baseUrl.replace(/\/+$/,'')+'/_api/lists' : _urlBase);
			_urlBase += ( gRegexGUID.test(inOpts.name) ? "(guid'"+ inOpts.name +"')" : "/getbytitle('"+ inOpts.name.replace(/\s/gi,'%20') +"')" );
		}
		else {
			console.error("ERROR: A 'listName' or 'listGUID' is required! EX: `sprLib.list('Employees')` or `sprLib.list({ name:'Employees' })`");
			console.error('ARGS:');
			console.error(inOpts);
			return null;
		}

		/**
		* Used after `.create()` if no {type} was provided (enables us to continue using the object in subsequnt operations)
		* Used internally when users send CRUD methods objects without `__metadata.type`
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

		// TODO: list().perms()
		// returns exactly what SP Perms page has (user/group, type, perm roles/levels)
		// Eg: _layouts/15/user.aspx?obj=[listGUID]

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
		* @example: sprLib.list('Employees').info().then(function(objInfo){ console.table(objInfo) });
		*/
		_newList.info = function() {
			return new Promise(function(resolve, reject) {
				var strFields = 'Id,AllowContentTypes,BaseTemplate,BaseType,Created,Description,DraftVersionVisibility,'
					+ 'EnableAttachments,EnableFolderCreation,EnableVersioning,ForceCheckout,Hidden,ItemCount,'
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

		// GET-ITEMS ----------------------------------------------------------------

		/**
		* Get specified or all List/Library column values - optionally: filter, sort, limit
		*
		* Options:
		*
		* | property      | type    | reqd  | description       | example/allowed vals |
		* |---------------|---------|-------|-------------------|----------------------|
		* | `listCols`    | array   | no    | array of column names in OData style | `listCols: ['Name', 'Badge_x0020_Number']` |
		* | `listCols`    | object  | no    | object with column properties | `listCols: { badge: { dataName:'Badge_x0020_Number' } }` |
		* | `metadata`    | boolean | no    | whether to return `__metadata` | `metadata: true }` |
		* | `queryFilter` | string  | no    | OData style filter    | `ID eq 1`, `Badge_x0020_Number eq 1234` |
		* | `queryOrderby`| string  | no    | OData style order by  | `Badge_x0020_Number`, `Badge_x0020_Number desc` [asc sort is SP2013 default] |
		* | `queryLimit`  | number  | no    | OData style row limit | `10` would limit number of rows returned to 10 |
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
		* | `currencyFormat` | string  | no    | date format       | `INTL`, `INTLTIME` TODO |
		* | `dateFormat`     | string  | no    | date format       | `INTL`, `INTLTIME` TODO |
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
		*/
		_newList.getItems = function(inObj) {
			var listGUID = '';
			return new Promise(function(resolve, reject) {
				// STEP 1: Create/Init Params
				inObj = inObj || {};
				// Deal with garbage here instead of in parse
				if ( inObj == '' || inObj == [] ) inObj = {};
				// Handle: `$filter` only accepts single quote (%27), double-quote (%22) will fail, so transform if needed
				if ( inObj.queryFilter ) inObj.queryFilter = inObj.queryFilter.replace(/\"/gi,"'");

				// TODO: check for dupe col names! ['Name','Name']

				// STEP 2: Parse options/cols / Set Internal Arrays
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
						inObj.listCols.forEach(function(colStr,i){
							var strTmp = ( colStr.indexOf('/') > -1 ? colStr.substring(0,colStr.indexOf('/')) : colStr );
							// Handle cases where there are 2 expands from same column. Ex: 'Manager/Id' and 'Manager/Title'
							if ( colStr ) objListCols[strTmp] = ( objListCols[strTmp] ? { dataName:objListCols[strTmp].dataName+','+colStr } : { dataName:colStr } );
						});
						objNew.listCols = objListCols;
						inObj = objNew;
					}
					// CASE 5: No listCols - create when needed
					else if ( !inObj.listCols ) inObj.listCols = {};

					// AJAX OPTIONS:
					inObj.cache = inObj.cache || false;
					// TODO: change 'false' to DEF_CACHE

					// Add internal data objects
					inObj.spArrData = [];
					inObj.spObjData = {};
					inObj.spObjMeta = {};
				}

				// STEP 3: Start data fetch Promise chain
				Promise.resolve()
				.then(function(){
					return new Promise(function(resolve, reject) {
						var objAjaxQuery = {
							url     : _urlBase+"/items",
							type    : "GET",
							cache   : inObj.cache,
							metadata: inObj.metadata || false,
							headers : { "Accept":"application/json;odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
						};
						var arrExpands = [], strExpands = "";

						// STEP 1: Start building REST Endpoint URL
						{
							// If columns were provided, start a select query
							if ( inObj.listCols && Object.keys(inObj.listCols).length > 0 ) objAjaxQuery.url += "?$select=";
						}

						// STEP 2: Keep building REST Endpoint URL
						{
							// A: Add columns
							$.each(inObj.listCols, function(key,col){
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

							// B: Add maxrows (if any) or use default b/c SP2013 default is a paltry 100 rows!
							objAjaxQuery.url += (objAjaxQuery.url.indexOf('?$') > -1 ? '&':'?') + '$top=' + ( inObj.queryLimit ? inObj.queryLimit : APP_OPTS.maxRows );

							// C: Add expand (if any)
							if ( strExpands ) objAjaxQuery.url += (objAjaxQuery.url.indexOf('?$') > -1 ? '&':'?') + '$expand=' + strExpands;

							// D: Add filter (if any)
							if ( inObj.queryFilter ) {
								objAjaxQuery.url += (objAjaxQuery.url.indexOf('?$') > -1 ? '&':'?') + '$filter=' + ( inObj.queryFilter.indexOf('%') == -1 ? encodeURI(inObj.queryFilter) : inObj.queryFilter );
							}

							// E: Add orderby (if any)
							if ( inObj.queryOrderby ) objAjaxQuery.url += (objAjaxQuery.url.indexOf('?$') > -1 ? '&':'?') + '$orderby=' + inObj.queryOrderby;
						}

						// STEP 3: Send AJAX REST query
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

								// B.3: Capture query results
								$.each(inObj.listCols, function(key,col){
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
										if ( typeof colVal === 'object' && !Array.isArray(colVal) && Object.keys(colVal).length == 0 ) colVal = null;
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

								// 4: Set data
								// 4.A: Result row
								inObj.spArrData.push( objRow );
								// 4.B: Create data object if we have ID (for lookups w/o spArrData.filter)
								if ( intID ) {
									inObj.spObjData[intID] = objRow;
									inObj.spObjMeta[intID] = ( result.__metadata || {} );
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
					$.each(inObj.listCols, function(key,col){
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
							url: "_vti_bin/owssvr.dll?Cmd=Display&List="
								+ "%7B"+ listGUID +"%7D"+"&XMLDATA=TRUE&IncludeVersions=TRUE"
								+ "&Query=ID%20"+ arrAppendColNames.toString().replace(/\,/g,'%20') +"%20"
								+ "Modified%20Editor%20"
								+ "&SortField=Modified&SortDir=ASC"
						})
						.then(function(result){
							if ( result && result[0] && result[0].documentElement ) {
								// Query is order by oldest->newest, so always capture the result and the last one captured will always be the most recent
								$(result[0].documentElement).find("z\\:row, row").each(function(i,row){
									arrAppendCols.forEach(function(objCol,idx){
										var intID = $(row).attr("ows_ID");
										var prvComm = "";

										// NOTE: LOGIC: Versions doesnt filter like getItems, so we may get many more items than our dataset has
										if ( inObj.spObjData[intID] && $(row).attr("ows_"+objCol.dataName) ) {
											var rowNote = ($(row).attr('ows_'+objCol.dataName) || '');
											if ( rowNote ) {
												if ( rowNote != prvComm ) {
													inObj.spObjData[intID][objCol.keyName].push({
														verDate: new Date($(row).attr('ows_Modified')).toISOString(),
														verName: $(row).attr('ows_Editor').substring($(row).attr('ows_Editor').indexOf("#")+1),
														verText: rowNote
													});
													prvComm = rowNote;
												}
												else {
													// When note content is the same, replace the previous version
													// (so author and date are correct - older ones are ModifiedBy folks who Modified *OTHER* fields! - oldest is true author!)
													inObj.spObjData[intID][objCol.keyName].pop();
													inObj.spObjData[intID][objCol.keyName].push({
														verDate: new Date($(row).attr('ows_Modified')).toISOString(),
														verName: $(row).attr('ows_Editor').substring($(row).attr('ows_Editor').indexOf("#")+1),
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
				if ( !jsonData || Array.isArray(jsonData) || typeof jsonData !== 'object' || Object.keys(jsonData).length == 0 ) reject("JSON data expected! Ex: `{Name:'Brent'}`");
				try { var test = JSON.stringify(jsonData) } catch(ex) { reject("`JSON.stringify(jsonData)` failed! Send valid JSON Please. Ex: `{'Name':'Brent'}`") }

				// STEP 1: Param Setup
				// B: DESIGN/OPTION: If no etag is provided, consider it a force (a faux {OPTION})
				jsonData.__metadata = jsonData.__metadata || {};
				// Ensure we dont pass an etag
				delete jsonData.__metadata.etag;

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
						headers : { "Accept":"application/json;odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
					})
					.then(function(arrData){
						if ( arrData && arrData[0] ) {
							// A: Populate new ID (both 'Id' and 'ID' to mimic SP)
							jsonData.Id = arrData[0].Id;
							jsonData.ID = arrData[0].ID;

							// B: Populate metadata
							jsonData.__metadata = jsonData.__metadata || arrData[0].__metadata || {};
							jsonData.__metadata.etag = jsonData.__metadata.etag || arrData[0].__metadata.etag;
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
		* 	Hire_x0020_Date: new Date()
		* })
		* .then(function(objItem){ console.table(objItem) })
		* .catch(function(strErr){ console.error(strErr)  });
		*
		* @param {object} inObj - The item to update, in regular SharePoint JSON format
		*
		* @return {object} Return newly created item in JSON format (return the data result from SharePoint).
		*/
		_newList.update = function(jsonData) {
			return new Promise(function(resolve, reject) {
				// FIRST: Param checks
				if ( !jsonData || Array.isArray(jsonData) || typeof jsonData !== 'object' || Object.keys(jsonData).length == 0 ) reject("JSON data expected! Ex: `{Name:'Brent'}`");
				if ( !jsonData['ID'] && !jsonData['Id'] && !jsonData['iD'] && !jsonData['id'] ) reject("JSON data must have an `ID` value! Ex: `{Id:99}`");
				try { var test = JSON.stringify(jsonData) } catch(ex) { reject("`JSON.stringify(jsonData)` failed! Send valid JSON Please. Ex: `{'Name':'Brent'}`") }

				// STEP 1: Param Setup
				// A: Set our `Id` value (users may send an of 4 different cases), then remove as ID is not updateable in SP
				var intID = jsonData['ID'] || jsonData['Id'] || jsonData['iD'] || jsonData['id'];
				delete jsonData.ID; delete jsonData.Id; delete jsonData.iD; delete jsonData.id;
				// B: DESIGN/OPTION: If no etag is provided, consider it a force (a faux {OPTION})
				jsonData.__metadata = jsonData.__metadata || {};
				// Ensure we dont pass junk as etag or SP will error
				if ( jsonData.__metadata.etag == "" || jsonData.__metadata.etag == null ) delete jsonData.__metadata.etag;

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
							"X-RequestDigest": $("#__REQUESTDIGEST").val(),
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
		* This operation is permanent (item does not go into Recycle Bin)!
		*
		* @example - with etag
		* sprLib.list('Employees').delete({
		*   __metadata: { etag:10 },
		*   Id: 1
		* })
		* .then(function(){ console.log('Deleted!') })
		* .catch(function(strErr){ console.error(strErr)  });
		*
		* @example - without etag (aka: force delete)
		* sprLib.list('Employees').delete({ Id: 1 })
		* .then(function(){ console.log('Deleted!') })
		* .catch(function(strErr){ console.error(strErr)  });
		*
		* @return {number} Return the `id` just deleted.
		*/
		_newList.delete = function(jsonData) {
			return new Promise(function(resolve,reject) {
				// FIRST: Param checks
				if ( !jsonData || Array.isArray(jsonData) || typeof jsonData !== 'object' || Object.keys(jsonData).length == 0 ) reject("JSON data expected! Ex: `{Name:'Brent'}`");
				if ( !jsonData['ID'] && !jsonData['Id'] && !jsonData['iD'] && !jsonData['id'] ) reject("JSON data must have an `ID` value! Ex: `{Id:99}`");
				try { var test = JSON.stringify(jsonData) } catch(ex) { reject("`JSON.stringify(jsonData)` failed! Send valid JSON Please. Ex: `{'Name':'Brent'}`") }

				// STEP 1: Param Setup
				// A: Set our `Id` value (users may send an of 4 different cases), then remove as ID is not updateable in SP
				var intID = jsonData['ID'] || jsonData['Id'] || jsonData['iD'] || jsonData['id'];
				delete jsonData.ID; delete jsonData.Id; delete jsonData.iD; delete jsonData.id;
				// B: DESIGN/OPTION: If no etag is provided, consider it a force (a faux {OPTION})
				jsonData.__metadata = jsonData.__metadata || {};
				// Ensure we dont pass junk as etag or SP will error
				if ( jsonData.__metadata.etag == "" || jsonData.__metadata.etag == null ) delete jsonData.__metadata.etag;

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
						type    : "DELETE",
						url     : _urlBase +"/items("+ intID +")",
						metadata: true,
						headers : {
							"X-HTTP-Method"  : "MERGE",
							"Accept"         : "application/json;odata=verbose",
							"X-RequestDigest": $("#__REQUESTDIGEST").val(),
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
		* Remove an item from a SP List/Library
		* This operation sends the item to Recycle Bin
		*
		* @example - with etag
		* sprLib.list('Employees').recycle({ __metadata:{ etag:10 }, Id:123 })
		*
		* @example - without etag
		* sprLib.list('Employees').recycle({ Id:123 })
		*
		* @example - simple ID (number or string)
		* sprLib.list('Employees').recycle(123)
		*
		* @return {number} Return the `id` just deleted.
		*/
		_newList.recycle = function(intID) {
			return new Promise(function(resolve,reject) {
				// FIRST: Param checks
				if ( !intID || typeof intID.toString() !== 'string' ) reject("ID expected! Ex: `recycle(99)`");

				// STEP 1: Recycle item
				sprLib.rest({
					type    : "POST",
					url     : _urlBase +"/items("+ intID.toString() +")/recycle()",
					metadata: true,
					headers : { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
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
			inOpt.cache = inOpt.cache || false;
			inOpt.metadata = inOpt.metadata || false;
			inOpt.type = inOpt.restType || inOpt.type || "GET";
			inOpt.url = (inOpt.restUrl || inOpt.url || APP_OPTS.baseUrl).replace(/\"/g, "'");
			//
			inOpt.spArrData = [];

			// STEP 2: Setup vars
			var arrExpands = [], strExpands = "";
			var objAjaxQuery = {
				url    : inOpt.url,
				type   : inOpt.type,
				cache  : inOpt.cache,
				headers: inOpt.headers || { "Accept":"application/json;odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
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
						$.each(inOpt.queryCols, function(key,col){
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

				// queryLimit: Add maxrows (b/c default in SP2013 is a paltry 100 rows)
				// NOTE: Only applies to GET types (POST with this param are obv. invalid!)
				if ( (inOpt.queryFilter || objAjaxQuery.url.toLowerCase().indexOf('$select') > -1) && inOpt.url.toLowerCase().indexOf('$top') == -1 && inOpt.type == "GET" ) {
					objAjaxQuery.url += ( (objAjaxQuery.url.indexOf('?')>0?'&':'?')+'$top=' + ( inOpt.queryLimit ? inOpt.queryLimit : APP_OPTS.maxRows ) );
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
					if ( NODEJS ) {
						objAjaxQuery.headers["Cookie"] = APP_OPTS.nodeCookie;
						delete objAjaxQuery.headers["X-RequestDigest"];
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
								else if ( rawData.indexOf('Microsoft.SharePoint.SPException') > -1 ) {
									// EX: {"error":{"code":"-1, Microsoft.SharePoint.SPException","message":{"lang":"en-US","value":"The field or property 'ColDoesntExist' does not exist."}}}
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
						request.end();
					}
					else {
						$.ajax(objAjaxQuery)
						.done(function(data,textStatus){
							resolve(data);
						})
						.fail(function(jqXHR,textStatus,errorThrown){
							// TODO: 20170628: renewSecurityToken when detected
							reject( parseErrorMessage(jqXHR, textStatus, errorThrown) + "\n\nURL used: " + objAjaxQuery.url );
						});
					}
				});
			})
			.then(function(data){
				// A: Parse if needed
				data = ( typeof data === 'string' && data.indexOf('{') == 0 ? JSON.parse(data) : data );

				// If result is a single object, make it an array for pasing below (Ex: '_api/site/Owner/Id')
				var arrObjResult = ( data && data.d && !data.d.results && typeof data.d === 'object' && Object.keys(data.d).length > 0 ? [data.d] : [] );

				// B: Iterate over results
				// NOTE: Depending upon which REST endpoint used, SP can return results in various forms (!)
				// EX..: data.d.results is an [] of {}: [ {Title:'Brent Ely', Email:'Brent.Ely@microsoft.com'}, {}, {} ]
				// NOTE: Ensure results are an object because SP will return an entire HTML page as a result in some error cases!
				if ( arrObjResult.length > 0 || (data && data.d && data.d.results && typeof data.d.results === 'object') ) {
					$.each((arrObjResult.length > 0 ? arrObjResult : data.d.results), function(key,result){
						var objRow = {};

						if ( inOpt.queryCols ) {
							$.each(inOpt.queryCols, function(key,col){
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
								if ( col.dataType == 'DateTime' ) objRow[key] = new Date(colVal);
								else objRow[key] = ( APP_OPTS.cleanColHtml && col.listDataType == 'string' ? colVal.replace(/<div(.|\n)*?>/gi,'').replace(/<\/div>/gi,'') : colVal );
							});
						}
						else {
							$.each(result, function(key,val){ objRow[key] = val; });
						}

						// TODO: 20171107: Add `etag` option to return etag (check to ensure it exists, then set prop value)
						if ( objRow.__metadata && !inOpt.metadata ) delete objRow.__metadata;
						inOpt.spArrData.push( objRow );
					});
				}
				// EX..: data.d or data is an [object]: { listTitle:'Game Systems', numberOfItems:25 }
				else if ( (data && data.d ? data.d : (data ? data : false)) && typeof (data.d || data) === 'object' ) {
					var objRow = {};

					$.each((data.d || data), function(key,result){ objRow[key] = result; });

					if ( objRow.__metadata && !inOpt.metadata ) delete objRow.__metadata;
					inOpt.spArrData.push( objRow );
				}

				// C:
				resolve( inOpt.spArrData );
			})
			.catch(function(strErr){
				// ROBUST: Renew token when needed (use `gRetryCounter` to prevent race condition)
				// CASE '403': SP2013-2016 Expired Token error: Microsoft.SharePoint.SPException (-2130575252): "X-RequestDigest expired form digest"
				// var strErrCode = jqXHR.status.toString();
				// var strSpeCode = $.parseJSON(jqXHR.responseText).error['code'].split(',')[0];
				// INFO: ( strErrCode == '403' && strSpeCode == '-2130575252' )
				if ( !NODEJS && typeof strErr == 'string' && strErr.indexOf('(403)') > -1 && gRetryCounter <= APP_OPTS.maxRetries ) {
					Promise.resolve()
					.then(function(){
						return sprLib.renewSecurityToken();
					})
					.then(function(){
						if (DEBUG) console.log('err-403: token renewed');
						// Some operations (ex: CRUD) will include the token value in header. It must be refreshed as well (or the new tolem is pointless!)
						if ( inOpt.headers && inOpt.headers['X-RequestDigest'] ) inOpt.headers['X-RequestDigest'] = $("#__REQUESTDIGEST").val();
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
		var newSite = {};
		var strBaseUrl = (inUrl ? (inUrl+'/').replace(/\/+$/g,'/') : ''); // Guarantee that baseUrl will end with a forward slash

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
		newSite.info = function() {
			return new Promise(function(resolve, reject) {
				Promise.all([
					sprLib.rest({
						url: strBaseUrl+'_api/web',
						queryCols: ['Id','Title','Description','Language','Created',
							'LastItemModifiedDate','RequestAccessEmail','SiteLogoUrl','Url','WebTemplate',
							'AssociatedOwnerGroup/Id',        'AssociatedMemberGroup/Id',        'AssociatedVisitorGroup/Id',
							'AssociatedOwnerGroup/OwnerTitle','AssociatedMemberGroup/OwnerTitle','AssociatedVisitorGroup/OwnerTitle',
							'AssociatedOwnerGroup/Title',     'AssociatedMemberGroup/Title',     'AssociatedVisitorGroup/Title'
						],
						cache: false
					}),
					sprLib.rest({
						url: strBaseUrl+'_api/site',
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

					// C: Resolve results (NOTE: if site was not found, an empty object is the correct result)
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
		newSite.lists = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: strBaseUrl+'_api/web/lists',
					queryCols: ['Id','Title','Description','ParentWebUrl','ItemCount','Hidden','ImageUrl','BaseType','BaseTemplate','RootFolder/ServerRelativeUrl']
				})
				.then(function(arrData){
					// A: Flatten value
					arrData.forEach(function(item,idx){ item.RootFolder = item.RootFolder.ServerRelativeUrl });

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
		newSite.subsites = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: strBaseUrl+'_api/web/webs',
					queryCols: {
						Id:				{ dataName:'Id'						,dispName:'Id'					},
						Name:			{ dataName:'Title'					,dispName:'Subsite Name'		},
						UrlAbs:			{ dataName:'Url'					,dispName:'Absolute URL'		},
						UrlRel:			{ dataName:'ServerRelativeUrl'      ,dispNAme:'Relative URL'		},
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
		* Returns array of obejcts with 2 keys: `Member` and `Roles`
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
		newSite.perms = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: strBaseUrl+'_api/web/roleAssignments',
					queryCols: ['PrincipalId','Member/PrincipalType','Member/Title','RoleDefinitionBindings/Name','RoleDefinitionBindings/Hidden']
				})
				.then(function(arrData){
					// Transform: Results s/b 2 keys with props inside each
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

					// TODO: OPTION: "Show Group Members", then do lookups below, otherwise, just show users/group names
					// TODO: use PrincipalType to find groups and query for thier users, then full pictureisodne!!!
					//.then(arrOwnerId => { return sprLib.rest({ url:site.UrlAbs+'/_api/web/SiteGroups/GetById('+ arrOwnerId[0].Id +')/Users', queryCols:['Title','Email'] }) })
					//.then(arrUsers   => arrUsers.forEach((user,idx) => site.OwnersGroupUsers += ('<div class="itemBox">'+ user.Title +'<span style="display:none">; </span></div>') ))

					// A: Resolve results (NOTE: empty array is the correct default result)
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
		newSite.roles = function() {
			return new Promise(function(resolve, reject) {
				sprLib.rest({
					url: strBaseUrl+'_api/web/roleDefinitions',
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
		newSite.groups = function() {
			return new Promise(function(resolve, reject) {
				var arrData = [];
				var arrQuery = [];

				// LOGIC: If `inUrl` exists, then just get the Groups from that site, otherwise, return SiteCollection Groups
				if ( inUrl ) {
					var arrPromises = [];

					// STEP 1: Get Groups
					sprLib.rest({
						url: strBaseUrl+'_api/web/RoleAssignments',
						queryCols: ['Member/Id','Member/Title','Member/Description','Member/OwnerTitle','Member/PrincipalType','Member/AllowMembersEditMembership'],
						queryFilter: 'Member/PrincipalType eq 8',
						queryLimit: 5000
					})
					.then(function(arrGroups){
						// STEP 2: Create array of Groups and Promises
						arrGroups.forEach(function(grp,idx){
							// A: Create object
							arrData.push({
								Id: grp.Member.Id,
								Title: grp.Member.Title,
								Description: grp.Member.Description,
								OwnerTitle: grp.Member.OwnerTitle,
								PrincipalType: (ENUM_PRINCIPALTYPES[grp.Member.PrincipalType] || grp.Member.PrincipalType),
								AllowMembersEditMembership: grp.Member.AllowMembersEditMembership,
								Users: []
							});

							// B: Create Users promise
							arrPromises.push(
								sprLib.rest({
									url: strBaseUrl+'_api/web/SiteGroups/GetById('+ grp.Member.Id +')/Users',
									queryCols: ['Id','LoginName','Title'],
									queryLimit: 5000
								})
							);
						});

						// STEP 3: Populate Group's Users
						Promise.all(arrPromises)
						.then(function(arrAllArrays,idx){
							arrAllArrays.forEach(function(arrUsers,idx){
								arrUsers.forEach(function(user,idy){ arrData[idx].Users.push({ Id:user.Id, LoginName:user.LoginName, Title:user.Title }); });
							});

							// Resolve results (NOTE: empty array is the correct default result)
							resolve( arrData || [] );
						});
					})
					.catch(function(strErr){
						reject( strErr );
					});
				}
				else {
					sprLib.rest({
						url: strBaseUrl+'_api/web/siteGroups',
						queryCols:
							['Id','Title','PrincipalType','Description','OwnerTitle','AllowMembersEditMembership',
							'Users/Id','Users/Title','Users/LoginName'],
						queryLimit: 5000
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
		newSite.users = function() {
			return new Promise(function(resolve, reject) {
				// LOGIC: If `inUrl` exists, then just get the Groups from that site, otherwise, return SiteCollection Groups
				if ( inUrl ) {
					// NOTE: A website's Users are: Users with RoleAssignments (if any), plus all users in Groups with RoleAssignments
					// A: Get individual User grants/perms
					// B: Get Members (Users) from Group grants/perms
					// FIXME: LIMIT: Library only supports up to 5000 results!
					Promise.all([
						sprLib.rest({
							url: strBaseUrl+'_api/web/RoleAssignments',
							queryCols: ['Member/Id','Member/Email','Member/LoginName','Member/Title','Member/IsSiteAdmin'],
							queryFilter: 'Member/PrincipalType eq 1',
							queryLimit: 5000
						}),
						sprLib.rest({
							url: strBaseUrl+'_api/web/RoleAssignments',
							queryCols: ['Member/Id','Member/Title','Member/Users/Id','Member/Users/Email','Member/Users/LoginName','Member/Users/Title','Member/Users/IsSiteAdmin'],
							queryFilter: 'Member/PrincipalType eq 8',
							queryLimit: 5000
						})
					])
					.then(function(arrAllArrays){
						// STEP 1: Compile results
						var arrSiteUsers = [];
						var objTempUsers = {};

						// A: Result is an array of user objects
						// EX: [ {Member: {Id:9,Title:'Brent'}}, {Member:[...]} ]
						arrAllArrays[0].forEach(function(obj,idx){
							obj.Member.Groups = [];
							arrSiteUsers.push( obj.Member );
							objTempUsers[obj.Member.Id] = obj.Member;
						});

						// B: Result is an array of `Member` objects
						// EX: [ {Member: {Id:1, Title:'Members', Users:[{Id:9,Title:'Brent'},{Id:10,Title:'Elon Musk'}]}}, {Member:[...]} ]
						arrAllArrays[1].forEach(function(obj,idx){
							if ( obj.Member.Users && obj.Member.Users.length > 0 ) {
								obj.Member.Users.forEach(function(user,idy){
									// A: Remove __metadata (if any - since it's in a sub-object, `metadata:false` will not guarantee absence)
									if ( user.__metadata ) delete user.__metadata;

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
						url: strBaseUrl+'_api/web/SiteUsers',
						queryCols: ['Id','Email','LoginName','Title','IsSiteAdmin','Groups/Id','Groups/Title'],
						queryFilter: 'PrincipalType eq 1',
						queryLimit: 5000
					})
					.then(function(arrData){
						// A: Filter internal/junk users
						if ( arrData && Array.isArray(arrData) ) {
							arrData = arrData.filter(function(user){ return user.Title.indexOf('spocrwl') == -1 && user.Id < 1000000000 });
						}

						// C: Resolve results (NOTE: empty array is the correct default result)
						resolve( arrData || [] );
					})
					.catch(function(strErr){
						reject( strErr );
					});
				}
			});
		}

		// TODO: FUTURE: contentTypes & Features
		/*
			newSite.contentTypes = function() {
				// ContentTypes: https://contoso.sharepoint.com/sites/dev/_api/web/ContentTypes
			}
			newSite.features = function() {
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
		return newSite;
	}

	// API: USER (Current or Query User by Props)
	sprLib.user = function user(inOpt) {
		// STEP 1: Variables
		var newUser = {};
		var strDynUrl = "_api/Web/CurrentUser?";

		// STEP 2: Build query URL based on whether its current user (no parameter) or a passed in object
		// NOTE: Use CurrentUser service as it is included in SP-Foundation and will work for everyone
		// ....: (Users will need SP-Enterprise for UserProfiles service to work)
		// NOTE: `_api/Web/GetUserById()` for non-existant users results in a heinous error 500 that chokes jQuery.ajax.fail(),
		// ....: so dont use it, or check user id with `siteusers?$filter` first!
		if      ( inOpt && inOpt['id']    ) strDynUrl = "_api/Web/siteusers?$filter=Id%20eq%20"+           inOpt['id']    +"&";
		else if ( inOpt && inOpt['email'] ) strDynUrl = "_api/web/siteusers?$filter=Email%20eq%20%27"+     inOpt['email'] +"%27&";
		else if ( inOpt && inOpt['login'] ) strDynUrl = "_api/web/siteusers?$filter=LoginName%20eq%20%27"+ inOpt['login'].replace(/#/g,'%23') +"%27&";
		else if ( inOpt && inOpt['title'] ) strDynUrl = "_api/web/siteusers?$filter=Title%20eq%20%27"+     inOpt['title'] +"%27&";

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
		newUser.info = function() {
			return new Promise(function(resolve, reject) {
				// A: Handle case when options have empty/null/undef params
				if ( inOpt == '' || (inOpt && !inOpt['id'] && !inOpt['email'] && !inOpt['login'] && !inOpt['title']) ) {
					resolve( {} );
					return;
				}

				// B:
				sprLib.rest({
					url    : strDynUrl + "$select=Id,Title,Email,LoginName,IsSiteAdmin,PrincipalType",
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
		newUser.groups = function() {
			return new Promise(function(resolve, reject) {
				// A: Handle case when options have empty/null/undef params
				if ( inOpt == '' || (inOpt && !inOpt['id'] && !inOpt['email'] && !inOpt['login'] && !inOpt['title']) ) {
					resolve( [] );
					return;
				}

				// B:
				sprLib.rest({
					url    : strDynUrl + "$select=Groups/Id,Groups/Title,Groups/Description,Groups/LoginName,Groups/OwnerTitle&$expand=Groups",
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

		// TODO: Add newUser.profile - that will work when users have Enterpise license/access to User-Profile-Service
		// FUTURE: add ability to fetch individual properties (`Manager` etc)
		// http://sharepoint.stackexchange.com/questions/207422/getting-user-profile-property-with-dash-in-name-with-rest-api
		// User Profile service - https://msdn.microsoft.com/en-us/library/office/dn790354.aspx
		//
		/* WORKS:
			/sites/dev/_api/sp.userprofiles.profileloader.getprofileloader/getuserprofile - (The user profile of the current user)
			/sites/dev/_api/sp.userprofiles.profileloader.getprofileloader/getuserprofile/AccountName
			/sites/dev/_api/sp.userprofiles.profileloader.getowneruserprofile
		*/
		/* 20170611:
			sprLib.rest({
				url: "/sites/dev/_api/sp.userprofiles.profileloader.getowneruserprofile",
				type: 'POST'
			})
			// WORKS in SP Online
			PictureUrl, SipAddress, etc.
		*/
		/* 20170611:
		// NOTE: Encode "#" to "%23" or query fails!
		// NOTE: Per MSDN we can only query with `accountName`
			sprLib.rest({
				url: "/sites/dev/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='i:0%23.f|membership|admin@siteurl.onmicrosoft.com'",
				type: 'POST'
			})
		*/
		/* More Ex:
		http://siteurl/_api/SP.UserProfiles.PeopleManager/GetUserProfilePropertyFor(accountName=@v,propertyName='LastName')?@v='i:0%23.f|membership|brent@siteurl.onmicrosoft.com'
		http://siteurl/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=PictureUrl,AccountName
		*/

		// LAST: Return this List to enable chaining
		return newUser;
	}

	// API: UTILITY: Token
	sprLib.renewSecurityToken = function renewSecurityToken(){
		return doRenewDigestToken();
	}

	// API: NODEJS: Setup
	sprLib.nodeConfig = function nodeConfig(inOpts){
		inOpts = (inOpts && typeof inOpts === 'object' ? inOpts : {});
		APP_OPTS.nodeCookie = inOpts.cookie || '';
		APP_OPTS.nodeServer = inOpts.server || '';
	}

	/* ===============================================================================================
	|
	#######           ######                          #
	#     # #    #    #     #   ##    ####  ######    #        ####    ##   #####
	#     # ##   #    #     #  #  #  #    # #         #       #    #  #  #  #    #
	#     # # #  #    ######  #    # #      #####     #       #    # #    # #    #
	#     # #  # #    #       ###### #  ### #         #       #    # ###### #    #
	#     # #   ##    #       #    # #    # #         #       #    # #    # #    #
	####### #    #    #       #    #  ####  ######    #######  ####  #    # #####
	|
	==================================================================================================
	*/

	if ( !NODEJS ) {
		$(document).ready(function(){
			doShowBusySpinners();
			doPopulateDataBinds();
		});
	}
})();

// [Node.js] support
if ( NODEJS ) {
	// A: Set vars
	var isElectron = require("is-electron");

	// B: Load depdendencies
	var $ = require("jquery-node");
	var https = require("https");

	// C: Export module
	module.exports = sprLib;
}
