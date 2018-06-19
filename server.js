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

app.get('/api/humor', (req, res, next) => {

  client.query(`
    SELECT * FROM humor;
  `).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});



//ADVICE

app.get('/api/advice', (req, res, next) => {

  client.query(`
    SELECT
      a.id,
      a.title,
      a.text,
      a.user_id AS auth_id,
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




// RESOURCES

app.get('/api/resources', (req, res, next) => {

  client.query(`
    SELECT
      r.id,
      r.title,
      r.description,
      r.url,
      r.user_id AS auth_id,
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





// RESOURCE CATEGORIES

app.get('/api/resources/:id', (req, res, next) => {

  client.query(`
    SELECT *

    FROM (SELECT
      r.id,
      r.title,
      r.description,
      r.url,
      r.user_id AS auth_id,
      r.category_id,
      u.first_name,
      u.last_name,
      COUNT(v.id) AS upvotes
      FROM resources r
      JOIN users u
        ON u.id = r.user_id
      LEFT JOIN votes v
        ON v.table_id = 2 AND r.id = v.post_id
      GROUP BY r.id, u.first_name, u.last_name
      ORDER BY upvotes DESC
    ) r
    
    JOIN resource_categories
        ON r.category_id = resource_categories.id
    
    WHERE r.category_id = $1;

  `,
  [req.params.id]
  ).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});




// WORKSPACES

app.get('/api/workspaces', (req, res, next) => {

  client.query(`
    SELECT
      w.id,
      w.title,
      w.workspace_type,
      w.address,
      w.description,
      w.url,
      w.user_id AS auth_id,
      u.first_name,
      u.last_name,
      COUNT(v.id) AS upvotes
    FROM workspaces w
    JOIN users u
      ON u.id = w.user_id
    LEFT JOIN votes v
      ON v.table_id = 3 AND w.id = v.post_id
    GROUP BY w.id, u.first_name, u.last_name
    ORDER BY upvotes DESC;

  `).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});





// SAVED

app.get('/api/saved/advice/:id', (req, res, next) => {

  client.query(`
    SELECT 
      s.id,
      s.user_id, 
      a.title,
      a.text, 
      a.first_name AS firstName, 
      a.last_name AS lastName,
      a.upvotes 

    FROM saved s
    
    JOIN (SELECT
      a.id AS advice_id,
      a.title,
      a.text,
      a.user_id AS author_id,
      u.first_name,
      u.last_name,
      COUNT(v.id) AS upvotes
      FROM advice a
      JOIN users u
        ON u.id = a.user_id
      LEFT JOIN votes v
        ON v.table_id = 1 AND a.id = v.post_id
      GROUP BY a.id, u.first_name, u.last_name
      ORDER BY upvotes DESC
    ) a
    
      ON s.table_id = 1 AND s.post_id = a.advice_id

    WHERE s.user_id = $1;

  `,
  [req.params.id]
  ).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});

app.get('/api/saved/resources/:id', (req, res, next) => {

  client.query(`
    SELECT 
      s.id,
      s.user_id, 
      r.title,
      r.description,
      r.url,
      r.first_name AS firstName, 
      r.last_name AS lastName,
      r.upvotes 

    FROM saved s
  
    JOIN (SELECT
      r.id AS resource_id,
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
      ORDER BY upvotes DESC
    ) r
    
      ON s.table_id = 2 AND s.post_id = r.resource_id

    WHERE s.user_id = $1;

  `,
  [req.params.id]
  ).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});

app.get('/api/saved/workspaces/:id', (req, res, next) => {

  client.query(`
    SELECT 
      s.id,
      s.user_id, 
      w.title,
      w.workspace_type AS workspaceType,
      w.address,  
      w.description,
      w.url,
      w.first_name AS firstName, 
      w.last_name AS lastName,
      w.upvotes 
    
    FROM saved s
    
    JOIN (SELECT
      w.id,
      w.title,
      w.workspace_type,
      w.address,
      w.description,
      w.url,
      w.user_id,
      u.first_name,
      u.last_name,
      COUNT(v.id) AS upvotes
      FROM workspaces w
      JOIN users u
        ON u.id = w.user_id
      LEFT JOIN votes v
        ON v.table_id = 3 AND w.id = v.post_id
      GROUP BY w.id, u.first_name, u.last_name
      ORDER BY upvotes DESC
    ) w
    
      ON s.table_id = 3 AND s.post_id = w.id 
    
    WHERE s.user_id = $1
  `,
  [req.params.id]
  ).then(result => {
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