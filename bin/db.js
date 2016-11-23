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

module.exports = {
  getAllTags: tagController.getAll,
  getBcs: bcsController.get,
  getTagByName: tagController.getByName,
  syncNews: bcsController.syncNews,
  syncIdeas: bcsController.syncIdeas
};