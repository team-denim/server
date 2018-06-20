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



// USERS

app.post('/api/auth/signup', (req, res, next) => {
  const body = req.body;
  const email = body.email;
  const password = body.password;
  console.log(body.firstName);
  if(!email || !password) {
    next('email and password are required');
  }

  client.query(`
    SELECT count(*) FROM users WHERE email = $1;
  `,
  [email])
    .then(result => {
      if(result.rows[0].count > 0) {
        throw new Error('Email already exists');
      }

      return client.query(`
      INSERT INTO users (first_name, last_name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, first_name, last_name, email;
      `,
      [body.firstName, body.lastName, email, password]);
    })
    .then(result => {
      const row = result.rows[0];
      res.send({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email
      });
    })
    .catch(next);
});


app.post('/api/auth/signin', (req, res, next) => {
  const body = req.body;
  const email = body.email;
  const password = body.password;

  if(!email || !password) {
    next('Email and password are required');
  }

  client.query(`
    SELECT 
      id, 
      email, 
      password, 
      first_name,
      last_name
    FROM users
    WHERE email = $1;
  `,
  [email]
  )
    .then(result => {
      const row = result.rows[0];
      if(!row || row.password !== password) {
        throw new Error('Invalid email or password');
      }
      res.send({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name
      });
    })
    .catch(next);    
});

app.get('/api/users/:id', (req, res, next) => {

  client.query(`
    SELECT
      first_name as "firstName",
      last_name as "lastName",
      linkedin,
      github_profile as "githubProfile",
      classwork_repo as "classworkRepo"
    FROM users
    WHERE id = $1;
  `,
  [req.params.id])
    .then (result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.put('/api/users/:id', (req, res, next) => {
  const body = req.body;

  client.query(`
    UPDATE users
    SET
      first_name = $1,
      last_name = $2,
      email = $3,
      linkedin = $4,
      github_profile = $5,
      classwork_repo = $6
    WHERE id = $7
    RETURNING 
      first_name AS firstName,
      last_name AS lastName,
      email,
      linkedin,
      github_profile AS githubProfile,
      classwork_repo AS classworkRepo;
  `,
  [body.firstName, body.lastName, body.email, body.linkedin, body.githubProfile, body.classworkRepo, req.params.id]
  ).then(result => {
    res.send(result.rows[0]);
  })
    .catch(next);
});






// HUMOR

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
      a.author_id AS "authorID",
      u.first_name AS "firstName",
      u.last_name AS "lastName",
      COUNT(v.id) AS upvotes
    FROM advice a
    JOIN users u
      ON u.id = a.author_id
    LEFT JOIN votes v
      ON v.table_id = 1 AND a.id = v.post_id
    GROUP BY a.id, u.first_name, u.last_name
    ORDER BY upvotes DESC;

  `).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});

app.post('/api/advice', (req, res, next) => {
  const body = req.body;
  client.query(`
    INSERT INTO advice (author_id, title, text)
    VALUES ($1, $2, $3)
    RETURNING *, author_id AS "authorID";
  `,
  [body.authorID, body.title, body.text])
    .then(result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.put('/api/advice/:id', (req, res, next) => {
  const body = req.body;
  client.query(`
    UPDATE advice
    SET
      title = $1,
      text = $2
    WHERE id = $3
    RETURNING *, author_id AS "authorID";
  `,
  [body.title, body.text, req.params.id])
    .then(result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.delete('/api/advice/:id', (req, res, next) => {
  client.query(`
    DELETE FROM advice
    WHERE id = $1
  `,
  [req.params.id])
    .then(() => {
      res.send({ deleted: true });
    })
    .catch(next);
});








// RESOURCES

app.get('/api/resources', (req, res, next) => {

  client.query(`
    SELECT
      r.id,
      r.category_id AS "categoryID",
      r.title,
      r.description,
      r.url,
      r.author_id AS "authorID",
      u.first_name AS "firstName",
      u.last_name AS "lastName",
      COUNT(v.id) AS upvotes
    FROM resources r
    JOIN users u
      ON u.id = r.author_id
    LEFT JOIN votes v
      ON v.table_id = 2 AND r.id = v.post_id
    GROUP BY r.id, u.first_name, u.last_name
    ORDER BY upvotes DESC;

  `).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});

app.post('/api/resources', (req, res, next) => {
  const body = req.body;
  client.query(`
    INSERT INTO resources (author_id, category_id, title, description, url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *, author_id AS "authorID", category_id AS "categoryID";
  `,
  [body.authorID, body.categoryID, body.title, body.description, body.url])
    .then(result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.put('/api/resources/:id', (req, res, next) => {
  const body = req.body;
  client.query(`
    UPDATE resources
    SET
      title = $1,
      description = $2,
      category_id = $3,
      url = $4
    WHERE id = $5
    RETURNING *, author_id AS "authorID", category_id AS "categoryID";
  `,
  [body.title, body.description, body.categoryID, body.url, req.params.id])
    .then(result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.delete('/api/resources/:id', (req, res, next) => {
  client.query(`
    DELETE FROM resources
    WHERE id = $1
  `,
  [req.params.id])
    .then(() => {
      res.send({ deleted: true });
    })
    .catch(next);
});





// WORKSPACES

app.get('/api/workspaces', (req, res, next) => {

  client.query(`
    SELECT
      w.id,
      w.title,
      w.workspace_type AS "workspaceType",
      w.address,
      w.description,
      w.url,
      w.author_id AS "authorID",
      u.first_name AS "firstName",
      u.last_name AS "lastName",
      COUNT(v.id) AS upvotes
    FROM workspaces w
    JOIN users u
      ON u.id = w.author_id
    LEFT JOIN votes v
      ON v.table_id = 3 AND w.id = v.post_id
    GROUP BY w.id, u.first_name, u.last_name
    ORDER BY upvotes DESC;

  `).then(result => {
    res.send(result.rows);
  })
    .catch(next);
});

app.post('/api/workspaces', (req, res, next) => {
  const body = req.body;
  client.query(`
    INSERT INTO workspaces (author_id, title, workspace_type, address, description, url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *, author_id AS "authorID", workspace_type AS "workspaceType";
  `,
  [body.authorID, body.title, body.workspaceType, body.address, body.description, body.url])
    .then(result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.put('/api/workspaces/:id', (req, res, next) => {
  const body = req.body;
  client.query(`
    UPDATE workspaces
    SET
      title = $1,
      workspace_type = $2,
      address = $3,
      description = $4,
      url = $5
    WHERE id = $6
    RETURNING *, author_id AS "authorID", workspace_type AS "workspaceType";
  `,
  [body.title, body.workspaceType, body.address, body.description, body.url, req.params.id])
    .then(result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.delete('/api/workspaces/:id', (req, res, next) => {
  client.query(`
    DELETE FROM workspaces
    WHERE id = $1
  `,
  [req.params.id])
    .then(() => {
      res.send({ deleted: true });
    })
    .catch(next);
});







// SAVED

app.post('/api/saved', (req, res, next) => {
  const body = req.body;
  client.query(`
    INSERT INTO saved (user_id, table_id, post_id)
    VALUES ($1, $2, $3)
    RETURNING
      user_id AS "userID",
      table_id AS "tableID",
      post_id AS "postID"
  `,
  [body.userID, body.tableID, body.postID])
    .then(result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.get('/api/saved/advice/:id', (req, res, next) => {

  client.query(`
    SELECT 
      s.id,
      s.user_id AS "userID", 
      a.author_id AS "authorID",
      a.title,
      a.text, 
      a.first_name AS "firstName", 
      a.last_name AS "lastName",
      a.upvotes 

    FROM saved s
    
    JOIN (SELECT
      a.id AS advice_id,
      a.title,
      a.text,
      a.author_id,
      u.first_name,
      u.last_name,
      COUNT(v.id) AS upvotes
      FROM advice a
      JOIN users u
        ON u.id = a.author_id
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
      s.user_id AS "userID",
      r.author_id AS "authorID",
      r.title,
      r.description,
      r.url,
      r.first_name AS "firstName", 
      r.last_name AS "lastName",
      r.upvotes 

    FROM saved s
  
    JOIN (SELECT
      r.id AS resource_id,
      r.title,
      r.description,
      r.url,
      r.author_id,
      u.first_name,
      u.last_name,
      COUNT(v.id) AS upvotes
      FROM resources r
      JOIN users u
        ON u.id = r.author_id
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
      s.user_id AS "userID", 
      w.author_id AS "authorID",
      w.title,
      w.workspace_type AS "workspaceType",
      w.address,  
      w.description,
      w.url,
      w.first_name AS "firstName", 
      w.last_name AS "lastName",
      w.upvotes 
    
    FROM saved s
    
    JOIN (SELECT
      w.id,
      w.title,
      w.workspace_type,
      w.address,
      w.description,
      w.url,
      w.author_id,
      u.first_name,
      u.last_name,
      COUNT(v.id) AS upvotes
      FROM workspaces w
      JOIN users u
        ON u.id = w.author_id
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







// COMMENTS

//GET a count of how many comments on each post for a specific table
app.get('/api/comments/:id', (req, res, next) => {
  client.query(`
    SELECT c.post_id,
      count(c.post_id) AS "commentCount"
    FROM comments c
    WHERE table_id = $1
    GROUP BY c.post_id;
  `,
  [req.params.id])
    .then(result => {
      res.send(result.rows);
    })
    .catch(next);
});



//GET all comments from a specific post from Advice
app.get('/api/comments/advice/:id', (req, res, next) => {

  client.query(`
    SELECT 
      c.id,
      c.text,
      c.author_id,
      u.first_name,
      u.last_name
    FROM comments c
    JOIN users u
      ON u.id = c.author_id
    WHERE table_id = 1 AND post_id = $1;
  `,
  [req.params.id])
    .then(result => {
      res.send(result.rows);
    })
    .catch(next);
});

app.get('/api/comments/resources/:id', (req, res, next) => {

  client.query(`
    SELECT 
      c.id,
      c.text,
      c.author_id,
      u.first_name,
      u.last_name
    FROM comments c
    JOIN users u
      ON u.id = c.author_id
    WHERE table_id = 2 AND post_id = $1;
  `,
  [req.params.id])
    .then(result => {
      res.send(result.rows);
    })
    .catch(next);
});

app.get('/api/comments/workspaces/:id', (req, res, next) => {

  client.query(`
    SELECT 
      c.id,
      c.text,
      c.author_id,
      u.first_name,
      u.last_name
    FROM comments c
    JOIN users u
      ON u.id = c.author_id
    WHERE table_id = 3 AND post_id = $1;
  `,
  [req.params.id])
    .then(result => {
      res.send(result.rows);
    })
    .catch(next);
});



app.post('/api/comments', (req, res, next) => {
  const body = req.body;
  client.query(`
    INSERT INTO comments (author_id, table_id, post_id, text)
    VALUES ($1, $2, $3, $4)
    RETURNING
      author_id AS "authorID",
      table_id AS "tableID",
      post_id AS "postID",
      text;
  `,
  [body.authorID, body.tableID, body.postID, body.text])
    .then(result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.put('/api/comments/:id', (req, res, next) => {
  const body = req.body;
  client.query(`
    UPDATE comments 
    SET
      text = $1
    WHERE id = $2
    RETURNING 
      id,
      author_id AS "authorID",
      table_id AS "tableID",
      post_id AS "postID",
      text;    
  `,
  [body.text, req.params.id])
    .then(result => {
      res.send(result.rows[0]);
    })
    .catch(next);
});

app.delete('/api/comments/:id', (req, res, next) => {

  client.query(`
    DELETE FROM comments

    WHERE id = $1;
  `,
  [req.params.id]
  ).then(() => {
    res.send({ removed: true });
  })
    .catch(next);
});





// VOTES

//GET all upvotes by user, id = user_id
app.get('/api/votes/:id', (req, res, next) => {
  client.query(`
    SELECT id,
      post_id AS "postID",
      user_id AS "userID"
    FROM votes
    WHERE user_id = $1;
  `,
  [req.params.id])
    .then(result => {
      res.send(result.rows);
    })
    .catch(next);
});

//POST a record of user's upvote
app.post('/api/votes', (req, res, next) => {
  const body = req.body;

  client.query(`
    INSERT INTO votes (user_id, table_id, post_id)
    VALUES ($1, $2, $3)
    RETURNING
      user_id AS "userID",
      table_id AS "tableID",
      post_id AS "postID";
  `,
  [body.userID, body.tableID, body.postID])
    .then(result => {
      const row = result.rows[0];
      res.send({
        id: row.id,
        userID: row.userID,
        tableID: row.tableID,
        postID: row.postID
      });
    })
    .catch(next);
});

//DELETE upvote by vote primary key
app.delete('/api/votes/:id', (req, res, next) => {

  client.query(`
    DELETE FROM votes
    WHERE id = $1;
  `,
  [req.params.id]
  ).then(() => {
    res.send({ removed: true });
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