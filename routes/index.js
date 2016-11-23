var express = require('express');
var router = express.Router();

var db = require('../bin/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/tags', db.getAllTags);
router.get('/bcs', db.getBcs);
router.get('/tags/:name', db.getTagByName);
router.get('/syncNews', db.syncNews);
router.get('/syncIdeas', db.syncIdeas);


module.exports = router;
