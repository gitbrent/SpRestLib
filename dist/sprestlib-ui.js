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
	var APP_BLD = "20180109";
	var SPR_REQ = "1.4.0+";
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
				if ( data.text && objListData[data.list].cols.indexOf(data.text)  == -1 )
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
						// TODO: (Show error test in element?)
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
			if ( !sprLib ) {
				console.error("Error: `sprLib` not found! sprestlib-ui.js requires sprestlib.js\n(TIP: use `sprestlib-ui.bundle.js` it has everything!)");
				return;
			}

			doShowBusySpinners();
			doPopulateDataBinds();
		});
	}
})();
