import mysql from 'mysql2/promise';

// Create a connection pool. This is more efficient than creating a new connection for every request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the pool so it can be used in your API routes
export default pool;