import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

export function getDbPool() {
  if (!pool) {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      throw new Error(
        "MySQL Database configuration variables are missing. Please verify your DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME settings in .env.local."
      );
    }
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Reusable query executor
export async function query(sql, params) {
  const db = getDbPool();
  const [results] = await db.execute(sql, params);
  return results;
}
