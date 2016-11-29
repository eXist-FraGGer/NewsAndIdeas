var Promise = require('bluebird');
var vcNewsSrvc = Promise.promisifyAll(require('../services/vcNewsSrvc')),
	optionsSrvc = Promise.promisifyAll(require('../services/optionsSrvc')),
	articleTagCtrl = Promise.promisifyAll(require('./articleTagCtrl')),
	articleTickerCtrl = Promise.promisifyAll(require('./articleTickerCtrl'));

var vcNewsService,
	optionsService,
	articleTagController,
	articleTickerController;;

var vcController = function(db) {
	vcNewsService = new vcNewsSrvc(db);
	optionsService = new optionsSrvc(db);
	articleTagController = new articleTagCtrl(db);
	articleTickerController = new articleTickerCtrl(db);

	var synchronize = function(options) {

	};

	return {
		get: (req, res) => {
			vcNewsService.load(req.query)
				.then(data => {
					res.status(200).json(data);
					/*res.render('investIdeas', {
						data: data,
						page: +req.query.page || 0
					});*/
				})
				.catch(error => {
					res.status(500).json(error);
				});
		},
		sync: (req, res) => {
			synchronize({
				limit: 100
			});
			res.send('Synchronize Ideas Starting');
		}
	}
};

module.exports = function(db) {
	return new vcController(db);
}