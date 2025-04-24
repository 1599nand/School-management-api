// db.js
const { Pool } = require('pg');
require('dotenv').config();  // Load environment variables from .env file

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Use DATABASE_URL environment variable
  ssl: {
    rejectUnauthorized: false,  // Required for secure connection to Render's PostgreSQL database
  },
});

module.exports = pool;
