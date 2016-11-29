var promise = require('bluebird');

var options = {
	promiseLib: promise
};
var pgp = require("pg-promise")(options);
var db = pgp("postgres://test_user:root@localhost:5432/NewsAndIdeas");

var tagCtrl = require('../controllers/tagCtrl');
var tagController = new tagCtrl(db);

var bcsCtrl = require('../controllers/bcsCtrl');
var bcsController = new bcsCtrl(db);
var investCtrl = require('../controllers/investCtrl');
var investController = new investCtrl(db);
var vcCtrl = require('../controllers/vcCtrl');
var vcController = new vcCtrl(db);

module.exports = {
	getAllTags: tagController.getAll,
	getTagByName: tagController.getByName,
	syncBcsNews: bcsController.syncNews,
	syncBcsIdeas: bcsController.syncIdeas,
	getBcsNews: bcsController.getNews,
	getBcsIdeas: bcsController.getIdeas,
	getInvestIdeas: investController.get,
	syncInvestIdeas: investController.sync,
	getVcNews: vcController.get,
	syncVcNews: vcController.sync
};