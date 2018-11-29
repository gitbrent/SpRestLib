/*
 * NAME: qunit-test.js
 * DESC: tests for qunit-test.html (coded against my personal O365 Dev Site - YMMV)
 * AUTH: https://github.com/gitbrent/
 * DATE: 20181128
 *
 * HOWTO: Generate text tables for README etc.:
 * sprLib.list('Employees').items(['Id', 'Name', 'Badge_x0020_Number']).then(function(arrData){ console.log(getAsciiTableStr(arrData)) });
 *
 // REALITY-CHECK:
 // QUnit.test("QUnit Base Test", function(assert){ assert.ok( true === true, "Passed!" ); });
 */

const BASEURL   = _spPageContextInfo.siteServerRelativeUrl;
const RESTROOT  = '/sites/dev';
const RESTDEMO1 = '/sites/dev/sandbox';
const RESTDEMO2 = '/sites/dev/sandbox/';
const SITEURL1  = '/sites/dev/sandbox/child1';
const SITEURL2  = 'sandbox/child1';
const SITEURL3  = '/sites/dev/sandbox/';
const FOLDPERMUNQ = '/sites/dev/Shared Documents/BreakPerms';
//
const ARR_NAMES_FIRST = ['Jack','Mark','CutiePie','Steve','Barry','Clark','Diana','Star','Luke','Captain'];
const ARR_NAMES_LAST  = ['Septiceye','Iplier','Martzia','Rodgers','Allen','Kent','Prince','Lord','Skywalker','Marvel'];
//
const LIST_GUID2 = '23846527-218a-43a2-b5c1-7b55b6feb1a3';
//
const gRegexGUID = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
var gTestUserId = 9;

function getAsciiTableStr(inResult) {
	var arrResults = [];
	var table = "";

	// STEP 1: Transform object / Create headings
	if ( inResult && !Array.isArray(inResult) && typeof inResult === 'object' ) {
		Object.keys(inResult).forEach(key => {
			arrResults.push({ 'name':key, 'value':( typeof inResult[key] === 'object' ? JSON.stringify(inResult[key]) : inResult[key].toString() ) });
		});
		table = new AsciiTable().setHeading( ['Prop Name','Prop Value'] );
	}
	else if ( Array.isArray(inResult) && inResult.length > 0 ) {
		arrResults = inResult;
		var arrColHeadings = [];
		Object.keys(arrResults[0]).forEach(function(key,idx){
			if ( typeof key === 'object' ) Object.keys(key).forEach(function(key,idx){ arrColHeadings.push(key) });
			else arrColHeadings.push(key);
		});
		table = new AsciiTable().setHeading( arrColHeadings );
	}

	arrResults.forEach((obj,idx)=>{
		let vals = [];
		$.each(obj, function(key,val){
			if ( typeof val === 'object' && JSON.stringify(val).indexOf("__deferred") > 0 ) val = "[[__deferred]]";
			//if ( typeof val === 'object' && JSON.stringify(val).indexOf("__metadata") > 0 ) val = "[[__metadata]]";
			//vals.push( ( typeof val === 'object' && key != '__metadata' ? JSON.stringify(val) : val ) );
			vals.push( typeof val === 'object' ? JSON.stringify(val) : val );
		});
		table.addRow(vals);
	});

	return table.toString();
}

// ================================================================================================

QUnit.module( "LIST - COLS and INFO Methods", function(){
	// TEST: Using GUID
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
	['Documents', 'Site Assets', 'Site Pages']
	.forEach(function(list,idx){
		QUnit.test(`sprLib.list({ name:'${list}', baseUrl:'${RESTDEMO1}' }).cols()`, function(assert){
			var done = assert.async();
			sprLib.list({ name:list, baseUrl:RESTDEMO1 }).cols()
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

		QUnit.test(`sprLib.list({ name:'${list}', baseUrl:'${RESTDEMO2}' }).info()`, function(assert){
			var done = assert.async();
			sprLib.list({ name:list, baseUrl:RESTDEMO2 }).info()
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
});

QUnit.module( "LIST - BASEURL Methods", function(){
	QUnit.test(`sprLib.list() 'baseUrl' parsing VS!`, function(assert){
		var done = assert.async();
		Promise.all([
			sprLib.list({ name:'Employees', baseUrl:'/sites/dev//'}).cols(),
			sprLib.list({ name:'Employees', baseUrl:'/sites/dev/' }).cols(),
			sprLib.list({ name:'Employees', baseUrl:'/sites/dev'  }).cols()
		])
		.then(arrArr => {
			assert.ok(arrArr[0].length > 0);
			assert.ok(arrArr[1].length > 0);
			assert.ok(arrArr[2].length > 0);
			assert.ok( arrArr[0].length == arrArr[1].length && arrArr[1].length == arrArr[2].length, "Pass: lengths all the same: "+ arrArr[0].length+'/'+arrArr[1].length+'/'+arrArr[2].length );

			done();
		})
	});
});

QUnit.module( "LIST - ITEM CRUD Methods", function(){
	QUnit.test("sprLib.list().create()", function(assert){
		[1,2,3,4].forEach(function(done,idx){
			done = assert.async();
			//
			var json = {
				__metadata:							{ type:"SP.Data.EmployeesListItem" },
				Name:								ARR_NAMES_FIRST[(Math.floor(Math.random()*9)+1)]+' '+ARR_NAMES_LAST[(Math.floor(Math.random()*9)+1)],
				ManagerId:							gTestUserId,
				Departments_x0020_SupportedId:		{ results:[1,2,3] },
				Mentored_x0020_Team_x0020_MemberId:	{ results:[9] },
				Site_x0020_Link:					{ Url:'https://github.com/', Description:'GitHub Site' },
				Badge_x0020_Number:					Math.round(new Date().getTime() / 1000000),
				Job_x0020_GradeId:					(idx+1),
				Hire_x0020_Date:					new Date(2017, idx, 1),
				Salary:								12345.49,
				Utilization_x0020_Pct:				1.0,
				Extension:							(1234+idx).toString(),
				Comments:							'New employee created',
				Active_x003f_:						true
			};
			var keys = Object.keys(json);

			sprLib.list('Employees').create(json)
			.then(function(newObj){
				assert.ok( (newObj.Id), "New Id: " + newObj.Id );
				assert.ok( (newObj.ID), "New ID: " + newObj.ID );
				assert.ok( (newObj.__metadata.etag), "New etag: " + newObj.__metadata.etag );
				assert.ok( ( keys.length+2 == Object.keys(newObj).length ), "Object.keys().lengths equal: " + Object.keys(newObj).length );
				assert.ok( true, "INPUT.: "+ keys.sort().toString() );
				assert.ok( true, "OUTPUT: "+ Object.keys(newObj).sort().toString() );
				assert.ok( getAsciiTableStr(json), `RESULTS:\n${getAsciiTableStr(json)}` );
				assert.ok( getAsciiTableStr(newObj), `RESULTS:\n${getAsciiTableStr(newObj)}` );
				assert.ok( true, "..." );
				assert.ok( true, ".." );
				assert.ok( true, "." );
				done();
			});
		});
	});

	QUnit.test("sprLib.list().update() 1: with current etag   ", function(assert){
		var done = assert.async();

		// PREP:
		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1, metadata:true })
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
		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
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
		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
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
		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1, metadata:true })
		.then(function(data){ gUpdateItem = data[0]; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({
				__metadata: { etag:gUpdateItem.__metadata.etag },
				id: gUpdateItem.Id
			})
			.then(function(retID){
				assert.ok( typeof retID === 'number', "typeof retID === 'number': "+(typeof retID === 'number') );
				assert.ok( retID == gUpdateItem.Id, "retID == gUpdateItem.Id: "+(retID == gUpdateItem.Id) );
				done();
			});
		});
	});
	QUnit.test("sprLib.list().delete() 2: with etag [null]    ", function(assert){
		var done = assert.async();
		// PREP:
		var gUpdateItem = {};
		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){ gUpdateItem = data[0]; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({
				__metadata: { etag:null },
				id: gUpdateItem.Id
			})
			.then(function(retID){
				assert.ok( typeof retID === 'number', "typeof retID === 'number': "+(typeof retID === 'number') );
				assert.ok( retID == gUpdateItem.Id, "retID == gUpdateItem.Id: "+(retID == gUpdateItem.Id) );
				done();
			});
		});
	});
	QUnit.test("sprLib.list().delete() 3: no etag (aka: force)", function(assert){
		var done = assert.async();
		// PREP:
		var numId = "'-1'";
		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			numId = data[0].Id;
			assert.ok( (true), "Found Id: "+numId );
		})
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({ id:numId })
			.then(function(retID){
				assert.ok( typeof retID === 'number', "typeof retID === 'number': "+(typeof retID === 'number') );
				assert.ok( retID == numId, "retID == numId: "+(retID == numId) );
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
		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){
			numId = data[0].Id;
			assert.ok( (true), "FYI: selected ID: "+numId );
		})
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.recycle({ "ID":numId })
			.then(function(retID){
				assert.ok( typeof retID === 'number', "typeof retID === 'number': "+(typeof retID === 'number') );
				assert.ok( retID == numId, "retID == numId: "+(retID == numId) );
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

		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
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

		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
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

		sprLib.list('Employees').items({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
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
});

QUnit.module( "LIST - ITEM GET Methods", function(){
	QUnit.test("sprLib.items() 01: no opts", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items()
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0        , "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (!arrayResults[0].__metadata)  , "arrayResults[0].__metadata does not exist!" );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 02: simple col name STRING", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items('Name')
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0                 , "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( Object.keys(arrayResults[0]).length == 1, "arrayResults[0] has length == 1: "+ Object.keys(arrayResults[0]).length );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 03: simple col name ARRAY (w Person object)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items(
			['Id', 'Name', 'Manager/Title']
		)
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0                 , "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( Object.keys(arrayResults[0]).length == 3, "arrayResults[0] has length == 3: "+ Object.keys(arrayResults[0]).length );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 04: `listCols` with simple string", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items({ listCols:'Manager/Title' })
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 1, "arrayResults[0] has length == 1: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].Manager.Title)         , "arrayResults[0].Manager.Title exists: "+ JSON.stringify(arrayResults[0].Manager.Title) );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 05: `listCols` with simple array of col names (Manager/Title)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items({
			listCols:['Id', 'Name', 'Manager/Title']
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 3, "arrayResults[0] has length == 3: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].Manager.Title)         , "arrayResults[0].Manager.Title exists: "+ JSON.stringify(arrayResults[0].Manager.Title) );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 06: `listCols` with simple array of col names (Manager/Id and Manager/Title)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list({ name:'Employees' })
		.items({
			listCols: ['Id', 'Name', 'Manager/Id', 'Manager/Title'],
			metadata: true
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

	QUnit.test("sprLib.items() 07: `listCols` with named columns", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items({
			listCols: {
				name:     { dataName:'Name'               },
				badgeNum: { dataName:'Badge_x0020_Number' },
				mgrId:    { dataName:'Manager/Id'         },
				mgrTitle: { dataName:'Manager/Title'      }
			},
			metadata: true
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

	QUnit.test("sprLib.items() 08: `listCols` with named columns `dataFunc` tests", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items({
			listCols: {
				name:     { dataName:'Name'               },
				badgeNum: { dataName:'Badge_x0020_Number' },
				mgrTitle: { dataName:'Manager/Title'      },
				funcTest: { dataFunc:function(result){ return result.Name+':'+result.Badge_x0020_Number } }
			}
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 4, "arrayResults[0] has length == 4: "+ Object.keys(arrayResults[0]).length );
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

	QUnit.test("sprLib.items() 09: `listCols` with named columns: Multi-Lookup test `Id`", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items({
			listCols: {
				empName:  { dataName:'Name'          },
				mgrTitle: { dataName:'Manager/Title' },
				depsArr:  { dataName:'Departments_x0020_Supported/Id' }
			},
			queryLimit: 1,
			queryFilter: "Departments_x0020_Supported ne null"
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).filter(key=>{return key.indexOf('_')!=0}).length == 3, "arrayResults[0] (no '__meta/__next') has length == 3: "+ Object.keys(arrayResults[0]).length );
			assert.ok( !isNaN(arrayResults[0].depsArr[0].Id), "arrayResults[0].depsArr[0].Id is a number: "+ arrayResults[0].depsArr[0].Id );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 10: `listCols` with column array: Multi-Lookup test `Id`", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items({
			listCols: ['Name', 'Manager/Title', 'Departments_x0020_Supported/Id'],
			queryLimit: 1,
			queryFilter: "Departments_x0020_Supported ne null"
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).filter(key=>{return key.indexOf('_')!=0}).length == 3, "arrayResults[0] (no '__meta/__next') has length == 3: "+ Object.keys(arrayResults[0]).length );
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

	// NOTE: Promise.all()
	QUnit.test("sprLib.items() 11: `listCols` with column array: Multi-Lookup two fields (`Id`, `Title`)", function(assert){
		var done = assert.async();
		// TEST:
		Promise.all([
			sprLib.list('Employees')
			.items({
				listCols: ['Name', 'Departments_x0020_Supported/Id', 'Departments_x0020_Supported/Title'],
				queryLimit: 1,
				queryFilter: "Departments_x0020_Supported ne null"
			})
			,sprLib.list('Employees')
			.items({
				listCols: ['Name', 'Departments_x0020_Supported/Id', 'Departments_x0020_Supported/Title'],
				queryLimit: 1,
				queryFilter: "Departments_x0020_Supported eq null"
			})
		])
		.then(function(arrayResults){
			var res1 = arrayResults[0];
			assert.ok( Object.keys(res1[0]).filter(key=>{return key.indexOf('_')!=0}).length == 2, "res1[0] (no '__meta/__next') has length == 2: "+ Object.keys(res1[0]).length );
			assert.ok(
				!isNaN( res1[0].Departments_x0020_Supported[0].Id ),
				"res1[0].Departments_x0020_Supported[0].Id is a number: "+ res1[0].Departments_x0020_Supported[0].Id
			);
			assert.ok(
				(res1[0].Departments_x0020_Supported[0].Title),
				"res1[0].Departments_x0020_Supported[0].Title exists: "+ res1[0].Departments_x0020_Supported[0].Title
			);
			assert.ok( getAsciiTableStr(res1), `RESULTS:\n${getAsciiTableStr(res1)}`);

			// Empty Multi-Lookup fields should be an empty array `[]`
			var res2 = arrayResults[1];
			assert.ok( Object.keys(res2[0]).filter(key=>{return key.indexOf('_')!=0}).length == 2, "res2[0] (no '__meta/__next') has length == 2: "+ Object.keys(res2[0]).length );
			assert.ok(
				(Array.isArray(res2[0].Departments_x0020_Supported) && res2[0].Departments_x0020_Supported.length == 0),
				"res2[0].Departments_x0020_Supported == []: "+ res2[0].Departments_x0020_Supported
			);
			assert.ok( getAsciiTableStr(res2), `RESULTS:\n${getAsciiTableStr(res2)}`);

			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	// NOTE: Promise.all()
	QUnit.test("sprLib.items() 12: `listCols` with column array: Multi-Person two fields (`ID`, `Title`)", function(assert){
		var done = assert.async();
		// TEST:
		Promise.all([
			sprLib.list('Employees').items({
				listCols: ['Name', 'Mentored_x0020_Team_x0020_Member/ID', 'Mentored_x0020_Team_x0020_Member/Title'],
				queryLimit: 1,
				queryFilter: "Mentored_x0020_Team_x0020_Member ne null"
			}),
			sprLib.list('Employees').items({
				listCols: ['Name', 'Mentored_x0020_Team_x0020_Member/ID', 'Mentored_x0020_Team_x0020_Member/Title'],
				queryLimit: 1,
				queryFilter: "Mentored_x0020_Team_x0020_Member eq null"
			})
		])
		.then(function(arrayResults){
			var res1 = arrayResults[0];
			assert.ok( Object.keys(res1[0]).filter(key=>{return key.indexOf('_')!=0}).length == 2, "res1[0] (no '__meta/__next') has length == 2: "+ Object.keys(res1[0]).length );
			assert.ok( !isNaN(res1[0].Mentored_x0020_Team_x0020_Member[0].ID), "res1[0].Mentored_x0020_Team_x0020_Member[0].ID is a number: "+ res1[0].Mentored_x0020_Team_x0020_Member[0].ID );
			assert.ok( (res1[0].Mentored_x0020_Team_x0020_Member[0].Title), "res1[0].Mentored_x0020_Team_x0020_Member[0].Title exists: "+ res1[0].Mentored_x0020_Team_x0020_Member[0].Title );
			assert.ok( getAsciiTableStr(res1), `RESULTS:\n${getAsciiTableStr(res1)}`);

			// Empty Person/Lookup fields should be null
			var res2 = arrayResults[1];
			assert.ok( Object.keys(res2[0]).filter(key=>{return key.indexOf('_')!=0}).length == 2, "res2[0] (no '__meta/__next') has length == 2: "+ Object.keys(res2[0]).length );
			assert.ok( (res2[0].Mentored_x0020_Team_x0020_Member == null), "res2[0].Mentored_x0020_Team_x0020_Member == null: "+ res2[0].Mentored_x0020_Team_x0020_Member );
			assert.ok( getAsciiTableStr(res2), `RESULTS:\n${getAsciiTableStr(res2)}`);

			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 13: `queryFilter` using: `Id` + `eq`", function(assert){
		var done = assert.async();
		// TEST:
		Promise.resolve()
		.then(function(){
			return sprLib.list('Employees').items({ listCols:'Id', queryLimit:1 });
		})
		.then(function(arrayResults){
			var intId = arrayResults[0].Id;
			sprLib.list('Employees')
			.items({
				listCols: ['Id','Name'],
				queryFilter: 'Id eq '+intId
			})
			.then(function(arrayResults){
				assert.ok( Object.keys(arrayResults[0]).length == 2, "arrayResults[0] has length == 2: "+ Object.keys(arrayResults[0]).length );
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

	QUnit.test("sprLib.items() 14: `queryFilter` using: `Name` + `eq` with single-quote", function(assert){
		var done = assert.async();
		// TEST:
		Promise.resolve()
		.then(function(){
			return sprLib.list('Employees').items({ listCols:'Name', queryLimit:1 });
		})
		.then(function(arrayResults){
			var strName = arrayResults[0].Name;
			sprLib.list('Employees')
			.items({
				listCols: 'Name',
				queryFilter: "Name eq '"+strName+"'",
				queryLimit: 1
			})
			.then(function(arrayResults){
				assert.ok( Object.keys(arrayResults[0]).filter(key=>{return key.indexOf('_')!=0}).length == 1, "arrayResults[0] (no '__meta/__next') has length == 1: "+ Object.keys(arrayResults[0]).length );
				assert.ok( (arrayResults[0].Name)        , "arrayResults[0].Name exists: "+ JSON.stringify(arrayResults[0].Name) );
				assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	QUnit.test("sprLib.items() 15: `queryFilter` using: `Name` + `eq` with double-quote", function(assert){
		var done = assert.async();
		// TEST:
		Promise.resolve()
		.then(function(){
			return sprLib.list('Employees').items({ listCols:'Name', queryLimit:1 });
		})
		.then(function(arrayResults){
			var strName = arrayResults[0].Name;
			sprLib.list('Employees')
			.items({
				listCols: 'Name',
				queryFilter: 'Name eq "'+strName+'"',
				queryLimit: 1
			})
			.then(function(arrayResults){
				assert.ok( Object.keys(arrayResults[0]).filter(key=>{return key.indexOf('_')!=0}).length == 1, "arrayResults[0] (no '__meta/__next') has length == 1: "+ Object.keys(arrayResults[0]).length );
				assert.ok( (arrayResults[0].Name)        , "arrayResults[0].Name exists: "+ JSON.stringify(arrayResults[0].Name) );
				assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	QUnit.test("sprLib.items() 16: `queryLimit` test", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items({ listCols:'Name', queryLimit:3, metadata:true })
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

	QUnit.test("sprLib.items() 17: `queryOrderby` (asc) test", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items({
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

	QUnit.test("sprLib.items() 18: `queryOrderby` (desc) test", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.items({
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

	QUnit.test("sprLib.items() 19: Promise.all/Multi-Test: APPEND TEXT", function(assert){
		var done = assert.async();

		sprLib.list('Employees').items({ listCols:'ID', queryOrderby:'Modified', queryLimit:1 })
		.then(function(arrResults){
			return sprLib.list('Employees')
			.update({
				__metadata: { type:"SP.Data.EmployeesListItem" },
				ID: arrResults[0].ID,
				Versioned_x0020_Comments: (new Date().toISOString() + ': adding version to history')
			});
		})
		.then(function(objItem){
			return sprLib.list('Employees')
			.update({
				__metadata: { type:"SP.Data.EmployeesListItem" },
				ID:   objItem.ID,
				Comments: null,
				Name: 'Adding post-Comments change to clear Comments value in this version'
			});
		})
		.then(function(objItem){
			// SETUP TEST: Set/Verify empty comment in newest version so history tests below will have easily verifiable results
			assert.ok( true, "Setup Test:\n------------------" );
			assert.ok( (!objItem.Comments), 'Comments is ""/null : '+ objItem.Comments );

			// TEST:
			Promise.all([
				sprLib.list('Employees').items({
					listCols: ['ID', 'Versioned_x0020_Comments', 'Mentored_x0020_Team_x0020_Member/Title'],
					queryLimit: 10,
					queryOrderby: "Modified desc"
				}),
				sprLib.list('Employees').items({
					listCols: {
						appendText: { dataName:'Versioned_x0020_Comments', getVersions:true }
					},
					queryLimit: 10,
					queryOrderby: "Modified desc"
				}),
				sprLib.list('Employees').items({
					listCols: {
						Versioned_x0020_Comments: { dataName:'Versioned_x0020_Comments', getVersions:true }
					},
					queryLimit: 10,
					queryOrderby: "Modified desc"
				}),
				sprLib.list({ name:'Site Assets', baseUrl:'/sites/dev/sandbox' }).items({
					listCols: {
						fileName: { dataName:'FileLeafRef', getVersions:true }
					},
					queryLimit: 1
				})
			])
			.then(function(arrayResults){
				var result = arrayResults[0];
				assert.ok( true, "Negative Test: getVersions=false\n------------------" );
				assert.ok( Object.keys(result[0]).filter(key=>{return key.indexOf('_')!=0}).length == 3, "result[0] (no '__meta/__next') has length == 3: "+ Object.keys(result[0]).filter(key=>{return key.indexOf('_')!=0}).length );
				assert.ok( (true), "result[0].Versioned_x0020_Comments: "+ result[0].Versioned_x0020_Comments );
				assert.ok( getAsciiTableStr(result), `RESULTS:\n${getAsciiTableStr(result)}` );

				var result = arrayResults[1];
				assert.ok( true, "TEST: getVersions with keyname-1\n------------------" );
				assert.ok( Object.keys(result[0]).filter(key=>{return key.indexOf('_')!=0}).length == 1, "result[0] (no '__meta/__next') has length == 1: "+ Object.keys(result[0]).filter(key=>{return key.indexOf('_')!=0}).length );
				assert.ok( result[0].appendText, "result[0].appendText: "+ result[0].appendText );
				assert.ok( Array.isArray(result[0].appendText), "Array.isArray(result[0].appendText): "+ Array.isArray(result[0].appendText) );
				assert.ok( result[0].appendText.length > 0, "result[0].appendText.length > 0: "+ result[0].appendText.length );
				assert.ok( getAsciiTableStr(result), `RESULTS:\n${getAsciiTableStr(result)}` );

				var result = arrayResults[2];
				assert.ok( true, "TEST: getVersions with keyname-2\n------------------" );
				assert.ok( Object.keys(result[0]).filter(key=>{return key.indexOf('_')!=0}).length == 1, "result[0] (no '__meta/__next') has length == 1: "+ Object.keys(result[0]).filter(key=>{return key.indexOf('_')!=0}).length );
				assert.ok( result[0].Versioned_x0020_Comments, "result[0].Versioned_x0020_Comments: "+ result[0].Versioned_x0020_Comments );
				assert.ok( Array.isArray(result[0].Versioned_x0020_Comments), "result[0].VC is Array(): "+ Array.isArray(result[0].Versioned_x0020_Comments) );
				assert.ok( result[0].Versioned_x0020_Comments.length > 0, "result[0].Versioned_x0020_Comments.length > 0: "+ result[0].Versioned_x0020_Comments.length );
				assert.ok( getAsciiTableStr(result), `RESULTS:\n${getAsciiTableStr(result)}` );

				var result = arrayResults[3];
				assert.ok( true, "TEST: getVersions with baseUrl\n------------------" );
				assert.ok( Object.keys(result[0]).filter(key=>{return key.indexOf('_')!=0}).length == 1, "result[0] (no '__meta/__next') has length == 1: "+ Object.keys(result[0]).filter(key=>{return key.indexOf('_')!=0}).length );
				assert.ok( result[0].fileName, "result[0].fileName: "+ result[0].fileName );
				assert.ok( Array.isArray(result[0].fileName), "result[0].VC is Array(): "+ Array.isArray(result[0].fileName) );
				assert.ok( result[0].fileName.length > 0, "result[0].fileName.length > 0: "+ result[0].fileName.length );
				assert.ok( getAsciiTableStr(result), `RESULTS:\n${getAsciiTableStr(result)}` );

				done();
			})
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 20: `listCols` with duplicate column", function(assert){
		var done = assert.async();
		// TEST: This caused empty results until fixed in 1.5.0!
		sprLib.list('Departments')
		.items({ listCols:['Id','Id'] })
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 1, "arrayResults[0] has length == 1: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].Id)           , "arrayResults[0].Id exists: "+ JSON.stringify(arrayResults[0].Id) );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 50: `queryNext` with return values", function(assert){
		var done = assert.async();
		var intLastID = 0;

		sprLib.list('Departments').items({ listCols:['Id','Title'], queryOrderby:'ID', queryLimit:5 })
		.then(arrayResults => {
			assert.ok( Object.keys(arrayResults[0]).length == 3, "Object.keys(arrayResults[0]) length == 3: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].__next ), "arrayResults[0].__next exists: "+ JSON.stringify(arrayResults[0].__next) );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			//
			intLastID = arrayResults[arrayResults.length-1].Id;
			return sprLib.list('Departments').items({ queryNext:arrayResults[0].__next, listCols:['Id','Title'], queryOrderby:'ID', queryLimit:5 })
		})
		.then(arrayResults => {
			assert.ok( intLastID+1 == arrayResults[0].Id, "intLastID+1 == arrayResults[0].Id: "+ (intLastID+1) +" ?=? "+ arrayResults[0].Id );
			assert.ok( Object.keys(arrayResults[0]).length == 3, "Object.keys(arrayResults[0]) length == 3: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].__next ), "arrayResults[0].__next exists: "+ JSON.stringify(arrayResults[0].__next) );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			//
			intLastID = arrayResults[arrayResults.length-1].Id;
			return sprLib.list('Departments').items({ queryNext:arrayResults[0].__next, listCols:['Id','Title'], queryOrderby:'ID', queryLimit:5 })
		})
		.then(arrayResults => {
			assert.ok( intLastID+1 == arrayResults[0].Id, "intLastID+1 == arrayResults[0].Id: "+ (intLastID+1) +" ?=? "+ arrayResults[0].Id );
			assert.ok( Object.keys(arrayResults[0]).length == 3, "Object.keys(arrayResults[0]) length == 3: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].__next ), "arrayResults[0].__next exists: "+ JSON.stringify(arrayResults[0].__next) );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			//
			intLastID = arrayResults[arrayResults.length-1].Id;
			return sprLib.list('Departments').items({ queryNext:arrayResults[0].__next, listCols:['Id','Title'], queryOrderby:'ID', queryLimit:5 })
		})
		.then(arrayResults => {
			assert.ok( intLastID+1 == arrayResults[0].Id, "intLastID+1 == arrayResults[0].Id: "+ (intLastID+1) +" ?=? "+ arrayResults[0].Id );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			//
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.items() 51: `queryNext` using options", function(assert){
		var done = assert.async();
		var intMax = 5;

		// TEST:
		Promise.resolve()
		.then(function(){
			return sprLib.list('Departments').items({ listCols:'Id', queryOrderby:'ID' });
		})
		.then(function(arrayResults){
			var numPrevId = arrayResults[0].Id;

			sprLib.list('Departments')
			.items({
				listCols    : 'Id',
				queryOrderby: 'Id',
				queryNext   : { prevId:numPrevId, maxItems:intMax }
			})
			.then(function(arrayResults){
				assert.ok( arrayResults[0].Id > numPrevId, 'arrayResults[0].Id > numPrevId: '+ arrayResults[0].Id+'/'+numPrevId );
				assert.ok( arrayResults.length == intMax, 'arrayResults.length == intMax:'+arrayResults.length );
				assert.ok( arrayResults[0].__next, 'arrayResults[0].__next: '+ JSON.stringify(arrayResults[0].__next) );
				assert.ok( arrayResults[0].__next.prevId == arrayResults[arrayResults.length-1].Id, 'arrayResults[0].__next.prevId == arrayResults[arrayResults.length-1].Id: '+ arrayResults[0].__next.prevId+'/'+arrayResults[arrayResults.length-1].Id );
				assert.ok( arrayResults[0].__next.maxItems == intMax, 'arrayResults[0].__next.maxItems == intMax: '+ arrayResults[0].__next.maxItems+'/'+intMax );
				assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
				done();
			})
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	// DEPRECATED: `getItems`
	QUnit.test("sprLib.items() 90: DEPRECATED TEST: `getItems`", function(assert){
		var done = assert.async();
		// TEST: This caused empty results until fixed in 1.5.0!
		sprLib.list('Departments')
		.getItems({ listCols:['Id'] })
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 1, "arrayResults[0] has length == 1: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].Id)           , "arrayResults[0].Id exists: "+ JSON.stringify(arrayResults[0].Id) );
			assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	// JUNK TESTS:
	QUnit.test("sprLib.items() 99: Junk/Empty .list() param test", function(assert){
		['', [], [''], ['',''], {}].forEach(function(data,idx){
			var done = assert.async();
			// TEST:
			sprLib.list('Employees').items({listCols:data, queryLimit:10})
			.then(function(arrayResults){
				assert.ok( arrayResults.length > 0        , "arrayResults is an Array and length > 0: "+ arrayResults.length );
				assert.ok( getAsciiTableStr(arrayResults) , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});
});

// ================================================================================================

QUnit.module( "FILE - Methods", function(){
	// NOTE: `get` - test can be executed via `sprestlib-demo.html` (or `nodejs-demo.js`)

	// `info()`
	QUnit.test("sprLib.file('SiteAssets/whatever').info()", function(assert){
		var done = assert.async();
		sprLib.folder('SiteAssets').files()
		.then(arrFiles => {
			sprLib.file( arrFiles[0].ServerRelativeUrl ).info()
			.then(function(objInfo){
				assert.ok( Object.keys(objInfo).length > 0, "Object.keys(objInfo).length > 0: "+ Object.keys(objInfo).length );
				assert.ok( getAsciiTableStr([objInfo]) , `RESULTS:\n${getAsciiTableStr([objInfo])}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	// `perms()`
	QUnit.test("sprLib.file('SiteAssets/whatever').perms()", function(assert){
		var done = assert.async();
		sprLib.folder('SiteAssets').files()
		.then(arrFiles => {
			sprLib.file( arrFiles[0].ServerRelativeUrl ).perms()
			.then(function(arrayResults){
				assert.ok( arrayResults[0].hasOwnProperty('Member'), "arrayResults[0].hasOwnProperty('Member')"+ arrayResults[0].hasOwnProperty('Member') );
				assert.ok( arrayResults[0].hasOwnProperty('Roles') , "arrayResults[0].hasOwnProperty('Roles')" + arrayResults[0].hasOwnProperty('Roles') );
				assert.ok( Array.isArray(arrayResults[0].Roles)    , "Array.isArray(arrayResults[0].Roles)"    + Array.isArray(arrayResults[0].Roles) );
				assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	// `delete()`
	QUnit.test("sprLib.file('/sites/dev/Shared Documents/deleteable/whatever').delete()", function(assert){
		var done = assert.async();
		// PREP:
		var objFile = {};
		sprLib.folder('/sites/dev/Shared Documents/deleteable').files()
		.then(function(arrResults){
			if ( !arrResults || arrResults.length == 0 ) throw 'NO_FILES_FOUND';
			objFile = arrResults.sort((a,b) => { return new Date(a.Modified) > new Date(b.Modified) ? true : false })[0];
			assert.ok( (true), "FYI: objFile: "+JSON.stringify(objFile,null,4) );
		})
		.then(function(){
			// TEST:
			sprLib.file(objFile.ServerRelativeUrl).delete()
			.then(function(boolResult){
				assert.ok( boolResult, "`boolResult`: "+boolResult.toString() );
				done();
			});
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	// `recycle()`
	QUnit.test("sprLib.file('/sites/dev/Shared Documents/deleteable/whatever').recycle()", function(assert){
		var done = assert.async();
		// PREP:
		var objFile = {};
		sprLib.folder('/sites/dev/Shared Documents/deleteable').files()
		.then(function(arrResults){
			// NOTE: use `<=1` and `[1]` below, otherwise, the same file will be chosen for both delete/recycle!!!
			if ( !arrResults || arrResults.length <= 1 ) throw 'NO_FILES_FOUND';
			objFile = arrResults.sort((a,b) => { return new Date(a.Modified) > new Date(b.Modified) ? true : false })[1];
			assert.ok( (true), "FYI: objFile: "+JSON.stringify(objFile,null,4) );
		})
		.then(function(){
			// TEST:
			sprLib.file(objFile.ServerRelativeUrl).recycle()
			.then(function(boolResult){
				assert.ok( boolResult, "`boolResult`: "+boolResult.toString() );
				done();
			});
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
});

QUnit.module( "FOLDER - Methods", function(){
	// INFO: PROPS/PERMS
	QUnit.test("sprLib.folder('"+BASEURL+"/SiteAssets').info() - using full URL", function(assert){
		var done = assert.async();
		sprLib.folder(BASEURL+'/SiteAssets').info()
		.then(function(objInfo){
			assert.ok( Object.keys(objInfo).length > 0, "Object.keys(objInfo).length > 0: "+ Object.keys(objInfo).length );
			assert.ok( getAsciiTableStr([objInfo]) , `RESULTS:\n${getAsciiTableStr([objInfo])}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.folder('SiteAssets').info() - using only folder name", function(assert){
		var done = assert.async();
		sprLib.folder('SiteAssets').info()
		.then(function(objInfo){
			assert.ok( Object.keys(objInfo).length > 0, "Object.keys(objInfo).length > 0: "+ Object.keys(objInfo).length );
			assert.ok( getAsciiTableStr([objInfo]) , `RESULTS:\n${getAsciiTableStr([objInfo])}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.folder('SiteAssets').perms()", function(assert){
		var done = assert.async();
		sprLib.folder('SiteAssets').perms()
		.then(function(arrayResults){
			assert.ok( arrayResults[0].hasOwnProperty('Member'), "arrayResults[0].hasOwnProperty('Member')"+ arrayResults[0].hasOwnProperty('Member') );
			assert.ok( arrayResults[0].hasOwnProperty('Roles') , "arrayResults[0].hasOwnProperty('Roles')" + arrayResults[0].hasOwnProperty('Roles') );
			assert.ok( Array.isArray(arrayResults[0].Roles)    , "Array.isArray(arrayResults[0].Roles)"    + Array.isArray(arrayResults[0].Roles) );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.folder('"+FOLDPERMUNQ+"').perms() - Unique Perms", function(assert){
		var done = assert.async();
		sprLib.folder(FOLDPERMUNQ).perms()
		.then(function(arrayResults){
			assert.ok( arrayResults[0].hasOwnProperty('Member'), "arrayResults[0].hasOwnProperty('Member')"+ arrayResults[0].hasOwnProperty('Member') );
			assert.ok( arrayResults[0].hasOwnProperty('Roles') , "arrayResults[0].hasOwnProperty('Roles')" + arrayResults[0].hasOwnProperty('Roles') );
			assert.ok( arrayResults.length == 2                , "arrayResults.length == 2 (perms are broken, and contain only 2 groups): " + arrayResults.length );
			assert.ok( getAsciiTableStr(arrayResults)          , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	// CONTENTS: FILES/FOLDERS
	QUnit.test("sprLib.folder('SiteAssets').files()", function(assert){
		var done = assert.async();
		sprLib.folder('SiteAssets').files()
		.then(arrayResults => {
			assert.ok( Array.isArray(arrayResults)              , "Array.isArray(arrayResults)               => "+ Array.isArray(arrayResults) );
			assert.ok( arrayResults[0].hasOwnProperty('Name')   , "arrayResults[0].hasOwnProperty('Name')    => "+ arrayResults[0].hasOwnProperty('Name') );
			assert.ok( arrayResults[0].hasOwnProperty('Created'), "arrayResults[0].hasOwnProperty('Created') => "+ arrayResults[0].hasOwnProperty('Created') );
			assert.ok( getAsciiTableStr(arrayResults)           , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	QUnit.test("sprLib.folder('SiteAssets').folders()", function(assert){
		var done = assert.async();
		sprLib.folder('SiteAssets').folders()
		.then(arrayResults => {
			assert.ok( Array.isArray(arrayResults)              , "Array.isArray(arrayResults)               => "+ Array.isArray(arrayResults) );
			assert.ok( arrayResults[0].hasOwnProperty('Name')   , "arrayResults[0].hasOwnProperty('Name')    => "+ arrayResults[0].hasOwnProperty('Name') );
			assert.ok( arrayResults[0].hasOwnProperty('Created'), "arrayResults[0].hasOwnProperty('Created') => "+ arrayResults[0].hasOwnProperty('Created') );
			assert.ok( getAsciiTableStr(arrayResults)           , `RESULTS:\n${getAsciiTableStr(arrayResults)}`);
			done();
		})
		.catch(function(errorMessage){
			assert.ok( (false), errorMessage );
			done();
		});
	});

	// MANIPULATION: Add, Delete, Recycle
	// `add()`
	QUnit.test("sprLib.folder('Shared Documents/deleteable').add('newFolder')", function(assert){
		var done = assert.async();
		var strNewFolder = 'AddFolder-'+new Date().toISOString().replace(/[-:.]/gi,'');
		sprLib.folder('Shared Documents/deleteable').add(strNewFolder)
		.then(objFolder => {
			sprLib.folder( objFolder.ServerRelativeUrl ).info()
			.then(function(objInfo){
				assert.ok( Object.keys(objInfo).length > 0, "Object.keys(objInfo).length > 0: "+ Object.keys(objInfo).length );
				assert.ok( objInfo.Name == strNewFolder, "(objInfo.Name == strNewFolder) ? "+ (objInfo.Name == strNewFolder ? 'TRUE' : 'FALSE!!!') );
				assert.ok( getAsciiTableStr([objInfo]) , `RESULTS:\n${getAsciiTableStr([objInfo])}`);
				done();
			})
			.catch(function(errorMessage){
				assert.ok( (false), errorMessage );
				done();
			});
		});
	});

	// `delete()`
	QUnit.test("sprLib.folder('folderToDelete').delete()", function(assert){
		var done = assert.async();
		// PREP:
		var objFile = {};
		sprLib.folder('/sites/dev/Shared Documents/deleteable').folders()
		.then(function(arrResults){
			if ( !arrResults || arrResults.length == 0 ) throw 'NO_FOLDERS_FOUND';
			objFile = arrResults.sort((a,b) => { return new Date(a.Modified) > new Date(b.Modified) ? true : false })[0];
			assert.ok( (true), "FYI: objFolder: "+JSON.stringify(objFile,null,4) );
		})
		.then(function(){
			// TEST:
			sprLib.folder(objFile.ServerRelativeUrl).delete()
			.then(function(boolResult){
				assert.ok( boolResult, "`boolResult`: "+boolResult.toString() );
				done();
			});
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	// `recycle()`
	QUnit.test("sprLib.folder('folderToDelete').recycle()", function(assert){
		var done = assert.async();
		// PREP:
		var objFile = {};
		sprLib.folder('/sites/dev/Shared Documents/deleteable').folders()
		.then(function(arrResults){
			if ( !arrResults || arrResults.length == 0 ) throw 'NO_FOLDERS_FOUND';
			objFile = arrResults.sort((a,b) => { return new Date(a.Modified) > new Date(b.Modified) ? true : false })[0];
			assert.ok( (true), "FYI: objFolder: "+JSON.stringify(objFile,null,4) );
		})
		.then(function(){
			// TEST:
			sprLib.folder(objFile.ServerRelativeUrl).recycle()
			.then(function(boolResult){
				assert.ok( boolResult, "`boolResult`: "+boolResult.toString() );
				done();
			});
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
});

// ================================================================================================

QUnit.module( "REST - Methods", function(){
	QUnit.test("sprLib.rest() ex: '_api/lists/getbytitle('Employees')/items' [1:relative-url, 2:get]", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			url: "_api/lists/getbytitle('Employees')/items",
			queryCols: ['Id', 'Name', 'Manager/Title'],
			queryLimit: 5,
			type: "GET"
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).filter(key=>{return key.indexOf('_')!=0}).length == 3, "arrayResults[0] (no '__meta/__next') has length == 3: "+ Object.keys(arrayResults[0]).length );
			assert.ok( (arrayResults[0].Manager.Title), "arrayResults[0].Manager.Title exists: "+ arrayResults[0].Manager.Title );
			assert.ok( arrayResults.length == 5, "arrayResults has length == 5: "+ arrayResults.length );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}` );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	QUnit.test("sprLib.rest() ex: '_api/lists/getbytitle('Employees')/items' [1:relative-url, 2:$select-not-cols]", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			url: "_api/lists/getbytitle('Employees')/items?$select=Name,Manager/Title&$orderby=ID%20desc&$top=5&$expand=Manager"
		})
		.then(function(arrayResults){
			// NOTE: Running your own select results in raw results (sprLib only parses `queryCols`). Ex: `{"Title":"Brent Ely"}`
			assert.ok( Object.keys(arrayResults[0]).filter(key=>{return key.indexOf('_')!=0}).length == 2, "arrayResults[0] (no '__meta/__next') has length == 2: "+ Object.keys(arrayResults[0]).length );
			assert.ok( arrayResults[0].Manager, "arrayResults[0].Manager: "+ arrayResults[0].Manager );
			assert.ok( arrayResults.length == 5, "arrayResults has length == 5: "+ arrayResults.length );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}` );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

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

	QUnit.test("sprLib.rest() ex: 'Expand multi-level test", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			url : "_api/web/RoleAssignments",
			queryCols: ['PrincipalId','Member/Users/Id'],
			queryFilter: 'Member/PrincipalType eq 8'
		})
		.then(function(arrayResults){
			assert.ok( Object.keys(arrayResults[0]).length == 2, "arrayResults[0] has length == 2: "+ Object.keys(arrayResults[0]).length );
			assert.ok( arrayResults[0].PrincipalId && arrayResults[0].Member, "arrayResults[0] has props 'PrincipalId' && 'Member': "+ Object.keys(arrayResults[0]) );
			var arrItems = arrayResults.filter(obj => { return obj.Member.Users && obj.Member.Users.length > 0 });
			assert.ok( (arrItems[0].Member.Users[0].Id), "arrItems[0].Member.Users[0].Id exists: "+ arrItems[0].Member.Users[0].Id );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}` );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	// TEST: Complete, full URL
	QUnit.test("sprLib.rest() ex: 'https://full.url.com/_api/web/sitegroups'", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			url: BASEURL+'/_api/web/sitegroups',
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

	// TEST: endpoints that return `data.d.results` [{}]
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

	// TEST: endpoints that return `data.d` {}
	QUnit.test("sprLib.rest() ex: '/_api/web/lists' [[using `?$select=col`]]", function(assert){
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
});

// ================================================================================================

QUnit.module( "SITE - Methods", function(){
	var arrTestUrls = [ null, SITEURL1, SITEURL2 ];

	// DESC: info()
	QUnit.test("sprLib.site().info() - using `arrTestUrls`", function(assert){
		arrTestUrls.forEach((ARG_SITE,idx)=>{
			var done = assert.async();
			// TEST:
			sprLib.site(ARG_SITE).info()
			.then(function(objSite){
				assert.ok( Object.keys(objSite).length == 15, "Object.keys(objSite).length == 15: "+ Object.keys(objSite).length );
				assert.ok( (objSite.Id),    "objSite.Id    exists: '"+ objSite.Id    +"'");
				assert.ok( (objSite.Title), "objSite.Title exists: '"+ objSite.Title +"'");
				assert.ok( objSite.AssociatedOwnerGroup.Id && objSite.AssociatedOwnerGroup.Title && objSite.AssociatedOwnerGroup.OwnerTitle, "objSite.AssociatedOwnerGroup has 3 props: "+ JSON.stringify(objSite.AssociatedOwnerGroup) );
				assert.ok( objSite.AssociatedMemberGroup.Id && objSite.AssociatedMemberGroup.Title && objSite.AssociatedMemberGroup.OwnerTitle, "objSite.AssociatedMemberGroup has 3 props: "+ JSON.stringify(objSite.AssociatedMemberGroup) );
				assert.ok( objSite.AssociatedVisitorGroup.Id && objSite.AssociatedVisitorGroup.Title && objSite.AssociatedVisitorGroup.OwnerTitle, "objSite.AssociatedVisitorGroup has 3 props: "+ JSON.stringify(objSite.AssociatedVisitorGroup) );
				assert.ok( objSite.Owner.LoginName && objSite.Owner.Title && objSite.Owner.Email && objSite.Owner.IsSiteAdmin, "objSite.Owner has 4 props: "+ JSON.stringify(objSite.Owner,' ',4) );
				assert.ok( getAsciiTableStr(objSite), `RESULTS:\n${getAsciiTableStr(objSite)}` );
				assert.ok( true, `\n************************************************************\n`);
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});

	// DESC: lists()
	QUnit.test("sprLib.site().lists() - using both `()` and `(SITEURL1)`", function(assert){
		arrTestUrls.forEach((ARG_SITE,idx)=>{
			var done = assert.async();
			// TEST:
			sprLib.site(ARG_SITE).lists()
			.then(function(arrResults){
				var objItem = arrResults[0];
				//
				assert.ok( Object.keys(objItem).length == 10, "Object.keys(objItem).length == 10: "+ Object.keys(objItem).length );
				assert.ok( (objItem.Title != null),     "objItem.Title exists..........: '"+ objItem.Title +"'");
				assert.ok( (objItem.Id    != null),     "objItem.Id    exists..........: '"+ objItem.Id    +"'");
				assert.ok( gRegexGUID.test(objItem.Id), "gRegexGUID.test(objItem.Id)...: '"+ objItem.Id    +"'");
				assert.ok( !isNaN(objItem.ItemCount),   "objItem.ItemCount is a Number.: "+ objItem.ItemCount +"");
				assert.ok( (objItem.ImageUrl          && objItem.ImageUrl.indexOf('/') == 0),          "objItem.ImageUrl          starts with '/': '"+ objItem.ImageUrl +"'");
				assert.ok( (objItem.ParentWebUrl      && objItem.ParentWebUrl.indexOf('/') == 0),      "objItem.ParentWebUrl      starts with '/': '"+ objItem.ParentWebUrl +"'");
				assert.ok( (objItem.ServerRelativeUrl && objItem.ServerRelativeUrl.indexOf('/') == 0), "objItem.ServerRelativeUrl starts with '/': '"+ objItem.ServerRelativeUrl +"'");
				assert.ok( getAsciiTableStr(objItem), `RESULTS:\n${getAsciiTableStr(objItem)}` );
				assert.ok( getAsciiTableStr(arrResults), `RESULTS:\n${getAsciiTableStr(arrResults)}` );
				//
				assert.ok( true, `\n************************************************************\n`);
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});

	// DESC: perms()
	QUnit.test("sprLib.site().perms() - using both `()` and `(SITEURL1)`", function(assert){
		arrTestUrls.forEach((ARG_SITE,idx)=>{
			var done = assert.async();
			// TEST:
			sprLib.site(ARG_SITE).perms()
			.then(function(arrResults){
				var objItem = arrResults[0];
				//
				assert.ok( Object.keys(objItem).length == 2, "Object.keys(objItem).length == 2: "+ Object.keys(objItem).length );
				assert.ok( objItem.Member, "objItem.Member exists: '"+ JSON.stringify(objItem.Member) +"'");
				assert.ok( objItem.Member.PrincipalId && objItem.Member.PrincipalType && objItem.Member.Title, "objItem.Member has 3 props: "+ JSON.stringify(objItem.Member) );
				assert.ok( objItem.Roles && Array.isArray(objItem.Roles), "objItem.Roles exists and is an array: '"+ JSON.stringify(objItem.Roles) +"'");
				assert.ok( Object.keys(objItem.Roles[0]).length == 2, "Object.keys(objItem.Roles[0]).length == 2: "+ JSON.stringify(objItem.Roles[0]) );
				assert.ok( getAsciiTableStr(objItem), `RESULTS:\n${getAsciiTableStr(objItem)}` );
				//
				assert.ok( true, `\n************************************************************\n`);
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});

	// DESC: groups()
	QUnit.test("sprLib.site().groups() - using both `()` and `(SITEURL1)`", function(assert){
		arrTestUrls.forEach((ARG_SITE,idx)=>{
			var done = assert.async();
			var grpId = 0;
			var grpTitle = "";

			// TEST: No args
			sprLib.site(ARG_SITE).groups()
			.then(function(arrResults){
				var objItem = arrResults[0];
				grpId = objItem.Id;
				grpTitle = objItem.Title;
				//
				assert.ok( Object.keys(objItem).length == 7, "Object.keys(objItem).length == 7: "+ Object.keys(objItem).length );
				assert.ok( objItem.Users && Array.isArray(objItem.Users), "objItem.Users exists and is an array: "+ Array.isArray(objItem.Users) );
				assert.ok( Object.keys(objItem.Users[0]).length == 3, "Object.keys(objItem.Users[0]).length == 3: "+ Object.keys(objItem.Users[0]).toString() );
				assert.ok( getAsciiTableStr(arrResults), `RESULTS:\n${getAsciiTableStr(arrResults)}` );
				//
				assert.ok( true, `\nEND TEST 1: ************************************************************\n`);
			})
			// TEST: Using filters
			.then(function(){
				return Promise.all([
					sprLib.site(ARG_SITE).groups({ 'id':grpId }),
					sprLib.site(ARG_SITE).groups({ 'title':grpTitle })
				]);
			})
			.then(function(arrAllArrays){
				var objItem1 = arrAllArrays[0][0];
				var objItem2 = arrAllArrays[1][0];
				//
				assert.ok( arrAllArrays[0].length == 1, "arrAllArrays[0].length == 1: "+ arrAllArrays[0].length );
				assert.ok( arrAllArrays[1].length == 1, "arrAllArrays[1].length == 1: "+ arrAllArrays[1].length );
				//
				assert.ok( objItem1.Id == grpId, "objItem1.Id == grpId: '"+ objItem1.Id +"' = '"+ grpId +"'" );
				assert.ok( objItem2.Title == grpTitle, "objItem2.Title == grpTitle: '"+ objItem2.Title +"' = '"+ grpTitle +"'" );
				assert.ok( Object.keys(objItem2).length == 7, "Object.keys(objItem2).length == 7: "+ Object.keys(objItem2).length );
				assert.ok( objItem2.Users && Array.isArray(objItem2.Users), "objItem2.Users exists and is an array: "+ Array.isArray(objItem2.Users) );
				assert.ok( Object.keys(objItem2.Users[0]).length == 3, "Object.keys(objItem2.Users[0]).length == 3: "+ Object.keys(objItem2.Users[0]).toString() );
				assert.ok( getAsciiTableStr(arrAllArrays[0]), `RESULTS:\n${getAsciiTableStr(arrAllArrays[0])}` );
				assert.ok( getAsciiTableStr(arrAllArrays[1]), `RESULTS:\n${getAsciiTableStr(arrAllArrays[1])}` );
				//
				assert.ok( true, `\nEND TEST 2: ************************************************************\n`);
			})
			// TEST: Using filters: NEGATIVE TEST using bad user id and bad user title
			.then(function(){
				return Promise.all([
					sprLib.site(ARG_SITE).groups({ 'id':999111999 }),
					sprLib.site(ARG_SITE).groups({ 'title':'JUNK' })
				]);
			})
			.then(function(arrAllArrays){
				//
				assert.ok( arrAllArrays[0].length == 0, "arrAllArrays[0].length == 0: "+ arrAllArrays[0].length );
				assert.ok( arrAllArrays[1].length == 0, "arrAllArrays[1].length == 0: "+ arrAllArrays[1].length );
				//
				assert.ok( true, `\nEND TEST 3: ************************************************************\n`);
			})
			// TEST: Using filters: NEGATIVE TEST using invalid option name
			.then(function(){
				console.warn('WARNING: Negative test of `site().groups()` will produce console warnings below:')
				return sprLib.site(ARG_SITE).groups({ 'junkName':999111999 });
			})
			.then(function(arrGroups){
				//
				assert.ok( arrGroups.length > 1, "arrGroups.length > 1: "+ arrGroups.length );
				assert.ok( Object.keys(arrGroups[0]).length == 7, "Object.keys(arrGroups[0]).length == 7: "+ Object.keys(arrGroups[0]).length );
				assert.ok( arrGroups[0].Users && Array.isArray(arrGroups[0].Users), "arrGroups[0].Users exists and is an array: "+ Array.isArray(arrGroups[0].Users) );
				assert.ok( Object.keys(arrGroups[0].Users[0]).length == 3, "Object.keys(arrGroups[0].Users[0]).length == 3: "+ Object.keys(arrGroups[0].Users[0]).toString() );
				assert.ok( getAsciiTableStr(arrGroups), `RESULTS:\n${getAsciiTableStr(arrGroups)}` );
				//
				assert.ok( true, `\nEND TEST 4: ************************************************************\n`);
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});

	// DESC: roles()
	QUnit.test("sprLib.site().roles() - using both `()` and `(SITEURL1)`", function(assert){
		arrTestUrls.forEach((ARG_SITE,idx)=>{
			var done = assert.async();
			// TEST:
			sprLib.site(ARG_SITE).roles()
			.then(function(arrResults){
				var objItem = arrResults[0];
				//
				assert.ok( Object.keys(objItem).length == 5, "Object.keys(objItem).length == 5: "+ Object.keys(objItem).length );
				assert.ok( getAsciiTableStr(arrResults), `RESULTS:\n${getAsciiTableStr(arrResults)}` );
				//
				assert.ok( true, `\n************************************************************\n`);
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});

	// DESC: subsites()
	QUnit.test("sprLib.site().subsites() - using both `()` and `(SITEURL3)`", function(assert){
		[null,SITEURL3].forEach((ARG_SITE,idx)=>{
			var done = assert.async();
			// TEST:
			sprLib.site(ARG_SITE).subsites()
			.then(function(arrResults){
				var objItem = arrResults[0];
				//
				assert.ok( Object.keys(objItem).length == 8, "Object.keys(objItem).length == 8: "+ Object.keys(objItem).length );
				assert.ok( (objItem.Id),     "objItem.Id     exists: '"+ objItem.Id +"'");
				assert.ok( (objItem.UrlAbs), "objItem.UrlAbs exists: '"+ objItem.UrlAbs +"'");
				assert.ok( (objItem.UrlRel), "objItem.UrlRel exists: '"+ objItem.UrlRel +"'");
				assert.ok( getAsciiTableStr(objItem), `RESULTS:\n${getAsciiTableStr(objItem)}` );
				assert.ok( getAsciiTableStr(arrResults), `RESULTS:\n${getAsciiTableStr(arrResults)}` );
				//
				assert.ok( true, `\n************************************************************\n`);
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});

	// DESC: users()
	QUnit.test("sprLib.site().users() - using both `()` and `(SITEURL1)`", function(assert){
		arrTestUrls.forEach((ARG_SITE,idx)=>{
			var done = assert.async();
			var userId = 0;
			var userTitle = "";

			// TEST:
			sprLib.site(ARG_SITE).users()
			.then(function(arrResults){
				var objItem = arrResults[0];
				userId = objItem.Id;
				userTitle = objItem.Title;
				//
				assert.ok( Object.keys(objItem).length == 6, "Object.keys(objItem).length == 6: "+ Object.keys(objItem).length );
				assert.ok( objItem.Groups && Array.isArray(objItem.Groups), "objItem.Groups exists and is an array: "+ Array.isArray(objItem.Groups) );
				assert.ok( Object.keys(objItem.Groups[0]).length == 2, "Object.keys(objItem.Groups[0]).length == 2: "+ Object.keys(objItem.Groups[0]).toString() );
				assert.ok( getAsciiTableStr(arrResults), `RESULTS:\n${getAsciiTableStr(arrResults)}` );
				//
				assert.ok( true, '\nSITE: '+ARG_SITE+'\nEND TEST 1: ************************************************************\n');
			})
			// TEST: Using filters
			.then(function(){
				return Promise.all([
					sprLib.site(ARG_SITE).users({ 'id':userId }),
					sprLib.site(ARG_SITE).users({ 'title':userTitle })
				]);
			})
			.then(function(arrAllArrays){
				var objItem1 = arrAllArrays[0][0];
				var objItem2 = arrAllArrays[1][0];
				//
				assert.ok( true, '\nBEG TEST 2: ********************************************\nSITE: '+ARG_SITE+' / USER: '+userTitle+'\n');
				//
				assert.ok( arrAllArrays[0].length == 1, "arrAllArrays[0].length == 1: "+ arrAllArrays[0].length );
				assert.ok( arrAllArrays[1].length == 1, "arrAllArrays[1].length == 1: "+ arrAllArrays[1].length );
				//
				assert.ok( objItem1.Id == userId, "objItem1.Id == userId: '"+ objItem1.Id +"' = '"+ userId +"'" );
				assert.ok( objItem2.Title == userTitle, "objItem2.Title == userTitle: '"+ objItem2.Title +"' = '"+ userTitle +"'" );
				assert.ok( Object.keys(objItem2).length == 6, "Object.keys(objItem2).length == 6: "+ Object.keys(objItem2).length );
				assert.ok( objItem2.Groups && Array.isArray(objItem2.Groups), "objItem2.Groups exists and is an array: "+ Array.isArray(objItem2.Groups) );
				assert.ok( objItem2.Groups.length > 0, "objItem2.Groups.length > 0: "+ objItem2.Groups.length );
				assert.ok( objItem2.Groups[0], "objItem2.Groups[0] exists: "+ objItem2.Groups[0] );
				assert.ok( Object.keys(objItem2.Groups[0]).length == 2, "Object.keys(objItem2.Groups[0]).length == 2: "+ Object.keys(objItem2.Groups[0]).toString() );
				assert.ok( getAsciiTableStr(arrAllArrays[0]), `RESULTS:\n${getAsciiTableStr(arrAllArrays[0])}` );
				assert.ok( getAsciiTableStr(arrAllArrays[1]), `RESULTS:\n${getAsciiTableStr(arrAllArrays[1])}` );
				//
				assert.ok( true, '\nSITE: '+ARG_SITE+'\nEND TEST 2: ************************************************************\n');
			})
			// TEST: Using filters: NEGATIVE TEST using bad id/title
			.then(function(){
				return Promise.all([
					sprLib.site(ARG_SITE).users({ 'id':999111999 }),
					sprLib.site(ARG_SITE).users({ 'title':'JUNK' })
				]);
			})
			.then(function(arrAllArrays){
				assert.ok( true, '\nBEG TEST 3: ********************************************\nSITE: '+ARG_SITE+'\n');
				//
				assert.ok( arrAllArrays[0].length == 0, "arrAllArrays[0].length == 0: "+ arrAllArrays[0].length );
				assert.ok( arrAllArrays[1].length == 0, "arrAllArrays[1].length == 0: "+ arrAllArrays[1].length );
				//
				assert.ok( true, '\nSITE: '+ARG_SITE+'\nEND TEST 3: ************************************************************\n');
			})
			// TEST: Using filters: NEGATIVE TEST using invalid option name
			.then(function(){
				console.warn('WARNING: Negative test of `site().users()` will produce console warnings below:')
				return sprLib.site(ARG_SITE).users({ 'junkName':999111999 });
			})
			.then(function(arrUsers){
				//
				// NOTE: assert.ok( arrUsers.length > 1, "arrUsers.length > 1: "+ arrUsers.length );
				// NOTE: ^^^ we onyl have 1 user in test SP site!!! cant test this
				assert.ok( Object.keys(arrUsers[0]).length == 6, "Object.keys(arrUsers[0]).length == 6: "+ Object.keys(arrUsers[0]).length );
				assert.ok( arrUsers[0].Groups && Array.isArray(arrUsers[0].Groups), "arrUsers[0].Groups exists and is an array: "+ Array.isArray(arrUsers[0].Groups) );
				assert.ok( arrUsers[0].Groups.length > 0, "arrUsers[0].Groups.length > 0: "+ arrUsers[0].Groups.length );
				assert.ok( arrUsers[0].Groups[0], "arrUsers[0].Groups[0] exists: "+ arrUsers[0].Groups[0] );
				assert.ok( Object.keys(arrUsers[0].Groups[0]).length == 2, "Object.keys(arrUsers[0].Groups[0]).length == 2: "+ Object.keys(arrUsers[0].Groups[0]).toString() );
				assert.ok( getAsciiTableStr(arrUsers), `RESULTS:\n${getAsciiTableStr(arrUsers)}` );
				//
				assert.ok( true, `\nEND TEST 4: ************************************************************\n`);
				done();
			})

			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});

	// NEGATIVE: test URLs that should work and return current site
	QUnit.test("sprLib.site().info() - JUNK TESTS", function(assert){
		[null,'',undefined].forEach((junkUrl,idx)=>{
			var done = assert.async();
			// TEST:
			sprLib.site(junkUrl).info()
			.then(function(arrResults){
				assert.ok( getAsciiTableStr(arrResults), `RESULTS:\n${getAsciiTableStr(arrResults)}` );
				assert.ok( true, `\n************************************************************\n`);
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});

	// NEGATIVE: test BAD locations that should throw errors
	QUnit.test("sprLib.site().info() - JUNK TESTS", function(assert){
		['/junk/url','junk',999].forEach((junkUrl,idx)=>{
			var done = assert.async();
			// TEST:
			sprLib.site(junkUrl).info()
			.then(function(arrResults){
				assert.ok( getAsciiTableStr(arrResults), `RESULTS:\n${getAsciiTableStr(arrResults)}` );
				assert.ok( false, `\n************************************************************\n`);
				done();
			})
			.catch(function(err){
				assert.ok( true, err );
				done();
			});
		});
	});
});

// ================================================================================================

QUnit.module( "USER - Methods", function(){
	var gObjCurrUser = {};

	// TODO: FIXME: these tests wont run - we need QUnit.test - top level!
	sprLib.user().info()
	.then(function(objUser){ gObjCurrUser = objUser })
	.then(function(){
		[ {id:gObjCurrUser.Id}, {email:gObjCurrUser.Email}, {login:gObjCurrUser.LoginName}, {title:gObjCurrUser.Title} ]
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

			QUnit.test('sprLib.user('+ JSON.stringify(param) +').profile()', function(assert){
				var done = assert.async();
				// TEST:
				Promise.all([
					sprLib.user(param).profile(),
					sprLib.user(param).profile('Email')
				])
				.then(function(arrArrays){
					var prof1 = arrArrays[0];
					var prof2 = arrArrays[1];
					assert.ok( prof1.hasOwnProperty('Email'), "Pass: prof1.hasOwnProperty('Email'): " + prof1.hasOwnProperty('Email') );
					assert.ok( Object.keys(prof1).length > 0, "Pass: Object.keys(prof1).length > 0: "+ Object.keys(prof1).length );
					assert.ok( prof2.Email == gObjCurrUser.Email, "prof2.Email == gObjCurrUser.Email ? "+ `${prof2.Email} == ${gObjCurrUser.Email}` );
					assert.ok( getAsciiTableStr(prof1), `RESULTS:\n${getAsciiTableStr(prof1)}` );
					assert.ok( getAsciiTableStr(prof2), `RESULTS:\n${getAsciiTableStr(prof2)}` );
					done();
				});
			});
		});

		// TODO: separate test for `[ '', {} ]` as those will return current user

		[ {id:999}, {email:'junk@email.com'}, {login:'totally not a real login'}, {title:'totally not a real name'} ]
		.forEach(function(param,idx){
			QUnit.test('sprLib.user('+ JSON.stringify(param) +').info()', function(assert){
				var done = assert.async();
				// TEST:
				sprLib.user(param).info()
				.then(function(objUser){
					assert.ok( typeof objUser === 'object', "Pass: objUser is object type: " + typeof objUser );
					assert.ok( Object.keys(objUser).length == 0, "Pass: `keys(objUser).length == 0` -> " + Object.keys(objUser).length );
					done();
				});
			});

			QUnit.test('sprLib.user('+ JSON.stringify(param) +').groups()', function(assert){
				var done = assert.async();
				// TEST:
				sprLib.user(param).groups()
				.then(function(arrGroups){
					assert.ok( Array.isArray(arrGroups), "Pass: Array.isArray(arrGroups): " + Array.isArray(arrGroups) );
					assert.ok( arrGroups.length == 0, "Pass: `arrGroups.length == 0` -> "+ arrGroups.length );
					done();
				});
			});

			QUnit.test('sprLib.user('+ JSON.stringify(param) +').profile()', function(assert){
				var done = assert.async();
				// TEST:
				Promise.all([
					sprLib.user(param).profile(),
					sprLib.user(param).profile('Email')
				])
				.then(function(arrArrays){
					var prof1 = arrArrays[0];
					var prof2 = arrArrays[1];
					assert.ok( prof1 && Object.keys(prof1).length == 0, "Object.keys(prof1).length == 0: " + Object.keys(prof1).length );
					assert.ok( prof2 && Object.keys(prof2).length == 0, "Object.keys(prof2).length == 0: " + Object.keys(prof2).length );
					assert.ok( !prof1.Email , "prof1.Email doesnt exist: "+ prof1.Email );
					assert.ok( !prof2.Email , "prof2.Email doesnt exist: "+ prof2.Email );
					done();
				});
			});
		});
	});

	// NEGATIVE-TEST:
	var param = {'badName':'whatever'};
	QUnit.test('sprLib.user('+ JSON.stringify(param) +').info()', function(assert){
		var done = assert.async();
		// TEST:
		sprLib.user(param).info()
		.then(function(objUser){
			assert.ok( typeof objUser === 'object', "Pass: objUser is object type: " + typeof objUser );
			assert.ok( Object.keys(objUser).length == 6, "Pass: `keys(objUser).length == 6` -> " + Object.keys(objUser).length );
			assert.ok( getAsciiTableStr([objUser]), `RESULTS:\n${getAsciiTableStr([objUser])}` );
			done();
		})
		.catch(strErr => {
			console.log( strErr );
		});
	});
});

//
// MISC:
//

QUnit.module( "QA -- REST API test urlPath", function(){
	// NOTE: Parameterized QUnit Tests (!)
	var arrObjTests = [
		{ testDesc:"url:relative", urlPath:  "_api/lists/getbytitle('Site Assets')/items" },
		{ testDesc:"url:absolute", urlPath: "/_api/lists/getbytitle('Site Assets')/items" },
		{ testDesc:"url:relative", urlPath:  "_api/lists/getbytitle('Site Assets')/items?$select=ID" },
		{ testDesc:"url:absolute", urlPath: "/_api/lists/getbytitle('Site Assets')/items?$select=ID" },
		{ testDesc:"url:RESTROOT", urlPath: RESTROOT+"/_api/lists/getbytitle('Site Assets')/items?$select=ID" },
		{ testDesc:"url:BASEURL+RESTROOT", urlPath: BASEURL+"/_api/lists/getbytitle('Site Assets')/items?$select=ID" },
		{
			testDesc: "query: queryCols",
			urlPath:  "_api/lists/getbytitle('Site Assets')/items",
			qryCols:  "ID",
			arrTests: [
				function(arrResults){ return arrResults.length > 0 },
				function(arrResults){ return Object.keys(arrResults[0]).length == 1 },
				function(arrResults){ return arrResults[0].ID }
			]
		},
		{
			testDesc: "query: queryCols + queryFilter",
			urlPath: "_api/lists/getbytitle('Site Assets')/items",
			qryCols: ['ID'],
			qryFilter: "ID eq 10",
			arrTests: [
				function(arrResults){ return arrResults.length > 0 },
				function(arrResults){ return Object.keys(arrResults[0]).length == 1 },
				function(arrResults){ return arrResults[0].ID == 10 }
			]
		},
		{
			testDesc: "query: queryFilter + qryLimit",
			urlPath: "_api/lists/getbytitle('Site Assets')/items",
			qryFilter: "ID gt 10",
			qryLimit: "5",
			arrTests: [
				function(arrResults){ return arrResults.length == 5 },
				function(arrResults){ return arrResults[0].ID > 10 }
			]
		},
		{
			testDesc: "query: queryFilter",
			urlPath: "_api/lists/getbytitle('Site Assets')/items",
			qryFilter: "ID eq 10",
			arrTests: [
				function(arrResults){ return arrResults.length > 0 },
				function(arrResults){ return arrResults[0].ID == 10 }
			]
		},
		{
			testDesc: "query: mixed $select and queryFilter",
			urlPath: "_api/lists/getbytitle('Site Assets')/items?$select=ID",
			qryFilter: "ID eq 10",
			arrTests: [
				function(arrResults){ return arrResults.length > 0 },
				function(arrResults){ return arrResults[0].ID == 10 }
			]
		}

		/*
		{
			testDesc : ""
			urlPath  : RESTROOT+"/_api/lists/getbytitle('Site Assets')/items",
			urlSelect: "",
			qryCols  : null,
			qryFilter: "",
			qryLimit : ""
		}
		*/
	];

	QUnit.test("sprLib.rest() -> Battery of Parsing Tests (Total: "+arrObjTests.length+")", function(assert){
		arrObjTests.forEach((objTest,idx)=>{
			// A:
			var done = assert.async();

			// B: Set query object
			var objRest = {};
			if ( objTest.urlPath   ) objRest.url =  objTest.urlPath;
			if ( objTest.urlSelect ) objRest.url += objTest.urlSelect;
			if ( objTest.qryCols   ) objRest.queryCols   = objTest.qryCols;
			if ( objTest.qryFilter ) objRest.queryFilter = objTest.qryFilter;
			if ( objTest.qryLimit  ) objRest.queryLimit  = objTest.qryLimit;
			if ( !objTest.arrTests ) objTest.arrTests = [function(arrResults){ return arrResults.length > 0 }];

			// C: Execute test
			sprLib.rest(objRest)
			.then(function(arrResults){
				objTest.arrTests.forEach((funcTest,idy) => assert.ok( funcTest(arrResults), (objTest.testDesc || "TEST "+idx)+" #"+idy+":\n"+funcTest.toString() ));
				assert.ok(true, `RESULTS:\n${getAsciiTableStr(arrResults)}\n************************************************************\n`);
				done();
			})
			.catch(function(err){
				assert.ok( (false), err );
				done();
			});
		});
	});
});

QUnit.module( "QA -- Result Parsing", function(){
	QUnit.test("sprLib.rest() ex: 'Parsing Lookups: Lookup with 2 sub items (ex: 'Member.ID' and 'Member.Title') - plain cols", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			url: '_api/web/roleAssignments',
			queryCols: ['PrincipalId','Member/PrincipalType','Member/Title','RoleDefinitionBindings/Name','RoleDefinitionBindings/Hidden']
		})
		.then(function(arrayResults){
			var objRow = arrayResults[0];
			assert.ok( Object.keys(objRow).length == 3, "objRow has length == 3: "+ Object.keys(objRow).length );
			assert.ok( (objRow.Member.PrincipalType && objRow.Member.Title), "objRow.Member.PrincipalType/Title both exist: "+ objRow.Member.PrincipalType+' / '+objRow.Member.Title );
			assert.ok( (typeof objRow.Member === 'object' && !Array.isArray(objRow.Member)), "objRow.Member is object (and !array): "+ typeof objRow.Member === 'object' );
			assert.ok( (Array.isArray(objRow.RoleDefinitionBindings)), "objRow.RoleDef is an array: "+ Array.isArray(objRow.RoleDefinitionBindings) );
			assert.ok( (objRow.RoleDefinitionBindings[0].Name && objRow.RoleDefinitionBindings[0].Hidden !== 'undefined'), "objRow.RoleDef[0].Name/Hidden both exist: "+ objRow.RoleDefinitionBindings[0].Name+' / '+objRow.RoleDefinitionBindings[0].Hidden );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}` );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	QUnit.test("sprLib.rest() ex: 'Parsing Lookups: Lookup with 2 sub items (ex: 'Member.ID' and 'Member.Title') - col objects", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			url: '_api/web/roleAssignments',
			queryCols: {
				PrincipalId:	{ dataName:'PrincipalId' },
				PrincipalType:	{ dataName:'Member/PrincipalType' },
				Title:			{ dataName:'Member/Title' },
				RoleNames:		{ dataName:'RoleDefinitionBindings/Name' }
			}
		})
		.then(function(arrayResults){
			var objRow = arrayResults[0];
			assert.ok( Object.keys(objRow).length == 4, "objRow has length == 4: "+ Object.keys(objRow).length );
			assert.ok( (objRow.PrincipalId && objRow.PrincipalType && objRow.Title && objRow.RoleNames), "All cols exist: "+ Object.keys(arrayResults[0]).toString() );
			assert.ok( (typeof objRow.PrincipalType === 'number'), "typeof objRow.PrincipalType === 'number': "+ typeof objRow.PrincipalType );
			assert.ok( (Array.isArray(objRow.RoleNames)), "Array.isArray(objRow.RoleNames): "+ Array.isArray(objRow.RoleNames) );
			assert.ok( (objRow.RoleNames[0].Name), "objRow.RoleNames[0].Name exists: "+ objRow.RoleNames[0].Name );
			assert.ok( getAsciiTableStr(arrayResults), `RESULTS:\n${getAsciiTableStr(arrayResults)}` );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
});

QUnit.module( "MISC -- Library Options", function(){
	QUnit.test(`sprLib.options({ baseUrl:'${RESTROOT}' })`, function(assert){
		// A: Set
		sprLib.options({ baseUrl:RESTROOT });
		// B: Get
		var objOpts = sprLib.options();
		var strBaseUrl = objOpts.baseUrl;
		// C: Test
		assert.ok( strBaseUrl == RESTROOT, "Pass: `sprLib.options().baseUrl == RESTROOT` Str: " + strBaseUrl );
		assert.ok( getAsciiTableStr([objOpts]), `RESULTS:\n${getAsciiTableStr([objOpts])}` );
	});

	// DEPRECATED (w/b removed in 2.0)
	QUnit.test(`sprLib.baseUrl('${RESTROOT}') **DEPRECATED**`, function(assert){
		// TEST:
		// A: Set
		sprLib.baseUrl(RESTROOT);
		// B: Get
		var strBaseUrl = sprLib.baseUrl();
		// C: Test
		assert.ok( strBaseUrl == RESTROOT, "Pass: `strBaseUrl == RESTROOT` Str: " + strBaseUrl );
	});
});

QUnit.module( "MISC -- requestDigest Tests", function(){
	var _digest = "";
	var _testId = "";

	QUnit.test("requestDigest Test 1: Test `requestDigest`", function(assert){
		// A:
		var done = assert.async();

		// B: Test
		Promise.all([
			sprLib.rest({ url:'_api/contextinfo', type:'POST' }),
			sprLib.list('Employees').items({ listCols:'Id', queryLimit:'1' })
		])
		.then(function(arrAllArrays){
			_digest = arrAllArrays[0][0].GetContextWebInformation.FormDigestValue;
			_testId = arrAllArrays[1][0].Id;

			assert.ok( _digest, "(old) $('#__REQUESTDIGEST').val():\n"+ $('#__REQUESTDIGEST').val() );
			assert.ok( _digest, "(new) _api/contextinfo.FormDigestValue:\n"+ _digest );

			sprLib.list({ name:'Employees', requestDigest:_digest }).update({ ID:_testId, Title:'FDV Test' })
			.then(function(objData){
				assert.ok( objData.Id && objData.Title, "objData.Id && objData.Title: "+ objData.Id +'/'+ objData.Title );
				assert.ok(true, `RESULTS:\n${getAsciiTableStr(objData)}\n************************************************************\n`);
				done();
			});
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
});

// TODO: Add Utility methods

/*
	TODO: 20180218: create `qunit-ui-tests.js` start with below
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
