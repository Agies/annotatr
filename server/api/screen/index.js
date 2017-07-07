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
    result.sort((a, b) => {
      if (!a.lastUpdate) return 1;
      if (!b.lastUpdate) return -1;
      return a.lastUpdate > b.lastUpdate ? -1 : 1;
    });
    res.json(result);
  })
  .then(null, error => handleError(error, res));
});
router.get('/component/:value', (req, res) => {
  getAll()
  .then(result => {
    var map = [];
    result.forEach(r => {
      var comp = r.component;
      if (!comp || map.indexOf(comp) > 0 || comp.indexOf(req.body.value) == 0) {
        return;
      }
      map.push(comp);
    });
    res.json(map);
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
    thumbnail: 1,
    component: 1,
    lastUpdate: 1
  });
}

module.exports = router;
