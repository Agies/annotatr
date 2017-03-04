'use strict';

var express = require('express');
var DB = require('../../components/services/data').DB;
var data = new DB('screen');
var router = express.Router();

router.get('/', (req, res) => {
  data.find().then(result => {
    res.json(result);
  });
});

module.exports = router;
