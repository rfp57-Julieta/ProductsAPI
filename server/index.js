require('newrelic');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const db = require('../database/index.js');
const productRoute = require('./router.js');
// const cartRoute = require('./cartRoute.js');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: '34SDgsdgspxxxxxxxdfsG', // just a long random string
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(__dirname + '/../dist'));

app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
})

app.use('/products', productRoute);

// app.use('/cart', cartRoute);
