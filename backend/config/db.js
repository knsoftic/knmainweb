const mysql = require('mysql2/promise');
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

if (!dbHost || !dbPort || !dbUser || !dbPassword || !dbName) {
  console.error('FATAL ERROR: Database configuration is missing. Please check your .env file for DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME.');
  process.exit(1);
}

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then((conn) => {
    console.log('✅ Successfully connected to MySQL database on port', process.env.DB_PORT || 3306);
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MySQL database:', err.message);
  });

module.exports = {
  query: async (sql, values) => {
    const [results] = await pool.execute(sql, values);
    return results;
  },

  /**
   * Runs `work(query)` on one connection inside a transaction: every statement is committed
   * together, or none are (rolled back) if anything throws.
   */
  transaction: async (work) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(async (sql, values) => {
        const [rows] = await connection.execute(sql, values);
        return rows;
      });
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
};
