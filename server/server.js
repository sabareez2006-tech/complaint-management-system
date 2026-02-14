console.log("🔥 THIS SERVER.JS IS RUNNING");

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import database pool to establish connection on startup
const pool = require("./config/database");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");

const initDB = require("./db_init");

const app = express();

// Initialize Database Tables
initDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// Health check (must be before catch-all)
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

// Serve static files from React app
app.use(express.static(path.join(__dirname, "../client/build")));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

