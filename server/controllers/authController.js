const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

// Import dummy data from central location
const { dummyUsers } = require("../utils/dummyData");

// Helper function to generate JWT token for dummy users
const createDummyJWT = (user) => {
  const token = jwt.sign(
    { userId: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET || "mySecretKey123ForEventManagementSystem",
    { expiresIn: process.env.JWT_LIFETIME || "30d" }
  );
  return token;
};

// Test endpoint to check server connectivity
const testConnection = async (req, res) => {
  try {
    res.status(StatusCodes.OK).json({
      message: "Server is running correctly",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Debug endpoint to list available test users (only in development mode)
const listTestUsers = async (req, res) => {
  try {
    // Only show this in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      // Return a safe version of dummy users (without password hashes)
      const safeUsers = dummyUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        testPassword:
          user.email === "testuser@example.com"
            ? "test123"
            : user.email === "organizer@example.com"
            ? "org123"
            : user.email === "admin@example.com"
            ? "admin123"
            : "any password with 6+ characters",
      }));

      return res.status(StatusCodes.OK).json({
        message: "Available test users in development mode",
        users: safeUsers,
        note: "You can log in with any of these users using the provided test passwords",
      });
    }

    // In production, don't expose this information
    return res.status(StatusCodes.FORBIDDEN).json({
      error: "This endpoint is only available in development mode",
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Register a new user
const register = async (req, res) => {
  try {
    console.log("Registration attempt:", {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    });

    // Check if we're in development mode or have connection issues
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      // Check if email already exists in dummy users
      if (dummyUsers.find((u) => u.email === req.body.email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "Email already exists",
        });
      }

      // Create a new dummy user
      const newUser = {
        _id: `dummy${Date.now()}`,
        name: req.body.name,
        email: req.body.email,
        password:
          "$2a$10$7JXRrDw9U67/UwQyUA3dj.hOEbBzRJhG8dxJzYUGBcq3xqNdJW7XS", // dummy hash
        role: req.body.role || "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to dummy users array
      dummyUsers.push(newUser);

      // Generate token
      const token = createDummyJWT(newUser);

      console.log("Dummy user created successfully:", {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });

      return res.status(StatusCodes.CREATED).json({
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      });
    }

    // Try real database if not in dev mode
    const user = await User.create({ ...req.body });
    const token = user.createJWT();

    console.log("User created successfully:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.status(StatusCodes.CREATED).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

// User login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Please provide email and password" });
  }

  // Check if we're in development mode or have connection issues
  const isDevMode = process.env.NODE_ENV === "development";

  if (isDevMode) {
    // Find user in dummy users
    const dummyUser = dummyUsers.find((u) => u.email === email);

    if (!dummyUser) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid credentials" });
    }

    // In a real app we would check the password, but for dummy users we'll accept any password
    // that matches the one in our dummy user list or skip the check entirely

    const token = createDummyJWT(dummyUser);
    return res.status(StatusCodes.OK).json({
      user: {
        id: dummyUser._id,
        name: dummyUser.name,
        email: dummyUser.email,
        role: dummyUser.role,
      },
      token,
    });
  }

  // Try real database if not in dev mode
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Invalid credentials" });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Invalid credentials" });
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      // Find user in dummy users
      const dummyUser = dummyUsers.find((u) => u._id === req.user.userId);

      if (!dummyUser) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "User not found" });
      }

      return res.status(StatusCodes.OK).json({
        user: {
          id: dummyUser._id,
          name: dummyUser.name,
          email: dummyUser.email,
          role: dummyUser.role,
        },
      });
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role && req.user.role === "admin") updates.role = role;

    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  testConnection,
  listTestUsers,
};
