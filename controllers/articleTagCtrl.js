var Promise = require('bluebird');
var tagSrvc = Promise.promisifyAll(require('../services/tagSrvc')),
	articleTagSrvc = Promise.promisifyAll(require('../services/articleTagSrvc'));

var tagService,
	articleTagService;

var ArticleTagController = function(db) {
	tagService = new tagSrvc(db);
	articleTagService = new articleTagSrvc(db);

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
				var allTags = [];
				data.forEach(function(item, i, data) {
					allTags = allTags.concat(item.tags)
				});
				allTags = unique(allTags);
				tagService.getByNames(allTags)
					.then(tags => { /* tags exists in db*/
						/*filter tags not exists and write in db*/
						var new_tags = allTags.filter(value => tags.find(tag => tag.name == value) ? false : true);
						if (new_tags.length > 0)
							tagService.add(new_tags)
							.then(newTags => {
								tags = tags.concat(newTags);
								data.forEach(function(item, i, data) {
									var tg = item.tags || [];
									tg.forEach(function(t_item, i, tg) {
										articleTagService.add({
												articleId: item.articleId,
												tagId: tags.find(t => t.name == t_item).id
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
								var tg = item.tags || [];
								tg.forEach(function(t_item, i, tg) {
									articleTagService.add({
											articleId: item.articleId,
											tagId: tags.find(t => t.name == t_item).id
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