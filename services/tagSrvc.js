var Promise = require('bluebird');
var pgp = require("pg-promise")({
	promiseLib: Promise
});

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
		getByNames: data => {
			return new Promise(function(resolve, reject) {
				db.manyOrNone('SELECT * FROM tag WHERE name IN (' + pgp.as.csv(data) + ')')
					.then(data => {
						resolve(data);
					})
					.catch(error => {
						console.log(query);
						reject(error);
					});
			});
		},
		getByName: getByNamePrivate,
		add: data => {
			return new Promise(function(resolve, reject) {
				var cs = new pgp.helpers.ColumnSet(['name'], {
					table: 'tag'
				});
				var tags = [];
				data.forEach(function(item, i, data) {
					tags.push({
						name: item
					});
				});
				var query = pgp.helpers.insert(tags, cs) + " returning id, name";
				db.manyOrNone(query)
					.then(data => {
						resolve(data);
					})
					.catch(error => {
						reject(error);
					});
				/*db.one('INSERT INTO tag(name) VALUES($1) returning id', name)
					.then(function(data) {
						resolve(data.id);
					})
					.catch(function(error) {
						if (error.code == 23505) resolve(getByNamePrivate(name));
						else reject(error);
					});*/
			});
		}
	}
};

module.exports = function(db) {
	return new TagService(db);
}