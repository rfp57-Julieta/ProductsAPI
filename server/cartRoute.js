const express = require('express');
const router = express.Router();
const db = require('../database/index.js');

router.get('/', (req, res) => {
  db.getCart((err, result) => {
    if (err) {
      console.log('Failed to get data: ', err);
      res.status(500).send(err);
    } else {
      console.log('Get product info!')
      res.status(200).send(result);
    }
  })
})

module.exports = router;