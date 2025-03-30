const { Pool } = require('pg');
const config = require('config');

const pool = new Pool({
  ...config.get('db'),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
});

module.exports = pool;