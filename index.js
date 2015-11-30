(function(config){

	var request = require('superagent-bluebird-promise');
	var options;

	(function(config){
		if(!config.user){
			throw new Error('No user passed in config object');
		}

		if(!config.password){
			throw new Error('No password passed in config object');
		}

		if(config.book){
			throw new Error('No defined book in config object');
		}

		options = config;
	})(config);


	function basicRequest() {
		return request()
			.accept('json')
			.auth(this.username, this.password)
	}	

	function buildApi() {
		var args = Array.prototype.slice.call(arguments); 
		//put bookId to beginning of array
		args.unshift(options.book);
		var path = args.join("/");
		return url.resolve("https://api.fieldbook.com/v1/",path);
	}

	return {
		getSheets: function(){
			var api = buildApi();
			return basicRequest
				.get(api)
				.end();
		},
		
		getSheet: function(sheetId){
			var api = buildApi(sheetId);
			return basicRequest()
				.get(api)
				.end();
		},

		getRecord: function(sheetId, recordId){
			var api = buildApi(sheetId, recordId);
			return basicRequest()
				.get(api)
				.end();
		},

		addRecord: function(sheetId, data){
			var api = buildApi(sheetId);
			return basicRequest()
				.post(api)
				.send(data)	
				.end();
		},

		updateRecord: function(sheetId, recordId, data){
			var api = buildApi(sheetId, recordId);
			return basicRequest()
				.patch(api)
				.send(data);
				.end();
		},

		deleteRecord: function(sheetId, recordId){
			var api = buildApi(sheetId, recordId);
			return basicRequest()
				.delete(api)
				.end();
		}	
	}


})();
