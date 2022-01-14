const express = require('express');
const db = require('../database/index.js');
const router = require('./router.js');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(express.static(__dirname + '/../dist'));

app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
})

app.use('/products', router);

