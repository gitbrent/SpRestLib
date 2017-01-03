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
	var APP_BLD = "20170102";
	var DEBUG = false; // (verbose mode, lots of logging - w/b removed before v1.0.0)
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
	var APP_LISTS = {};
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

	function parseErrorMessage(jqXHR, textStatus, errorThrown) {
		// STEP 1:
		jqXHR       = jqXHR || {};
		textStatus  = textStatus || "";
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

	// TODO: Gather AppendText
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
				// A: Parse bind data from html tags
				var data = {};
				try {
					// NOTE: jQuery returns an JSON-type object automatically (no JSON.parse required)
					data = $(tag).data('sprlib');
					// Ignore garbage or tags w/o a LIST
					if ( typeof data !== 'object' || !data.list ) return; // aka:next
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
				if (DEBUG) console.log( data );

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
				$.each(data.cols, function(i,col){
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
					.catch(function(err){
						console.log('TODO: bad list! or some err! set data to null and keep going!');
					})
					.then(function(data){
						arrTags.filter(function(tag){ return tag.list == list }).map(function(tag){ tag.data = data });
					})
				);
			});
			if (DEBUG) { console.log('objListData\n'); console.log(arrPromises); }

			// STEP 3: Wait for each List query to provide all the data needed to fill all tags
			Promise.all( arrPromises )
			.then(function(){
				if (DEBUG) console.table(arrTags);
				// Populate each tag
				$.each(arrTags, function(idx,objTag){
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
							$.each(objTag.data, function(i,arrData){
								// 1: Add row
								isFilterPassed = false;
								$newRow = $('<tr/>');

								// 2: Add cells to new row
								$.each(arrData, function(key,val){
									// TODO: HELP: howto use these "op" lookups in an actual if? (eval?)
									// FIX: Filtering: "filter": {"col":"active", "op":"eq", "val":false}} }

									// A: Filtering: Check if filtering, if not give green light
									if ( !objFilter.col || ( objFilter.col == key && objFilter.op == "eq" && objFilter.val == val ) ) isFilterPassed = true;

									// B: Add row cells
									if ( $.inArray(key, objTag.cols) > -1 ) {
										$newRow.append( '<td>'+ val +'</td>' );
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
										$newRow.append( $cell );
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

	// TODO: Validate/Update 20161231
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
	sprLib.list = function list(inName) {
		// FIRST: Param check
		if ( !inName || typeof inName !== 'string' ) { console.error("ERROR: listName [string] is required!"); return null; }

		var newList = {};
		var listName = inName;

		// STEP 1: Add public methods

		// TODO: .about
		// https://msdn.microsoft.com/en-us/library/office/jj245826.aspx#properties
		// 1: List+props - https://gitbrent.sharepoint.com/sites/dev/_api/web/lists/getbytitle('Employees')
			// super useful for writing our own listCols objects and/or seeing all List cols/types!
			// This method will return a metadata-like object: {dataName: dataType: isNumPct etc! }
			// sprLib.listDesc = function listDesc() {}

		// GET-ITEMS

		/**
		* DESC: Get specified (or all) List/Library column values - optionally: filter, sort, limit
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
		* @example - omitting listCols means "return all" (mirrors SP behavior)
		* sprLib.list('Employees').getItems().then(function(arrData){ console.table(arrData); });
		*
		* @example - with some options
		* sprLib.list('Employees').getItems({
		*   listCols:     { badgeNum: { dataName:'Badge_x0020_Number' } },
		*   queryFilter:  "Salary gt 100000",
		*   queryOrderby: "Hire_x0020_Date",
		*   queryLimit:   100
		* })
		* .then(function(arrData){ console.log(arrData) })
		* .catch(function(errMsg){ console.error(errMsg) });
		*
		* @example listCols - simple array of column names
		* listCols: ['Name', 'Badge_x0020_Number', 'Hire_x0020_Date']
		*
		* @example listCols - object with user designated key names and column options
		* listCols: {
		*   name:  { dataName:'Name'               },
		*   badge: { dataName:'Badge_x0020_Number', dispName:'Badge Number' }
		* }
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
		newList.getItems = function(inObj) {
			return new Promise(function(resolve, reject) {
				// FIRST: Param check
				// N/A: getItems() does not req any opts/params.  We do need a valid inObj though, so create if needed
				if ( !inObj || typeof inObj !== 'object' ) inObj = {};

				// STEP 1: Attach the properties used next for meta/data queries
				inObj.listName  = listName;
				inObj.spObjMeta = {};
				inObj.spArrData = [];

				// STEP 2: Convert listCols array into object format (if necessary)

				// We dont code for it in our API, but we better handle case `listCols:"Name"` b/c you know it'll happen
				if ( typeof inObj.listCols === 'string' ) inObj.listCols = [ inObj.listCols ];

				// DESIGN: Overloading: Cols can be objects or a plain array or string field names - if array, build `listCols` object now
				if ( inObj.listCols && $.isArray(inObj.listCols) ) {
					var listCols = {};
					$.each(inObj.listCols, function(i,colStr){ listCols[colStr] = { dataName:colStr } });
					inObj.listCols = listCols;
				}

				// STEP 3: Start data fetch Promise chain
				Promise.resolve()
				.then(function(){
					/*
					// TODO: 20161229: this is optional right? only used by Form Population, and even then cant we just rely on dataFormat tag and typechecking?
					return new Promise(function(resolve, reject) {
						// STEP 1: Exec SharePoint REST Query
						$.ajax({
							url: APP_OPTS.baseUrl+"/_api/lists/getbytitle('"+ inModel.listName.replace(/\s/gi,'%20') +"')?$select=Fields/Title,Fields/InternalName,Fields/CanBeDeleted,Fields/TypeAsString,Fields/SchemaXml,Fields/AppendOnly&$expand=Fields",
							type: "GET",
							cache: false,
							headers: {"Accept":"application/json; odata=verbose"}
						})
						.done(function(data,textStatus){
							$.each(data.d.Fields.results, function(i,result){
								// TODO-1.0: handle 'Account/Title' etc.
								$.each(inModel.listCols, function(key,col){
									// DESIGN: col.dataName is *NOT REQD*
									if ( col.dataName && col.dataName.split('/')[0] == result.InternalName ) {
										inModel.listCols[key].dataType = result.TypeAsString;
										inModel.listCols[key].dispName = ( inModel.listCols[key].dispName || result.Title ); // Fallback to SP.Title ("Display Name"]
										inModel.listCols[key].isAppend = ( result.AppendOnly || false );
										inModel.listCols[key].isNumPct = ( result.SchemaXml.toLowerCase().indexOf('percentage="true"') > -1 );
									}
								});
							});
							if (DEBUG) console.table( inModel.listCols );

							// STEP 2: Resolve Promise
							resolve();
						})
						.fail(function(jqXHR,textStatus,errorThrown){
							reject({ 'jqXHR':jqXHR, 'textStatus':textStatus, 'errorThrown':errorThrown });
						});
					});
					*/
				})
				.then(function(){
					return new Promise(function(resolve, reject) {
						var objAjax = {};
						var strAjaxUrl = "", strExpands = "";

						// STEP 1: Start building REST URL
						strAjaxUrl = APP_OPTS.baseUrl + "/_api/lists/getbytitle('"+ inObj.listName.replace(/\s/gi,'%20') +"')/items";
						// If columns were provided, ensure we select `Id` for use in building our data model SP-array/object
						if ( inObj.listCols ) strAjaxUrl = strAjaxUrl+"?$select=Id,";
						// TODO: Just get the Id from __metadata instead! (20161212)

						// STEP 2: Continue building REST URL
						{
							// A: Add columns
							$.each(inObj.listCols, function(key,col){
								if ( !col.dataName ) return; // Skip columns without a 'dataName' key
								// 1:
								if ( strAjaxUrl.substring(strAjaxUrl.length-1) == '=' ) strAjaxUrl += col.dataName;
								else strAjaxUrl += ( strAjaxUrl.lastIndexOf(',') == strAjaxUrl.length-1 ? col.dataName : ','+col.dataName );
								// 2:
								if ( col.dataName.indexOf('/') > -1 ) strExpands += (strExpands == '' ? '' : ',') + col.dataName.substring(0,col.dataName.indexOf('/'));
							});

							// B: Add maxrows (if any) or use default b/c SP2013 default is a paltry 100 rows!
							strAjaxUrl += (strAjaxUrl.indexOf('?$') > -1 ? '&':'?') + '$top=' + ( inObj.queryLimit ? inObj.queryLimit : APP_OPTS.maxRows );

							// C: Add expand (if any)
							if ( strExpands ) strAjaxUrl += (strAjaxUrl.indexOf('?$') > -1 ? '&':'?') + '$expand=' + strExpands;

							// D: Add filter (if any)
							if ( inObj.queryFilter ) {
								strAjaxUrl += (strAjaxUrl.indexOf('?$') > -1 ? '&':'?') + '$filter=' + ( inObj.queryFilter.indexOf('%') == -1 ? encodeURI(inObj.queryFilter) : inObj.queryFilter );
							}

							// E: Add orderby (if any)
							if ( inObj.queryOrderby ) strAjaxUrl += (strAjaxUrl.indexOf('?$') > -1 ? '&':'?') + '$orderby=' + inObj.queryOrderby;
						}

						// STEP 3: Send AJAX REST query
						$.ajax({
							url: strAjaxUrl,
							type: (inObj.ajaxType || "GET"),
							cache: false,
							headers: { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
						})
						.done(function(data,textStatus){
							// A: Clear model data (if needed)
							inObj.spObjData = ( strAjaxUrl.indexOf('=Id') > -1 || strAjaxUrl.indexOf(',Id,') > -1 ? {} : [] );

							// B: Iterate over results
							$.each( (data.d.results || data), function(i,result){
								// B1: Create row object JSON
								var objRow = {};

								// B2: Add __metadata (if it exists)
								if ( result.__metadata ) objRow['__metadata'] = result.__metadata;

								// B3: Add columns specified -OR- add everything we got back (mirror SP behavior)
								if ( inObj.listCols && typeof inObj.listCols === 'object' ) {
									$.each(inObj.listCols, function(key,col){
										var arrCol = [];
										var colVal = "";

										if ( col.dataName ) {
											arrCol = col.dataName.replace(/\//gi,'.').split('.');
											colVal = ( arrCol.length > 1 ? result[arrCol[0]][arrCol[1]] : result[arrCol[0]] );
											// TODO: ^^^ results like 'Account/Title' will be created above (!)
											// TODO: is above still true?? (20161212)
										}
										else if ( col.dataFunc ) {
											colVal = col.dataFunc(result);
										}

										// Convert: Not all values can be taken at return value (dates have to be turned into actual Date objects, etc.)
										if ( col.dataType == 'DateTime' ) { objRow[key] = new Date(colVal); }
										else {
											objRow[key] = ( APP_OPTS.cleanColHtml && col.listDataType == 'string' ? colVal.replace(/<div(.|\n)*?>/gi,'').replace(/<\/div>/gi,'') : colVal );
										}
									});
								}
								else {
									$.each(result, function(key,val){
										if ( typeof val !== 'object' ) objRow[key] = val;
									});
								}

								// B4: Store result JSON data and metadata
								inObj.spArrData.push( objRow );
								if ( result.Id ) {
									inObj.spObjData[result.Id] = objRow;
									inObj.spObjMeta[result.Id] = ( result.__metadata || {} );
								}
								else {
									inObj.spObjData.push( objRow );
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
					// TODO: Check for append text, fetch if needed, else resolve()
					// LAST: Return List data
					resolve( inObj.spArrData );
				})
				.catch(function(objErr){
					reject( parseErrorMessage(objErr.jqXHR, objErr.textStatus, objErr.errorThrown) );
					if (DEBUG) console.error(objErr);
				});
			});
		}
		/* DEMO: (run in console on O365 sprestlib-demo page)
		Promise.resolve()
		.then( function()       { return sprLib.list('Departments').getItems({ listCols: {title:{dataName:'Title'}} }) })
		.then( function(arrData){ console.warn('WARN: Awesome code ahead!'); console.log(arrData); })
		.then( function()       { return sprLib.list('Employees').getItems({ listCols: ['Name','Badge_x0020_Number'] }) })
		.then( function(arrData){ console.warn('WARN: Awesome code ahead!'); console.log(arrData); })
		.catch(function(errMesg){ console.error(errMesg); });
		*/

		// CRUD

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
		newList.create = function(jsonData) {
			return new Promise(function(resolve, reject) {
				// FIRST: Param check
				if ( !jsonData || typeof jsonData !== 'object' ) reject("{jsonData} expected");
				try { test = JSON.stringify(jsonData) } catch(ex) { reject("JSON.stringify({jsonData}) failed") }

				// TODO: for all CRUD ops: `__metadata` is *OPTIONAL* (if not incld, then get List Metadta (TODO: internal func for this))

				// STEP 1: Do insert
				$.ajax({
					type       : "POST",
					url        : APP_OPTS.baseUrl+"/_api/lists/getbytitle('"+ listName +"')/items",
					data       : JSON.stringify(jsonData),
					contentType: "application/json;odata=verbose",
					headers    : { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
				})
				.done(function(data, textStatus){
					resolve( data.d );
				})
				.fail(function(jqXHR, textStatus, errorThrown){
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
					reject( parseErrorMessage(jqXHR, textStatus, errorThrown) );
				});
			});
		};
		/* TEST
		sprLib.list('Employees')
		.create( { __metadata:{type:"SP.Data.EmployeesListItem"}, Name:'sprLib.list.insert test'} )
		.then( function(newItem){ console.table(newItem) } )
		.catch( function(err){ console.error(err) } );
		*/

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
		newList.update = function(jsonData) {
			return new Promise(function(resolve,reject) {
				// FIRST: Param checks
				if ( !jsonData || typeof jsonData !== 'object' ) reject("{jsonData} expected");
				if ( !jsonData['ID'] && !jsonData['Id'] && !jsonData['iD'] && !jsonData['id'] ) reject("{jsonData}['Id'] expected");
				try { test = JSON.stringify(jsonData) } catch(ex) { reject("JSON.stringify(`jsonData`) failed") }

				// STEP 1: Determine SP.Type if needed
				// TODO: for all CRUD ops: `__metadata` is *OPTIONAL* (if not incld, then get List Metadta (TODO: internal func for this))
				//if ( !jsonData.__metadata ) { promise.getMeta,then()... continue below }

				// STEP 2: Set our `Id` value (users may send an of 4 different cases), then remove as its nt updateable
				var itemId = jsonData['ID'] || jsonData['Id'] || jsonData['iD'] || jsonData['id'];
				delete jsonData.ID; delete jsonData.Id; delete jsonData.iD; delete jsonData.id;

				// STEP 3: Build headers
				// DESIGN/OPTION: If no etag is provided, consider it a force (a faux {OPTION})
				var objHeaders = {
					"X-HTTP-Method"  : "MERGE",
					"Accept"         : "application/json;odata=verbose",
					"X-RequestDigest": $("#__REQUESTDIGEST").val(),
					"IF-MATCH"       : ( jsonData.__metadata && jsonData.__metadata.etag ? jsonData.__metadata.etag : "*" )
				};

				// STEP 4: Clean-up data
				if ( jsonData.__metadata.etag == "" || jsonData.__metadata.etag == null ) delete jsonData.__metadata.etag;

				// STEP 5: Update item
				$.ajax({
					type       : "POST",
					url        : APP_OPTS.baseUrl+"/_api/lists/getbytitle('"+ listName +"')/items("+ itemId +")",
					data       : JSON.stringify(jsonData),
					contentType: "application/json;odata=verbose",
					headers    : objHeaders
				})
				.done(function(data, textStatus){
					// SP doesnt return anything for Merge/Update, so return original jsonData object so users can chain, etc.
					// Populate both 'Id' and 'ID' to mimic SP 2013+ behavior
					jsonData.ID = itemId; jsonData.Id = itemId;
					resolve( jsonData );
				})
				.fail(function(jqXHR, textStatus, errorThrown){
					reject( parseErrorMessage(jqXHR, textStatus, errorThrown) );
				});
			});
		};
		/* TEST
		sprLib.list('Employees')
		.update({ __metadata:{type:"SP.Data.EmployeesListItem"}, id:1, Name:'updated by sprLib.list().update()' })
		.then( function(objItem){ console.table(objItem) } )
		.catch( function(err){ console.error(err) } );
		*/

		/**
		* Delete an item from a SP List/Library
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
	 	*/
		newList.delete = function(jsonData) {
			return new Promise(function(resolve,reject) {
				// FIRST: Param checks
				if ( !jsonData || typeof jsonData !== 'object' ) reject("{jsonData} expected");
				if ( !jsonData['ID'] && !jsonData['Id'] && !jsonData['iD'] && !jsonData['id'] ) reject("{jsonData}['Id'] expected");
				try { test = JSON.stringify(jsonData) } catch(ex) { reject("JSON.stringify(`jsonData`) failed") }

				// STEP 1: Determine SP.Type if needed
				// TODO: for all CRUD ops: `__metadata` is *OPTIONAL* (if not incld, then get List Metadta (TODO: internal func for this))
				//if ( !jsonData.__metadata ) { promise.getMeta,then()... continue below }

				// STEP 2: Set our `Id` value (users may send an of 4 different cases), then remove as its nt updateable
				var itemId = jsonData['ID'] || jsonData['Id'] || jsonData['iD'] || jsonData['id'];
				delete jsonData.ID; delete jsonData.Id; delete jsonData.iD; delete jsonData.id;

				// STEP 3: Build headers
				// DESIGN/OPTION: If no etag is provided, consider it a force (a fuax {OPTION})
				var objHeaders = {
					"X-HTTP-Method"  : "MERGE",
					"Accept"         : "application/json; odata=verbose",
					"X-RequestDigest": $("#__REQUESTDIGEST").val(),
					"IF-MATCH"       : ( jsonData.__metadata && jsonData.__metadata.etag ? jsonData.__metadata.etag : "*" )
				};

				// STEP 4: Delete item
				$.ajax({
					type       : "DELETE",
					url        : APP_OPTS.baseUrl+"/_api/lists/getbytitle('"+ listName +"')/items("+ itemId +")",
					contentType: "application/json;odata=verbose",
					headers    : objHeaders
				})
				.done(function(data, textStatus){
					// SP doesnt return anything for Deletes, so return is empty.
					resolve();
				})
				.fail(function(jqXHR, textStatus, errorThrown){
					reject( parseErrorMessage(jqXHR, textStatus, errorThrown) );
				});
			});
		};

		// LAST: Return this new List
		return newList;
	};

	// API: REST (raw, ad-hoc interface)
	/**
	* Execute an ad-hoc REST query to one of many endpoints
	*
	* @example
	sprLib.rest({
		restUrl: '/sites/dev/_api/web/sitegroups',
		restType: ["GET" | "POST"],
		queryCols: {
			title: { dataName:'Title' },
			loginName: { dataName:'LoginName' },
			editAllowed: { dataName:'AllowMembersEditMembership' }
		},
		queryFilter:   "AllowMembersEditMembership eq 1",
		queryOrderby:  "Title",
		queryLimit: 10
	})
	.then(function(arrayResults){ console.table(arrayResults) });
	*/
	// sprLib.rest({ restUrl:"/sites/dev/_api/web/sitegroups" }).then(function(data){ console.table(data); }); (data.d.results)
	// sprLib.rest({ restUrl:"/_api/web/lists/getbytitle('Employees')" }).then(function(data){ console.table(data); }); (data.d)
	//
	// EX: https://gitbrent.sharepoint.com/sites/dev/_api/web/lists/getbytitle('Employees')/
	// EX: https://gitbrent.sharepoint.com/sites/dev/_api/web/sitegroups
	sprLib.rest = function rest(inOpt) {
		return new Promise(function(resolve, reject) {
			// STEP 1: REALITY-CHECK
			if ( !inOpt.restUrl ) {
				var strTemp = 'restQuery ERROR:\n\n object parameter must contain: restUrl';
				( inObj.onFail ) ? inObj.onFail(strTemp) : console.error(strTemp);
				return null;
			}

			// STEP 2: Setup vars
			var objAjax = {};
			var strAjaxUrl = "", strExpands = "";
			inOpt.spArrData = [];

			// STEP 3: Construct Base URL: restUrl can be presented in many different forms...
			if      ( inOpt.restUrl.indexOf('/_api') == 0 )						strAjaxUrl = APP_OPTS.baseUrl + inOpt.restUrl;
			else if ( inOpt.restUrl.indexOf('_api')  == 0 )						strAjaxUrl = APP_OPTS.baseUrl + "/" + inOpt.restUrl;
			else if ( inOpt.restUrl.indexOf('/')     == 0 &&  inOpt.queryCols )	strAjaxUrl = inOpt.restUrl + "?$select=";
			else if ( inOpt.restUrl.indexOf('/')     == 0 && !inOpt.queryCols )	strAjaxUrl = inOpt.restUrl;
			else if ( inOpt.restUrl.indexOf('http')  == 0 &&  inOpt.queryCols )	strAjaxUrl = inOpt.restUrl + "?$select=";
			else if ( inOpt.restUrl.indexOf('http')  == 0 && !inOpt.queryCols )	strAjaxUrl = inOpt.restUrl;
			//else																strAjaxUrl = APP_OPTS.baseUrl + "/_api/lists/getbytitle('"+ inOpt.restUrl.replace(/\s/gi,'%20') +"')/items?$select=Id,"
			// TODO: ^^^ what about an else?

			// STEP 4: Continue building URL: Some REST API calls can contain select columns (`queryCols`)
			if ( strAjaxUrl.indexOf('$select') > -1 ) {
				// A: Add columns
				$.each(inOpt.queryCols, function(key,col){
					if ( !col.dataName ) return; // Skip columns without a 'dataName' key
					// A:
					if ( strAjaxUrl.substring(strAjaxUrl.length-1) == '=' ) strAjaxUrl += col.dataName;
					else strAjaxUrl += ( strAjaxUrl.lastIndexOf(',') == strAjaxUrl.length-1 ? col.dataName : ','+col.dataName );
					// B:
					if ( col.dataName.indexOf('/') > -1 ) strExpands += ( strExpands == '' ? col.dataName.substring(0,col.dataName.indexOf('/')) : ','+col.dataName.substring(0,col.dataName.indexOf('/')) );
				});

				// B: Add maxrows as default in SP2013 is a paltry 100 rows
				strAjaxUrl += '&$top=' + ( inOpt.queryLimit ? inOpt.queryLimit : APP_OPTS.maxRows );

				// C: Add expand (if any)
				if ( strExpands ) strAjaxUrl += '&$expand=' + strExpands;

				// D: Add filter (if any)
				else if ( inOpt.queryFilter ) strAjaxUrl += '&$filter=' + ( inOpt.queryFilter.indexOf('%') == -1 ? encodeURI(inOpt.queryFilter) : inOpt.queryFilter );

				// E: Add orderby (if any)
				if ( inOpt.queryOrderby ) strAjaxUrl += '&$orderby=' + inOpt.queryOrderby;
			}

			// STEP 5: Execute REST call
			$.ajax({
				url    : strAjaxUrl,
				type   : (inOpt.ajaxType || "GET"),
				cache  : false,
				headers: { "Accept":"application/json; odata=verbose", "X-RequestDigest":$("#__REQUESTDIGEST").val() }
			})
			.done(function(data,textStatus){
				var arrResults = [];

				// A: Depending upon which REST endpoint used, SP can return results in various ways... (!)

				// data.d.results is an [] of {}: [ {Title:'Brent', Email:'Brent.Ely@microsoft.com'}, {}, {} ]
				if ( data && data.d && data.d.results ) {
					$.each(data.d.results, function(key,result){
						var objRow = {};

						if ( inOpt.queryCols ) {
							$.each(inOpt.queryCols, function(key,col){
								var arrCol = col.dataName.replace(/\//gi,'.').split('.');
								var colVal = ( arrCol.length > 1 ? result[arrCol[0]][arrCol[1]] : result[arrCol[0]] );
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
				else if ( data ) {
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
				reject( parseErrorMessage(jqXHR, textStatus, errorThrown) + "\n\nURL used: " + strAjaxUrl );
			});
		});
	}

	// API: SITE
	sprLib.site = function site(inUrl) {
		return new Promise(function(resolve, reject) {
			// TODO: 20161230

			// TODO: Get Site Groups, Usage etc. - some good common methods here
			// 2: Get SITE info (logo, etc): https://gitbrent.sharepoint.com/sites/dev/_api/web/
			// 3: Lists+props: https://gitbrent.sharepoint.com/sites/dev/_api/web/Lists/
		});
	}

	// API: USER
	sprLib.user = function user(inOpt) {
		// STEP 1: Create new user object
		var newUser = {};

		// STEP 2: Build query URL based on whether its current user (no parameter) or a passed in one
		var strDynUrl = APP_OPTS.baseUrl+"/_api/Web/" + ( inOpt && !isNaN(inOpt) ? "GetUserById("+inOpt+")" : "CurrentUser" );

		/**
		* Get user's base info (`Id`, `Title`, `LoginName`, `Email`)
		*
		* @example
		* sprLib.user().info().then( function(objUser){ console.table(objUser) } );
		* sprLib.user(1234).info().then( function(objUser){ console.table(objUser) } );
		*
		* @return {Promise} - return `Promise` containing User info (`Id`, `Title`, `LoginName`, `Email`)
		*/
		newUser.info = function() {
			return new Promise(function(resolve, reject) {
				// STEP 1: Get SP.User info
				// NOTE: Use CurrentUser service as it is included in SP-Foundation and will work for everyone (Users will need SP-Enterprise for UserProfiles service to work)
				$.ajax({
					url    : strDynUrl += "?$select=Id,LoginName,Title,Email,PrincipalType,IsSiteAdmin",
					type   : "GET",
					cache  : false,
					headers: {"Accept":"application/json; odata=verbose"}
				})
				.done(function(data, textStatus){
					// A: Gather user data
					var objUser = {};
					$.each(data.d, function(key,result){ objUser[key] = result; });

					// B: Resolve results
					resolve( objUser );
				})
				.fail(function(jqXHR, textStatus, errorThrown){
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
				$.ajax({
					url    : strDynUrl += "?$select=Groups/Id,Groups/Title&$expand=Groups",
					type   : "GET",
					cache  : false,
					headers: {"Accept":"application/json; odata=verbose"}
				})
				.done(function(data, textStatus) {
					// A: Gather groups
					var arrGroups = [];
					$.each(data.d.Groups.results, function(idx,group){ arrGroups.push({ Id:group.Id, Title:group.Title }); });

					// B: Resolve results
					resolve( arrGroups );
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					reject( parseErrorMessage(jqXHR, textStatus, errorThrown) );
				});
			});
		}

		// LAST: Return this List to enable chaining
		return newUser;
	}

	// API: Version
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

	$(document).ready(function(){
		doShowBusySpinners();
		doPopulateDataBinds();
	});
})();
