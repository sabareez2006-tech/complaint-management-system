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

    // Get old status for history
    let oldStatus = null;
    try {
      const oldResult = await pool.query(
        `SELECT status FROM complaints WHERE complaint_id = $1`, [id]
      );
      oldStatus = oldResult.rows.length > 0 ? oldResult.rows[0].status : null;
    } catch (e) {
      console.warn("Could not fetch old status:", e.message);
    }

    let result;
    try {
      // Try full update with timestamp columns
      if (status === 'resolved') {
        result = await pool.query(
          `UPDATE complaints
           SET status = $1, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE complaint_id = $2
           RETURNING *`,
          [status, id]
        );
      } else {
        result = await pool.query(
          `UPDATE complaints
           SET status = $1, resolved_at = NULL, updated_at = CURRENT_TIMESTAMP
           WHERE complaint_id = $2
           RETURNING *`,
          [status, id]
        );
      }
    } catch (colError) {
      // Fallback: simple status-only update (if resolved_at/updated_at columns don't exist)
      console.warn("Full update failed, using fallback:", colError.message);
      result = await pool.query(
        `UPDATE complaints
         SET status = $1
         WHERE complaint_id = $2
         RETURNING *`,
        [status, id]
      );
    }

    // Record status change in history (non-blocking)
    if (oldStatus && oldStatus !== status) {
      try {
        await pool.query(
          `INSERT INTO status_history (complaint_id, old_status, new_status, changed_by)
           VALUES ($1, $2, $3, $4)`,
          [id, oldStatus, status, req.user.userId]
        );
      } catch (historyError) {
        console.warn("Could not log status history:", historyError.message);
      }
    }

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

// GET ANALYTICS (ADMIN)
const getAnalytics = async (req, res) => {
  try {
    // Total complaints
    const totalResult = await pool.query(`SELECT COUNT(*) as total FROM complaints`);
    const total = parseInt(totalResult.rows[0].total);

    // Count by status
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count FROM complaints GROUP BY status
    `);
    const byStatus = {};
    statusResult.rows.forEach(row => {
      byStatus[row.status] = parseInt(row.count);
    });

    // Count by category
    const categoryResult = await pool.query(`
      SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC
    `);
    const byCategory = categoryResult.rows.map(row => ({
      category: row.category,
      count: parseInt(row.count),
    }));

    // Count by priority
    const priorityResult = await pool.query(`
      SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority
    `);
    const byPriority = {};
    priorityResult.rows.forEach(row => {
      byPriority[row.priority] = parseInt(row.count);
    });

    // Recent complaints (last 7 days)
    const recentResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM complaints
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    const recentTimeline = recentResult.rows.map(row => ({
      date: row.date,
      count: parseInt(row.count),
    }));

    // Average resolution time (for resolved complaints)
    const avgTimeResult = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
      FROM complaints
      WHERE status = 'resolved' AND resolved_at IS NOT NULL
    `);
    const avgResolutionHours = avgTimeResult.rows[0].avg_hours
      ? parseFloat(avgTimeResult.rows[0].avg_hours).toFixed(1)
      : null;

    res.json({
      total,
      byStatus,
      byCategory,
      byPriority,
      recentTimeline,
      avgResolutionHours,
    });
  } catch (error) {
    console.error("GET ANALYTICS ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  addFeedback,
  getAnalytics,
};
