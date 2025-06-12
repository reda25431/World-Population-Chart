const mysql = require('mysql2/promise');

require('dotenv').config()

// const dbConfig = {
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'population_db',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     acquireTimeout: 60000,
//     timeout: 60000,
//     reconnect: true
// };

// const pool = mysql.createPool(dbConfig);
const pool = mysql.createPool(process.env.DATABASE_URL);

module.exports = pool;