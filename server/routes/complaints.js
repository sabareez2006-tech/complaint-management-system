const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { verifyToken, isAdmin } = require("../middleware/auth");

// Student
router.post("/", verifyToken, complaintController.createComplaint);
router.get("/my-complaints", verifyToken, complaintController.getMyComplaints);
router.put("/:id/feedback", verifyToken, complaintController.addFeedback);

// Admin
router.get("/", verifyToken, isAdmin, complaintController.getAllComplaints);
router.get("/analytics", verifyToken, isAdmin, complaintController.getAnalytics);
router.put("/:id/status", verifyToken, isAdmin, complaintController.updateComplaintStatus);

module.exports = router;
