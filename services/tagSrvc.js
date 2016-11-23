var Promise = require('bluebird');

var TagService = function(db) {
	return {
		getAll: data => {
			return new Promise(function(resolve, reject) {
				db.any('SELECT * FROM tag')
					.then(data => {
						resolve({
							status: 'success',
							data: data,
							message: 'Retrieved ALL tags'
						});
					})
					.catch(err => {
						reject(err);
					});
			});
		},
		getByName: name => {
			return new Promise(function(resolve, reject) {
				db.oneOrNone('SELECT id FROM tag WHERE name=$1', name)
					.then(data => {
						if (data) resolve(data.id);
						resolve(null);
					})
					.catch(err => {
						reject(err);
					});

			});
		},
		add: name => {
			return new Promise(function(resolve, reject) {
				db.one("INSERT INTO tag(name) VALUES($1) returning id", name)
					.then(function(data) {
						resolve(data.id);
					})
					.catch(function(error) {
						reject(error);
					});
			});
		}
	}
};

module.exports = function(db) {
	return new TagService(db);
}