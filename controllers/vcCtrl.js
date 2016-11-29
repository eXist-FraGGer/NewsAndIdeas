var Promise = require('bluebird');
var vcNewsSrvc = Promise.promisifyAll(require('../services/vcNewsSrvc')),
	optionsSrvc = Promise.promisifyAll(require('../services/optionsSrvc')),
	articleTagCtrl = Promise.promisifyAll(require('./articleTagCtrl'));

var vcNewsService,
	optionsService,
	articleTagController;

var vcController = function(db) {
	vcNewsService = new vcNewsSrvc(db);
	optionsService = new optionsSrvc(db);
	articleTagController = new articleTagCtrl(db);

	var synchronize = function(options) {
		vcNewsService.load()
			.then(data => {
				if (data.length > 0) {
					var ids = [];
					data.forEach((item, i, data) => {
						ids.push(item.guid[0]['_']);
					});
					vcNewsService.getExists(ids)
						.then(exData => {
							var n_ids = [];
							exData.forEach((e_item, i, exData) => {
								n_ids.push(e_item.id);
							});
							var f_data = data.filter(d => !n_ids.includes(+d.guid[0]['_']));
							if (f_data.length > 0) {
								vcNewsService.add(f_data)
									.then(ids => {
										var tag_list = [];
										ids.forEach(function(ids_item, i, ids) {
											var tags = f_data.find(item => ids_item.id == +item.guid[0]['_']).category[0] || undefined;
											if (tags)
												tag_list.push({
													articleId: ids_item.articleId,
													tags: [tags]
												});
										});
										if (tag_list.length > 0)
											articleTagController.add(tag_list)
											.then(() => {})
											.catch(error => {
												console.log('articleTagController add', error);
											});
										console.log('Synchronize vcNews Service Comlited!');
									})
									.catch(error => {
										console.log('vcNews Service add', error);
									});
							} else console.log('Synchronizen vcNews Service Comlited!');
						})
						.catch(error => {
							console.log('vcNews Service getExists', error);
						});
				} else console.log('Synchronizen vcNews Service Comlited!');
			})
			.catch(error => {
				console.log('vcNews Service load', error);
			});
	};

	return {
		get: (req, res) => {
			vcNewsService.get(req.query)
				.then(data => {
					res.render('vcNews', {
						data: data,
						page: +req.query.page || 0
					});
				})
				.catch(error => {
					res.status(500).json(error);
				});
		},
		sync: (req, res) => {
			synchronize();
			res.send('Synchronize News Starting');
		}
	}
};

module.exports = function(db) {
	return new vcController(db);
}