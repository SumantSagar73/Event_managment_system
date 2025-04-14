const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user",
    },
    activeRole: {
      type: String,
      enum: ["user", "organizer"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate JWT token
userSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME || "30d" }
  );
};

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Switch role method
userSchema.methods.switchRole = async function (newRole) {
  if (newRole !== "user" && newRole !== "organizer") {
    throw new Error("Invalid role");
  }
  
  // Only allow switching to organizer if user has organizer role
  if (newRole === "organizer" && this.role !== "organizer" && this.role !== "admin") {
    throw new Error("You don't have permission to switch to organizer role");
  }
  
  this.activeRole = newRole;
  await this.save();
  return this;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
