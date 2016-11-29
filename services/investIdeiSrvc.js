var Promise = require('bluebird');
var options = {
	promiseLib: Promise
};
var pgp = require("pg-promise")(options);

var request = require('superagent');

var investIdeiService = function(db) {
	return {
		load: data => {
			return new Promise(function(resolve, reject) {
				var url = 'https://invest-idei.ru/api/v1/ideas/';
				if (!data.limit) data.limit = 100;
				url += '?limit=' + data.limit;
				if (data.offset)
					url += '&offset=' + data.offset;
				request.get(url)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.end(function(err, res) {
						if (err) reject(err);
						else resolve(res.body.results);
					});
			});
		},
		count: () => {
			return new Promise(function(resolve, reject) {
				db.any("SELECT COUNT(*) AS count FROM article WHERE service='invest-idei' AND type = 2")
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
				var cs = new pgp.helpers.ColumnSet(['id', 'broker', 'broker_rating', 'isClosed', 'horizon', 'dateOpen', 'priceOpen', 'dateClose', 'priceClose', 'profit', 'profitFact', 'type', 'strategy', 'title', 'body', 'imgMedium', 'visibility', 'believe', 'not_believe', 'service'], {
					table: 'article'
				});
				data.forEach(function(item, i, data) {
					item.service = 'invest-idei';
					item.type = 2;
					item.isClosed = item['is_open'] == 'false' ? true : false;
					var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
					item['date_start'] = item['date_start'].replace(pattern, '$3-$2-$1');
					var dt = new Date(item['date_start']);
					item.dateOpen = dt.getFullYear() + "-" + ('0' + (dt.getMonth() + 1)).slice(-2) + "-" + ('0' + dt.getDate()).slice(-2);
					item.priceOpen = item['price_start'];
					if (item['date_end']) {
						item['date_end'] = item['date_end'].replace(pattern, '$3-$2-$1');
						dt = new Date(item['date_end']);
						item.dateClose = dt.getFullYear() + "-" + ('0' + (dt.getMonth() + 1)).slice(-2) + "-" + ('0' + dt.getDate()).slice(-2);
					} else item.dateClose = undefined;
					item.priceClose = item.price;
					item.profit = item.yield;
					item.profitFact = item['target_yield'];
					item.body = item.description;
					item.imgMedium = item.image;
					if (!item.dateClose) {
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
		get: data => {
			return new Promise(function(resolve, reject) {
				db.any("SELECT * FROM article WHERE service='invest-idei' AND type = 2 LIMIT 100 OFFSET $1", (data.page || 0) * 100)
					.then(data => {
						resolve(data);
					})
					.catch(error => {
						reject(error);
					});
			});
		}
	}
};

module.exports = function(db) {
	return new investIdeiService(db);
}