// const client = require('../db-client');

// client.query(`
//     CREATE TABLE IF NOT EXISTS quadrants (
//       id SERIAL PRIMARY KEY,
//       name VARCHAR(256) NOT NULL,
//       direction VARCHAR(8) UNIQUE NOT NULL
//     );

// `)
//   .then(
//     () => console.log('create tables complete'),
//     err => console.log(err)
//   )
//   .then(() => {
//     client.end();
//   });