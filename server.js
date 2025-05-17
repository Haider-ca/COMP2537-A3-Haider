// server.js
const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

// 1) View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2) Static files
app.use(express.static(path.join(__dirname, 'public')));

// 3) Root route
app.get('/', (req, res) => {
  res.render('index');
});

// 4) Start
app.listen(PORT, () =>
  console.log(`🎮 Memory Game server running at http://localhost:${PORT}`)
);
