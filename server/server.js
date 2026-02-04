console.log("🔥 THIS SERVER.JS IS RUNNING");

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints"); // ✅ IMPORTANT

const app = express();

app.use(cors());
app.use(express.json());

// Routes
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// Serve static files from React app
app.use(express.static(path.join(__dirname, "../client/build")));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
