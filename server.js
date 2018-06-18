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

app.get('/api/advice', (req, res, next) => {

  client.query(`
    SELECT
      a.id,
      a.title,
      a.text,
      a.user_id,
      u.first_name,
      u.last_name,
      COUNT(v.id) AS upvotes
    FROM advice a
    JOIN users u
      ON u.id = a.user_id
    LEFT JOIN votes v
      ON v.table_id = 1 AND a.id = v.post_id
    GROUP BY a.id, u.first_name, u.last_name
    ORDER BY upvotes DESC;

  `).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});

app.get('/api/resources', (req, res, next) => {

  client.query(`
    SELECT
      r.id,
      r.title,
      r.description,
      r.url,
      r.user_id,
      u.first_name,
      u.last_name,
      COUNT(v.id) AS upvotes
    FROM resources r
    JOIN users u
      ON u.id = r.user_id
    LEFT JOIN votes v
      ON v.table_id = 2 AND r.id = v.post_id
    GROUP BY r.id, u.first_name, u.last_name
    ORDER BY upvotes DESC;

  `).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});

// eslint-disable-next-line
app.use((err, req, res, next) => {
  console.log('****SERVER ERROR****\n', err);
  let message = 'internal server error';
  if(err.message) message = err.message;
  else if(typeof err === 'string') message = err;
  res.status(500).send({ message });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log('server running on port', PORT));