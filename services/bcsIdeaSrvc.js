var Promise = require('bluebird');
var options = {
	promiseLib: Promise
};
var pgp = require("pg-promise")(options);

var BcsIdeaService = function(db) {
	return {
		get: data => {
			return new Promise(function(resolve, reject) {
				db.any("SELECT * FROM article WHERE service='BCS' AND type=2 LIMIT 100 OFFSET $1", (data.page || 0) * 100)
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
				db.any("SELECT COUNT(*) AS count FROM article WHERE service='BCS' AND type=2")
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
				var cs = new pgp.helpers.ColumnSet(['dateOpen', 'dateClose', 'priceOpen', 'priceClose', 'horizon', 'profit', 'profitFact', 'ProfitPotential', 'recommend', 'strategy', 'risk_level', 'market', 'range', 'isClosed', 'id', 'timestamp', 'access', 'type', 'date', 'title', 'announce', 'body', 'imgSmall', 'imgMedium', 'imgBig', 'service'], {
					table: 'article'
				});
				data.forEach(function(item, i, data) {
					item.service = 'BCS';
					if (item.dateClose == "") {
						var date = new Date(item.dateOpen);
						date.setFullYear(date.getFullYear(), date.getMonth(), date.getDate() + parseFloat(item.horizon));
						item.dateClose = date.getFullYear() + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);
					}
				});
				var query = pgp.helpers.insert(data, cs) + " returning id, \"articleId\"";
				db.many(query)
					.then(data => {
						resolve(data);
					})
					.catch(error => {
						reject(error);
					});
			});
		},
		getByID: id => {
			return new Promise(function(resolve, reject) {
				db.oneOrNone("SELECT \"dateOpen\", \"dateClose\", \"priceOpen\", \"priceClose\", horizon, profit, \"profitFact\", \"ProfitPotential\", recommend, strategy, \"risk_level\", market, range, \"isClosed\", id, timestamp, access, date, title, announce, body, \"imgSmall\", \"imgMedium\", \"imgBig\" FROM article WHERE service='BCS' AND type=2 AND id=$1", id)
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
				db.one("SELECT EXISTS (SELECT id FROM article WHERE service='BCS' AND type=2 AND id=$1)", id)
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
	return new BcsIdeaService(db);
}