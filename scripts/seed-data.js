require('dotenv').config();
const client = require('../db-client');
const users = require('./users.json');
const tables = require('./tables.json');
const advice = require('./advice.json');
const votes = require('./votes.json');
const comments = require('./comments.json');
const saved = require('./saved.json');

Promise.all(
  users.map(user => {
    return client.query(`
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password,
          linkedin)
        VALUES ($1, $2, $3, $4, $5);
    `,
    [user.firstName, user.lastName, user.email, user.password, user.linkedin]
    ).then(result => result.rows[0]);
  })
)
  .then(() => {
    return Promise.all(
      tables.map(table => {
        return client.query(`
            INSERT INTO tables (
              name
            )
            VALUES ($1);
        `,
        [table.name]
        ).then(result => result.rows[0]);
      })
    );
  })
  .then(() => {
    return Promise.all(
      advice.map(a => {
        return client.query(`
            INSERT INTO advice (
              user_id, 
              title, 
              text
            )
            VALUES ($1, $2, $3);
        `,
        [a.userID, a.title, a.text]
        ).then(result => result.rows[0]);
      })
    );
  })
  .then(() => {
    return Promise.all(
      votes.map(vote => {
        return client.query(`
            INSERT INTO votes (
              user_id, 
              table_id,
              post_id
            )
            VALUES ($1, $2, $3);
        `,
        [vote.userID, vote.tableID, vote.postID]
        ).then(result => result.rows[0]);
      })
    );
  })
  .then(() => {
    return Promise.all(
      comments.map(comment => {
        return client.query(`
            INSERT INTO comments (
              user_id, 
              table_id,
              post_id,
              text
            )
            VALUES ($1, $2, $3, $4);
        `,
        [comment.userID, comment.tableID, comment.postID, comment.text]
        ).then(result => result.rows[0]);
      })
    );
  })
  .then(() => {
    return Promise.all(
      saved.map(s => {
        return client.query(`
            INSERT INTO saved (
              user_id,
              table_id,
              post_id
            )
            VALUES ($1, $2, $3);
        `,
        [s.userID, s.tableID, s.postID]
        ).then(result => result.rows[0]);
      })
    );
  })

  .then(
    () => console.log('seed data load successful'),
    err => console.error(err)
  )
  .then(() => client.end());