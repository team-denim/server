require('dotenv').config();
const client = require('../db-client');

client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(32) NOT NULL,
      last_name VARCHAR(32) NOT NULL,
      email VARCHAR(64) UNIQUE NOT NULL,
      password VARCHAR(64) NOT NULL,
      linkedin VARCHAR(128)
    );

    CREATE TABLE IF NOT EXISTS humor (
      id SERIAL PRIMARY KEY,
      image_url VARCHAR(512) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS advice (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      text VARCHAR(1024) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      advice_id INTEGER NOT NULL REFERENCES advice(id)
    );

`)
  .then(
    () => console.log('create tables complete'),
    err => console.log(err)
  )
  .then(() => {
    client.end();
  });