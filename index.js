module.exports = function(config){


	var request = require('superagent-promise')(require('superagent'), this.Promise),
	url = require('url'),
	constants = require('./constants');	

	var options;

	(function(conf){
		if(!conf) {
			throw new Error(constants.errors.NO_CONFIG_OBJECT);
			return;
		}

		if(!conf.user){
			throw new Error(constants.errors.NO_CONFIG_USER);
			return;
		}

		if(!conf.password){
			throw new Error(constants.errors.NO_CONFIG_PASSWORD);
			return;
		}

		if(!conf.book){
			throw new Error(constants.errors.NO_CONFIG_BOOK);
			return;
		}

		options = config;
	})(config);


	function execute(req) {
		return req
			.set('accept','application/json')
			.auth(options.user, options.password)
			.end()
			.then(function(response){
				return response.body;
			}, function(errBody){
				return Promise.reject(errBody.response.error);
			});
		
	}	

	function buildApi() {
		var path;

		if(!arguments) {
			path = options.book;			
		} else {
			var args = Array.prototype.slice.call(arguments); 
			//put bookId to beginning of array
			args.unshift(options.book);
			path = args.join("/");
		}
		
		return url.resolve("https://api.fieldbook.com/v1/",path);
	}

	return {
		getSheets: function(){
			var api = buildApi();
			return execute(request.get(api));
		},
		
		getSheet: function(sheetId){
			var api = buildApi(sheetId);
			return execute(request.get(api));
		},

		getRecord: function(sheetId, recordId){
			var api = buildApi(sheetId, recordId);
			return execute(request.get(api));
		},

		addRecord: function(sheetId, data){
			var api = buildApi(sheetId);
			return execute(request
							.post(api)
							.send(data))
		},

		updateRecord: function(sheetId, recordId, data){
			var api = buildApi(sheetId, recordId);
			return execute(request
							.patch(api)
							.send(data));
		},

		deleteRecord: function(sheetId, recordId){
			var api = buildApi(sheetId, recordId);
			return execute(request.del(api));
		}	
	}


}
