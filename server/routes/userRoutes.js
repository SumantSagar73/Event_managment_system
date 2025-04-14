const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  switchRole
} = require("../controllers/userController");

// Test route to check if the router is working
router.get("/test", (req, res) => {
  res.json({ message: "User routes are working" });
});

// Protected routes - commented out to identify the issue
// router.get("/", protect, getUsers);
// router.post("/switch-role", protect, switchRole);
// router.get("/:id", protect, getUserById);
// router.put("/:id", protect, updateUser);
// router.delete("/:id", protect, deleteUser);

module.exports = router; 