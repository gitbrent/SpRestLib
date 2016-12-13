/*
 * NAME: qunit-test.js
 * DESC: tests for qunit-test.html (coded to the gitbrent O365 Dev Site)
 * AUTH: https://github.com/gitbrent/
 * DATE: 2016-12-10
 *
 // REALITY-CHECK:
 //QUnit.test("QUnit Base Test", function(assert){ assert.ok( true === true, "Passed!" ); });
 */
var gNewEmpItem = -1;

// ================================================================================================
QUnit.module( "Users and Groups" );
// ================================================================================================

QUnit.test("getCurrentUser", function(assert){
	var done = assert.async();
	sprLib.getCurrentUser({
		onDone: function(objUser){
			assert.equal( objUser.Id		,9 													,"Pass: Id - " + objUser.Id );
			assert.equal( objUser.Email		,"admin@gitbrent.onmicrosoft.com"					,"Pass: Email - " + objUser.Email );
			assert.equal( objUser.LoginName	,"i:0#.f|membership|admin@gitbrent.onmicrosoft.com"	,"Pass: LoginName - " + objUser.LoginName );
			assert.equal( objUser.Title		,"Brent Ely"										,"Pass: Title - " + objUser.Title );
			done();
		}
	});
});

QUnit.test("getCurrentUserGroups", function(assert){
	var done = assert.async();
	sprLib.getCurrentUserGroups({
		onDone: function(arrayGroups){
			assert.ok( $.isArray(arrayGroups), "onDone result is an array" );
			assert.ok( arrayGroups.length > 0, "arrayGroups.length > 0" );
			assert.ok( (arrayGroups[0].Id && arrayGroups[0].Title ), "arrayGroups[0] is valid -> Id: "+arrayGroups[0].Id+" / Title: "+arrayGroups[0].Title );
			var arrGroups = [];
			$.each(arrayGroups, function(idx,group){ arrGroups.push(group.Title) });
			assert.equal( arrGroups.toString(), "Dev Site Owners", "UsersGroups = 'Dev Site Owners'" );
			done();
		}
	});
});

// ================================================================================================
QUnit.module( "sprLib.restCall" );
// ================================================================================================

QUnit.test("sprLib.restCall - /_api/web/sitegroups", function(assert){
	var done = assert.async();
	sprLib.restCall({
		restUrl: '/sites/dev/_api/web/sitegroups',
		queryCols: {
			title: { dataName:'Title' },
			loginName: { dataName:'LoginName' },
			editAllowed: { dataName:'AllowMembersEditMembership' }
		},
		queryFilter: "AllowMembersEditMembership eq true",
		queryOrderby: "Title",
		queryMaxItems: 10,
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			done();
		}
	});
});

QUnit.test("sprLib.restCall - /_api/web/lists", function(assert){
	var done = assert.async();
	sprLib.restCall({
		restUrl: '/sites/dev/_api/web/lists/',
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			assert.ok( (arrayResults[0].Id && arrayResults[0].Title), "arrayResults[0] is valid - Id: "+arrayResults[0].Id+" / Title: "+arrayResults[0].Title );
			done();
		}
	});
});

// ================================================================================================
QUnit.module( "sprLib.getListItems" );
// ================================================================================================

QUnit.test("sprLib.getListItems() - onExec", function(assert){
	var done = assert.async();
	sprLib.getListItems({
		listName: 'Employees',
		listCols: { id:{dataName:'ID'} },
		queryMaxItems: 1,
		onExec: function(){ assert.ok( true, "onExec fired!" ); done(); }
	});
});

QUnit.test("sprLib.getListItems() - onDone", function(assert){
	var done = assert.async();
	sprLib.getListItems({
		listName: 'Employees',
		listCols: { id:{dataName:'ID'} },
		queryMaxItems: 1,
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
		queryMaxItems: 10,
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			assert.ok( (arrayResults[0].__metadata && typeof arrayResults[0].__metadata !== 'undefined'), "arrayResults[0] is valid -> __metadata: "+ arrayResults[0].__metadata );
			assert.ok( (arrayResults[0].id         && typeof arrayResults[0].name       !== 'undefined'), "arrayResults[0] is valid -> Id: "+arrayResults[0].id+" / Title: "+arrayResults[0].name );
			// TODO: Move to the (as yet undone) MODEL TEST section
			/*
			QUnit.test("sprLib.model('Emp').data() method", function(assert){
				assert.ok( $.isArray(sprLib.model('Employees').data()), "sprLib.model().add().data() is an array" );
				assert.ok( $.isArray(sprLib.model('Employees').data('array')), "sprLib.model().add().data('array') is an array" );
				assert.ok( (typeof sprLib.model('Employees').data('object') === 'object'), "sprLib.model().add().data('object') is an object" );
			});
			*/
			done();
		}
	});
});

QUnit.test("sprLib.getListItems() - w/o listCols", function(assert){
	var done = assert.async();
	sprLib.getListItems({
		listName: 'Employees',
		queryMaxItems: 10,
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
		queryMaxItems: 10,
		onDone: function(arrayResults){
			assert.ok( $.isArray(arrayResults), "onDone result is an array" );
			assert.ok( arrayResults.length > 0, "arrayResults.length > 0" );
			assert.ok( ( arrayResults[0].badgeNum ), "arrayResults[0] is valid - badgeNum: " + arrayResults[0].badgeNum );
			assert.ok( ( arrayResults[0].funcTest ), "arrayResults[0] is valid - funcTest: " + arrayResults[0].funcTest );
			done();
		}
	});
});

// ================================================================================================
QUnit.module( "CRUD Operations" );
// ================================================================================================
// insertItem
QUnit.test("sprLib.insertItem", function(assert){
	var done = assert.async();
	sprLib.insertItem({
		listName: 'Employees',
		jsonData: {
			__metadata: { type:"SP.Data.EmployeesListItem" },
			Name: 'Mr. SP REST Library',
			Badge_x0020_Number: 123,
			Hire_x0020_Date: new Date(),
			Salary: 12345.49,
			Utilization_x0020_Pct: 1.0,
			Extension: 1234,
			Comments: 'New employee created',
			Active_x003f_: true
		},
		onDone: function(newObj){
			assert.ok( (typeof newObj === 'object'), "Insert success: onDone result is an object" );
			assert.ok( (newObj.Id), "onDone result valid - Id:" + newObj.Id );
			gNewEmpItem = newObj.Id;
			done();
		},
		onFail: function(errMsg){ console.error('ERROR: '+errMsg); }
	});
});

// updateItem
/*
QUnit.test("sprLib.updateItem", function(assert){
	var done = assert.async();
});
*/

// deleteItem
QUnit.test("sprLib.deleteItem", function(assert){
	var done = assert.async();
	sprLib.deleteItem({
		listName: 'Employees',
		jsonData: {
			__metadata: { type:"SP.Data.EmployeesListItem", etag:"\"1\"" },
			Id: gNewEmpItem
		},
		onDone: function(){
			assert.ok( "Delete success!" );
			done();
		},
		onFail: function(errMsg){ console.error('ERROR: '+errMsg); done(); }
	});
});

// ================================================================================================
QUnit.module( "Binding / Forms" );
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
