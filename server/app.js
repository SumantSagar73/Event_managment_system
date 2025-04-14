const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Force development mode - hardcoded for testing
process.env.NODE_ENV = "development";
console.log("Environment mode:", process.env.NODE_ENV);

// Development mode indicator
const isDevMode = process.env.NODE_ENV === "development";

// Connect to MongoDB if not in development mode or try with fallback
if (!isDevMode) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      console.log("Running in fallback mode with mock data");
    });
} else {
  console.log("Running in development mode with mock data");
}

// Base API route response
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Event Management System API",
    status: "OK",
    mode: isDevMode ? "development" : "production",
    endpoints: {
      auth: "/api/auth",
      events: "/api/events",
      tickets: "/api/tickets",
      users: "/api/users",
    },
  });
});

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", mode: isDevMode ? "development" : "production" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Mode: ${isDevMode ? "Development (using mock data)" : "Production"}`
  );
});
