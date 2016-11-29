var Promise = require('bluebird');
var tickerSrvc = Promise.promisifyAll(require('../services/tickerSrvc')),
	articleTickerSrvc = Promise.promisifyAll(require('../services/articleTickerSrvc'));

var tickerService,
	articleTickerServicer;

var ArticleTagController = function(db) {
	tickerService = new tickerSrvc(db);
	articleTickerServicer = new articleTickerSrvc(db);

	var unique = function(arr) {
		var obj = {};
		for (var i = 0; i < arr.length; i++) {
			var str = arr[i];
			obj[str] = true;
		}
		return Object.keys(obj);
	}
	return {
		add: data => {
			return new Promise(function(resolve, reject) {
				var allTickers = [];
				data.forEach(function(item, i, data) {
					allTickers = allTickers.concat(item.tickers)
				});
				allTickers = unique(allTickers);
				tickerService.getByNames(allTickers)
					.then(tickers => {
						var new_tickers = allTickers.filter(value => tickers.find(ticker => ticker.name == value) ? false : true);
						if (new_tickers.length > 0)
							tickerService.add(new_tickers)
							.then(newTickers => {
								tickers = tickers.concat(newTickers);
								data.forEach(function(item, i, data) {
									var tk = item.tickers;
									tk.forEach(function(t_item, i, tk) {
										articleTickerServicer.add({
												articleId: item.articleId,
												tickerId: tickers.find(t => t.name == t_item).id
											})
											.then(data => { /* Success */ })
											.catch(error => { /* Error */ });
									});
								});
							})
							.catch(error => {
								reject(error);
							});
						else
							data.forEach(function(item, i, data) {
								var tk = item.tickers;
								tk.forEach(function(t_item, i, tk) {
									articleTickerServicer.add({
											articleId: item.articleId,
											tickerId: tickers.find(t => t.name == t_item).id
										})
										.then(data => { /* Success */ })
										.catch(error => { /* Error */ });
								});
							});
					})
					.catch(error => {
						reject(error);
					});

			});
		}
	}
};

module.exports = function(db) {
	return new ArticleTagController(db);
};