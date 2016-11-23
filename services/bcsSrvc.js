var Promise = require('bluebird');

var request = require('superagent');

var bscService = function(db) {
	return {
		get: data => {
			return new Promise(function(resolve, reject) {
				var url = 'http://bcs-express.ru/api/articles/71e3ad09a9704fdf8e22ef5bed16e09f/';
				if (data.type && (data.type == 2 || data.type == 'ideas'))
					url += '?type=ideas';
				else
					url += '?type=news';
				if (data.limit)
					url += '&limit=' + data.limit;
				if (data.offset)
					url += '&offset=' + data.offset;
				request.get(url)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.end(function(err, res) {
						if (err) reject(err);
						else resolve(res.body);
					});
			});
		}
	}
};

module.exports = function(db) {
	return new bscService(db);
}