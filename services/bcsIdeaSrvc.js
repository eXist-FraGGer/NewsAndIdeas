var Promise = require('bluebird');

var BcsIdeaService = function(db) {
	return {
		getAll: data => {
			return new Promise(function(resolve, reject) {
				db.any('SELECT * FROM tag')
					.then(data => {
						resolve({
							status: 'success',
							data: data,
							message: 'Retrieved ALL Ideas'
						});
					})
					.catch(err => {
						reject(err);
					});
			});
		},
		add: data => {
			return new Promise(function(resolve, reject) {
				if (data.dateClose == "") {
					var date = new Date(data.dateOpen);
					date.setFullYear(date.getFullYear(), date.getMonth(), date.getDate() + parseFloat(data.horizon));
					data.dateClose = date.getFullYear() + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);
				}
				db.one("INSERT INTO article(\"dateOpen\", \"dateClose\", \"priceOpen\", \"priceClose\", horizon, profit, \"profitFact\", \"ProfitPotential\", recommend, strategy, \"risk_level\", market, range, \"isClosed\", id, timestamp, access, type, date, title, announce, body, \"imgSmall\", \"imgMedium\", \"imgBig\", service)" +
						"VALUES (${dateOpen}, ${dateClose}, ${priceOpen}, ${priceClose}, ${horizon}, ${profit}, ${profitFact}, ${ProfitPotential}, ${recommend}, ${strategy}, ${risk_level}, ${market}, ${range}, ${isClosed}, ${id}, ${timestamp}, ${access}, 2, ${date}, ${title}, ${announce}, ${body}, ${imgSmall}, ${imgMedium}, ${imgBig}, 'BCS') returning \"articleID\"", data)
					.then(function(data) {
						resolve(data.articleID);
					})
					.catch(function(error) {
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