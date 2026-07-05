import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'auth-db1493.hstgr.io',
  user: 'u810420317_intellentadmin',
  password: '321#$%$#!@#Rr',
  database: 'u810420317_seo_intellent',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function resetDb() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE monitored_domains;');
    await connection.query('TRUNCATE TABLE audit_history;');
    await connection.query('TRUNCATE TABLE posts;');
    await connection.query('TRUNCATE TABLE leads;');
    await connection.query('TRUNCATE TABLE uploads;');
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    connection.release();
    console.log('Database tables truncated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error truncating DB:', error);
    process.exit(1);
  }
}

resetDb();
