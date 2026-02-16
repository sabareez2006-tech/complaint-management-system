-- ============================================================
--  COMPLAINT MANAGEMENT SYSTEM — DATABASE SCHEMA
--  Database: PostgreSQL
--  Description: All table creation queries used in the project
-- ============================================================


-- =========================
--  1. USERS TABLE
--  Stores all registered users (students & admins)
-- =========================
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin')),
    roll_number   VARCHAR(50) UNIQUE,
    department    VARCHAR(100),
    phone         VARCHAR(15),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active     BOOLEAN DEFAULT TRUE
);


-- =========================
--  2. ADMIN TABLE
--  Dedicated table for admin users
-- =========================
CREATE TABLE IF NOT EXISTS admin (
    admin_id    SERIAL PRIMARY KEY,
    name        VARCHAR(50),
    email       VARCHAR(50),
    password    VARCHAR(100),
    phone       VARCHAR(15),
    department  VARCHAR(50),
    role        VARCHAR(20),
    created_at  DATE DEFAULT CURRENT_DATE
);


-- =========================
--  3. CATEGORIES TABLE
--  Predefined complaint categories
-- =========================
CREATE TABLE IF NOT EXISTS categories (
    category_id    SERIAL PRIMARY KEY,
    category_name  VARCHAR(100) UNIQUE NOT NULL,
    description    TEXT,
    is_active      BOOLEAN DEFAULT TRUE,
    department     VARCHAR(50),
    priority_level VARCHAR(20),
    created_at     DATE DEFAULT CURRENT_DATE,
    updated_at     DATE DEFAULT CURRENT_DATE
);


-- =========================
--  4. COMPLAINTS TABLE
--  Core table storing all student complaints
-- =========================
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id  SERIAL PRIMARY KEY,
    student_id    INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title         VARCHAR(200) NOT NULL,
    description   TEXT NOT NULL,
    category      VARCHAR(50) NOT NULL,
    priority      VARCHAR(20) DEFAULT 'medium',
    status        VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    location      VARCHAR(200),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at   TIMESTAMP,
    assigned_to   INTEGER REFERENCES users(user_id),
    feedback      TEXT
);

-- Migration: Fix status constraint on existing databases
ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
ALTER TABLE complaints ADD CONSTRAINT complaints_status_check CHECK (status IN ('pending', 'in_progress', 'resolved'));


-- =========================
--  5. STATUS HISTORY TABLE
--  Tracks every status change for audit trail
-- =========================
CREATE TABLE IF NOT EXISTS status_history (
    history_id    SERIAL PRIMARY KEY,
    complaint_id  INTEGER REFERENCES complaints(complaint_id),
    old_status    VARCHAR(50),
    new_status    VARCHAR(50),
    changed_by    INTEGER REFERENCES users(user_id),
    changed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
--  6. FEEDBACK TABLE
--  Detailed feedback with ratings
-- =========================
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id    SERIAL PRIMARY KEY,
    complaint_id   INTEGER,
    user_id        INTEGER,
    rating         INTEGER,
    comments       VARCHAR(100),
    feedback_date  DATE DEFAULT CURRENT_DATE,
    response       VARCHAR(100),
    status         VARCHAR(20)
);
