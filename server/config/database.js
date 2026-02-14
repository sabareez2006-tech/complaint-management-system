const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes("render") ? { rejectUnauthorized: false } : false,
});


pool.on("connect", () => {
  // console.log("✅ Connected to PostgreSQL database"); 
  // Commented out to avoid spamming logs on every new client connection
});

// Test connection immediately
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err);
  } else {
    console.log("✅ Connected to PostgreSQL database successfully!");
  }
});

module.exports = pool;

