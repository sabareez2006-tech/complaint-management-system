-- ============================================================
--  COMPLAINT MANAGEMENT SYSTEM — SEED DATA
--  Description: Default data inserted on first run
-- ============================================================


-- =========================
--  DEFAULT ADMIN USER
--  Credentials: admin@college.edu / admin123
-- =========================

-- Insert into users table
INSERT INTO users (username, full_name, email, password_hash, role)
VALUES ('admin', 'System Admin', 'admin@college.edu', '<bcrypt_hashed_password>', 'admin');

-- Insert into admin table
INSERT INTO admin (name, email, password, role)
VALUES ('System Admin', 'admin@college.edu', '<bcrypt_hashed_password>', 'admin');
