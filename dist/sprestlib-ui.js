/*\
|*|  :: SpRestLib-UI.js ::
|*|
|*|  JavaScript Library for SharePoint Web Serices
|*|  https://github.com/gitbrent/SpRestLib
|*|
|*|  This library is released under the MIT Public License (MIT)
|*|
|*|  SpRestLib (C) 2016-2018 Brent Ely -- https://github.com/gitbrent
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
	var APP_VER = "1.0.0-beta";
	var APP_BLD = "20180111";
	var SPRLIB_REQ = "1.4.0+";
	var DEBUG = false; // (verbose mode/lots of logging)
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
	var APP_CSS = {
		updatingBeg: { 'background-color':'#e2e9ec' },
		updatingErr: { 'background-color':'#e2999c', 'color':'#fff' },
		updatingEnd: { 'background-color':'', 'color':'' }
	};
	var APP_DATE_FORMATS = {
		"US": "Ex: 02/14/2018 09:15:01",
		"DATE": "",
		"TIME": "",
		"YYYYMMDD": "",
		"INTLTIME": "",
		"INTL": "",
		"ISO": ""
	};

	// SPRESTLIB-UI Setup
	sprLib.ui = {};
	sprLib.ui.version = APP_VER+'-'+APP_BLD;

	/* TODO:
	- Add `Intl` (i18n) support (its supported in IE11!!) - Date and Currency formats are awesome (add Direction for our R->L users too?)
	*/

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

		var dateTemp = new Date(inDate);
		dateMM = dateTemp.getMonth() + 1; dateDD = dateTemp.getDate(); dateYY = dateTemp.getFullYear();
		h = dateTemp.getHours(); m = dateTemp.getMinutes(); s = dateTemp.getSeconds();
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
			strFinalDate = MONTHS[dateTemp.getMonth()] + " " + (dateDD<=9 ? '0' + dateDD : dateDD) + ", " + dateYY + " " + (h<=9 ? '0' + h : h) + ":" + (m<=9 ? '0' + m : m) + ":" + (s<=9 ? '0' + s : s);
		}
		else if (inType == "INTL") {
			strFinalDate = MONTHS[dateTemp.getMonth()] + " " + (dateDD<=9 ? '0' + dateDD : dateDD) + ", " + dateYY;
		}
		else if (inType == "ISO") {
			strFinalDate = dateYY +"-"+ (dateMM<=9 ? '0' + dateMM : dateMM) +"-"+ (dateDD<=9 ? '0' + dateDD : dateDD) +"T"+ (h<=9 ? '0' + h : h) + ":" + (m<=9 ? '0' + m : m) + ":" + (s<=9 ? '0' + s : s) + ".000Z";
		}

		if ( strFinalDate && (strFinalDate.indexOf("NaN") > -1 || strFinalDate.indexOf("undefined") > -1) ) return '';
		return strFinalDate;
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

	// TODO: Unimplemented/undocumented/undemoed
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

	function doShowBusySpinners() {
		// STEP 1: TABLE
		$('table[data-bind]').each(function(i,tag){
			if ( $(this).data('bind').options && $(this).data('bind').options.showBusySpinner ) {
				$(this).append('<tbody class="sprlibuiTemp"><tr><td style="text-align:center">'+ APP_OPTS.busySpinnerHtml +'</td></tr></tbody>');
			}
		});

		// STEP 2: TBODY
		$('tbody[data-bind]').each(function(i,tag){
			if ( $(this).data('bind').options && $(this).data('bind').options.showBusySpinner ) {
				$(this).append('<tr class="sprlibuiTemp"><td colspan="'+ ($(this).parents('table').find('thead th').length || 1) +'" style="text-align:center">'+ APP_OPTS.busySpinnerHtml +'</td></tr>');
			}
		});
	}

	/**
	* Find all page elements with `data-sprlib` property and populate them
	*
	* @example - `<table  data-sprlib='{ "list":"Departments", "cols":["Title"], "showBusy":true }'></table>`
	* @example - `<span   data-sprlib='{ "list":"Employees", "value":"name", "filter":{"col":"Badge_x0020_Number", "op":"eq", "val":"666"} }'></span>`
	* @example - `<select data-sprlib='{ "list":"Employees", "value":"Title", "text":"Id" }'></select>`
	*/
	function doPopulatePageElements() {
		var objFilter = {}, objTable = null;

		// Loop over all HTML tags with sprlib data properties
		$('[data-sprlib]').each(function(idx,tag){
			if (DEBUG) { console.log('--------------------'); console.log('Found tag: '+$(tag).prop('tagName')+' - id: '+$(tag).prop('id')); }
			var arrColNames = [];
			var objTagData = {};

			// STEP 1: Parse `data-sprlib` from this tag
			try {
				// A: Retrieve object (NOTE: jQuery returns an JSON-type object automatically (no JSON.parse required))
				objTagData = $(tag).data('sprlib');

				// B: Ignore garbage tags or tags w/o a `list`
				if ( typeof objTagData !== 'object' || !objTagData.list ) {
					if (DEBUG) {
						console.log('**Warning** this tag has `data-sprlib` but is defective: its data is not an object, or it lacks the `list` prop');
						console.log(objTagData);
						console.log(typeof objTagData);
						console.log(objTagData.list ? objTagData.list : '!objTagData.list does not exist!');
					}
					return;
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

			// STEP 2: Set/Validate options
			if ( objTagData.cols ) {
				// 1:
				if ( Array.isArray(objTagData.cols) ) {
					objTagData.cols.forEach(function(col,idx){
						if ( typeof col === 'string' ) arrColNames.push(col);
						else if ( typeof col === 'object' ) {
							if ( !col.hasOwnProperty('name') ) {
								// TODO: better error msg (show in tag, etc.)
								console.error("Error: column object lacks `name` property. Ex:`cols: [{name:'HireDate'}]`");
								console.error(col);
							}
							else {
								arrColNames.push(col.name);
							}
						}
					});
				}

				// 2: If a column is in a [select] text/value, then add it to cols!
				if ( objTagData.text  && objTagData.cols.indexOf(objTagData.text)  == -1 ) arrColNames.push(objTagData.text);
				if ( objTagData.value && objTagData.cols.indexOf(objTagData.value) == -1 ) arrColNames.push(objTagData.value);
			}

			if ( objTagData.filter ) {
				// A: Param Check (NOTE: Dont use "!$(tag).filter.val" as actual value may be [false] or ""!)
				if ( !$(tag).filter.col || !$(tag).filter.op || typeof $(tag).filter.val === 'undefined' ) {
					console.error('FILTER ERROR:\n\nYour filter:\n'+ $(tag)['context'].outerHTML.replace(/\&quot\;/gi,'"') +'\n\nShould look like this:\n"filter":{"col":"name", "op":"eq", "val":"bill"}\'>');
					return;
				}
				else if ( !APP_FILTEROPS[$(tag).filter.op] ) {
					console.error('FILTER ERROR:\n\nOperation Unknown:\n'+ $(tag).filter.op +'>');
					return;
				}
			}

			// STEP 3: Query and Populate tag
			if (DEBUG) { console.log('objTagData: '); console.log(objTagData); }
			sprLib.list(objTagData.list).getItems({
				listCols:     arrColNames,
				queryFilter:  objTagData.filter  || null,
				queryLimit:   objTagData.limit   || null,
				queryOrderby: objTagData.orderby || null,
				metadata:     false
			})
			.then(function(arrItems){
				// 3.A: Capture query results
				objTagData.data = arrItems;

				// 3.B: Remove any temporary UI items now that this element is being populated
				$(tag).find('.sprlibuiTemp').remove();

				// 3.C: Find/Populate element bound to this LIST object
				if ( $(tag).is('select') || $(tag).is('table') || $(tag).is('tbody') ) {
					if ( $(tag).is('select') ) {
						if ( !objTagData.text && !objTagData.value ) {
							reject('<select> requires `text` and `value`.\nEx: <select data-sprlib=\'{ "list":"Employees", "value":"Title", "text":"Id" }\'></select>');
						}

						$.each(objTagData.data, function(i,data){
							$(tag).append('<option value="'+ data[objTagData.value] +'">'+ data[objTagData.text] +'</option>');
						});
					}
					else if ( $(tag).is('table') || $(tag).is('tbody') ) {
						// 3.C.1: Prepare table
						{
							// CASE 1: <table>
							if ( $(tag).is('table') ) {
								// A: Destroy tablesorter before modifying table
								if ( objTagData.tableSorter && $.tablesorter ) $(tag).trigger("destroy");

								// B: Add or Empty <thead>
								( $(tag).find('> thead').length == 0 ) ? $(tag).prepend('<thead/>') : $(tag).find('> thead').empty();

								// C: Populate <thead>
								var $row = $('<tr/>');
								$.each(objTagData.cols, function(key,col){
									if ( !col.hidden ) $row.append('<th>'+ (col.dispName || col.name || col) +'</th>');
								});
								$(tag).find('> thead').append( $row );

								// D: Add or Empty <tbody>
								( $(tag).find('> tbody').length == 0 ) ? $(tag).append('<tbody/>') : $(tag).find('> tbody').empty();

								// E: Set loop fill object
								objTable = $(tag);
							}
							// CASE 2: <tbody>

							else if ( $(tag).is('tbody') ) {
								$(tag).empty();
								objTable = $(tag).parent('table');
							}
						}

						// 3.C.2: Add each table row
						objTagData.data.forEach(function(arrData,i){
							// 1: Add row
							isFilterPassed = false;
							var $newRow = $('<tr/>');

							// 2: Populate row cells
							$.each(arrData, function(key,val){
								var $cell = $('<td/>');

								// A: Filtering: Check if filtering, if not give green light
								// FIXME: Filtering: "filter": {"col":"active", "op":"eq", "val":false}} }
								// TODO: should we use same object filter everywhere like in tables?
								if ( !objFilter.col || ( objFilter.col == key && objFilter.op == "eq" && objFilter.val == val ) ) isFilterPassed = true;

								// B: Populate and style cell for this result/column
								objTagData.cols.forEach(function(col){
									if ( typeof col === 'string' && objTagData.cols.indexOf(key) > -1 ) {
										//$newRow.find('td:nth-child('+ (objTagData.cols.indexOf(key)+1) +')').text( val );
										$cell.text( val );
									}
									else if ( col.hasOwnProperty('name') && col.name == key ) {
										// A: Stringify boolean values (true/false)
										if ( typeof val === 'boolean' ) val = val.toString().replace('true','Yes').replace('false','No');

										// B: Create cell
										if      ( val && col.isNumPct && !isNaN(val) )               $cell.text( Math.round(val*100)+'%' );
										else if ( val && col.dataType == 'Currency' && !isNaN(val) ) $cell.text( formatCurrency(val) );
										else if ( val && col.dataType == 'DateTime' )                $cell.text( formatDate(val, (col.dateFormat||'INTL')) );
										// FIXME: get format working!
										else if ( val && Object.keys(APP_DATE_FORMATS).indexOf(col.format) > -1 ) $cell.text( formatDate(val,(col.format||'INTL')) );
										else                                                         $cell.text( (val || '') );

										// C: Add CSS style and/or dispClass (if any)
										if ( col.class ) { $cell.addClass( col.class ); }
										if ( col.style ) {
											try {
												if ( typeof JSON.parse(col.style) === 'object' ) $cell.css( JSON.parse(col.style) );
											}
											catch(ex) {
												var strTemp = 'PARSE ERROR:\n'
													+ 'Unable to parse [JSON.parse] and/or set the css style for data model: '+ bindJSON[bindOper].model +'\n\n'
													+ '* model style value:\n'+ col.style +'\n'
													+ '* correct syntax ex:\n{"width":"1%", "white-space":"nowrap"}\n\n'
													+ ex;
												console.error(strTemp);
											}
										}
									}
								});

								// C: Add cell to row (NOTE: Ignore `__next`, `__metadata`, etc.)
								if ( key.indexOf('__') == -1 ) $newRow.append( $cell );
							});

							// 3: Add new table row if filter matched and only if the cell(s) were populated
							//if ( isFilterPassed && $newRow.find('td').length > 0 ) $(objTable).find('> tbody').append( $newRow );
							if ( isFilterPassed ) $(objTable).find('> tbody').append( $newRow );
						});

						// 3.C.3: OPTIONS: tablesorter
						if ( objTagData.tableSorter && $.tablesorter ) {
							objTagData.tablesorter({ sortList:objTagData.tableSorter.sortList }); // Sort by (Col#/Asc=0,Desc=1)
							objTagData.tableSorter.htmlEle = $(objTable);
						}

						// 3.C.4: Last: Show message when no rows
						if ( $(objTable).find('tbody tr').length == 0 ) {
							$(objTable).find('tbody').append('<tr><td colspan="'+ $(objTable).find('thead th').length +'" style="color:#ccc; text-align:center;">'+ APP_STRINGS[APP_OPTS.language].noRows +'</td></tr>');
						}
					}
				}
				else {
					// B: (NOTE: There may be more than one row of data, but if use bound a single text field, what else can we do - so we use [0]/first row)
					if ( $(tag).is('input[type="text"]') ) $(tag).val( objTagData.data[0][objTagData.value] );
					else if ( $(tag).not('input') ) $(tag).text( objTagData.data[0][objTagData.value] );
				}

			})
			.catch(function(strErr){
				// TODO: show error in tag
				console.error(strErr);
			});
		});
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

	if ( $ && $(document) ) {
		$(document).ready(function(){
			// REALITY-CHECK:
			if ( !sprLib ) {
				console.error("Error: `sprLib` not found! sprestlib-ui.js requires sprestlib.js\n(TIP: use `sprestlib-ui.bundle.js` it has everything!)");
				return;
			}

			// STEP 1: Show busy spinners where needed
			doShowBusySpinners();

			// STEP 2: Populate page elements
			doPopulatePageElements();
		});
	}
})();
