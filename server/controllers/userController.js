const User = require("../models/User");

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if user is updating their own profile or is an admin
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user"
      });
    }
    
    // Update fields
    const fieldsToUpdate = req.body;
    delete fieldsToUpdate.password; // Don't update password through this route
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).select("-password");
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if user is deleting their own profile or is an admin
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this user"
      });
    }
    
    // Use findByIdAndDelete instead of remove()
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
};

// Switch user role
exports.switchRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    
    if (!newRole || (newRole !== "user" && newRole !== "organizer")) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be either 'user' or 'organizer'",
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Check if user has permission to switch to organizer role
    if (newRole === "organizer" && user.role !== "organizer" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to switch to organizer role",
      });
    }
    
    // Switch the role
    await user.switchRole(newRole);
    
    res.status(200).json({
      success: true,
      message: `Role switched to ${newRole} successfully`,
      data: {
        activeRole: user.activeRole,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error switching role:", error);
    res.status(500).json({
      success: false,
      message: "Error switching role",
      error: error.message,
    });
  }
}; 