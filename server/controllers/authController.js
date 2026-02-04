const bcrypt = require("bcrypt");
const pool = require("../config/database");

/* =========================
   REGISTER USER
========================= */

const register = async (req, res) => {
  try {
    console.log("REGISTER API HIT", req.body);

    const { full_name, email, password, role } = req.body;

    // Basic validation
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Use email as username
    const username = email;

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (username, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, username, full_name, email, role`,
      [username, full_name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================
   LOGIN USER
========================= */
const jwt = require("jsonwebtoken");

// LOGIN USER
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


/* =========================
   EXPORTS
========================= */
module.exports = {
  register,
  login,
};
