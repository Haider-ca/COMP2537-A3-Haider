// functions/api.js
const serverless = require('serverless-http');
const express    = require('express');
const path       = require('path');
const app        = express();

// 1) Serve your EJS views
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// 2) Serve your public assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// 3) Root handler
app.get('/', (req, res) => {
  res.render('index');
});

module.exports.handler = serverless(app);
