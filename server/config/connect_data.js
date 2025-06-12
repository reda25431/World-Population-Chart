// const mysql = require('mysql2/promise');

// require('dotenv').config()

// const pool = mysql.createPool(process.env.DATABASE_URL);

// module.exports = pool;
//-------------------------------------------------//
// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   ssl: {
//     rejectUnauthorized: true
//   }
// });

// module.exports = pool;
//-------------------------------------------------//
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  user: '3AxrLTJaEs3KqoC.root',
  password: 'W6XndzKcvXXe6lJc',
  database: 'population_db',
  port: 4000,
  ssl: {
    rejectUnauthorized: true
  }
});

module.exports = pool;


