var Promise = require('bluebird');
var options = {
	promiseLib: Promise
};
var pgp = require("pg-promise")(options);

var BcsNewsService = function(db) {
	return {
		get: data => {
			return new Promise(function(resolve, reject) {
				db.any("SELECT * FROM article WHERE service='BCS' AND type=1 LIMIT 100 OFFSET $1", (data.page || 0) * 100)
					.then(data => {
						resolve(data);
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		count: () => {
			return new Promise(function(resolve, reject) {
				db.any("SELECT COUNT(*) AS count FROM article WHERE service='BCS' AND type=1")
					.then(data => {
						resolve(data[0].count);
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		add: data => {
			return new Promise(function(resolve, reject) {
				var cs = new pgp.helpers.ColumnSet(['id', 'timestamp', 'access', 'type', 'date', 'title', 'announce', 'body', 'imgSmall', 'imgMedium', 'imgBig', 'service'], {
					table: 'article'
				});
				data.forEach(function(item, i, data) {
					item.service = 'BCS';
				});
				var query = pgp.helpers.insert(data, cs) + " returning id, \"articleId\"";
				db.many(query)
					.then(data => {
						resolve(data);
					})
					.catch(error => {
						reject(error);
					});
				/*db.one("INSERT INTO article(id, timestamp, access, type, date, title, announce, body, \"imgSmall\", \"imgMedium\", \"imgBig\", service)" +
						"VALUES (${id}, ${timestamp}, ${access}, 1, ${date}, ${title}, ${announce}, ${body}, ${imgSmall}, ${imgMedium}, ${imgBig}, 'BCS') returning \"articleId\"", data)
					.then(function(data) {
						resolve(data.articleId);
					})
					.catch(function(error) {
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