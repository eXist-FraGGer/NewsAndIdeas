var Promise = require('bluebird');
var pgp = require("pg-promise")({
	promiseLib: Promise
});

var TickerService = function(db) {
	var self = this;
	var getByNamePrivate = name => {
		return new Promise(function(resolve, reject) {
			db.oneOrNone('SELECT id FROM ticker WHERE name=$1', name)
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
				db.any('SELECT * FROM ticker')
					.then(data => {
						resolve({
							status: 'success',
							data: data,
							message: 'Retrieved ALL tickers'
						});
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		getByNames: data => {
			return new Promise(function(resolve, reject) {
				db.manyOrNone('SELECT * FROM ticker WHERE name IN (' + pgp.as.csv(data) + ')')
					.then(data => {
						resolve(data);
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		getByName: getByNamePrivate,
		add: data => {
			return new Promise(function(resolve, reject) {
				var cs = new pgp.helpers.ColumnSet(['name'], {
					table: 'ticker'
				});
				var tickers = [];
				data.forEach(function(item, i, data) {
					tickers.push({
						name: item
					});
				});
				var query = pgp.helpers.insert(tickers, cs) + " returning id, name";
				db.manyOrNone(query)
					.then(data => {
						resolve(data);
					})
					.catch(error => {
						reject(error);
					});
				/*db.one('INSERT INTO ticker(name) VALUES($1) returning id', name)
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
	return new TickerService(db);
}