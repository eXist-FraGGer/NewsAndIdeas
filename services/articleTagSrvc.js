var Promise = require('bluebird');

var ArticleTagService = function(db) {
	return {
		getAll: data => {
			return new Promise(function(resolve, reject) {
				db.any('SELECT * FROM \"Article_Tag\"')
					.then(data => {
						resolve({
							status: 'success',
							data: data,
							message: 'Retrieved ALL Article_Tag'
						});
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		getByArticleID: id => {
			return new Promise(function(resolve, reject) {
				db.oneOrNone("SELECT * FROM \"Article_Tag\" WHERE \"articleID\"=$1", id)
					.then(data => {
						resolve(data);
					})
					.catch(error => {
						reject(error);
					});

			});
		},
		add: data => {
			return new Promise(function(resolve, reject) {
				if (!data.articleId || !data.tagId)
					reject('No corrected data');
				else {
					db.one("INSERT INTO \"Article_Tag\"(\"articleId\", \"tagId\") VALUES(${articleId}, ${tagId}) returning id", data)
						.then(function(data) {
							resolve(data.id);
						})
						.catch(function(error) {
							if (error.code != 23505)
								reject(error);
						});
				}
			});
		}
	}
};

module.exports = function(db) {
	return new ArticleTagService(db);
}