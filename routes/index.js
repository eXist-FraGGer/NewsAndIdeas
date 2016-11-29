var express = require('express');
var router = express.Router();

var db = require('../bin/db');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Express'
	});
});

router.get('/tags', db.getAllTags);
router.get('/tags/:name', db.getTagByName);
router.get('/syncBcsNews', db.syncBcsNews);
router.get('/syncBcsIdeas', db.syncBcsIdeas);
router.get('/bcsNews', db.getBcsNews);
router.get('/bcsIdeas', db.getBcsIdeas);
router.get('/investIdeas', db.getInvestIdeas);
router.get('/syncInvestIdeas', db.syncInvestIdeas);
router.get('/vcNews', db.getVcNews);


module.exports = router;