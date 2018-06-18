// basic express app
require('dotenv').config();
const express = require('express');
const app = express();

// middleware (cors and read json body)
const cors = require('cors');
const morgan = require('morgan');
app.use(morgan('dev')); 
app.use(cors());
app.use(express.json());

// server files in public directory
app.use(express.static('public'));

// connect to the database
const client = require('./db-client');

app.get('/api/users', (req, res) => {

  client.query(`
    SELECT * FROM users;
  `).then(result => {
    res.send(result.rows);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log('server running on port', PORT));