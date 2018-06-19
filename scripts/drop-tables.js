require('dotenv').config();
const client = require('../db-client');

client.query(`
DROP TABLE IF EXISTS saved;
DROP TABLE IF EXISTS humor;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS advice;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS resource_categories;
DROP TABLE IF EXISTS workspaces;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS users;
`)
  .then(
    () => console.log('drop tables complete'),
    err => console.log(err)
  )
  .then(() => {
    client.end();
  });