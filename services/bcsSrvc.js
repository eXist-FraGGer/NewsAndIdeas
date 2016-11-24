var Promise = require('bluebird');

var request = require('superagent');

var bscService = function(db) {
	return {
		get: data => {
			return new Promise(function(resolve, reject) {
				var url = 'http://bcs-express.ru/api/articles/71e3ad09a9704fdf8e22ef5bed16e09f/';
				if (data.type && (data.type == 2 || data.type == 'ideas'))
					url += '?type=ideas';
				else
					url += '?type=news';
				if (data.limit)
					url += '&limit=' + data.limit;
				if (data.offset)
					url += '&offset=' + data.offset;
				request.get(url)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.end(function(err, res) {
						if (err) reject(err);
						else resolve(res.body);
					});
			});
		},
		test: data => {
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
				var query = pgp.helpers.insert(data, cs) +" returning id";
				db.many(query)
					.then(data => {
						console.log(data);
					})
					.catch(error => {
						console.log(error);
					});
			});
		}
	}
};

module.exports = function(db) {
	return new bscService(db);
}