var Promise = require('bluebird');
var investIdeiSrvc = Promise.promisifyAll(require('../services/investIdeiSrvc')),
	optionsSrvc = Promise.promisifyAll(require('../services/optionsSrvc')),
	articleTagCtrl = Promise.promisifyAll(require('./articleTagCtrl')),
	articleTickerCtrl = Promise.promisifyAll(require('./articleTickerCtrl'));

var investIdeiService,
	optionsService,
	articleTagController,
	articleTickerController;;

var investController = function(db) {
	investIdeiService = new investIdeiSrvc(db);
	optionsService = new optionsSrvc(db);
	articleTagController = new articleTagCtrl(db);
	articleTickerController = new articleTickerCtrl(db);

	var synchronize = function(options) {
		investIdeiService.count()
			.then(count => {
				investIdeiService.load({
						limit: options.limit,
						offset: (count || 0) + options.limit * options.iter
					})
					.then(data => {
						if (data.length > 0) {
							optionsService.get('lastInvestIdeasID')
								.then(ID => {
									ID = options.lastID || ID;
									var f_data = data.filter(value => value.id > ID);
									//console.log(ID, data);
									if (f_data.length > 0) {
										if (f_data[f_data.length - 1].id > ID) {
											options.lastID = f_data[f_data.length - 1].id;
											ID = options.lastID;
										}
										optionsService.update({
												value: ID,
												name: 'lastInvestIdeasID'
											})
											.then(() => { /* Success */ })
											.catch(error => {
												console.log('service Options update', error);
											});
										investIdeiService.add(f_data)
											.then(ids => {
												var tag_list = [],
													ticker_list = [];
												ids.forEach(function(ids_item, i, ids) {
													var tag = f_data.find(item => ids_item.id == item.id).tags;
													if (tag)
														tag_list.push({
															articleId: ids_item.articleId,
															tags: [tag.jurisdiction === 'Российские' ? 'В России' : 'В мире']
														});
													var ticker = f_data.find(item => ids_item.id == item.id).ticker;
													if (ticker)
														ticker_list.push({
															articleId: ids_item.articleId,
															tickers: [ticker]
														});
												});
												if (tag_list.length > 0)
													articleTagController.add(tag_list)
													.then(() => { /* Success */ })
													.catch(error => {
														console.log('articleTagController add', error);
													});
												if (ticker_list.length > 0)
													articleTickerController.add(ticker_list)
													.then(() => { /* Success */ })
													.catch(error => {
														console.log('articleTickerController add', error);
													});
												if (data.length == options.limit) {
													options.iter += 1;
													synchronize(options);
												} else console.log('Synchronize invest-idei Service Comlited!');
											})
											.catch(error => {
												console.log('invest-idei Service add', error);
											})
									} else console.log('Synchronize invest-idei Service Comlited!');
								})
								.catch(error => {
									console.log('options Service get', error);
								});
						} else console.log('Synchronize invest-idei Service Comlited!');
					})
					.catch(error => {
						console.log('invest-idei Service get', error);
					});
			})
			.catch(error => {
				console.log('invest-idei Service count', error);
			});
	};

	return {
		get: (req, res) => {
			investIdeiService.get(req.query)
				.then(data => {
					//res.status(200).json(data);
					res.render('investIdeas', {
						data: data,
						page: +req.query.page || 0
					});
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
	return new investController(db);
}