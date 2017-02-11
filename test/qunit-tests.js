/*
 * NAME: qunit-test.js
 * DESC: tests for qunit-test.html (coded to the gitbrent O365 Dev Site)
 * AUTH: https://github.com/gitbrent/
 * DATE: 2016-12-27
 *
 // REALITY-CHECK:
 //QUnit.test("QUnit Base Test", function(assert){ assert.ok( true === true, "Passed!" ); });
 */
var RESTROOT = '/sites/dev';
var gNewEmpItem = -1;
var gTestUserId = 9;
var gUpdateItem = { Id:55 };

// ================================================================================================
QUnit.module( "LIST > MISC Methods" );
// ================================================================================================
{
	['Departments', 'Employees', '8fda2798-dbbc-497d-9840-df87b08e09c1'].forEach(function(list,idx){
		QUnit.test(`sprLib.list().cols() - using '${list}'`, function(assert){
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

		QUnit.test(`sprLib.list().info() - using '${list}'`, function(assert){
			var done = assert.async();
			// TEST:
			sprLib.list(list).info()
			.then(function(objInfo){
				assert.ok( objInfo.Id		, "Pass: Id....... = " + objInfo.Id );
				assert.ok( objInfo.Created	, "Pass: Created.. = " + objInfo.Created );
				assert.ok( objInfo.ItemCount, "Pass: ItemCount = " + objInfo.ItemCount );
				assert.ok( objInfo.Title	, "Pass: Title.... = " + objInfo.Title );
				done();
			});
		});
	});
}

// ================================================================================================
QUnit.module( "LIST > ITEM CRUD Methods" );
// ================================================================================================
{
	QUnit.test("sprLib.list().create()", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees').create({
			__metadata: { type:"SP.Data.EmployeesListItem" },
			Name: 'Mr. SP REST Library',
			Badge_x0020_Number: 123,
			Hire_x0020_Date: new Date(),
			Salary: 12345.49,
			Utilization_x0020_Pct: 1.0,
			Extension: 1234,
			Comments: 'New employee created',
			Active_x003f_: true
		})
		.then(function(newObj){
			assert.ok( (newObj.Id), "Created! Id: " + newObj.Id );
			gNewEmpItem = newObj.Id;
			done();
		});
	});

	QUnit.test("sprLib.list().update() 1: with current etag   ", function(assert){
		var done = assert.async();

		// PREP:
		sprLib.list('Employees')
		.getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){ gUpdateItem = data[0]; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.update({
				__metadata: { type:"SP.Data.EmployeesListItem", etag:gUpdateItem.__metadata.etag },
				Id:         gUpdateItem.Id,
				Name:       'updated by sprLib.list().update() with etag'
			})
			.then(function(objItem){
				assert.ok( (objItem.Name), "Updated! Name: '" + objItem.Name + "'");
				done();
			});
		});
	});
	QUnit.test("sprLib.list().update() 2: with etag [null]    ", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.update({
			__metadata: { type:"SP.Data.EmployeesListItem", etag:null },
			id:         gUpdateItem.Id,
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
	QUnit.test("sprLib.list().update() 3: no etag (aka: force)", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.update({
			__metadata: { type:"SP.Data.EmployeesListItem" },
			id:         gUpdateItem.Id,
			Name:       'updated by sprLib.list().update() w/o etag'
		})
		.then(function(objItem){
			assert.ok( (objItem.Name), "Updated! Name: '" + objItem.Name + "'");
			done();
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
				assert.ok( (true), "Deleted!" );
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
				assert.ok( (true), "Deleted!" );
				done();
			});
		});
	});
	QUnit.test("sprLib.list().delete() 3: no etag (aka: force)", function(assert){
		var done = assert.async();
		// PREP:
		var numId = "'-1'";
		sprLib.list('Employees').getItems({ listCols:'Id', queryOrderby:'Modified', queryLimit:1 })
		.then(function(data){ numId = data[0].Id; })
		.then(function(){
			// TEST:
			sprLib.list('Employees')
			.delete({ id:numId })
			.then(function(){
				assert.ok( (true), "Deleted!" );
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
		var item = { Name:'Marty McFly', Hire_x0020_Date:new Date() };
		Promise.resolve()
		.then(function()    { return sprLib.list('Employees').create(item); })
		.then(function(item){ return sprLib.list('Employees').update(item); })
		.then(function(item){ return sprLib.list('Employees').delete(item); })
		.then(function(item){
			assert.ok( (true), "Success! An item navigated the entire CRUD chain!" );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
}

// ================================================================================================
QUnit.module( "LIST > ITEM GET Methods" );
// ================================================================================================
{
	QUnit.test("sprLib.getListItems() 1: no opts", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems()
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0, "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].__metadata), "arrayResults[0].__metadata exists: \n"+ JSON.stringify(arrayResults[0].__metadata) );
			//
			let table = new AsciiTable().setHeading(Object.keys(arrayResults[0]));
			$.each(arrayResults,function(idx,obj){ let vals = []; $.each(obj, function(key,val){ vals.push(val) }); table.addRow(vals); });
			assert.ok( table.toString(), `RESULTS:\n${table.toString()}`);
			//
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});

	QUnit.test("sprLib.getListItems() 2: w listCols", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.list('Employees')
		.getItems({
			listCols: { title:{dataName:'Title'}, badgeNum:{dataName:'Badge_x0020_Number'} }
		})
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0, "arrayResults is an Array and length > 0: "+ arrayResults.length );
			assert.ok( (arrayResults[0].__metadata), "arrayResults[0].__metadata exists: \n"+ JSON.stringify(arrayResults[0].__metadata) );
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
}

// ================================================================================================
QUnit.module( "REST Methods" );
// ================================================================================================
{
	// REST endpoints that return `data.d.results` [{}]
	QUnit.test("sprLib.rest() ex: '/_api/web/sitegroups'", function(assert){
		var done = assert.async();
		// TEST:
		sprLib.rest({
			restUrl: RESTROOT+'/_api/web/sitegroups',
			queryCols: {
				title: { dataName:'Title' },
				loginName: { dataName:'LoginName' },
				editAllowed: { dataName:'AllowMembersEditMembership' }
			}
			//,queryFilter:   "AllowMembersEditMembership eq 1"
			//,queryOrderby:  "Title"
			//,queryLimit: 10
		})
		.then(function(arrayResults){
			assert.ok( arrayResults.length > 0, "arrayResults is an Array and length > 0: "+ arrayResults.length );
			//
			let table = new AsciiTable();
			if (arrayResults.length > 0) table.setHeading( Object.keys(arrayResults[0]) );
			$.each(arrayResults,function(idx,obj){ let vals = []; $.each(obj, function(key,val){ vals.push(val) }); table.addRow(vals); });
			assert.ok( table.toString(), `RESULTS:\n${table.toString()}`);
			//
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
		sprLib.rest({ restUrl:RESTROOT+'/_api/web/lists/' })
		.then(function(arrayListObjs){
			var table = new AsciiTable('Site Lists').setHeading(Object.keys(arrayListObjs[0]));
			$.each(arrayListObjs,function(idx,obj){ let vals = []; $.each(obj, function(key,val){ vals.push(val) }); table.addRow(vals); });
			//
			assert.ok( arrayListObjs.length > 0, "arrayListObjs is an Array and length > 0: "+ arrayListObjs.length );
			assert.ok( table.toString(), `table.toString():\n ${table.toString()}`);
			done();
		})
		.catch(function(err){
			assert.ok( (false), err );
			done();
		});
	});
}

// ================================================================================================
QUnit.module( "USER Methods" );
// ================================================================================================
{
	[gTestUserId,''].forEach(function(userId,idx){
		QUnit.test(`sprLib.user(${userId}).info()`, function(assert){
			var done = assert.async();
			// TEST:
			sprLib.user(userId).info()
			.then(function(objUser){
				assert.ok( objUser.Id		,"Pass: Id....... - " + objUser.Id );
				assert.ok( objUser.Title	,"Pass: Title.... - " + objUser.Title );
				assert.ok( objUser.Email	,"Pass: Email.... - " + objUser.Email );
				assert.ok( objUser.LoginName,"Pass: LoginName - " + objUser.LoginName );
				done();
			});
		});

		QUnit.test(`sprLib.user(${userId}).groups()`, function(assert){
			var done = assert.async();
			// TEST:
			sprLib.user(userId).groups()
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
}



// NEGATIVE TSET:
/*
sprLib.rest({ restUrl:'../_api/web/GetByTitle' });
*/


/*
QUnit.test("sprLib.getListItems() - onDone", function(assert){
	var done = assert.async();
	sprLib.getListItems({
		listName: 'Employees',
		listCols: { id:{dataName:'ID'} },
		queryLimit: 1,
		onDone: function(){ assert.ok( true, "onDone fired!" ); done(); }
	});
});

QUnit.test("sprLib.getListItems() - with listCols", function(assert){
	var done = assert.async();
	sprLib.getListItems({
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

QUnit.test("sprLib.getListItems() - w/o listCols", function(assert){
	var done = assert.async();
	sprLib.getListItems({
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

QUnit.test("sprLib.getListItems() - dataFunc listCols", function(assert){
	var done = assert.async();
	sprLib.getListItems({
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
