var Promise = require('bluebird');

var BcsNewsService = function(db) {
	return {
		getAll: data => {
			return new Promise(function(resolve, reject) {
				db.any('SELECT * FROM article WHERE service="BCS" AND type=1')
					.then(data => {
						resolve({
							status: 'success',
							data: data,
							message: 'Retrieved ALL News'
						});
					})
					.catch(err => {
						reject(err);
					});
			});
		},
		add: data => {
			return new Promise(function(resolve, reject) {
				db.one("INSERT INTO article(id, timestamp, access, type, date, title, announce, body, \"imgSmall\", \"imgMedium\", \"imgBig\", service)" +
						"VALUES (${id}, ${timestamp}, ${access}, 1, ${date}, ${title}, ${announce}, ${body}, ${imgSmall}, ${imgMedium}, ${imgBig}, 'BCS') returning \"articleID\"", data)
					.then(function(data) {
						resolve(data.articleID);
					})
					.catch(function(error) {
						reject(error);
					});
				/*db.tx(t => t.batch(data.map(l => t.one(
						"INSERT INTO article(id, timestamp, access, type, date, title, announce, body, \"imgSmall\", \"imgMedium\", \"imgBig\", service)" +
						"VALUES (${id}, ${timestamp}, ${access}, ${type}, ${date}, ${title}, ${announce}, ${body}, ${imgSmall}, ${imgMedium}, ${imgBig}, 'BCS') returning \"articleID\"", l))))
					.then(data => {
						var ids = data.map(d => d.articleID);
						resolve(ids);
					})
					.catch(error => {
						reject(error);
					});*/
			});
		},
		getByID: id => {
			return new Promise(function(resolve, reject) {
				db.oneOrNone("SELECT id, timestamp, access, date, title, announce, body, \"imgSmall\", \"imgMedium\", \"imgBig\" FROM article WHERE service='BCS' AND type=1 AND id=$1", id)
					.then(function(data) {
						resolve(data);
					})
					.catch(function(error) {
						reject(error);
					});
			});
		},
		isExists: id => {
			return new Promise(function(resolve, reject) {
				db.one("SELECT EXISTS (SELECT id FROM article WHERE service='BCS' AND type=1 AND id=$1)", id)
					.then(function(data) {
						resolve(data.exists);
					})
					.catch(function(error) {
						reject(error);
					});
			});
		}
	}
};

module.exports = function(db) {
	return new BcsNewsService(db);
}