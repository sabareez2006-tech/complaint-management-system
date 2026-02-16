# 🎓 Complaint Management System — Complete Project Review Guide

---

## 📌 1. Project Overview

This is a **Student Grievance/Complaint Management System** for a college. It allows **students** to submit complaints (hostel, academic, electrical, etc.) and **admins** to manage, track, and resolve those complaints. The project has **3 parts**:

| Part | Technology | Purpose |
|------|-----------|---------|
| **Frontend (Web)** | React.js | Web interface for students & admins |
| **Backend (API)** | Node.js + Express.js | REST API server handling all logic |
| **Database** | PostgreSQL | Stores all persistent data |
| **Mobile App** | Flutter (Dart) | Mobile interface for the system |

---

## 📁 2. Project Folder Structure

```
complaint-system/
├── client/              → React.js Frontend (Web App)
│   ├── src/
│   │   ├── components/  → Reusable UI components (Toast)
│   │   ├── pages/       → All page components (Login, Register, Admin, etc.)
│   │   ├── services/    → API configuration (Axios)
│   │   ├── App.js       → Main app component (routing/views)
│   │   ├── App.css      → All styles
│   │   └── index.js     → React entry point
│   └── package.json     → Client dependencies
│
├── server/              → Node.js + Express Backend
│   ├── config/
│   │   └── database.js  → PostgreSQL connection pool setup
│   ├── controllers/
│   │   ├── authController.js      → Register & Login logic
│   │   └── complaintController.js → CRUD + Analytics logic
│   ├── middleware/
│   │   └── auth.js      → JWT token verification & admin check
│   ├── routes/
│   │   ├── auth.js      → Auth API routes (/register, /login)
│   │   └── complaints.js → Complaint API routes
│   ├── db_init.js       → Creates all tables + seeds default admin
│   ├── server.js        → Main Express server entry point
│   ├── .env             → Environment variables (DB config, JWT secret)
│   └── package.json     → Server dependencies
│
├── database/            → SQL documentation folder
│   ├── schema.sql       → All CREATE TABLE statements
│   ├── queries.sql      → All SQL queries used in the app
│   └── seed.sql         → Default admin seed data
│
├── complaint_app/       → Flutter Mobile App
│   ├── lib/
│   │   ├── main.dart    → App entry point
│   │   ├── screens/     → Mobile UI screens
│   │   ├── services/    → API service layer
│   │   └── theme/       → App theming
│   └── pubspec.yaml     → Flutter dependencies
│
└── package.json         → Root-level deployment scripts
```

---

## 🛠️ 3. Technologies Used — What & Why

### **Backend Technologies**

| Package | Version | What It Is | Why It Is Used |
|---------|---------|-----------|----------------|
| **Express.js** | 5.2.1 | Web framework for Node.js | Creates the REST API server, handles HTTP requests, defines routes. It's lightweight, fast, and the most popular Node.js framework |
| **pg** (node-postgres) | 8.17.1 | PostgreSQL client for Node.js | Connects to the PostgreSQL database and executes SQL queries. Uses a **connection pool** for efficient database access |
| **bcrypt** | 6.0.0 | Password hashing library | Securely hashes passwords before storing in DB. Uses **salt rounds (10)** to make brute-force attacks difficult |
| **jsonwebtoken (JWT)** | 9.0.3 | Token-based authentication | Generates and verifies JWT tokens for user sessions. Token is valid for **1 day** and contains `userId` and `role` |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing | Allows the React frontend (port 3000) to make API calls to the backend (port 4000) without browser blocking |
| **dotenv** | 17.2.3 | Environment variable loader | Loads sensitive config (DB password, JWT secret) from `.env` file so they're not hardcoded in source code |
| **body-parser** | 2.2.2 | Request body parser | Parses incoming JSON request bodies so `req.body` is available in controllers |
| **nodemon** | 3.1.11 (dev) | Auto-restart server | Automatically restarts the server when code changes during development |

### **Frontend Technologies (Web)**

| Package | Version | What It Is | Why It Is Used |
|---------|---------|-----------|----------------|
| **React** | 19.2.3 | UI library by Facebook | Builds the interactive user interface with components. Uses **hooks** (useState, useEffect) for state management |
| **react-dom** | 19.2.3 | React DOM renderer | Renders React components into the browser DOM |
| **react-scripts** | 5.0.1 | Create React App build tools | Provides dev server, build pipeline, Webpack, Babel — all pre-configured |
| **axios** | 1.13.2 | HTTP client | Makes API calls from frontend to backend. Supports **interceptors** to automatically attach JWT token to every request |

### **Mobile App Technologies (Flutter)**

| Package | Version | What It Is | Why It Is Used |
|---------|---------|-----------|----------------|
| **Flutter SDK** | 3.10.8+ | Cross-platform mobile framework | Builds iOS & Android apps from a single Dart codebase |
| **http** | 1.6.0 | HTTP package for Dart | Makes API calls from the mobile app to the backend |
| **shared_preferences** | 2.5.4 | Local storage for mobile | Stores JWT token and user data locally on the phone (like localStorage in web) |
| **google_fonts** | 8.0.1 | Google Fonts for Flutter | Uses custom typography (modern fonts) in the mobile app |

---

## 🔐 4. Authentication Flow — How Login/Register Works

```
┌──────────────┐         ┌───────────────┐         ┌────────────────┐
│   Frontend   │ ──────► │  Backend API  │ ──────► │   PostgreSQL   │
│   (React)    │ ◄────── │  (Express)    │ ◄────── │   Database     │
└──────────────┘         └───────────────┘         └────────────────┘
```

### **Registration Flow:**
1. User fills form → React sends `POST /api/auth/register` with `{full_name, email, password, role}`
2. Backend checks if email already exists (`SELECT user_id FROM users WHERE email = $1`)
3. Password is **hashed** using `bcrypt.hash(password, 10)` — the `10` is salt rounds
4. User is inserted into the `users` table with hashed password
5. If role is "admin", also inserted into the `admin` table
6. Returns `201 Created` with user data

### **Login Flow:**
1. User enters credentials → React sends `POST /api/auth/login` with `{email, password}`
2. Backend fetches user by email from DB
3. Compares entered password with stored hash using `bcrypt.compare()`
4. If match → creates a **JWT token** using `jwt.sign({userId, role}, JWT_SECRET, {expiresIn: '1d'})`
5. Token + user info sent back to frontend
6. Frontend stores `token`, `role`, `userName` in **localStorage**
7. Page reloads, and `App.js` reads localStorage to show the correct dashboard

### **JWT Token Protection (Middleware):**
- Every protected API call sends the token in the header: `Authorization: Bearer <token>`
- The `verifyToken` middleware in `middleware/auth.js`:
  - Extracts the token from the header
  - Verifies it with `jwt.verify(token, JWT_SECRET)`
  - Attaches decoded `{userId, role}` to `req.user`
- The `isAdmin` middleware checks if `req.user.role === "admin"` for admin-only routes

---

## 💾 5. DATABASE — In Complete Detail

### **Database Type: PostgreSQL**

**Why PostgreSQL?**
- It's a powerful, open-source **relational database** (RDBMS)
- Supports **ACID transactions** (Atomicity, Consistency, Isolation, Durability) — data is always safe
- Has advanced features like `SERIAL` for auto-increment, `CHECK` constraints, foreign keys
- Works great with Node.js via the `pg` library
- Free to host on cloud platforms like **Render**

### **Connection Setup (`config/database.js`)**

```javascript
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host, port, user, password, database }
);
```

- Uses **Connection Pool** pattern — maintains multiple reusable database connections instead of creating a new one for each query (much faster)
- Supports **two modes**:
  - **Local**: Uses individual env vars (`DB_HOST=localhost`, `DB_PORT=5432`, etc.)
  - **Cloud (Render)**: Uses a single `DATABASE_URL` connection string with SSL enabled

### **Environment Variables (`.env`)**

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | 4000 | Server port |
| `DB_HOST` | localhost | Database host |
| `DB_PORT` | 5432 | PostgreSQL default port |
| `DB_USER` | postgres | Database user |
| `DB_PASSWORD` | **** | Database password |
| `DB_NAME` | complaint_system | Database name |
| `JWT_SECRET` | **** | Secret key for signing JWT tokens |

---

### **📊 Database Schema — All 6 Tables Explained**

#### **Table 1: `users` — Stores all registered users (students & admins)**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `user_id` | SERIAL (auto-increment) | PRIMARY KEY | Unique identifier for each user |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Username (set = email) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `full_name` | VARCHAR(100) | NOT NULL | User's display name |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Login email |
| `role` | VARCHAR(20) | NOT NULL, CHECK ('student','admin') | Determines access level |
| `roll_number` | VARCHAR(50) | UNIQUE | Student roll number |
| `department` | VARCHAR(100) | — | Student's department |
| `phone` | VARCHAR(15) | — | Contact number |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration date/time |
| `is_active` | BOOLEAN | DEFAULT TRUE | Soft-delete flag |

**Why this table?** This is the **core table** — every user (student or admin) is stored here. The `role` column with a `CHECK` constraint ensures only valid roles exist. The `SERIAL` type auto-generates IDs. `UNIQUE` on email prevents duplicate accounts.

**Key Constraints:**
- `PRIMARY KEY` on `user_id` → Uniquely identifies each row
- `UNIQUE` on `username`, `email`, `roll_number` → No duplicates allowed
- `NOT NULL` on `username`, `password_hash`, `full_name`, `email`, `role` → These fields are mandatory
- `CHECK (role IN ('student', 'admin'))` → Only two valid roles
- `DEFAULT CURRENT_TIMESTAMP` on `created_at` → Automatically records when user registered
- `DEFAULT TRUE` on `is_active` → New users are active by default

---

#### **Table 2: `admin` — Dedicated admin table**

| Column | Type | Purpose |
|--------|------|---------|
| `admin_id` | SERIAL PRIMARY KEY | Auto-generated admin ID |
| `name` | VARCHAR(50) | Admin name |
| `email` | VARCHAR(50) | Admin email |
| `password` | VARCHAR(100) | Hashed password |
| `phone` | VARCHAR(15) | Contact |
| `department` | VARCHAR(50) | Admin's department |
| `role` | VARCHAR(20) | Role |
| `created_at` | DATE | Registration date |

**Why this table?** Separate admin tracking table. When an admin registers, they're inserted into **both** the `users` table (for authentication) and this `admin` table (for admin-specific data).

---

#### **Table 3: `categories` — Predefined complaint categories**

| Column | Type | Purpose |
|--------|------|---------|
| `category_id` | SERIAL PRIMARY KEY | Auto-generated |
| `category_name` | VARCHAR(100) UNIQUE NOT NULL | e.g., "Hostel", "Academic" |
| `description` | TEXT | Category description |
| `is_active` | BOOLEAN DEFAULT TRUE | Enable/disable categories |
| `department` | VARCHAR(50) | Associated department |
| `priority_level` | VARCHAR(20) | Default priority |
| `created_at` | DATE | Creation date |
| `updated_at` | DATE | Last updated |

**Why this table?** Stores predefined complaint categories. Currently, categories are hardcoded in the frontend (`Electrical, Hostel, Academic, Transport, Canteen, Library, Lab, Other`), but this table allows dynamic category management in future.

---

#### **Table 4: `complaints` — ⭐ Core table storing all student complaints**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `complaint_id` | SERIAL | PRIMARY KEY | Unique complaint number |
| `student_id` | INTEGER | REFERENCES users(user_id) ON DELETE CASCADE | Links to the student who filed it |
| `title` | VARCHAR(200) | NOT NULL | Brief complaint title |
| `description` | TEXT | NOT NULL | Detailed complaint description |
| `category` | VARCHAR(50) | NOT NULL | Complaint category (hostel, academic, etc.) |
| `priority` | VARCHAR(20) | DEFAULT 'medium' | low / medium / high |
| `status` | VARCHAR(30) | DEFAULT 'pending' | pending / in_progress / resolved |
| `location` | VARCHAR(200) | — | Where the issue occurred |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When complaint was filed |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modified time |
| `resolved_at` | TIMESTAMP | — | When marked as resolved |
| `assigned_to` | INTEGER | REFERENCES users(user_id) | Admin assigned to handle it |
| `feedback` | TEXT | — | Student's feedback after resolution |

**Why this table?** This is the **most important table**. Key design decisions:
- **`REFERENCES users(user_id) ON DELETE CASCADE`** — if a user is deleted, their complaints are automatically deleted (referential integrity)
- **`status` column** tracks the lifecycle: `pending → in_progress → resolved`
- **`resolved_at`** is set only when status changes to "resolved", and reset to `NULL` if changed back
- **`updated_at`** is updated on every status change to track activity
- **`feedback`** allows students to rate the resolution

**Relationships:**
- `student_id` → **Foreign Key** to `users.user_id` (many complaints belong to one student)
- `assigned_to` → **Foreign Key** to `users.user_id` (one admin can be assigned)
- `ON DELETE CASCADE` → If the student is deleted, all their complaints are automatically removed

---

#### **Table 5: `status_history` — Audit trail for status changes**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `history_id` | SERIAL | PRIMARY KEY | Auto-generated |
| `complaint_id` | INTEGER | REFERENCES complaints(complaint_id) | Which complaint |
| `old_status` | VARCHAR(50) | — | Previous status |
| `new_status` | VARCHAR(50) | — | New status |
| `changed_by` | INTEGER | REFERENCES users(user_id) | Admin who made the change |
| `changed_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When the change happened |

**Why this table?** This table provides an **audit trail**. Every time an admin changes a complaint's status (e.g., pending → in_progress), a record is logged here with who did it and when. This is important for **accountability and transparency**.

**Relationships:**
- `complaint_id` → **Foreign Key** to `complaints.complaint_id`
- `changed_by` → **Foreign Key** to `users.user_id`

---

#### **Table 6: `feedback` — Detailed feedback with ratings**

| Column | Type | Purpose |
|--------|------|---------|
| `feedback_id` | SERIAL PRIMARY KEY | Auto-generated |
| `complaint_id` | INTEGER | Which complaint |
| `user_id` | INTEGER | Who gave feedback |
| `rating` | INTEGER | Star rating (1-5) |
| `comments` | VARCHAR(100) | Written feedback |
| `feedback_date` | DATE | When submitted |
| `response` | VARCHAR(100) | Admin response to feedback |
| `status` | VARCHAR(20) | Feedback status |

**Why this table?** Detailed feedback system beyond the simple text feedback in the complaints table. Allows **ratings** and **admin responses** to feedback.

---

### **Database Relationships (ER Summary)**

```
users (1) ──────< (many) complaints        → One student can file many complaints
users (1) ──────< (many) status_history     → One admin can make many status changes
complaints (1) ──< (many) status_history    → One complaint can have many status changes
complaints (1) ──< (many) feedback          → One complaint can have multiple feedback entries
```

---

### **Database Initialization (`db_init.js`)**

When the server starts:
1. All 6 tables are created using `CREATE TABLE IF NOT EXISTS` — safe to run multiple times, won't duplicate tables
2. Checks if a default admin exists (`admin@college.edu`)
3. If not, creates one with password `admin123` (bcrypt hashed)
4. Inserts into both `users` and `admin` tables
5. Logs success/failure messages to the console

---

### **All SQL Queries Used in the Application**

| # | Operation | SQL Query | Used In |
|---|-----------|-----------|---------|
| 1 | Check duplicate email | `SELECT user_id FROM users WHERE email = $1` | Register |
| 2 | Register user | `INSERT INTO users (...) VALUES ($1,$2,$3,$4,$5) RETURNING *` | Register |
| 3 | Register admin | `INSERT INTO admin (...) VALUES ($1,$2,$3,$4)` | Register |
| 4 | Login | `SELECT * FROM users WHERE email = $1` | Login |
| 5 | Create complaint | `INSERT INTO complaints (...) VALUES ($1,$2,$3,$4,$5) RETURNING *` | Student |
| 6 | Get my complaints | `SELECT * FROM complaints WHERE student_id = $1 ORDER BY created_at DESC` | Student |
| 7 | Get all complaints | `SELECT * FROM complaints ORDER BY created_at DESC` | Admin |
| 8 | Get current status | `SELECT status FROM complaints WHERE complaint_id = $1` | Admin |
| 9 | Update status (resolved) | `UPDATE complaints SET status=$1, resolved_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE complaint_id=$2 RETURNING *` | Admin |
| 10 | Update status (other) | `UPDATE complaints SET status=$1, resolved_at=NULL, updated_at=CURRENT_TIMESTAMP WHERE complaint_id=$2 RETURNING *` | Admin |
| 11 | Log status change | `INSERT INTO status_history (complaint_id, old_status, new_status, changed_by) VALUES ($1,$2,$3,$4)` | Admin |
| 12 | Add feedback | `UPDATE complaints SET feedback=$1 WHERE complaint_id=$2 AND student_id=$3 RETURNING *` | Student |
| 13 | Total count | `SELECT COUNT(*) as total FROM complaints` | Analytics |
| 14 | Count by status | `SELECT status, COUNT(*) as count FROM complaints GROUP BY status` | Analytics |
| 15 | Count by category | `SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC` | Analytics |
| 16 | Count by priority | `SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority` | Analytics |
| 17 | Recent 7 days | `SELECT DATE(created_at) as date, COUNT(*) as count FROM complaints WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date ASC` | Analytics |
| 18 | Avg resolution time | `SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours FROM complaints WHERE status = 'resolved' AND resolved_at IS NOT NULL` | Analytics |

**Note on `$1, $2...` (Parameterized Queries):** These are **prepared statements**. Instead of putting values directly in SQL (which risks **SQL injection attacks**), the values are passed separately. PostgreSQL safely escapes them.

---

## 🌐 6. API Routes — All Endpoints

| Method | Endpoint | Auth Required | Admin Only | Purpose |
|--------|----------|:------------:|:---------:|---------|
| `POST` | `/api/auth/register` | ❌ | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | ❌ | Login and get JWT token |
| `POST` | `/api/complaints` | ✅ `verifyToken` | ❌ | Submit a new complaint |
| `GET` | `/api/complaints/my-complaints` | ✅ `verifyToken` | ❌ | Get student's own complaints |
| `PUT` | `/api/complaints/:id/feedback` | ✅ `verifyToken` | ❌ | Add feedback to resolved complaint |
| `GET` | `/api/complaints` | ✅ `verifyToken` | ✅ `isAdmin` | Get ALL complaints |
| `GET` | `/api/complaints/analytics` | ✅ `verifyToken` | ✅ `isAdmin` | Get analytics dashboard data |
| `PUT` | `/api/complaints/:id/status` | ✅ `verifyToken` | ✅ `isAdmin` | Update complaint status |
| `GET` | `/api/health` | ❌ | ❌ | Health check endpoint |

---

## 🖥️ 7. Frontend Pages — What Each Page Does

| Page | File | What It Does |
|------|------|-------------|
| **Landing** | `Landing.js` | Homepage with hero section, info cards ("Raise Your Voice", "Privacy Guaranteed", "Quick Resolution"), and 4-step "How It Works" process |
| **Login** | `Login.js` | Email/password form → calls `/api/auth/login` → stores token in localStorage → reloads page |
| **Register** | `Register.js` | Full name, email, password, role dropdown → calls `/api/auth/register` |
| **Complaint Form** | `Complaint.js` | Title, description, category dropdown (8 options), priority (low/medium/high) → submits complaint. Dispatches custom event `complaintUpdated` to refresh the list |
| **Complaint List** | `ComplaintList.js` | Shows student's own complaints as expandable cards. Shows status badges, priority, time ago. If resolved → shows feedback input. Listens for `complaintUpdated` event |
| **Admin Panel** | `Admin.js` | Two tabs: **Complaints** (table with search, filter by status/priority, CSV export, detail modal) and **Analytics** |
| **Analytics** | `Analytics.js` | Animated stat cards (total, pending, in-progress, resolved), donut chart for resolution rate, avg resolution time, priority breakdown bars, category bars, status distribution bar |
| **Logout** | `Logout.js` | Clears localStorage and reloads page |
| **Toast** | `Toast.js` | Global notification system using React Context. Shows success/error/warning/info messages with auto-dismiss animation |

---

## 🔄 8. Complete Application Flow

```
User opens website
    │
    ├── Not logged in → Landing Page
    │       ├── Click "File a Complaint" → Register Page
    │       └── Click "Login" → Login Page
    │               │
    │               └── Enters credentials → POST /api/auth/login
    │                       │
    │                       ├── Invalid → Show error toast
    │                       └── Valid → Store JWT token → Reload → Dashboard
    │
    ├── Logged in as STUDENT
    │       ├── Left Panel: Submit Complaint Form
    │       │       └── Submit → POST /api/complaints → Success toast
    │       │                       → Dispatches "complaintUpdated" event
    │       │
    │       └── Right Panel: My Complaints List
    │               ├── Auto-fetches via GET /api/complaints/my-complaints
    │               ├── Click card → Expand to see description, timestamps
    │               └── If resolved → Show feedback input → PUT /:id/feedback
    │
    └── Logged in as ADMIN
            ├── Complaints Tab
            │       ├── Search bar (by title, category, ID)
            │       ├── Filter dropdowns (status, priority)
            │       ├── Export CSV button
            │       ├── Table of ALL complaints
            │       ├── Status dropdown in each row → PUT /:id/status
            │       └── Click row → Detail Modal (full info + status update)
            │
            └── Analytics Tab
                    ├── Summary cards (total, pending, in-progress, resolved)
                    ├── SVG Donut chart (resolution rate %)
                    ├── Avg resolution time in hours
                    ├── Priority breakdown (bar chart)
                    ├── Category breakdown (bar chart)
                    └── Status distribution (stacked bar)
```

---

## ⚙️ 9. Key Design Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| **MVC (Model-View-Controller)** | Server side | Routes → Controllers → Database. Clean separation of concerns |
| **Connection Pooling** | `config/database.js` | Reuse DB connections instead of creating new ones per request (performance) |
| **Middleware Pattern** | `middleware/auth.js` | JWT verification runs before controller logic. Separates auth from business logic |
| **Parameterized Queries** | All controllers | Prevents SQL injection attacks |
| **Token-based Auth (JWT)** | Auth flow | Stateless authentication — server doesn't store sessions |
| **Event-driven UI updates** | `Complaint.js` → `ComplaintList.js` | `window.dispatchEvent(new Event("complaintUpdated"))` triggers list refresh after new complaint |
| **Axios Interceptors** | `services/api.js` | Automatically attaches JWT token to every HTTP request header |
| **Context API (Toast)** | `Toast.js` | Global toast notifications accessible from any component via `useToast()` |
| **Graceful Fallbacks** | `complaintController.js` | Try-catch with fallback queries if columns don't exist |

---

## 🚀 10. Deployment Architecture

- **Frontend**: React app is built (`npm run build`) and served as **static files** from the Express server
- **Backend**: Express serves both the API and the frontend build
- **Database**: PostgreSQL hosted on **Render** (cloud), with **SSL** enabled
- **Single deploy**: The root `package.json` has a `postinstall` script that installs both client & server dependencies and builds the client — making it a **single deploy** on Render

### Root `package.json` Scripts:
```json
{
  "install-server": "cd server && npm install",
  "install-client": "cd client && npm install",
  "install-all": "npm run install-server && npm run install-client",
  "build-client": "cd client && npm run build",
  "postinstall": "npm run install-all && npm run build-client",
  "start": "cd server && npm start"
}
```

### How the Server Serves Frontend:
```javascript
// Serve static files from React build
app.use(express.static(path.join(__dirname, "../client/build")));

// Catch-all: any non-API route serves React's index.html
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
```

---

## 🔒 11. Security Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Password Hashing** | `bcrypt.hash(password, 10)` | Passwords are never stored in plain text |
| **JWT Authentication** | `jsonwebtoken` with secret key | Stateless, secure session management |
| **Parameterized Queries** | `$1, $2` placeholders in SQL | Prevents SQL injection attacks |
| **Role-based Access Control** | `isAdmin` middleware | Students can't access admin routes |
| **Input Validation** | Server-side checks | All required fields are validated before DB operations |
| **CORS** | `cors()` middleware | Controls which origins can access the API |
| **Ownership Verification** | `WHERE student_id = $3` in feedback | Students can only give feedback on their own complaints |

---

## 📝 12. How to Run the Project Locally

### Prerequisites:
- Node.js (v16+)
- PostgreSQL installed and running
- Flutter SDK (for mobile app)

### Steps:
```bash
# 1. Create the database
psql -U postgres
CREATE DATABASE complaint_system;
\q

# 2. Install dependencies
cd complaint-system
cd server && npm install
cd ../client && npm install

# 3. Configure environment
# Edit server/.env with your PostgreSQL credentials

# 4. Start the backend (port 4000)
cd server && node server.js

# 5. Start the frontend (port 3000) — in another terminal
cd client && npm start

# 6. Open browser
# http://localhost:3000

# Default Admin Login:
# Email: admin@college.edu
# Password: admin123
```

---

*Last updated: February 16, 2026*
