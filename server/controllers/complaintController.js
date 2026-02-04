const pool = require("../config/database");

console.log("🔥 complaintController loaded");

// CREATE COMPLAINT
// CREATE COMPLAINT
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const result = await pool.query(
      `INSERT INTO complaints (student_id, title, description, category, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.userId, title, description, category, priority]
    );

    res.status(201).json({
      message: "Complaint created successfully",
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE COMPLAINT ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET MY COMPLAINTS
const getMyComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM complaints WHERE student_id = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json({ complaints: result.rows });
  } catch (error) {
    console.error("GET MY COMPLAINTS ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET ALL COMPLAINTS
const getAllComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM complaints ORDER BY created_at DESC`
    );

    res.json({ complaints: result.rows });
  } catch (error) {
    console.error("GET COMPLAINTS ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE COMPLAINT STATUS (ADMIN)
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE complaints
       SET status = $1
       WHERE complaint_id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      message: "Status updated",
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ADD FEEDBACK (STUDENT)
const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    // Security: Only allow update if complaint belongs to student
    const result = await pool.query(
      `UPDATE complaints
       SET feedback = $1
       WHERE complaint_id = $2 AND student_id = $3
       RETURNING *`,
      [feedback, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Complaint not found or unauthorized" });
    }

    res.json({
      message: "Feedback submitted",
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error("ADD FEEDBACK ERROR:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  addFeedback, // ✅ NEW
};
