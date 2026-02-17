-- ============================================================
--  COMPLAINT MANAGEMENT SYSTEM — APPLICATION QUERIES
--  Description: All SQL queries used in the application
--  Organized by module: Auth, Complaints, Categories, Feedback, Analytics
-- ============================================================


-- =========================================================
--  MODULE 1: AUTHENTICATION (authController.js)
-- =========================================================

-- 1.1 CHECK IF EMAIL ALREADY EXISTS (Register)
SELECT user_id FROM users WHERE email = $1;

-- 1.2 REGISTER NEW USER (Insert into users table)
INSERT INTO users (username, full_name, email, password_hash, role)
VALUES ($1, $2, $3, $4, $5)
RETURNING user_id, username, full_name, email, role;

-- 1.3 REGISTER ADMIN (Also insert into admin table)
INSERT INTO admin (name, email, password, role)
VALUES ($1, $2, $3, $4);

-- 1.4 LOGIN — FETCH USER BY EMAIL
SELECT * FROM users WHERE email = $1;


-- =========================================================
--  MODULE 2: COMPLAINTS (complaintController.js)
-- =========================================================

-- 2.1 CREATE NEW COMPLAINT
INSERT INTO complaints (student_id, title, description, category, priority)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- 2.2 GET MY COMPLAINTS (Student — filtered by student_id)
SELECT * FROM complaints
WHERE student_id = $1
ORDER BY created_at DESC;

-- 2.3 GET ALL COMPLAINTS (Admin — all complaints)
SELECT * FROM complaints
ORDER BY created_at DESC;

-- 2.4 GET CURRENT STATUS (Before updating — for history tracking)
SELECT status FROM complaints WHERE complaint_id = $1;

-- 2.5 UPDATE COMPLAINT STATUS — MARK AS RESOLVED
UPDATE complaints
SET status = $1, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
WHERE complaint_id = $2
RETURNING *;

-- 2.6 UPDATE COMPLAINT STATUS — MARK AS PENDING / IN PROGRESS
UPDATE complaints
SET status = $1, resolved_at = NULL, updated_at = CURRENT_TIMESTAMP
WHERE complaint_id = $2
RETURNING *;

-- 2.7 RECORD STATUS CHANGE IN HISTORY
INSERT INTO status_history (complaint_id, old_status, new_status, changed_by)
VALUES ($1, $2, $3, $4);

-- 2.8 ADD FEEDBACK TO COMPLAINT (Student — only if complaint belongs to them)
UPDATE complaints
SET feedback = $1
WHERE complaint_id = $2 AND student_id = $3
RETURNING *;

-- 2.9 INSERT FEEDBACK INTO FEEDBACK TABLE (Detailed tracking)
INSERT INTO feedback (complaint_id, user_id, rating, comments, status)
VALUES ($1, $2, $3, $4, $5);


-- =========================================================
--  MODULE 3: CATEGORIES (complaintController.js)
-- =========================================================

-- 3.1 GET ALL ACTIVE CATEGORIES
SELECT * FROM categories WHERE is_active = TRUE ORDER BY category_name ASC;

-- 3.2 ADD NEW CATEGORY (Admin)
INSERT INTO categories (category_name, description, department, priority_level)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- 3.3 UPDATE CATEGORY (Admin)
UPDATE categories
SET category_name = COALESCE($1, category_name),
    description = COALESCE($2, description),
    department = COALESCE($3, department),
    priority_level = COALESCE($4, priority_level),
    is_active = COALESCE($5, is_active),
    updated_at = CURRENT_DATE
WHERE category_id = $6
RETURNING *;

-- 3.4 DELETE CATEGORY — SOFT DELETE (Admin)
UPDATE categories SET is_active = FALSE, updated_at = CURRENT_DATE
WHERE category_id = $1 RETURNING *;


-- =========================================================
--  MODULE 4: FEEDBACK (complaintController.js)
-- =========================================================

-- 4.1 GET ALL FEEDBACK WITH DETAILS (Admin)
SELECT f.*, c.title as complaint_title, u.full_name as user_name
FROM feedback f
LEFT JOIN complaints c ON f.complaint_id = c.complaint_id
LEFT JOIN users u ON f.user_id = u.user_id
ORDER BY f.feedback_date DESC;

-- 4.2 FEEDBACK STATS (Analytics)
SELECT COUNT(*) as total, AVG(rating) as avg_rating
FROM feedback WHERE rating IS NOT NULL;


-- =========================================================
--  MODULE 5: ANALYTICS (complaintController.js — getAnalytics)
-- =========================================================

-- 5.1 TOTAL COMPLAINT COUNT
SELECT COUNT(*) AS total FROM complaints;

-- 5.2 COUNT BY STATUS (pending, in_progress, resolved)
SELECT status, COUNT(*) AS count
FROM complaints
GROUP BY status;

-- 5.3 COUNT BY CATEGORY
SELECT category, COUNT(*) AS count
FROM complaints
GROUP BY category
ORDER BY count DESC;

-- 5.4 COUNT BY PRIORITY (high, medium, low)
SELECT priority, COUNT(*) AS count
FROM complaints
GROUP BY priority;

-- 5.5 RECENT COMPLAINTS — LAST 7 DAYS TIMELINE
SELECT DATE(created_at) AS date, COUNT(*) AS count
FROM complaints
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;

-- 5.6 AVERAGE RESOLUTION TIME (in hours)
SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_hours
FROM complaints
WHERE status = 'resolved' AND resolved_at IS NOT NULL;


-- =========================================================
--  MODULE 6: DATABASE INITIALIZATION (db_init.js)
-- =========================================================

-- 6.1 CHECK IF DEFAULT ADMIN EXISTS
SELECT * FROM users WHERE email = $1;

-- 6.2 CHECK IF ADMIN EXISTS IN ADMIN TABLE
SELECT * FROM admin WHERE email = $1;

-- 6.3 SEED DEFAULT CATEGORIES (if categories table is empty)
SELECT COUNT(*) FROM categories;
INSERT INTO categories (category_name, description, department, priority_level)
VALUES ($1, $2, $3, $4)
ON CONFLICT (category_name) DO NOTHING;
