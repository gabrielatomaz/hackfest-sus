const { Pool } = require('pg');

const connectionString = `postgresql://postgres:gabi@localhost:5432/postgres`;

const pool = new Pool({
    connectionString
});

module.exports = { pool };