var test = require('tape'),
	agave = require('agave');

agave.enable();

var config = require('../config'),
	constants = require('../constants'),
	TEST_USER = config.fieldbook.user,
	TEST_PASSWORD = config.fieldbook.password,
	TEST_BOOK = config.fieldbook.book,
	SHEET_1_ID = 'sheet1',
	FIXED_SHEET_ID = 'fixed',
	FIXED_SHEET_RECORD_ID = 1,
	FIXED_SHEET_RECORD = {
		id: 1,
		field_0: null,
		field1: 1,
		date: '2015-02-10',
		field_3: 'Test string'
	};	

var FIELDBOOK_PATH = '../index.js';

function buildConfig(user, password, book){
	return {
		user: user,
		password: password,
		book: book
	};
}

test('Set up: Forgotten User', function(t){
	var config = buildConfig(undefined,TEST_PASSWORD,TEST_BOOK);
	t.throws(function(){
		fieldbook = require(FIELDBOOK_PATH)(config);	
	},constants.errors.NO_CONFIG_USER,'Should have thrown error for missing user');
	t.end();
});


test('Set up: Missing Password', function(t){
	var config = buildConfig(TEST_USER,undefined,TEST_BOOK);
	t.throws(function(){
		fieldbook = require(FIELDBOOK_PATH)(config);	
	},constants.errors.NO_CONFIG_PASSWORD,'Should have thrown error for missing password');
	t.end();
});

test('Set up: Forgotten Book', function(t){
	var config = buildConfig(TEST_USER,TEST_PASSWORD,undefined);
	t.throws(function(){
		fieldbook = require(FIELDBOOK_PATH)(config);	
	},constants.errors.NO_CONFIG_BOOK,'Should have thrown error for missing book');
	t.end();
});

function setUpFieldBook() {
	var config = buildConfig(TEST_USER,TEST_PASSWORD,TEST_BOOK);
	return require(FIELDBOOK_PATH)(config);	
}


test('getSheets: List All Sheets',function(t){
	var FieldBook = setUpFieldBook();
	FieldBook.getSheets().then(function(sheets){
		t.end();
	});	
});

test('getSheet: Fixed Sheet', function(t){
	var FieldBook = setUpFieldBook();
	FieldBook.getSheet(FIXED_SHEET_ID).then(function(sheet){
		t.ok(sheet.length > 0, 'Sheet should not be empty');
		t.equals(sheet.length, 1, 'Sheet should only have one row');
		t.deepEquals(sheet[0], FIXED_SHEET_RECORD, 'Sheet should have fixed row values');
		t.end();	
	});
});

test('getSheet: Nonexistant Sheet', function(t){
	var FieldBook = setUpFieldBook();
	FieldBook.getSheet('sdajfksjd').then(function(sheet){
		t.fail('Error callback should not be thrown');
	}, function(err){
		t.ok(err, 'Bad request should give back error object');
		t.ok(err.status >= 400 && err.status < 500, 'Bad request should have HTTP status code 4**');
		t.end();
	});
});

test('getRecord: Fixed Record', function(t){
	var FieldBook = setUpFieldBook();
	FieldBook.getRecord(FIXED_SHEET_ID, FIXED_SHEET_RECORD_ID).then(function(record){
		t.ok(record, 'Record should exist');
		t.deepEquals(record, FIXED_SHEET_RECORD, 'Record should have fixed record values');
		t.end();
	});
});

test('getRecord: Bad Record', function(t){
	var FieldBook = setUpFieldBook();
	FieldBook.getRecord(FIXED_SHEET_ID, 2).then(function(record){
		t.fail('Bad request should result in error path');
	},function(err) {
		t.ok(err.status >= 400 && err.status < 500, 'Bad request should have HTTP status code 4**');
		t.end();
	});
});

test('Manipulate Record: Add, Update, Delete Record', function(t){

	var record = {
		number: 1,
		text: 'string',
		date: '2015-04-04'
	};

	var updatedRecord = {
		number: 2,
		text: 'new string'
	};

	var FieldBook = setUpFieldBook();
	FieldBook.addRecord(SHEET_1_ID,record).then(function(rec){
		return FieldBook.getRecord(SHEET_1_ID,rec.id);
	}).then(function(rec){
		t.ok(rec.number, 'Number field should exist');
		t.ok(rec.text, 'Text field should exist');
		t.ok(rec.date, 'Date field should exist');
		t.equals(record.number,rec.number, 'Numbers should be equal');
		t.equals(record.text,rec.text, 'Texts should be equal');
		t.equals(record.date, rec.date, 'Dates should be equal');
		return FieldBook.updateRecord(SHEET_1_ID, rec.id, updatedRecord);
	}).then(function(rec){
		t.ok(rec.number, 'Number field should exist');
		t.ok(rec.text, 'Text field should exist');
		t.ok(rec.date, 'Date field should exist');
		t.equals(updatedRecord.number, rec.number, 'Numbers should be equal');
		t.equals(updatedRecord.text, rec.text, 'Texts should be equal');
		t.equals(record.date,rec.date, 'Dates should be equal');
		return FieldBook.deleteRecord(SHEET_1_ID, rec.id);
	}).then(function(res){
		t.equals(Object.keys(res).length, 0, 'Delete response should be empty');
		return FieldBook.getSheet(SHEET_1_ID);
	}).then(function(sheet){
		t.equals(sheet.length, 0, "Sheet should be empty");
		cleanUpSheet(SHEET_1_ID);
		t.end();
	}).catch(function(err){
		t.fail('Error in process :' + (err.text? err.text: err));
		t.end();
	});
}); 

function cleanUpSheet(sheetId) {
	var FieldBook = setUpFieldBook();
	FieldBook.getSheet(sheetId).then(function(sheet){
		var rowIds = sheet.map(function(row){
			return row.id;
		});
		
		rowIds.reduce(function(seq,rowId){
			return seq.then(function(){
				return FieldBook.deleteRecord(rowId);
			}).catch(function(err){
				console.error('Error: ' + err);
			});
		}, Promise.resolve())
	});
}


