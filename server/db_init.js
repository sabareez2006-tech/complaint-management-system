const pool = require('./config/database');
const bcrypt = require('bcrypt');

const initDB = async () => {
    try {
        console.log("🔄 Initializing database tables...");

        // Create Users Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        full_name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create Complaints Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        complaint_id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(user_id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        priority VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create Default Admin if not exists
        const adminEmail = 'admin@college.edu';
        const adminCheck = await pool.query("SELECT * FROM users WHERE email = $1", [adminEmail]);

        if (adminCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(`
        INSERT INTO users (username, full_name, email, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', 'System Admin', adminEmail, hashedPassword, 'admin']);
            console.log("✅ Default admin account created: admin@college.edu / admin123");
        }

        console.log("✅ Database tables validated/created successfully!");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
    }
};

module.exports = initDB;
