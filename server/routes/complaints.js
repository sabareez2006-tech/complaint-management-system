const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { verifyToken, isAdmin } = require("../middleware/auth");

// Categories (must be before /:id routes to avoid conflicts)
router.get("/categories", verifyToken, complaintController.getCategories);
router.post("/categories", verifyToken, isAdmin, complaintController.addCategory);
router.put("/categories/:id", verifyToken, isAdmin, complaintController.updateCategory);
router.delete("/categories/:id", verifyToken, isAdmin, complaintController.deleteCategory);

// Feedback (admin view all)
router.get("/feedback", verifyToken, isAdmin, complaintController.getAllFeedback);

// Student
router.post("/", verifyToken, complaintController.createComplaint);
router.get("/my-complaints", verifyToken, complaintController.getMyComplaints);
router.put("/:id/feedback", verifyToken, complaintController.addFeedback);

// Admin
router.get("/", verifyToken, isAdmin, complaintController.getAllComplaints);
router.get("/analytics", verifyToken, isAdmin, complaintController.getAnalytics);
router.put("/:id/status", verifyToken, isAdmin, complaintController.updateComplaintStatus);

module.exports = router;
