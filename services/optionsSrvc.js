var Promise = require('bluebird');

var OptionsService = function(db) {
	return {
		get: name => {
			return new Promise(function(resolve, reject) {
				db.one('SELECT value FROM options WHERE name=$1', name)
					.then(data => {
						resolve(data.value);
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		update: data => {
			return new Promise(function(resolve, reject) {
				db.none("UPDATE options SET value=${value} WHERE name=${name}", data)
					.then(() => {
						resolve('Success');
					})
					.catch(error => {
						reject(error);
					});
			});
		}
	}
};

module.exports = function(db) {
	return new OptionsService(db);
}