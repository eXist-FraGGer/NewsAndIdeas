var Promise = require('bluebird');

var request = require('superagent');

var options = {
	promiseLib: Promise
};
var pgp = require("pg-promise")(options);

var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var vcNewsService = function(db) {
	return {
		load: data => {
			return new Promise(function(resolve, reject) {
				var url = 'https://vc.ru/feed/tinkoff';
				request.get(url)
					.set('Content-Type', 'application/xml')
					.set('Accept', 'application/xml')
					.end(function(err, res) {
						//console.log('vcNews Service load',res);
						if (err) reject(err);
						else {
							parser.parseString(res.res.text, function(err, result) {
								resolve(result.rss.channel[0].item);
							});
						}
					});
			});
		},
		count: () => {
			return new Promise(function(resolve, reject) {
				db.any("SELECT COUNT(*) AS count FROM article WHERE service='vc' AND type = 1")
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
				var cs = new pgp.helpers.ColumnSet(['title', 'imgMedium', 'announce', 'broker', 'id', 'timestamp', 'body', 'type', 'service'], {
					table: 'article'
				});
				data.forEach(function(item, i, data) {
					item.service = 'vc';
					item.type = 1;
					item.imgMedium = item.link;
					item.announce = item.description;
					item.broker = item.author;
					item.id = item.guid.id;
					item.timestamp = new Date(item.pubDate).getTime();
					item.body = item['yandex:full-text'];
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
				db.any("SELECT * FROM article WHERE service='vc' AND type = 1 LIMIT 100 OFFSET $1", (data.page || 0) * 100)
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
	return new vcNewsService(db);
}