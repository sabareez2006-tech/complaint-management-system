const pool = require('./config/database');
const bcrypt = require('bcrypt');

const initDB = async () => {
    try {
        console.log("🔄 Initializing database tables...");

        // 1. Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin')),
                roll_number VARCHAR(50) UNIQUE,
                department VARCHAR(100),
                phone VARCHAR(15),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            );
        `);

        // 2. Create Categories Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                category_id SERIAL PRIMARY KEY,
                category_name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                department VARCHAR(50),
                priority_level VARCHAR(20),
                created_at DATE DEFAULT CURRENT_DATE,
                updated_at DATE DEFAULT CURRENT_DATE
            );
        `);

        // 3. Create Admin Table (Optional, if used separately)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin (
                admin_id SERIAL PRIMARY KEY,
                name VARCHAR(50),
                email VARCHAR(50),
                password VARCHAR(100),
                phone VARCHAR(15),
                department VARCHAR(50),
                role VARCHAR(20),
                created_at DATE DEFAULT CURRENT_DATE
            );
        `);

        // 4. Create Complaints Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                complaint_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                category VARCHAR(50) NOT NULL,
                priority VARCHAR(20) DEFAULT 'medium',
                status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
                location VARCHAR(200),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP,
                assigned_to INTEGER REFERENCES users(user_id),
                feedback TEXT
            );
        `);

        // Fix status constraint on existing databases (add 'in_progress' if missing)
        try {
            await pool.query(`ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check`);
            await pool.query(`ALTER TABLE complaints ADD CONSTRAINT complaints_status_check CHECK (status IN ('pending', 'in_progress', 'resolved'))`);
        } catch (e) {
            console.warn("Status constraint update skipped:", e.message);
        }

        // Ensure feedback column exists on complaints table (migration for older databases)
        try {
            await pool.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS feedback TEXT`);
            console.log("✅ Feedback column verified on complaints table");
        } catch (e) {
            console.warn("Feedback column migration skipped:", e.message);
        }

        // 5. Create Status History Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS status_history (
                history_id SERIAL PRIMARY KEY,
                complaint_id INTEGER REFERENCES complaints(complaint_id),
                old_status VARCHAR(50),
                new_status VARCHAR(50),
                changed_by INTEGER REFERENCES users(user_id),
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 6. Create Feedback Table (Detailed feedback)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedback (
                feedback_id SERIAL PRIMARY KEY,
                complaint_id INTEGER,
                user_id INTEGER,
                rating INTEGER,
                comments VARCHAR(100),
                feedback_date DATE DEFAULT CURRENT_DATE,
                response VARCHAR(100),
                status VARCHAR(20)
            );
        `);

        // Seed Default Admin
        const adminEmail = 'admin@college.edu';
        const adminCheck = await pool.query("SELECT * FROM users WHERE email = $1", [adminEmail]);

        if (adminCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(`
                INSERT INTO users (username, full_name, email, password_hash, role)
                VALUES ($1, $2, $3, $4, $5)
            `, ['admin', 'System Admin', adminEmail, hashedPassword, 'admin']);

            // Also insert into admin table
            const adminExists = await pool.query("SELECT * FROM admin WHERE email = $1", [adminEmail]);
            if (adminExists.rows.length === 0) {
                await pool.query(`
                  INSERT INTO admin (name, email, password, role)
                  VALUES ($1, $2, $3, $4)
              `, ['System Admin', adminEmail, hashedPassword, 'admin']);
            }

            console.log("✅ Default admin account created: admin@college.edu / admin123");
        }

        // Seed default categories if none exist
        const catCheck = await pool.query("SELECT COUNT(*) FROM categories");
        if (parseInt(catCheck.rows[0].count) === 0) {
            const defaultCategories = [
                { name: 'Electrical', description: 'Electrical issues and maintenance', department: 'Maintenance', priority: 'high' },
                { name: 'Hostel', description: 'Hostel related complaints', department: 'Hostel Admin', priority: 'medium' },
                { name: 'Academic', description: 'Academic and course related issues', department: 'Academic', priority: 'medium' },
                { name: 'Transport', description: 'Transport and bus related issues', department: 'Transport', priority: 'medium' },
                { name: 'Canteen', description: 'Canteen and food related complaints', department: 'Canteen', priority: 'low' },
                { name: 'Library', description: 'Library services and resources', department: 'Library', priority: 'low' },
                { name: 'Lab', description: 'Lab equipment and facility issues', department: 'Lab Admin', priority: 'high' },
                { name: 'Other', description: 'Other general complaints', department: null, priority: 'low' },
            ];

            for (const cat of defaultCategories) {
                await pool.query(
                    `INSERT INTO categories (category_name, description, department, priority_level)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (category_name) DO NOTHING`,
                    [cat.name, cat.description, cat.department, cat.priority]
                );
            }
            console.log("✅ Default categories seeded successfully!");
        }

        console.log("✅ Database tables validated/created successfully!");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
    }
};

module.exports = initDB;
