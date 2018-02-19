const { Pool, Client } = require('pg');
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: true // necessary for local development
});

function getJobStatus(id) {
  const statement = 'SELECT * FROM jobs WHERE id = $1';
  return pool.query(statement, [id]).then(
    result => {
      if (result.rows.length < 1) {
        throw new Error('Job not found');
      }
      return result.rows[0];
    },
    err => {
      // not sure what to do here?
      throw err;
    }
  );
}

function updateJob(id, newStatus, url) {
  const statement = 'UPDATE jobs SET status = $1, url = $2 WHERE id = $3';
  return pool.query(statement, [newStatus, url, id]);
}

function createJob(id) {
  const statement = 'INSERT INTO jobs VALUES($1, $2, $3)';
  return pool.query(statement, [id, 'pending', '']);
}

module.exports = { createJob, updateJob, getJobStatus };
