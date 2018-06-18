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

app.get('/api/advice', (req, res) => {

  client.query(`
  SELECT a.id, a.title, a.text, a.user_id,
    COUNT(votes.id) AS upvotes
  FROM advice a

  LEFT JOIN votes
    ON votes.table_id = 1 AND a.id = votes.post_id
  GROUP BY a.id
  ORDER BY upvotes DESC

  `).then(result => {
    res.send(result.rows);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log('server running on port', PORT));