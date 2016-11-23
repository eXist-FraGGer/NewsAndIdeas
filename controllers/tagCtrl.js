//var tagSrvc = require('../services/tagSrvc');

var Promise = require('bluebird');
var tagSrvc = Promise.promisifyAll(require('../services/tagSrvc'));
var tagService;

var TagController = function(db) {
	tagService = new tagSrvc(db);

	return {
		getAll: (req, res) => {
			tagService.getAll(req.body)
				.then(data => {
					res.status(200).json(data);
				})
				.catch(error => {
					res.status(500).json(error);
				})
		},
		getByName: (req, res) => {
			tagService.getByName(req.params.name)
				.then(data => {
					res.status(200).json(data);
				})
				.catch(error => {
					res.status(500).json(error);
				})
		}
	}
};

module.exports = function(db) {
	return new TagController(db);
}