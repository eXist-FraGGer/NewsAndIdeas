var Promise = require('bluebird');
var bcsSrvc = Promise.promisifyAll(require('../services/bcsSrvc')),
	bcsIdeaSrvc = Promise.promisifyAll(require('../services/bcsIdeaSrvc')),
	bcsNewsSrvc = Promise.promisifyAll(require('../services/bcsNewsSrvc')),
	tagSrvc = Promise.promisifyAll(require('../services/tagSrvc')),
	tickerSrvc = Promise.promisifyAll(require('../services/tickerSrvc')),
	optionsSrvc = Promise.promisifyAll(require('../services/optionsSrvc')),
	articleTagSrvc = Promise.promisifyAll(require('../services/articleTagSrvc')),
	articleTickerSrvc = Promise.promisifyAll(require('../services/articleTickerSrvc'));

var bcsService,
	bcsIdeasService,
	bcsNewsService,
	tagService,
	tickerService,
	optionsService,
	articleTagService,
	articleTickeServicer;

var services;

var bcsController = function(db) {
	bcsService = new bcsSrvc(db);
	bcsIdeasService = new bcsIdeaSrvc(db);
	bcsNewsService = new bcsNewsSrvc(db);
	tagService = new tagSrvc(db);
	tickerService = new tickerSrvc(db);
	optionsService = new optionsSrvc(db);
	articleTagService = new articleTagSrvc(db);
	articleTickeServicer = new articleTickerSrvc(db);

	services = {
		Bcs: bcsService,
		BcsIdeas: bcsIdeasService,
		BcsNews: bcsNewsService,
		Tag: tagService,
		Ticker: tickerService,
		Options: optionsService,
		ArticleTag: articleTagService,
		ArticleTicker: articleTickeServicer
	}

	this.iter = 0;

	var synchronize = function(options) {
		services['Options'].get('last' + options.service + 'ID')
			.then(lastID => {
				lastID = options.lastID || lastID;
				bcsService.get({
						type: options.type,
						limit: options.limit,
						offset: options.offset * options.iter
					})
					.then(data => {
						if (data.length > 0) {
							var f_data = data.filter(value => value.id > lastID);
							if (f_data.length > 0 && (f_data[0].id > lastID)) {
								options.lastID = f_data[0].id;
								lastID = options.lastID;
								services['Options'].update({
										value: options.lastID,
										name: 'last' + options.service + 'ID'
									})
									.then(() => { /* Success */ })
									.catch(error => { /* Error */ });
							};
							services['Options'].get('full' + options.service)
								.then(isFull => {
									var w_data;
									if (isFull == 'true') w_data = f_data;
									else w_data = data;
									w_data.forEach(function(item, i, w_data) {
										services[options.service].isExists(item.id)
											.then(state => {
												if (!state)
													services[options.service].add(item)
													.then(articleId => {
														var tags = item.tags || [];
														tags.forEach(function(t_item, i, tags) {
															services['Tag'].getByName(t_item)
																.then(tagId => {
																	if (tagId) {
																		services['ArticleTag'].add({
																				articleId: articleId,
																				tagId: tagId
																			})
																			.then(data => { /* Success */ })
																			.catch(error => {
																				console.log('if ArticleTag add', error);
																			});
																	} else {
																		services['Tag'].add(t_item)
																			.then(tagId => {
																				services['ArticleTag'].add({
																						articleId: articleId,
																						tagId: tagId
																					})
																					.then(data => { /* Success */ })
																					.catch(error => {
																						console.log('else ArticleTag add', error);
																					});
																			})
																			.catch(error => {
																				console.log('Tag add', error);
																			});
																	}
																})
																.catch(error => {
																	console.log('Tag getByName', error);
																});
														});
														var tickers = item.tickers || [];
														tickers.forEach(function(t_item, i, tickers) {
															services['Ticker'].getByName(t_item)
																.then(tickerId => {
																	//console.log('tickerId', tickerId);
																	if (tickerId) {
																		services['ArticleTicker'].add({
																				articleId: articleId,
																				tickerId: tickerId
																			})
																			.then(data => { /* Success */ })
																			.catch(error => {
																				console.log('if ArticleTicker add', error);
																			});
																	} else {
																		services['Ticker'].add(t_item)
																			.then(tickerId => {
																				services['ArticleTicker'].add({
																						articleId: articleId,
																						tickerId: tickerId
																					})
																					.then(data => { /* Success */ })
																					.catch(error => {
																						console.log('else ArticleTicker add', error);
																					});
																			})
																			.catch(error => {
																				console.log('Ticker add', error);
																			});
																	}
																})
																.catch(error => {
																	console.log('Ticker getByName', error);
																});
														});
													})
													.catch(error => {
														console.log(options.service, 'add', error);
													});
											})
											.catch(error => {
												console.log(options.service, 'isExists', error);
											});
									});
									if (isFull == 'false') {
										if (data.length == options.limit) {
											options.iter += 1;
											synchronize(options);
										} else {
											services['Options'].update({
													value: true,
													name: 'full' + options.service
												})
												.then(() => { /* Success */ })
												.catch(error => { /* Error */ });
											console.log('Synchronize', options.service, 'Comlited!');
										}
									} else if (f_data.length == data.length) {
										options.iter += 1;
										synchronize(options);
									} else {
										console.log('Synchronize', options.service, 'Comlited!');
									}
								})
								.catch(error => {
									console.log('Options get full', error);
								});
						} else {
							services['Options'].update({
									value: true,
									name: 'full' + options.service
								})
								.then(() => { /* Success */ })
								.catch(error => { /* Error */ });
							console.log('Synchronize', options.service, 'Comlited!');
						}
					})
					.catch(error => {
						console.log('bcsService.get', error);
					});
			})
			.catch(error => {
				console.log('Options get lastID', error);
			});
	};

	return {
		get: (req, res) => {
			bcsService.get(req.query)
				.then(data => {
					res.status(200).json(data);
				})
				.catch(error => {
					res.status(500).json(error);
				});
		},
		syncNews: (req, res) => {
			synchronize({
				type: 'news',
				service: 'BcsNews',
				limit: 100,
				offset: 100,
				iter: 0
			});
			res.send('Synchronize News Starting');
		},
		syncIdeas: (req, res) => {
			synchronize({
				type: 'ideas',
				service: 'BcsIdeas',
				limit: 100,
				offset: 100,
				iter: 0
			});
			res.send('Synchronize Ideas Starting');
		}
	}
};

module.exports = function(db) {
	return new bcsController(db);
}