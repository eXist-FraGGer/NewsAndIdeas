var Promise = require('bluebird');

var ArticleTickerService = function(db) {
	return {
		getAll: data => {
			return new Promise(function(resolve, reject) {
				db.any('SELECT * FROM \"Article_Ticker\"')
					.then(data => {
						resolve({
							status: 'success',
							data: data,
							message: 'Retrieved ALL Article_Tickers'
						});
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		getByArticleID: id => {
			return new Promise(function(resolve, reject) {
				db.oneOrNone("SELECT id FROM \"Article_Ticker\" WHERE \"articleId\"=$1", id)
					.then(data => {
						resolve(data.id);
					})
					.catch(error => {
						reject(error);
					});

			});
		},
		add: data => {
			return new Promise(function(resolve, reject) {
				if (!data.articleId || !data.tickerId)
					reject('No corrected data');
				else {
					db.one("INSERT INTO \"Article_Ticker\"(\"articleId\", \"tickerId\") VALUES(${articleId}, ${tickerId}) returning id", data)
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
	return new ArticleTickerService(db);
}