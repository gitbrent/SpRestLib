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
 - @see: https://dev.office.com/sharepoint/docs/sp-add-ins/use-odata-query-operations-in-sharepoint-rest-requests#page-through-returned-items
 - Only working SOLN is to get '__next' URI from results (or store prev ID and construct a similar URI using code)
 - Very ugly and not worth holidng 1.0 for

 - Add `Intl` (i18n) support (its supported in IE11!!) - Date and Currency formats are awesome (add Direction for our R->L users too?)
*/

// Detect Node.js
var NODEJS = ( typeof module !== 'undefined' && module.exports );

(function(){
	// APP VERSION/BUILD
	var APP_VER = "1.0.0-beta";
	var APP_BLD = "20170720";
	var DEBUG = false; // (verbose mode/lots of logging)
	// APP FUNCTIONALITY
	var APP_FILTEROPS = {
		"eq" : "==",
		"ne" : "!=",
		"gt" : ">",
		"gte": ">=",
		"lt" : "<",
		"lte": "<="
	};
	// APP MESSAGE STRINGS (i18n Internationalization)
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

	// -----------------------------
	// USER-CONFIGURABLE: UI OPTIONS
	// -----------------------------
	// TODO: i18n work
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
			UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, _spFormDigestRefreshInterval);
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
	* @param inName (string) - required - List Name or List GUID
	*/
	sprLib.list = function list(inName) {
		// FIRST-1: Param check
		if ( !inName || typeof inName !== 'string' ) {
			console.error("ERROR: A 'listName' or 'listGUID' is required! EX: `sprLib.list('Emps')`");
			return null;
		}

		// FIRST-2: Set vars
		var guidRegex = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
		var _newList = {};
		// NOTE: DESIGN: Accept either [ListName] or [ListGUID]
		var _urlBase = APP_OPTS.baseUrl + "/_api/lists" + ( guidRegex.test(inName) ? "(guid'"+ inName +"')" : "/getbytitle('"+ inName.replace(/\s/gi,'%20') +"')" );

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

		/**
		* Set baseUrl for this List
		* - Enables dynamically querying without redefining the library's baseUrl (eg: search subsites)
		*
		* @example: sprLib.list('Employees').baseUrl('/sites/dev/brent/')
		*/
		_newList.baseUrl = function(strUrl) {
			if ( strUrl && strUrl.toString().length > 0 ) {
				_urlBase = strUrl + (strUrl.substring(strUrl.length-1,strUrl.length) == "/" ? '' : '/') + "_api/lists" + ( guidRegex.test(inName) ? "(guid'"+ inName +"')" : "/getbytitle('"+ inName.replace(/\s/gi,'%20') +"')" );
				return _newList;
			}
			else {
				return ( _urlBase && _urlBase.indexOf('/_api') > -1 ? _urlBase.substring(0, _urlBase.indexOf('/_api')) : _urlBase );
			}
		};

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
					url: _urlBase+"?$select=Fields&$expand=Fields"
				})
				.then(function(arrData){
					var arrColumns = [];

					// STEP 1: Gather fields
					( arrData && arrData[0] && arrData[0].Fields && arrData[0].Fields.results ? arrData[0].Fields.results : [] )
					.forEach(function(result,i){
						// DESIGN: Only capture "user" columns (FYI: Type=17 are `Calculated` cols)
						if (
							result.InternalName == 'ID'
							|| ( !result.Hidden && (result.CanBeDeleted || result.InternalName == 'Title') )
							|| ( !result.CanBeDeleted && result.FieldTypeKind == 17 )
						) {
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
					url: _urlBase+"?$select="+strFields
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
		* | `listCols`    | array   | no    | array of column names in OData style | `listCols: ['Name', 'Badge_x0020_Number']`
		* | `listCols`    | object  | no    | object with column properties | `listCols: { badge: { dataName:'Badge_x0020_Number' } }`
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
		*   queryLimit:   100
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
				// `$filter` only accepts single quote (%27) - double-quote (%22) will fail
				if ( inObj.queryFilter ) inObj.queryFilter = inObj.queryFilter.replace(/\"/gi,"'");

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

					// Add internal data objects
					inObj.spArrData = [];
					inObj.spObjData = {};
					inObj.spObjMeta = {};
				}

				// STEP 3: Start data fetch Promise chain
				Promise.resolve()
				.then(function(){
					// PERF: Only query metadata when user requested append-text
					if ( !inObj.fetchAppend ) return Promise.resolve();

					// Fetch LIST metadata
					return new Promise(function(resolve, reject) {
						// STEP 1: Query SharePoint
						$.ajax({
							url: _urlBase+"?$select=Fields/Title,Fields/InternalName,Fields/CanBeDeleted,Fields/TypeAsString,Fields/SchemaXml,Fields/AppendOnly&$expand=Fields",
							type: "GET",
							cache: false,
							headers: {"Accept":"application/json; odata=verbose"}
						})
						.done(function(data,textStatus){
							// A: Get list GUID for use in XML query
							listGUID = data.d.__metadata.id.split("guid'").pop().replace(/\'\)/g,'');

							// B: Gather field metadata
							(data.d.Fields.results || []).forEach(function(result,i){
								for (var key in inObj.listCols) {
									// DESIGN: inObj.listCols[key].dataName is *NOT REQD*
									if ( inObj.listCols[key].dataName && inObj.listCols[key].dataName.split('/')[0] == result.InternalName ) {
										inObj.listCols[key].dataType = result.TypeAsString;
										inObj.listCols[key].dispName = ( inObj.listCols[key].dispName || result.Title ); // Fallback to SP.Title ("Display Name"]
										inObj.listCols[key].isAppend = ( result.AppendOnly || false );
										inObj.listCols[key].isNumPct = ( result.SchemaXml.toLowerCase().indexOf('percentage="true"') > -1 );
									}
								}
							});
							if (DEBUG) console.table( inObj.listCols );

							// STEP 2: Resolve Promise
							resolve();
						})
						.fail(function(jqXHR,textStatus,errorThrown){
							reject({ 'jqXHR':jqXHR, 'textStatus':textStatus, 'errorThrown':errorThrown });
						});
					});
				})
				.then(function(){
					return new Promise(function(resolve, reject) {
						var objAjaxQuery = {
							url    : _urlBase+"/items",
							type   : "GET",
							cache  : inObj.cache,
							headers: { "Accept":"application/json;odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
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
						$.ajax(objAjaxQuery)
						.done(function(data,textStatus){
							var arrResults = data.d.results || data || [];

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
								var objId = 0;

								// B.2: Capture `Id` and `__metadata` (if any)
								if ( result.__metadata ) {
									// Capture metadata
									objRow['__metadata'] = result.__metadata;

									// Capture this item's `Id` by parsing metadata (to avoid adding "Id," to the $select)
									if ( result.__metadata.uri && result.__metadata.uri.indexOf('/Items(') > -1 ) {
										objId = Number(result.__metadata.uri.split('/Items(').pop().replace(')',''));
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
										// B: Remove extraneous metadata
										if ( result[arrCol[0]].__metadata ) delete result[arrCol[0]].__metadata;
										// B: Same for deferred. NOTE: Multi-Person fields return only a `{__deferred:{uri:'http...'}}` result when field is empty (ugh!)
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

										// D: Value clean-up (things like empty multi-person fields may end up being `{}`)
										if ( typeof colVal === 'object' && !Array.isArray(colVal) && Object.keys(colVal).length == 0 ) colVal = [];
									}
									else if ( col.dataName ) {
										colVal = result[col.dataName];
									}
									else if ( col.dataFunc ) {
										colVal = col.dataFunc(result);
									}

									// B.3.2: Set value for this key
									// NOTE: Not all values can be taken at return value (dates->Date objects, etc.), so convert when needed
									if ( col.dataType == 'DateTime' ) {
										objRow[key] = new Date(colVal);
									}
									else {
										objRow[key] = ( APP_OPTS.cleanColHtml && col.listDataType == 'string' ? colVal.replace(/<div(.|\n)*?>/gi,'').replace(/<\/div>/gi,'') : colVal );
									}
								});

								// 4: Set data
								// 4.A: Result row
								inObj.spArrData.push( objRow );
								// 4.B: Create data object if we have ID (for lookups w/o spArrData.filter)
								if ( objId ) {
									inObj.spObjData[objId] = objRow;
									inObj.spObjMeta[objId] = ( result.__metadata || {} );
								}
							});

							// LAST:
							resolve();
						})
						.fail(function(jqXHR,textStatus,errorThrown){
							reject({ 'jqXHR':jqXHR, 'textStatus':textStatus, 'errorThrown':errorThrown });
						});
					});
				})
				.then(function(){
					var arrAppendColDatanames = [];

					// STEP 1: Check for any append cols that need to be queried
					// Append cols were captured by `fetchAppend:true` option
					$.each(inObj.listCols, function(key,col){ if ( col.isAppend ) arrAppendColDatanames.push( col.dataName ); });

					// STEP 2: Get data for any found cols
					if ( arrAppendColDatanames.length ) {
						// STEP 1: Query SharePoint
						// Convert our dataName array into a comma-delim string, then replace ',' with '%20' and our query string is constrcuted!
						$.ajax({
							url: APP_OPTS.baseUrl +"/_vti_bin/owssvr.dll?Cmd=Display&List="
								+ "%7B"+ listGUID +"%7D"+"&XMLDATA=TRUE&IncludeVersions=TRUE"
								+ '&Query=ID%20'+ arrAppendColDatanames.toString().replace(/\,/g,'%20') +'%20'
								+ "&SortField=Modified&SortDir=ASC"
						})
						.done(function(result,textStatus){
							// Query is order by oldest->newest, so always capture the result and the last one captured will always be the most recent
							$(result).find("z\\:row, row").each(function(i,row){
								arrAppendColDatanames.forEach(function(dataName,idx){
									var itemId = $(row).attr("ows_ID");

									if ( $(row).attr("ows_"+dataName) ) {
										// A: Set array data
										inObj.spArrData.filter(function(item){ return item.Id == itemId })[0][dataName] = $(row).attr("ows_"+dataName);
										// B: Set object data
										if ( inObj.spObjData[itemId] ) inObj.spObjData[itemId][dataName] = $(row).attr("ows_"+dataName);
									}
								});
							});

							// LAST: Return List data
							resolve(inObj.spArrData);
						})
						.fail(function(jqXHR,textStatus,errorThrown){
							reject({ 'jqXHR':jqXHR, 'textStatus':textStatus, 'errorThrown':errorThrown });
						});
					}
					else {
						resolve(inObj.spArrData);
					}
				})
				.catch(function(objErr){
					reject( parseErrorMessage(objErr.jqXHR, objErr.textStatus, objErr.errorThrown) );
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
						type   : "POST",
						url    : _urlBase +"/items",
						data   : JSON.stringify(jsonData),
						headers: { "Accept":"application/json;odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
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
						// TODO: Is there way to do this without a retryCnt??, otherwise: add,increment,clear
						/*
						try {
						var strErrCode = jqXHR.status.toString();
						var strErrText = "("+ jqXHR.status +") "+ textStatus +": "+ errorThrown;
						var strSpeCode = $.parseJSON(jqXHR.responseText).error['code'].split(',')[0];

						// CASE '403': SP2013-2016 Expired Token error: Microsoft.SharePoint.SPException (-2130575252): "X-RequestDigest expired form digest"
						if ( strErrCode == '403' && strSpeCode == '-2130575252' ) doRenewDigestToken();
						} catch(ex) {}
						*/
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
				var itemId = jsonData['ID'] || jsonData['Id'] || jsonData['iD'] || jsonData['id'];
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
						type   : "POST",
						url    : _urlBase +"/items("+ itemId +")",
						data   : JSON.stringify(jsonData),
						headers: {
							"X-HTTP-Method"  : "MERGE",
							"Accept"         : "application/json;odata=verbose",
							"X-RequestDigest": $("#__REQUESTDIGEST").val(),
							"IF-MATCH"       : ( jsonData.__metadata.etag ? jsonData.__metadata.etag : "*" )
						}
					})
					.then(function(arrData){
						// A: SP doesnt return anything for Merge/Update, so return original jsonData object so users can chain, etc.
						// Populate both 'Id' and 'ID' to mimic SP2013
						jsonData.Id = itemId; jsonData.ID = itemId;

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
				var itemId = jsonData['ID'] || jsonData['Id'] || jsonData['iD'] || jsonData['id'];
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
						type   : "DELETE",
						url    : _urlBase +"/items("+ itemId +")",
						headers: {
							"X-HTTP-Method"  : "MERGE",
							"Accept"         : "application/json;odata=verbose",
							"X-RequestDigest": $("#__REQUESTDIGEST").val(),
							"IF-MATCH"       : ( jsonData.__metadata.etag ? jsonData.__metadata.etag : "*" )
						}
					})
					.then(function(){
						// SP doesnt return anything for Deletes, but SpRestLib returns ID
						resolve( itemId );
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
		_newList.recycle = function(itemId) {
			return new Promise(function(resolve,reject) {
				// FIRST: Param checks
				if ( !itemId || typeof itemId.toString() !== 'string' ) reject("ID expected! Ex: `recycle(99)`");

				// STEP 1: Recycle item
				sprLib.rest({
					type   : "POST",
					url    : _urlBase +"/items("+ itemId.toString() +")/recycle()",
					headers    : { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
				})
				.then(function(){
					// SP returns the item guid for Recycle operations
					// EX: {"d":{"Recycle":"ed504e3d-f8ab-4dd4-bb22-6ddaa78bd117"}}
					resolve( Number(itemId) );
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
			inOpt.type  = inOpt.restType || inOpt.type || "GET";
			inOpt.url   = (inOpt.restUrl || inOpt.url || APP_OPTS.baseUrl).replace(/\"/g, "'");
			//
			inOpt.spArrData = [];

			// STEP 2: Setup vars
			var strExpands = "";
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
			if      ( inOpt.url.indexOf('/_api') == 0 )						objAjaxQuery.url = APP_OPTS.baseUrl + inOpt.url;
			else if ( inOpt.url.indexOf('_api')  == 0 )						objAjaxQuery.url = APP_OPTS.baseUrl + "/" + inOpt.url;
			else if ( inOpt.url.indexOf('/')     == 0 &&  inOpt.queryCols )	objAjaxQuery.url = inOpt.url + "?$select=";
			else if ( inOpt.url.indexOf('/')     == 0 && !inOpt.queryCols )	objAjaxQuery.url = inOpt.url;
			else if ( inOpt.url.indexOf('http')  == 0 &&  inOpt.queryCols )	objAjaxQuery.url = inOpt.url + "?$select=";
			else if ( inOpt.url.indexOf('http')  == 0 && !inOpt.queryCols )	objAjaxQuery.url = inOpt.url;
			// else: any relative URLs wouldve been set at `objAjaxQuery` init above

			// STEP 4: Continue building URL: Some REST API calls can contain select columns (`queryCols`)
			if ( objAjaxQuery.url.indexOf('$select') > -1 ) {
				// `listCols` can be: string, array of strings, or objects
				// A: Convert single string column into an array for use below
				if ( typeof inOpt.queryCols === 'string' ) inOpt.queryCols = [ inOpt.queryCols ];

				// B: Build query object if `queryCols` array exists
				if ( inOpt.queryCols && Array.isArray(inOpt.queryCols) ) {
					var objListCols = {};
					inOpt.queryCols.forEach(function(colStr,i){
						var strTmp = ( colStr.indexOf('/') > -1 ? colStr.substring(0,colStr.indexOf('/')) : colStr );
						// Handle cases where there are 2 expands from same column. Ex: 'Manager/Id' and 'Manager/Title'
						objListCols[strTmp] = ( objListCols[strTmp] ? { dataName:objListCols[strTmp].dataName+','+colStr } : { dataName:colStr } );
					});
					inOpt.queryCols = objListCols;
				}

				// C: Add columns
				if ( inOpt.queryCols && typeof inOpt.queryCols === 'object' ) {
					$.each(inOpt.queryCols, function(key,col){
						if ( !col.dataName ) return; // Skip columns without a 'dataName' key
						// A:
						if ( objAjaxQuery.url.substring(objAjaxQuery.url.length-1) == '=' ) objAjaxQuery.url += col.dataName;
						else objAjaxQuery.url += ( objAjaxQuery.url.lastIndexOf(',') == objAjaxQuery.url.length-1 ? col.dataName : ','+col.dataName );
						// B:
						// FIXME: this allows adding same col name - use `arrExpands`-style from getItems
						if ( col.dataName.indexOf('/') > -1 ) strExpands += ( strExpands == '' ? col.dataName.substring(0,col.dataName.indexOf('/')) : ','+col.dataName.substring(0,col.dataName.indexOf('/')) );
					});
				}

				// D: Add maxrows as default in SP2013 is a paltry 100 rows
				if ( inOpt.url.indexOf('$top') == -1 ) objAjaxQuery.url += '&$top=' + ( inOpt.queryLimit ? inOpt.queryLimit : APP_OPTS.maxRows );

				// E: Add expand (if any)
				if ( strExpands ) objAjaxQuery.url += '&$expand=' + strExpands;

				// F: Add filter (if any)
				if ( inOpt.queryFilter ) objAjaxQuery.url += '&$filter=' + ( inOpt.queryFilter.indexOf('%') == -1 ? encodeURI(inOpt.queryFilter) : inOpt.queryFilter );

				// G: Add orderby (if any)
				if ( inOpt.queryOrderby ) objAjaxQuery.url += '&$orderby=' + inOpt.queryOrderby;
			}

			// STEP 5: Execute REST call
			$.ajax(objAjaxQuery)
			.done(function(data,textStatus){
				var arrResults = [];

				// A: Depending upon which REST endpoint used, SP can return results in various ways... (!)

				// data.d.results is an [] of {}: [ {Title:'Brent Ely', Email:'Brent.Ely@microsoft.com'}, {}, {} ]
				// NOTE: Test for results being object because SP can return an entire HTML page as a result in some error cases.
				if ( data && data.d && data.d.results && typeof data.d.results === 'object' ) {
					$.each(data.d.results, function(key,result){
						var objRow = {};

						if ( inOpt.queryCols ) {
							$.each(inOpt.queryCols, function(key,col){
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
									arrCol = col.dataName.split('/');
									if ( result[ arrCol[0] ].__metadata ) delete result[ arrCol[0] ].__metadata;
									// Capture any-and-all columns returned (aside from removal of above)
									colVal = result[ arrCol[0] ];
								}
								else if ( col.dataName ) {
									arrCol = col.dataName.split('/');
									colVal = ( arrCol.length > 1 ? result[arrCol[0]][arrCol[1]] : result[arrCol[0]] );
								}

								// DESIGN: Not all values can be taken at return value - things like dates have to be turned into actual Date objects
								if ( col.dataType == 'DateTime' ) objRow[key] = new Date(colVal);
								else objRow[key] = ( APP_OPTS.cleanColHtml && col.listDataType == 'string' ? colVal.replace(/<div(.|\n)*?>/gi,'').replace(/<\/div>/gi,'') : colVal );
								// TODO-1.0: ^^ results like 'Account/Title' will be created above (!)
							});
						}
						else {
							$.each(result, function(key,val){ objRow[key] = val; });
						}

						inOpt.spArrData.push( objRow );
					});
				}
				// data.d or data is an {}: { listTitle:'Game Systems', numberOfItems:25 }
				else if ( (data && data.d ? data.d : (data ? data : false)) && typeof (data.d || data) === 'object' ) {
					var objRow = {};

					$.each((data.d || data), function(key,result){
						objRow[key] = result;
					});

					inOpt.spArrData.push( objRow );
				}

				// C:
				resolve( inOpt.spArrData );
			})
			.fail(function(jqXHR,textStatus,errorThrown){
				// TODO: 20170628: renewSecurityToken when detected
				reject( parseErrorMessage(jqXHR, textStatus, errorThrown) + "\n\nURL used: " + objAjaxQuery.url );
			});
		});
	}

	// API: SITE (TODO: FUTURE: Post-1.0.0)
	sprLib.site = function site(inUrl) {
		return new Promise(function(resolve, reject) {
			// TODO: POST-1.0:
			/*
			https://msdn.microsoft.com/library/microsoft.sharepoint.spsite

			## Site
			* `sprLib.site().listPerms()` - Returns an array of all List/Library Permissions for the current/specified Site
			* `sprLib.site().permGroups()` - Returns an array of Permission Groups and their membership for the current/specified Site
			*/
			// 2: Get SITE info (logo, etc): https://siteurl.sharepoint.com/sites/dev/_api/web/
			// 3: Lists+props: https://siteurl.sharepoint.com/sites/dev/_api/web/Lists/
		});
	}

	// API: USER
	sprLib.user = function user(inOpt) {
		// STEP 1: Variables
		var newUser = {};
		var strDynUrl = APP_OPTS.baseUrl+"/_api/Web/CurrentUser?";

		// STEP 2: Build query URL based on whether its current user (no parameter) or a passed in object
		// NOTE: Use CurrentUser service as it is included in SP-Foundation and will work for everyone
		// ....: (Users will need SP-Enterprise for UserProfiles service to work)
		// NOTE: `_api/Web/GetUserById()` for non-existant users results in a heinous error 500 that chokes jQuery.ajax.fail(),
		// ....: so dont use it, or check user id with `siteusers?$filter` first!
		if      ( inOpt && inOpt['id']    ) strDynUrl = APP_OPTS.baseUrl+"/_api/Web/siteusers?$filter=Id%20eq%20"+       inOpt['id']    +"&";
		else if ( inOpt && inOpt['email'] ) strDynUrl = APP_OPTS.baseUrl+"/_api/web/siteusers?$filter=Email%20eq%20%27"+ inOpt['email'] +"%27&";
		else if ( inOpt && inOpt['title'] ) strDynUrl = APP_OPTS.baseUrl+"/_api/web/siteusers?$filter=Title%20eq%20%27"+ inOpt['title'] +"%27&";

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
				// A: Handle case when options have empty//null/undef params
				if ( inOpt && !inOpt['id'] && !inOpt['email'] && !inOpt['title'] ) {
					resolve( {} );
					return;
				}

				// B:
				$.ajax({
					url    : strDynUrl + "$select=Id,Title,Email,LoginName,IsSiteAdmin,PrincipalType",
					type   : "GET",
					cache  : false,
					headers: {"Accept":"application/json; odata=verbose"}
				})
				.done(function(data, textStatus) {
					var objUser = {};

					// A: Gather user data
					$.each((data && data.d && data.d.results ? data.d.results[0] : (data && data.d ? data.d : [])), function(key,result){
						objUser[key] = result;
					});

					// B: Resolve results - if user was not found, an empty object is the correct result
					resolve( objUser );
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					reject( parseErrorMessage(jqXHR, textStatus, errorThrown) );
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
				sprLib.rest({
					type   : "GET",
					url    : strDynUrl + "$select=Groups/Id,Groups/Title,Groups/Description,Groups/LoginName,Groups/OwnerTitle&$expand=Groups",
					cache  : false,
					headers: { "Accept":"application/json;odata=verbose" }
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

	// API: UTILITY: Library Version
	sprLib.version = function version(){
		return APP_VER;
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
	// A: Load 2 depdendencies
	var $ = require("jquery-node");

	// B: Export module
	module.exports = sprLib;
}
