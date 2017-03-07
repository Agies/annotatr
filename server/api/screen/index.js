'use strict';

var express = require('express');
var DB = require('../../components/services/data').DB;
var io = require('../../components/services/websocket');
var Uuid = require('uuid-lib');
var data = new DB('screen');
var router = express.Router();

router.get('/', (req, res) => {
  getAll()
  .then(result => {
    res.json(result);
  })
  .then(null, error => handleError(error, res));
});
router.get('/:screenName', (req, res) => {
  data.find({ name: req.params.screenName })
    .then(result => {
      res.json(result[0]);
    })
    .then(null, error => handleError(error, res));
});
router.post('/', (req, res) => {
  data.find({ name: req.body.name })
  .then(previous => {
    if (!req.body._id && previous[0] || previous[0] && req.body._id != previous[0]._id) {
      req.body.name += `- ${Uuid.create().value}`;
    }
    data.save(req.body)
      .then(() => data.find({
        name: req.body.name
      }))
      .then(result => {
        res.json(result[0]);
      })
      .then(() => {
        getAll().then(result => {
          io.broadcast('screen', result);
        });
      })
      .then(null, error => handleError(error, res));
  });
});

function handleError(error, res) {
  console.error(error);
  res.status(500).json({
    error
  });
}

function getAll() {
  return data.find({deleted: { $ne: true }}, {
    _id: 1,
    name: 1,
    thumbnail: 1
  });
}

module.exports = router;
