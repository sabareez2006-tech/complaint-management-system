console.log("🔥 THIS SERVER.JS IS RUNNING");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints"); // ✅ IMPORTANT

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes); // ✅ THIS FIXES EVERYTHING

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
