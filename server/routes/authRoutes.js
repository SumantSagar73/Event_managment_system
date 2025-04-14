const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  testConnection,
  listTestUsers,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Test route for server connectivity
router.get("/test", testConnection);

// Debug route to list test users (development mode only)
router.get("/debug/users", listTestUsers);

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - require authentication
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

module.exports = router;
