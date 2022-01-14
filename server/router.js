const express = require('express');
const router = express.Router();
const db = require('../database/index.js');

router.get('/', (req, res) => {
  db.getProducts((err, result) => {
    if (err) {
      console.log('Failed to get data: ', err);
      res.status(500).send();
    } else {
      console.log('Get all products!')
      res.status(200).send(result.rows);
    }
  })
})

router.get('/:id', (req, res) => {
  db.getAProduct(req.params.id, (err, result) => {
    if (err) {
      console.log('Failed to get data: ', err);
      res.status(500).send();
    } else {
      console.log('Get product info!')
      res.status(200).send(result);
    }
  })
})

router.get('/:id/styles', (req, res) => {
  db.getStyle(req.params.id, (err, result) => {
    if (err) {
      console.log('Failed to get data: ', err);
      res.status(500).send();
    } else {
      console.log('Get all styles!')
      res.status(200).send(result);
    }
  })
})

module.exports = router;