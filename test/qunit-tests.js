/*
 * NAME: qunit-test.js
 * DESC: tests for qunit-test.html (coded to my O365 Dev Site - YMMV)
 * AUTH: https://github.com/gitbrent/
 * DATE: Jul 20, 2017
 *
 * HOWTO: Generate text tables for README etc.:
 * sprLib.list('Employees').getItems(['Id', 'Name', 'Badge_x0020_Number']).then(function(arrData){ console.log(getAsciiTableStr(arrData)) });
 *
 // REALITY-CHECK:
 // QUnit.test("QUnit Base Test", function(assert){ assert.ok( true === true, "Passed!" ); });
 */

const RESTROOT = '/sites/dev';
const RESTDEMO = '/sites/demo';
//
const ARR_NAMES_FIRST = ['Jack','Mark','CutiePie','Steve','Barry','Clark','Diana','Star','Luke','Captain'];
const ARR_NAMES_LAST  = ['Septiceye','Iplier','Martzia','Rodgers','Allen','Kent','Prince','Lord','Skywalker','Marvel'];
//
var gNewEmpItem = -1;
var gTestUserId = 9;

function getAsciiTableStr(arrayResults) {
	var arrColHeadings = [];

	Object.keys(arrayResults[0]).forEach(function(key,idx){
		if ( typeof key === 'object' ) Object.keys(key).forEach(function(key,idx){ arrColHeadings.push(key) });
		else arrColHeadings.push(key);
	});

	let table = new AsciiTable().setHeading( arrColHeadings );

	arrayResults.forEach(function(obj,idx){
		let vals = [];
		$.each(obj, function(key,val){
			vals.push( ( typeof val === 'object' && key != '__metadata' ? JSON.stringify(val) : val ) );
		});
		table.addRow(vals);
	});

	return table.toString();
}

// ================================================================================================
QUnit.module( "Library OPTIONS" );
// ================================================================================================
{
	QUnit.test(`sprLib.baseUrl('${RESTROOT}')`, function(assert){
		var done = assert.async();
		// TEST:
		// A: Set
		sprLib.baseUrl(RESTROOT);
		// B: Get
		var strBaseUrl = sprLib.baseUrl();
		// C: Test
		assert.ok( strBaseUrl == RESTROOT, "Pass: `strBaseUrl == RESTROOT` Str: " + strBaseUrl );
		//
		done();
	});
}

// ================================================================================================
QUnit.module( "LIST > COLS and INFO Methods" );
// ================================================================================================
{
	['Departments', 'Employees', 'Empty', '8fda2798-dbbc-497d-9840-df87b08e09c1']
	.forEach(function(list,idx){
		QUnit.test(`sprLib.list('${list}').cols()`, function(assert){
			var done = assert.async();
			// TEST:
			sprLib.list(list).cols()
			.then(function(arrColObjs){
				assert.ok( arrColObjs.length > 0		,"Pass: arrColObjs.length = " + arrColObjs.length );
				assert.ok( Object.keys(arrColObjs[0])	,"Pass: Object.keys().... = " + Object.keys(arrColObjs[0]).toString() );
				//
				let table = new AsciiTable();
				if (arrColObjs.length > 0) table.setHeading( Object.keys(arrColObjs[0]) );
				$.each(arrColObjs,function(idx,obj){ let vals = []; $.each(obj, function(key,val){ vals.push(val) }); table.addRow(vals); });
				assert.ok( table.toString(), `RESULTS:\n${table.toString()}`);
				//
				done();
			});
		});

		QUnit.test(`sprLib.list('${list}').info()`, function(assert){
			var done = assert.async();
			// TEST:
			sprLib.list(list).info()
			.then(function(objInfo){
				assert.ok( objInfo.Id		     , "Pass: Id....... = " + objInfo.Id );
				assert.ok( objInfo.Created	     , "Pass: Created.. = " + objInfo.Created );
				assert.ok( objInfo.ItemCount >= 0, "Pass: ItemCount = " + objInfo.ItemCount );
				assert.ok( objInfo.Title	     , "Pass: Title.... = " + objInfo.Title );
				done();
			});
		});
	});

	// TEST: Using `baseUrl`
	['Empty', 'Reports', '23846527-218a-43a2-b5c1-7b55b6feb1a3']
	.forEach(function(list,idx){
		QUnit.test(`sprLib.list('${list}').baseUrl('${RESTDEMO}').cols()`, function(assert){
			var done = assert.async();
			// TEST:
			sprLib.list(list).baseUrl(RESTDEMO).cols()
			.then(function(arrColObjs){
				assert.ok( arrColObjs.length > 0		,"Pass: arrColObjs.length = " + arrColObjs.length );
				assert.ok( Object.keys(arrColObjs[0])	,"Pass: Object.keys().... = " + Object.keys(arrColObjs[0]).toString() );
				//
				let table = new AsciiTable();
				if (arrColObjs.length > 0) table.setHeading( Object.keys(arrColObjs[0]) );
				$.each(arrColObjs,function(idx,obj){ let vals = []; $.each(obj, function(key,val){ vals.push(val) }); table.addRow(vals); });
				assert.ok( table.toString(), `RESULTS:\n${table.toString()}`);
				//
				done();
			});
		});

		QUnit.test(`sprLib.list('${list}').baseUrl('${RESTDEMO}').info()`, function(assert){
			var done = assert.async();
			// TEST:
			sprLib.list(list).baseUrl(RESTDEMO).info()
			.then(function(objInfo){
				assert.ok( objInfo.Id		     , "Pass: Id....... = " + objInfo.Id );
				assert.ok( objInfo.Created	     , "Pass: Created.. = " + objInfo.Created );
				assert.ok( objInfo.ItemCount >= 0, "Pass: ItemCount = " + objInfo.ItemCount );
				assert.ok( objInfo.Title	     , "Pass: Title.... = " + objInfo.Title );
				done();
			});
		});
	});

	// NON-EXISTANT LIST: COLS
	QUnit.test(`sprLib.list('BADLISTNAME').cols()`, function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('BADLISTNAME').cols()
		.then(function(arrColObjs){
			assert.ok( 0 == 1, 'Test should have thrown an error (catch)!' );
			done();
		})
		.catch(function(strErr){
			assert.ok( typeof strErr === 'string', `(typeof strErr === 'string') => ${typeof strErr}` );
			assert.ok( strErr, `catch strErr: ${strErr}` );
			done();
		});
	});

	// NON-EXISTANT LIST: INFO
	QUnit.test(`sprLib.list('BADLISTNAME').info()`, function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('BADLISTNAME').info()
		.then(function(arrColObjs){
			assert.ok( 0 == 1, 'Test should have thrown an error (catch)!' );
			done();
		})
		.catch(function(strErr){
			assert.ok( typeof strErr === 'string', `typeof strErr 'string': ${typeof strErr}` );
			assert.ok( strErr, `catch strErr: ${strErr}` );
			done();
		});
	});

	// JUNK NAMES (.list() method only - cant/wont test for cols/info - result w/b null)
	[ 101, '', null, undefined, {}, [] ]
	.forEach(function(list,idx){
		QUnit.test(`sprLib.list('${list}').cols()`, function(assert){
			var done = assert.async();
			// TEST:
			var list = sprLib.list(list);
			assert.ok( list == null, 'list returned null' );
			done();
		});
	});
}

// ================================================================================================
QUnit.module( "LIST > BASEURL Methods" );
// ================================================================================================
{
	QUnit.test(`sprLib.list('Empty').baseUrl('${RESTROOT}')`, function(assert){
		var sprResult = sprLib.list('Employees').baseUrl(RESTROOT);
		//
		assert.ok( sprResult							, "Pass: sprResult.............................. = "+ sprResult );
		assert.ok( typeof sprResult === 'object'		, "Pass: typeof sprResult === 'object'.......... = "+ typeof sprResult );
		assert.ok( typeof sprResult.cols === 'function'	, "Pass: typeof sprResult.cols === 'function'... = "+ typeof sprResult.cols );
		assert.ok( sprResult.baseUrl() == RESTROOT		, "Pass: sprResult.baseUrl() == RESTROOT........ = "+ sprResult.baseUrl() );
	});

	QUnit.test(`sprLib.list('Empty').baseUrl() VS!`, function(assert){
		var sprHas = sprLib.list('Employees').baseUrl('/sites/demo/').baseUrl();
		var sprNot = sprLib.list('Employees').baseUrl('/sites/demo').baseUrl();
		//
		assert.ok( sprHas == sprNot, "Pass: sprHas == sprNot : '"+ sprHas +"' == '"+ sprNot+ "'" );
	});
}

// ================================================================================================
QUnit.module( "LIST > ITEM CRUD Methods" );
// ================================================================================================
{
	QUnit.test("sprLib.list().create()", function(assert){
		[1,2,3,4].forEach(function(done,idx){
			done = assert.async();
			sprLib.list('Employees').create({
				__metadata:						{ type:"SP.Data.EmployeesListItem" },
				Name:							ARR_NAMES_FIRST[(Math.floor(Math.random()*9)+1)]+' '+ARR_NAMES_LAST[(Math.floor(Math.random()*9)+1)],
				ManagerId:						gTestUserId,
				Departments_x0020_SupportedId:	{ results:[1,2,3] },
				Site_x0020_Link:				{ Url:'https://github.com/', Description:'GitHub Site' },
				Badge_x0020_Number:				Math.round(new Date().getTime() / 1000000),
				Job_x0020_GradeId:				(idx+1),
				Hire_x0020_Date:				new Date(2017, idx, 1),
				Salary:							12345.49,
				Utilization_x0020_Pct:			1.0,
				Extension:						(1234+idx).toString(),
				Comments:							'New employee created',
				Mentored_x0020_Team_x0020_MemberId:	{ results:[9] },
				Active_x003f_:						true
			})
			.then(function(newObj){
				assert.ok( (newObj.Id), "Created! Id: " + newObj.Id );
				gNewEmpItem = newObj.Id;
				done();
			});
		});
	});

	QUnit.test("sprLib.list().update() 1: with current etag   ", function(assert){
		var done = assert.async();

		// PREP:
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			// TEST:
			sprLib.list('Employees')
			.update({
				__metadata: { type:"SP.Data.EmployeesListItem", etag:data[0].__metadata.etag },
				Id:         data[0].Id,
				Name:       'updated by sprLib.list().update() with etag'
			})
			.then(function(objItem){
				assert.ok( (objItem.Name), "Updated! Name: '" + objItem.Name + "'");
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});
	QUnit.test("sprLib.list().update() 2: with etag [null]    ", function(assert){
		var done = assert.async();
		// PREP:
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			// TEST:
			sprLib.list('Employees')
			.update({
				__metadata: { type:"SP.Data.EmployeesListItem", etag:null },
				id:         data[0].Id,
				Name:       'updated by sprLib.list().update() with etag:null'
			})
			.then(function(objItem){
				assert.ok( (objItem.Name), "Updated! Name: '" + objItem.Name + "'");
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});
	QUnit.test("sprLib.list().update() 3: no etag (aka: force)", function(assert){
		var done = assert.async();

		// PREP:
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			// TEST:
			sprLib.list('Employees')
			.update({
				__metadata: { type:"SP.Data.EmployeesListItem" },
				id:         data[0].Id,
				Name:       'updated by sprLib.list().update() w/o etag'
			})
			.then(function(objItem){
				assert.ok( (objItem.Name), "Updated! Name: '" + objItem.Name + "'");
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	QUnit.test("sprLib.list().delete() 1: with current etag   ", function(assert){
		var done = assert.async();
		// PREP:
		var gUpdateItem = {};
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){ gUpdateItem = data[0]; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({
				__metadata: { etag:gUpdateItem.__metadata.etag },
				id: gUpdateItem.Id
			})
			.then(function(){
				assert.ok( (true), "Deleted! "+gUpdateItem.Id );
				done();
			});
		});
	});
	QUnit.test("sprLib.list().delete() 2: with etag [null]    ", function(assert){
		var done = assert.async();
		// PREP:
		var gUpdateItem = {};
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){ gUpdateItem = data[0]; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({
				__metadata: { etag:null },
				id: gUpdateItem.Id
			})
			.then(function(){
				assert.ok( (true), "Deleted! "+gUpdateItem.Id );
				done();
			});
		});
	});
	QUnit.test("sprLib.list().delete() 3: no etag (aka: force)", function(assert){
		var done = assert.async();
		// PREP:
		var numId = "'-1'";
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			numId = data[0].Id;
			assert.ok( (true), "Found Id: "+numId );
		})
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({ id:numId })
			.then(function(retNum){
				assert.ok( retNum, "Success! Returned Id: "+retNum );
				done();
			});
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	QUnit.test("sprLib.list().recycle()", function(assert){
		var done = assert.async();
		// PREP:
		var numId = "'-1'";
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			numId = data[0].Id;
			assert.ok( (true), "Found Id: "+numId );
		})
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.recycle( numId )
			.then(function(retNum){
				assert.ok( retNum, "Success! Returned Id: "+retNum );
				done();
			});
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	QUnit.test("sprLib.list().create().update().delete() chain!", function(assert){
		var done = assert.async();
		//
		var item = { Name:'Marty McFly', ManagerId:gTestUserId, Hire_x0020_Date:new Date() };
		Promise.resolve()
		.then(function(){
			return sprLib.list('Employees').create(item);
		})
		.then(function(item){
			assert.ok( (true), "Success! create worked" );
			if (!item.Mentored_x0020_Team_x0020_MemberId) { delete item.Mentored_x0020_Team_x0020_MemberId; delete item.Mentored_x0020_Team_x0020_MemberStringId; }
			return sprLib.list('Employees').update(item);
		})
		.then(function(item){
			assert.ok( (true), "Success! update worked" );
			if (!item.Mentored_x0020_Team_x0020_MemberId) { delete item.Mentored_x0020_Team_x0020_MemberId; delete item.Mentored_x0020_Team_x0020_MemberStringId; }
			return sprLib.list('Employees').delete(item);
		})
		.then(function(item){
			assert.ok( (true), "Success! delete worked" );
			assert.ok( (true), "Success! An item navigated the entire CRUD chain!" );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	// API CHECK
	QUnit.test("sprLib.list().create(): w/o `__metadata`", function(assert){
		var done = assert.async();

		sprLib.list('Employees')
		.create({
			Title: 'QUnit: sprLib.list().create() 10'
		})
		.then(function(objItem){
			assert.ok( (objItem.Title), "objItem.Title: '" + objItem.Title + "'");
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});
	QUnit.test("sprLib.list().update(): w/o `__metadata`", function(assert){
		var done = assert.async();

		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			sprLib.list('Employees')
			.update({
				ID:    data[0].Id,
				Title: 'QUnit: sprLib.list().update() 11'
			})
			.then(function(objItem){
				assert.ok( (objItem.Title), "objItem.Title: '" + objItem.Title + "'");
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	// JUNK TESTS:
	QUnit.test("sprLib.list().create() JUNK TESTS", function(assert){
		var done = assert.async();

		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			[null, undefined, {}, [], ['ID'], {etag:null}, {type:null}, {ID:null}].forEach(function(json,idx){
				var done = assert.async();
				//
				sprLib.list('Employees')
				.create(json)
				.then(function(objItem){
					assert.ok( (false), "this should not have succeeded! "+ JSON.parse(objItem));
					done();
				})
				.catch(function(errorMessage){
					assert.ok( (true), "Test Failed [passed]. INPUT: "+ json +" - OUTPUT: "+errorMessage );
					done();
				});
			});
			done();
		});
	});
	QUnit.test("sprLib.list().update() JUNK TESTS", function(assert){
		var done = assert.async();

		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			[null, undefined, {}, [], ['ID'], {etag:null}, {type:null}, {ID:0}].forEach(function(json,idx){
				var done = assert.async();
				//
				sprLib.list('Employees')
				.update(json)
				.then(function(objItem){
					assert.ok( (false), "this should not have succeeded!");
					done();
				})
				.catch(function(errorMessage){
					assert.ok( (true), "Test Failed [passed]. INPUT: "+ json +" - OUTPUT: "+errorMessage );
					done();
				});
			});
			done();
		});
	});
}

// ================================================================================================
QUnit.module( "LIST > ITEM GET Methods" );
// ================================================================================================
{
	QUnit.test("sprLib.getItems() 01: no opts", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems()
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0        , "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].__metadata.id), "arrayResults[0].__metadata.id exists: "+ JSON.stringify(arrayResults[0].__metadata.id) );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 02: simple col name STRING", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems('Name')
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0                 , "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].__metadata.id)         , "arrayResults[0].__metadata.id exists: "+ JSON.stringify(arrayResults[0].__metadata.id) );
			assert.ok( Object.keys(arrayResults[0]).length == 2, "arrayResults[0] has length == 2: "+ Object.keys(arrayResults[0]).length );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 03: simple col name ARRAY (w Person object)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems(
			['Id', 'Name', 'Manager/Title']
		)
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0                 , "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].__metadata.id)         , "arrayResults[0].__metadata.id exists: "+ JSON.stringify(arrayResults[0].__metadata.id) );
			assert.ok( Object.keys(arrayResults[0]).length == 4, "arrayResults[0] has length == 4: "+ Object.keys(arrayResults[0]).length );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 04: `listCols` with simple string", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({ listCols:'Manager/Title' })
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 2, "arrayResults[0] has length == 2: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].__metadata.id)         , "arrayResults[0].__metadata.id exists: "+ JSON.stringify(arrayResults[0].__metadata.id) );
			assert.ok( (arrayResults[0].Manager.Title)         , "arrayResults[0].Manager.Title exists: "+ JSON.stringify(arrayResults[0].Manager.Title) );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 05: `listCols` with simple array of col names (Manager/Title)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols:['Id', 'Name', 'Manager/Title']
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 4, "arrayResults[0] has length == 4: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].__metadata.id)         , "arrayResults[0].__metadata.id exists: "+ JSON.stringify(arrayResults[0].__metadata.id) );
			assert.ok( (arrayResults[0].Manager.Title)         , "arrayResults[0].Manager.Title exists: "+ JSON.stringify(arrayResults[0].Manager.Title) );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 06: `listCols` with simple array of col names (Manager/Id and Manager/Title)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols:['Id', 'Name', 'Manager/Id', 'Manager/Title']
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 4, "arrayResults[0] has length == 4: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].__metadata.id)         , "arrayResults[0].__metadata.id exists: "+ JSON.stringify(arrayResults[0].__metadata.id) );
			assert.ok( (arrayResults[0].Manager.Id)            , "arrayResults[0].Manager.Id    exists: "+ JSON.stringify(arrayResults[0].Manager.Id) );
			assert.ok( (arrayResults[0].Manager.Title)         , "arrayResults[0].Manager.Title exists: "+ JSON.stringify(arrayResults[0].Manager.Title) );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 07: `listCols` with named columns", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols: {
				name:     { dataName:'Name'               },
				badgeNum: { dataName:'Badge_x0020_Number' },
				mgrId:    { dataName:'Manager/Id'         },
				mgrTitle: { dataName:'Manager/Title'      }
			}
		})
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0                     , "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].__metadata.id)             , "arrayResults[0].__metadata.id exists: "+ JSON.stringify(arrayResults[0].__metadata.id) );
			assert.ok( Object.keys(arrayResults[0]).length == 5    , "arrayResults[0] has length == 5: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].badgeNum)                  , "named column returned: arrayResults[0].badgeNum: "+ arrayResults[0].badgeNum );
			assert.ok( typeof arrayResults[0].mgrTitle === 'string', "`mgrTitle` named column returned a string value: "+ arrayResults[0].mgrTitle );
			assert.ok( getAsciiTableStr(arrayResults)              , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 08: `listCols` with named columns `dataFunc` tests", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols: {
				name:     { dataName:'Name'               },
				badgeNum: { dataName:'Badge_x0020_Number' },
				mgrTitle: { dataName:'Manager/Title'      },
				funcTest: { dataFunc:function(result){ return result.Name+':'+result.Badge_x0020_Number } }
			}
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 5, "arrayResults[0] has length == 5: "+ Object.keys(arrayResults[0]).length );
			assert.ok( typeof arrayResults[0].mgrTitle === 'string', "`mgrTitle` named column returned a string value: "+ arrayResults[0].mgrTitle );
			assert.ok(
				'"'+arrayResults[0].funcTest+'"' == '"'+arrayResults[0].name+':'+arrayResults[0].badgeNum+'"',
				"dataFunc result is accurate: "+ arrayResults[0].funcTest +" == "+ arrayResults[0].name+':'+arrayResults[0].badgeNum
			);
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 09: `listCols` with named columns: Multi-Lookup test `Id`", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols: {
				empName:  { dataName:'Name'          },
				mgrTitle: { dataName:'Manager/Title' },
				depsArr:  { dataName:'Departments_x0020_Supported/Id' }
			},
			queryLimit: 1,
			queryFilter: "Departments_x0020_Supported ne null"
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 4, "arrayResults[0] has length == 4: "+ Object.keys(arrayResults[0]).length );
			assert.ok( !isNaN(arrayResults[0].depsArr[0].Id), "arrayResults[0].depsArr[0].Id is a number: "+ arrayResults[0].depsArr[0].Id );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 10: `listCols` with column array: Multi-Lookup test `Id`", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols: ['Name', 'Manager/Title', 'Departments_x0020_Supported/Id'],
			queryLimit: 1,
			queryFilter: "Departments_x0020_Supported ne null"
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 4                  , "arrayResults[0] has length == 4: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].Manager.Title)                           , "arrayResults[0].Manager.Title exists: "+ JSON.stringify(arrayResults[0].Manager.Title) );
			assert.ok( Array.isArray(arrayResults[0].Departments_x0020_Supported), "arrayResults[0].Dep[..]ted is an array: true" );
			assert.ok( (arrayResults[0].Departments_x0020_Supported[0].Id)       , "arrayResults[0].Dep[..]ted[0].Id exists: "+ JSON.stringify(arrayResults[0].Departments_x0020_Supported[0].Id) );
			assert.ok( !isNaN( arrayResults[0].Departments_x0020_Supported[0].Id ),"arrayResults[0].Dep[..]ted[0].Id is number: "+ arrayResults[0].Departments_x0020_Supported[0].Id );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 11: `listCols` with column array: Multi-Lookup test with 2 fields (`Id`, `Title`)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols: ['Name', 'Departments_x0020_Supported/Id', 'Departments_x0020_Supported/Title'],
			queryLimit: 1,
			queryFilter: "Departments_x0020_Supported ne null"
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 3, "arrayResults[0] has length == 3: "+ Object.keys(arrayResults[0]).length );
			assert.ok(
				!isNaN( arrayResults[0].Departments_x0020_Supported[0].Id ),
				"arrayResults[0].Departments_x0020_Supported[0].Id is a number: "+ arrayResults[0].Departments_x0020_Supported[0].Id
			);
			assert.ok(
				(arrayResults[0].Departments_x0020_Supported[0].Title),
				"arrayResults[0].Departments_x0020_Supported[0].Title exists: "+ arrayResults[0].Departments_x0020_Supported[0].Title
			);
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	// NOTE: Promise.all()
	QUnit.test("sprLib.getItems() 12: `listCols` with column array: Multi-Person (`EMail`, `Title`)", function(assert){
		var done = assert.async();
		// TEST:
		Promise.all([
			sprLib.list('Employees').getItems({
				listCols: ['Name', 'Mentored_x0020_Team_x0020_Member/ID', 'Mentored_x0020_Team_x0020_Member/Title'],
				queryLimit: 1,
				queryFilter: "Mentored_x0020_Team_x0020_Member ne null"
			}),
			sprLib.list('Employees').getItems({
				listCols: ['Name', 'Mentored_x0020_Team_x0020_Member/ID', 'Mentored_x0020_Team_x0020_Member/Title'],
				queryLimit: 1,
				queryFilter: "Mentored_x0020_Team_x0020_Member eq null"
			})
		])
		.then(function(arrayResults){
			var res1 = arrayResults[0];
			assert.ok( Object.keys(res1[0]).length == 3, "res1[0] has length == 3: "+ Object.keys(res1[0]).length );
			assert.ok( !isNaN(res1[0].Mentored_x0020_Team_x0020_Member[0].ID), "res1[0].Mentored_x0020_Team_x0020_Member[0].ID is a number: "+ res1[0].Mentored_x0020_Team_x0020_Member[0].ID );
			assert.ok( (res1[0].Mentored_x0020_Team_x0020_Member[0].Title), "res1[0].Mentored_x0020_Team_x0020_Member[0].Title exists: "+ res1[0].Mentored_x0020_Team_x0020_Member[0].Title );
			assert.ok( getAsciiTableStr(res1), `RESULTS:\n${getAsciiTableStr(res1)}`);

			var res2 = arrayResults[1];
			assert.ok( Object.keys(res2[0]).length == 3, "res2[0] has length == 3: "+ Object.keys(res2[0]).length );
			assert.ok( (res2[0].Mentored_x0020_Team_x0020_Member.length == 0), "res1[0].Mentored_x0020_Team_x0020_Member.length == 0: "+ res1[0].Mentored_x0020_Team_x0020_Member.length );
			assert.ok( getAsciiTableStr(res2), `RESULTS:\n${getAsciiTableStr(res2)}`);

			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 13: `queryFilter` using: `Id` + `eq`", function(assert){
		var done = assert.async();
		// TEST:
		Promise.resolve()
		.then(function(){
			return sprLib.list('Employees').getItems({ listCols:'Id', queryLimit:1 });
		})
		.then(function(arrayResults){
			var intId = arrayResults[0].Id;
			sprLib.list('Employees')
			.getItems({
				listCols: ['Id','Name'],
				queryFilter: 'Id eq '+intId
			})
			.then(function(arrayResults){
				assert.ok( Object.keys(arrayResults[0]).length == 3, "arrayResults[0] has length == 3: "+ Object.keys(arrayResults[0]).length );
				assert.ok( (arrayResults[0].Id == intId)           , "arrayResults[0].Id == intId: "+ intId );
				assert.ok( (arrayResults[0].Name)                  , "arrayResults[0].Name exists: "+ JSON.stringify(arrayResults[0].Name) );
				assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	QUnit.test("sprLib.getItems() 14: `queryFilter` using: `Name` + `eq` with single-quote", function(assert){
		var done = assert.async();
		// TEST:
		Promise.resolve()
		.then(function(){
			return sprLib.list('Employees').getItems({ listCols:'Name', queryLimit:1 });
		})
		.then(function(arrayResults){
			var strName = arrayResults[0].Name;
			sprLib.list('Employees')
			.getItems({
				listCols: 'Name',
				queryFilter: "Name eq '"+strName+"'",
				queryLimit: 1
			})
			.then(function(arrayResults){
				assert.ok( Object.keys(arrayResults[0]).length == 2, "arrayResults[0] has length == 2: "+ Object.keys(arrayResults[0]).length );
				assert.ok( (arrayResults[0].Name)                  , "arrayResults[0].Name exists: "+ JSON.stringify(arrayResults[0].Name) );
				assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	QUnit.test("sprLib.getItems() 15: `queryFilter` using: `Name` + `eq` with double-quote", function(assert){
		var done = assert.async();
		// TEST:
		Promise.resolve()
		.then(function(){
			return sprLib.list('Employees').getItems({ listCols:'Name', queryLimit:1 });
		})
		.then(function(arrayResults){
			var strName = arrayResults[0].Name;
			sprLib.list('Employees')
			.getItems({
				listCols: 'Name',
				queryFilter: 'Name eq "'+strName+'"',
				queryLimit: 1
			})
			.then(function(arrayResults){
				assert.ok( Object.keys(arrayResults[0]).length == 2, "arrayResults[0] has length == 2: "+ Object.keys(arrayResults[0]).length );
				assert.ok( (arrayResults[0].Name)                  , "arrayResults[0].Name exists: "+ JSON.stringify(arrayResults[0].Name) );
				assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	QUnit.test("sprLib.getItems() 16: `queryLimit` test", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({ listCols:'Name', queryLimit:3 })
		.then(function(arrayResults){
			assert.ok( arrayResults.length == 3       , "arrayResults length == 3: "+ arrayResults.length );
			assert.ok( (arrayResults[0].__metadata.id), "arrayResults[0].__metadata.id exists: "+ JSON.stringify(arrayResults[0].__metadata.id) );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 17: `queryOrderby` (asc) test", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols: 'Id',
			queryLimit: 3,
			queryOrderby: 'Id'
		})
		.then(function(arrayResults){
			assert.ok( new Date(arrayResults[0].Id) < new Date(arrayResults[1].Id), "arrayResults[0].Id < arrayResults[1].Id = "+ arrayResults[0].Id +'/'+ arrayResults[1].Id );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.getItems() 18: `queryOrderby` (desc) test", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols: 'Id',
			queryLimit: 3,
			queryOrderby: 'Id desc'
		})
		.then(function(arrayResults){
			assert.ok( new Date(arrayResults[0].Id) > new Date(arrayResults[1].Id), "arrayResults[0].Id > arrayResults[1].Id = "+ arrayResults[0].Id +'/'+ arrayResults[1].Id );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	// JUNK TESTS:
	QUnit.test("sprLib.getItems() 99: Junk/Empty .list() param test", function(assert){
		['', [], [''], ['',''], {}].forEach(function(data,idx){
			var done = assert.async();
			// TEST:
			sprLib.list('Employees').getItems(data)
			.then(function(arrayResults){
				assert.ok( arrayResults.length > 0        , "arrayResults is an Array and length > 0: "+ arrayResults.length );
				assert.ok( (arrayResults[0].__metadata.id), "arrayResults[0].__metadata.id exists: "+ JSON.stringify(arrayResults[0].__metadata.id) );
				assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	// TODO: querySkip
	/*
	sprLib.list('Departments')
	.getItems({
		listCols:['Id', 'Title'],
		queryOrderby: 'Id',
		querySkip: 5
	})
	.then(function(arrayResults){
		console.log( arrayResults );
	});
	*/
}

// ================================================================================================
QUnit.module( "REST Methods" );
// ================================================================================================
{
	// REST
	QUnit.test("sprLib.rest() ex: '/sites/dev/_api/lists/getbytitle('Employees')/items' with Manager/Title", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			url : "/sites/dev/_api/lists/getbytitle('Employees')/items",
			type: "GET",
			queryCols: ['Id', 'Name', 'Manager/Title']
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 3, "arrayResults[0] has length == 3: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].Manager.Title), "arrayResults[0].Manager.Title exists: "+ arrayResults[0].Manager.Title );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}` );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	// REST endpoints that return `data.d.results` [{}]
	QUnit.test("sprLib.rest() ex: '/_api/web/sitegroups'", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			url: RESTROOT+'/_api/web/sitegroups',
			queryCols: {
				title: { dataName:'Title' },
				loginName: { dataName:'LoginName' },
				editAllowed: { dataName:'AllowMembersEditMembership' }
			}
			,queryFilter:   "AllowMembersEditMembership eq true"
			,queryOrderby:  "Title"
			,queryLimit: 10
		})
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0, "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].editAllowed), "arrayResults[0].editAllowed exists: "+ arrayResults[0].editAllowed );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}` );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	// REST endpoints that return `data.d` {}
	QUnit.test("sprLib.rest() ex: '/_api/web/lists'", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({ url:RESTROOT+'/_api/web/lists?$select=Title,ItemCount' })
		.then(function(arrayListObjs){
			assert.ok( arrayListObjs.length > 0, "arrayListObjs is an Array and length > 0: "+ arrayListObjs.length );
			assert.ok( getAsciiTableStr(arrayListObjs), `RESULTS:\n${getAsciiTableStr(arrayListObjs)}`);
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	/* works
	QUnit.test("sprLib.rest() ex: post+data (create new list column)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			url:  RESTROOT+'/_api/web/lists/getbytitle("Test")/fields',
			type: 'POST',
			data: "{'__metadata':{'type':'SP.FieldDateTime'}, 'FieldTypeKind':4, 'Title':'New Date Column', 'DisplayFormat':1 }"
		})
		.then(function(arrayListObjs){
			assert.ok( true, "Executed without errors: true" );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
	*/
}

// ================================================================================================
QUnit.module( "USER Methods" );
// ================================================================================================
{
	var gObjCurrUser = {};

	sprLib.user().info()
	.then(function(objUser){ gObjCurrUser = objUser })
	.then(function(){
		['', {id:gObjCurrUser.Id}, {title:gObjCurrUser.Title}, {email:gObjCurrUser.Email}]
		.forEach(function(param,idx){
			QUnit.test('sprLib.user('+ JSON.stringify(param) +').info()', function(assert){
				var done = assert.async();
				// TEST:
				sprLib.user(param).info()
				.then(function(objUser){
					assert.ok( objUser.Id		,"Pass: Id....... - " + objUser.Id );
					assert.ok( objUser.Title	,"Pass: Title.... - " + objUser.Title );
					assert.ok( objUser.Email	,"Pass: Email.... - " + objUser.Email );
					assert.ok( objUser.LoginName,"Pass: LoginName - " + objUser.LoginName );
					done();
				});
			});

			QUnit.test('sprLib.user('+ JSON.stringify(param) +').groups()', function(assert){
				var done = assert.async();
				// TEST:
				sprLib.user(param).groups()
				.then(function(arrGroups){
					assert.ok( arrGroups.length > 0, "arrGroups is an Array, and length > 0: "+ arrGroups.length );
					//
					let table = new AsciiTable();
					if (arrGroups.length > 0) table.setHeading( Object.keys(arrGroups[0]) );
					$.each(arrGroups,function(idx,obj){ let vals = []; $.each(obj, function(key,val){ vals.push(val) }); table.addRow(vals); });
					assert.ok( table.toString(), `RESULTS:\n${table.toString()}`);
					//
					done();
				});
			});
		});

		[ {id:999}, {email:'junk@email.com'}, {title:'totally not a real name'} ]
		.forEach(function(param,idx){
			QUnit.test('sprLib.user('+ JSON.stringify(param) +').info()', function(assert){
				var done = assert.async();
				// TEST:
				sprLib.user(param).info()
				.then(function(objUser){
					assert.ok( typeof objUser === 'object', "Pass: objUser is object type: " + typeof objUser );
					assert.ok( Object.keys(objUser).length == 0	,"Pass: keys.length == 0 - " + Object.keys(objUser).length );
					done();
				});
			});

			QUnit.test('sprLib.user('+ JSON.stringify(param) +').groups()', function(assert){
				var done = assert.async();
				// TEST:
				sprLib.user(param).groups()
				.then(function(arrGroups){
					assert.ok( arrGroups.length == 0, "arrGroups length == 0: "+ arrGroups.length );
					done();
				});
			});
		});
	});
}

// TODO: Add Utility methods


// NEGATIVE TEST:
/*
sprLib.rest({ restUrl:'../_api/web/GetByTitle' });
*/


/*
QUnit.test("sprLib.getItems() - onDone", function(assert){
	var done = assert.async();
	sprLib.getItems({
		listName: 'Employees',
		listCols: { id:{dataName:'ID'} },
		queryLimit: 1,
		onDone: function(){ assert.ok( true, "onDone fired!" ); done(); }
	});
});

QUnit.test("sprLib.getItems() - with listCols", function(assert){
	var done = assert.async();
	sprLib.getItems({
		listName: 'Employees',
		listCols: {
			id:       { dataName:'ID' },
			name:     { dataName:'Name' },
			badgeNum: { dataName:'Badge_x0020_Number' },
			hireDate: { dataName:'Hire_x0020_Date', dispName:'Hire Date', dataFormat:'INTL' },
			salary:   { dataName:'Salary' },
			extn:     { dataName:'Extension' },
			utilPct:  { dataName:'Utilization_x0020_Pct', dispName:'Util %' },
			comments: { dataName:'Comments' }
		},
		queryLimit: 10,
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			assert.ok( (arrayResults[0].__metadata && typeof arrayResults[0].__metadata !== 'undefined'), "arrayResults[0] is valid -> __metadata: "+ arrayResults[0].__metadata );
			assert.ok( (arrayResults[0].id         && typeof arrayResults[0].name       !== 'undefined'), "arrayResults[0] is valid -> Id: "+arrayResults[0].id+" / Title: "+arrayResults[0].name );
			// TODO: Move to the (as yet undone) MODEL TEST section

			/ *
			QUnit.test("sprLib.model('Emp').data() method", function(assert){
				assert.ok( $.isArray(sprLib.model('Employees').data()), "sprLib.model().add().data() is an array" );
				assert.ok( $.isArray(sprLib.model('Employees').data('array')), "sprLib.model().add().data('array') is an array" );
				assert.ok( (typeof sprLib.model('Employees').data('object') === 'object'), "sprLib.model().add().data('object') is an object" );
			});
			* /
			done();
		}
	});
});

QUnit.test("sprLib.getItems() - w/o listCols", function(assert){
	var done = assert.async();
	sprLib.getItems({
		listName: 'Employees',
		queryLimit: 10,
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			assert.ok( ( arrayResults[0].Id ), "arrayResults[0] is valid - Id: "+arrayResults[0].Id );
			QUnit.test("sprLib.model('Emp').data() method", function(assert){
				assert.ok( $.isArray(sprLib.model('Employees').data()), "sprLib.model().add().data() is an array" );
				assert.ok( $.isArray(sprLib.model('Employees').data('array')), "sprLib.model().add().data('array') is an array" );
				assert.ok( (typeof sprLib.model('Employees').data('object') === 'object'), "sprLib.model().add().data('object') is an object" );
			});
			done();
		}
	});
});

QUnit.test("sprLib.getItems() - dataFunc listCols", function(assert){
	var done = assert.async();
	sprLib.getItems({
		listName: 'Employees',
		listCols: {
			name:     { dataName:'Name' },
			badgeNum: { dataName:'Badge_x0020_Number' },
			funcTest: { dataFunc:function(objItem){ return objItem.Name +' ('+ objItem.Badge_x0020_Number+')' } }
		},
		queryLimit: 10,
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			assert.ok( ( arrayResults[0].badgeNum ), "arrayResults[0] is valid - badgeNum: " + arrayResults[0].badgeNum );
			assert.ok( ( arrayResults[0].funcTest ), "arrayResults[0] is valid - funcTest: " + arrayResults[0].funcTest );
			done();
		}
	});
});
*/

// ================================================================================================
//QUnit.module( "Binding / Forms" );
// ================================================================================================
// sprLib.model('Employees').syncItem()

// WORKS
/*
sprLib.model('junk').add({
	listName: '/sites/dev/_api/web/sitegroups',
	listCols: {
		title: { dataName:'Title' },
		loginName: { dataName:'LoginName' },
		editAllowed: { dataName:'AllowMembersEditMembership' }
	},
	onDone: function(data){ console.table(data) }
});
*/

/*
some API calls require an arguamnet (group/pr0file rest endpoints ets), require an auth toekn an POST!
ajaxType: "POST
*/


/*
howto test form/htmls
test(name, function() {
	var links = document.getElementById("qunit-fixture").getElementsByTagName("a");
	equal(links[0].innerHTML, "January 28th, 2008");
	equal(links[2].innerHTML, "January 27th, 2008");
	prettyDate.update(now);
	equal(links[0].innerHTML, first);
	equal(links[2].innerHTML, second);
});
*/
