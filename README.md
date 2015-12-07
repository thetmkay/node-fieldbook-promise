An unofficial npm module to use the [Fieldbook](https://fieldbook.com) API using native javascript promises.

### Useful links

1. [Jake Archibald's guide to native JS promises](http://www.html5rocks.com/en/tutorials/es6/promises/)
2. [Fieldbook API Reference (BETA)](https://github.com/fieldbook/api-docs)
3. [node-fieldbook - unofficial JS library using callbacks](https://github.com/connormckelvey/node-fieldbook/) 

### Installation

````
npm install fieldbook-promise
````

### Documentation

The module exports an object with the following objects. They all return native JS promises.

#### *module*

The module exports a function, which given a valid configuration for a Fieldbook book, will return a book object with methods to read and write to the book.

The configuration parameter is an object which must have the following three properties (otherwise an `Error` will be thrown:

- `book` (*string*): the id of the book (it is the last part of the "API URL")
- `user` (*string*): the username field (e.g. `key-1`)
- `password` (*string*): the API key password

All the information can be found by navigating to your book's page, pressing the downward arrow/triangle next to the name of the book, and clicking "Manage API" (see picture).

**Example**:

````javascript
var Fieldbook = require('fieldbook-promise');
var book = Fieldbook({
	book: '{bookid}',
	user: '{username}',
	password: '{password}'
});
````

The returned book object (note just a regular object, not a `class` *TODO*) exposes the following methods:

**Note**: The methods all return promises and correspond directly with the [Fieldbook REST API](https://github.com/fieldbook/api-docs/blob/master/reference.md) which is currently at v1.

##### getSheets()

- returns `Promise`
- fulfilled with: `array`

Fulfills with the array of sheets associated with the book. 

##### getSheet(sheetId)

- returns `Promise`
- fulfilled with: `array`

Fulfills with the array of records (*object*) for the sheet. Sheet IDs are lowercase, stripped of original punctuation, spaces replaced by underscores. [More detail in Fieldbook's API Docs](https://github.com/fieldbook/api-docs/blob/master/reference.md#sheet-titles--field-names).

##### getRecord(sheetId, recordId)

- returns `Promise`
- fulfilled with: `object`

Fulfills with the retrieved `record` object from the given sheet. Properties of the object correspond with the column headers (**NOTE**: the initial column is given the default name `{sheet_name}_name_or_identifier`).


##### addRecord(sheetId)

- returns `Promise`
- fulfilled with: `object`

Fulfills with the added `record` object.

##### updateRecord(sheetId, recordId, data)

- returns `Promise`
- fulfilled with: `object`

Fulfills with the updated `record` object after patching it with `data`. 

##### deleteRecord(sheetId, recordId)

- returns `Promise`
- fulfilled with: `object`

Fulfills with an empty object.

#### Errors

Errors are forwarded from Fieldbook's REST API. Additional errors (such as for invalid or missing configuration object) have messages defined in `constants.js` in the project root directory, under the `errors` property.

See the [Fieldbook documentation](https://github.com/fieldbook/api-docs/blob/master/reference.md) for further discussion on HTTP errors.

### Testing

Testing uses the [tape](https://github.com/substack/tape) testing framework, and exist in the `tests` directory. 

It currently uses a test book whose API keys are stored in `config.js` in the root project folder, which is not included as part of the repo.

#### Set-Up

1. Create a new book using [Fieldbook](https://fieldbook.com)
2. Store the `book`, `user` and `password` in config
3. Create a new sheet called `Fixed`
4. Create a new sheet called `Sheet 1`
5. Put the following columns/record:

**Fixed**

Columns:
- `Fixed name or identifier`
- `Field1` (number)
- `Date` (date)
- `Field 3` (text)

Records:

1 row
- `Fixed name or identifier`:`Fixed 1` (should be default)
- `Field1`:`1`
- `Date`:`2/10/2015`
- `Field 3`:`Test string`

**Sheet1** 

Columns:
- `Sheet1 name or identifier`
- `Number`
- `Date`
- `Text`

Records:

empty (no rows)
