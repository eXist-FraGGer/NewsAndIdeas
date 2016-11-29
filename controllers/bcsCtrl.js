var Promise = require('bluebird');
var bcsSrvc = Promise.promisifyAll(require('../services/bcsSrvc')),
	bcsIdeaSrvc = Promise.promisifyAll(require('../services/bcsIdeaSrvc')),
	bcsNewsSrvc = Promise.promisifyAll(require('../services/bcsNewsSrvc')),
	optionsSrvc = Promise.promisifyAll(require('../services/optionsSrvc')),
	articleTagCtrl = Promise.promisifyAll(require('./articleTagCtrl')),
	articleTickerCtrl = Promise.promisifyAll(require('./articleTickerCtrl'));

var bcsService,
	bcsIdeasService,
	bcsNewsService,
	optionsService,
	articleTagController,
	articleTickerController;

var services;

var bcsController = function(db) {
	bcsService = new bcsSrvc(db);
	bcsIdeasService = new bcsIdeaSrvc(db);
	bcsNewsService = new bcsNewsSrvc(db);
	optionsService = new optionsSrvc(db);
	articleTagController = new articleTagCtrl(db);
	articleTickerController = new articleTickerCtrl(db);

	services = {
		Bcs: bcsService,
		BcsIdeas: bcsIdeasService,
		BcsNews: bcsNewsService,
		Options: optionsService
	}

	var synchronize = function(options) {
		var typeId = 'last';
		if (options.count) typeId = 'first';
		if (!options.iter) options.iter = 0;
		services['Options'].get(typeId + options.service + 'ID')
			.then(ID => {
				if (options.count) ID = options.firstID || ID;
				else ID = options.lastID || ID;
				services['Bcs'].get({
						type: options.type,
						limit: options.limit,
						offset: (options.count || 0) + options.limit * options.iter
					})
					.then(data => {
						if (data.length > 0) {
							var f_data;
							if (options.count) f_data = data.filter(value => value.id < ID);
							else f_data = data.filter(value => value.id > ID);
							if (f_data.length > 0) {
								if (options.count) {
									if (f_data[f_data.length - 1].id < ID) {
										options.firstID = f_data[f_data.length - 1].id;
										ID = options.firstID;
									}
								} else if (f_data[0].id > ID) {
									options.lastID = f_data[0].id;
									ID = options.lastID;
								}
								services['Options'].update({
										value: ID,
										name: typeId + options.service + 'ID'
									})
									.then(() => { /* Success */ })
									.catch(error => {
										console.log('service Options update', error);
									});
								services[options.service].add(f_data)
									.then(ids => {
										var tag_list = [],
											ticker_list = [];
										ids.forEach(function(ids_item, i, ids) {
											var tags = f_data.find(item => ids_item.id == item.id).tags;
											if (tags)
												tag_list.push({
													articleId: ids_item.articleId,
													tags: tags
												});
											var tickers = f_data.find(item => ids_item.id == item.id).tickers;
											if (tickers)
												ticker_list.push({
													articleId: ids_item.articleId,
													tickers: tickers
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
									})
									.catch(error => {
										console.log('service', options.service, 'add', error);
									});
							};
							if (!options.count) {
								if (f_data.length == data.length) {
									options.iter += 1;
									synchronize(options);
								} else {
									services[options.service].count()
										.then(data => {
											options.iter = 0;
											options.count = +data;
											synchronize(options);
										})
										.catch(error => {
											console.log('service', options.service, 'count', error);
										});
								};
							} else {
								if (data.length == options.limit) {
									options.iter += 1;
									synchronize(options);
								} else console.log('Synchronize', options.service, 'Comlited!');
							};
						} else console.log('Synchronize', options.service, 'Comlited!');
					})
					.catch(error => {
						console.log('bcsService get', error);
					});
			})
			.catch(error => {
				console.log('Options get lastID', error);
			});
	};

	return {
		getNews: (req, res) => {
			bcsNewsService.get(req.query)
				.then(data => {
					res.render('bcsNews', {
						data: data,
						page: +req.query.page || 0
					});
				})
				.catch(error => {
					res.status(500).json(error);
				});
		},
		getIdeas: (req, res) => {
			bcsIdeasService.get(req.query)
				.then(data => {
					res.render('bcsIdeas', {
						data: data,
						page: +req.query.page || 0
					});
				})
				.catch(error => {
					res.status(500).json(error);
				});
		},
		syncNews: (req, res) => {
			synchronize({
				type: 'news',
				service: 'BcsNews',
				limit: 100
			});
			res.send('Synchronize News Starting');
		},
		syncIdeas: (req, res) => {
			synchronize({
				type: 'ideas',
				service: 'BcsIdeas',
				limit: 100
			});
			res.send('Synchronize Ideas Starting');
		}
	}
};

module.exports = function(db) {
	return new bcsController(db);
}