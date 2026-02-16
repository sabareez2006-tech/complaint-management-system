# 📦 Database — Complaint Management System

## Overview
This folder contains all the SQL queries used in the Complaint Management System.
These files are for **documentation and reference purposes only** — they are not executed directly.
The actual queries are run via the Node.js server using the `pg` (node-postgres) library.

---

## 📁 File Structure

| File | Description |
|------|-------------|
| `schema.sql` | All `CREATE TABLE` statements — defines the database structure |
| `queries.sql` | All application queries organized by module (Auth, Complaints, Analytics) |
| `seed.sql` | Default seed data (admin user) inserted on first run |

---

## 🗃️ Database Tables

| # | Table | Purpose |
|---|-------|---------|
| 1 | `users` | All registered users (students & admins) |
| 2 | `admin` | Dedicated admin table |
| 3 | `categories` | Predefined complaint categories |
| 4 | `complaints` | Core table — all student complaints |
| 5 | `status_history` | Audit trail of status changes |
| 6 | `feedback` | Detailed feedback with ratings |

---

## 🔗 Table Relationships

```
users (user_id)
  │
  ├──→ complaints (student_id → users.user_id)
  │     │
  │     ├──→ status_history (complaint_id → complaints.complaint_id)
  │     │
  │     └──→ feedback (complaint_id)
  │
  ├──→ complaints (assigned_to → users.user_id)
  │
  └──→ status_history (changed_by → users.user_id)

admin (admin_id) — Synced with users table on registration
```

---

## 🛠️ Tech Stack
- **Database**: PostgreSQL
- **Driver**: `pg` (node-postgres)
- **ORM**: None (raw SQL queries)
- **Connection**: Connection pool via `pg.Pool`

---

## ⚙️ Environment Variables
```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

---

## 📂 Where Queries Are Used

| File | Queries Used |
|------|-------------|
| `server/db_init.js` | Schema creation (CREATE TABLE) + Seed admin |
| `server/controllers/authController.js` | Register, Login |
| `server/controllers/complaintController.js` | CRUD Complaints, Status Updates, Analytics |
