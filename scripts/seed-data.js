require('dotenv').config();
const client = require('../db-client');
const users = require('./users.json');
const tables = require('./tables.json');
const advice = require('./advice.json');
const resources = require('./resources.json');
const humor = require('./humor.json');
const workspaces = require('./workspaces.json');
const votes = require('./votes.json');
const comments = require('./comments.json');
const saved = require('./saved.json');
const resourceCategories = require('./resource-categories.json');

Promise.all(
  users.map(user => {
    return client.query(`
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password,
          linkedin,
          github_profile,
          classwork_repo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
    [user.firstName, user.lastName, user.email, user.password, user.linkedin, user.githubProfile, user.classworkRepo]
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
              author_id, 
              title, 
              text
            )
            VALUES ($1, $2, $3);
        `,
        [a.authorID, a.title, a.text]
        ).then(result => result.rows[0]);
      })
    );
  })
  .then(() => {
    return Promise.all(
      resourceCategories.map(c => {
        return client.query(`
            INSERT INTO resource_categories (
              category       
            )
            VALUES ($1);
        `,
        [c.category]
        ).then(result => result.rows[0]);
      })
    );
  })
  .then(() => {
    return Promise.all(
      resources.map(resource => {
        return client.query(`
            INSERT INTO resources (
              author_id, 
              category_id,
              title, 
              description,
              url
            )
            VALUES ($1, $2, $3, $4, $5);
        `,
        [resource.authorID, resource.categoryID, resource.title, resource.description, resource.url]
        ).then(result => result.rows[0]);
      })
    );
  })
  .then(() => {
    return Promise.all(
      humor.map(image => {
        return client.query(`
            INSERT INTO humor (
              url
            )
            VALUES ($1);
        `,
        [image.url]
        ).then(result => result.rows[0]);
      })
    );
  })
  .then(() => {
    return Promise.all(
      workspaces.map(w => {
        return client.query(`
            INSERT INTO workspaces (
              author_id, 
              title, 
              workspace_type,
              address,
              description,
              url
            )
            VALUES ($1, $2, $3, $4, $5, $6);
        `,
        [w.authorID, w.title, w.workspaceType, w.address, w.description, w.url]
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
              author_id, 
              table_id,
              post_id,
              text
            )
            VALUES ($1, $2, $3, $4);
        `,
        [comment.authorID, comment.tableID, comment.postID, comment.text]
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