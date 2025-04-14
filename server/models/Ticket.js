const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Types.ObjectId,
    ref: "Event",
    required: [true, "Please provide event ID"],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide user ID"],
  },
  ticketType: {
    type: String,
    required: [true, "Please provide ticket type"],
  },
  ticketPrice: {
    type: Number,
    required: [true, "Please provide ticket price"],
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, "Quantity cannot be less than 1"],
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Active", "Used", "Cancelled", "Refunded"],
    default: "Active",
  },
  ticketCode: {
    type: String,
    unique: true,
  },
  isCheckedIn: {
    type: Boolean,
    default: false,
  },
  checkInTime: {
    type: Date,
  },
});

// Generate unique ticket code before saving
ticketSchema.pre("save", function (next) {
  if (!this.ticketCode) {
    // Generate a random alphanumeric string
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Add event ID prefix for uniqueness
    const eventPrefix = this.event.toString().substring(0, 4);
    this.ticketCode = `${eventPrefix}-${code}`;
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
