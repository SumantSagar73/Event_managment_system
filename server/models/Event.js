const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide event name"],
    trim: true,
    maxlength: [100, "Event name cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide event description"],
  },
  eventType: {
    type: String,
    enum: ["Music", "Sports", "Arts", "Theatre", "Comedy", "Family", "Other"],
    default: "Other",
  },
  startDate: {
    type: Date,
    required: [true, "Please provide event start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide event end date"],
  },
  location: {
    venue: {
      type: String,
      required: [true, "Please provide venue name"],
    },
    address: {
      type: String,
      required: [true, "Please provide venue address"],
    },
    city: {
      type: String,
      required: [true, "Please provide city"],
    },
    state: {
      type: String,
    },
    country: {
      type: String,
      required: [true, "Please provide country"],
    },
    zipCode: {
      type: String,
    },
  },
  organizer: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide event organizer"],
  },
  imageUrl: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
  },
  ticketTiers: [
    {
      name: {
        type: String,
        required: [true, "Please provide ticket tier name"],
      },
      price: {
        type: Number,
        required: [true, "Please provide ticket price"],
      },
      quantity: {
        type: Number,
        required: [true, "Please provide ticket quantity"],
      },
      quantitySold: {
        type: Number,
        default: 0,
      },
      description: {
        type: String,
      },
    },
  ],
  published: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
    default: "Upcoming",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update status based on date
eventSchema.pre("find", function (next) {
  this.find().forEach((event) => {
    const now = new Date();
    if (event.startDate > now) {
      event.status = "Upcoming";
    } else if (event.endDate < now) {
      event.status = "Completed";
    } else {
      event.status = "Ongoing";
    }
  });
  next();
});

module.exports = mongoose.model("Event", eventSchema);
