const express = require('express');
const router = express.Router();
const db = require('../database/index.js');

router.get('/:cartID', (req, res) => {
  db.getCart(req.params.cartID, (err, result) => {
    if (err) {
      console.log('Failed to get data: ', err);
      res.status(500).send(err);
    } else {
      console.log('Get cart info!')
      res.status(200).send(result);
    }
  })
})

router.post('/', (req, res) => {
  console.log('what is sessionID and active:', req.session.id);
  db.addToCart(req.body.sku_id, req.session.id)
    .then((result) => {
      console.log('Add to the cart!')
      res.send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    })
})

module.exports = router;