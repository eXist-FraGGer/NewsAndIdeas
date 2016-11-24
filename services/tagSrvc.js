var Promise = require('bluebird');

var TagService = function(db) {
	var self = this;
	var getByNamePrivate = name => {
		return new Promise(function(resolve, reject) {
			db.oneOrNone('SELECT id FROM tag WHERE name=$1', name)
				.then(data => {
					if (data) resolve(data.id);
					resolve(null);
				})
				.catch(error => {
					reject(error);
				});

		});
	};
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
					.catch(error => {
						reject(error);
					});
			});
		},
		getByName: getByNamePrivate,
		add: name => {
			return new Promise(function(resolve, reject) {
				db.one('INSERT INTO tag(name) VALUES($1) returning id', name)
					.then(function(data) {
						resolve(data.id);
					})
					.catch(function(error) {
						if (error.code == 23505) resolve(getByNamePrivate(name));
						else reject(error);
					});
			});
		}
	}
};

module.exports = function(db) {
	return new TagService(db);
}