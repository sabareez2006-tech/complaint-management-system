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


-- =========================
--  DEFAULT CATEGORIES
-- =========================

INSERT INTO categories (category_name, description, department, priority_level)
VALUES 
  ('Electrical', 'Electrical issues and maintenance', 'Maintenance', 'high'),
  ('Hostel', 'Hostel related complaints', 'Hostel Admin', 'medium'),
  ('Academic', 'Academic and course related issues', 'Academic', 'medium'),
  ('Transport', 'Transport and bus related issues', 'Transport', 'medium'),
  ('Canteen', 'Canteen and food related complaints', 'Canteen', 'low'),
  ('Library', 'Library services and resources', 'Library', 'low'),
  ('Lab', 'Lab equipment and facility issues', 'Lab Admin', 'high'),
  ('Other', 'Other general complaints', NULL, 'low')
ON CONFLICT (category_name) DO NOTHING;
