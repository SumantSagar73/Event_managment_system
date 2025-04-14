const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");
const Event = require("../models/Event");
const Ticket = require("../models/Ticket");
const bcrypt = require("bcryptjs");

// Dummy users data
const users = [
  {
    name: "Regular User",
    email: "user@example.com",
    password: "password123",
    role: "user",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "user",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "user",
  },
];

// Dummy organizers data
const organizers = [
  {
    name: "Event Organizer",
    email: "organizer@example.com",
    password: "password123",
    role: "organizer",
  },
  {
    name: "Music Fest Org",
    email: "music@example.com",
    password: "password123",
    role: "organizer",
  },
  {
    name: "Tech Conference",
    email: "tech@example.com",
    password: "password123",
    role: "organizer",
  },
];

// Admin user
const admin = {
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
  role: "admin",
};

// Connect to MongoDB
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Ticket.deleteMany({});
    console.log("Cleared existing data");

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      [...users, ...organizers, admin].map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );

    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Inserted ${createdUsers.length} users`);

    // Get organizer IDs for creating events
    const organizerIds = createdUsers
      .filter((user) => user.role === "organizer" || user.role === "admin")
      .map((org) => org._id);

    // Create dummy events
    const events = [
      {
        title: "Summer Music Festival",
        description:
          "A three-day music festival featuring top artists from around the world.",
        date: new Date(2025, 5, 15), // June 15, 2025
        time: "12:00 PM",
        location: "Central Park, New York",
        category: "Music",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
        price: 75.0,
        totalTickets: 1000,
        availableTickets: 1000,
        organizer: organizerIds[0],
        featured: true,
      },
      {
        title: "Tech Conference 2025",
        description:
          "Annual technology conference showcasing the latest innovations in AI and ML.",
        date: new Date(2025, 7, 10), // August 10, 2025
        time: "9:00 AM",
        location: "Convention Center, San Francisco",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        price: 150.0,
        totalTickets: 500,
        availableTickets: 500,
        organizer: organizerIds[1],
        featured: true,
      },
      {
        title: "Food & Wine Festival",
        description:
          "Experience the finest cuisine and wines from top chefs and sommeliers.",
        date: new Date(2025, 9, 5), // October 5, 2025
        time: "5:00 PM",
        location: "Waterfront Park, Chicago",
        category: "Food",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
        price: 95.0,
        totalTickets: 300,
        availableTickets: 300,
        organizer: organizerIds[2],
        featured: false,
      },
      {
        title: "Art Exhibition Opening",
        description:
          "Opening night of contemporary art exhibition featuring local and international artists.",
        date: new Date(2025, 4, 20), // May 20, 2025
        time: "7:00 PM",
        location: "Modern Art Gallery, Boston",
        category: "Art",
        image: "https://images.unsplash.com/photo-1531058020387-3be344556be6",
        price: 25.0,
        totalTickets: 200,
        availableTickets: 200,
        organizer: organizerIds[0],
        featured: false,
      },
      {
        title: "Startup Pitch Competition",
        description:
          "Young entrepreneurs pitch their startup ideas to a panel of investors.",
        date: new Date(2025, 6, 30), // July 30, 2025
        time: "1:00 PM",
        location: "Business Hub, Austin",
        category: "Business",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692",
        price: 50.0,
        totalTickets: 100,
        availableTickets: 100,
        organizer: organizerIds[1],
        featured: true,
      },
    ];

    // Insert events
    const createdEvents = await Event.insertMany(events);
    console.log(`Inserted ${createdEvents.length} events`);

    // Create some sample tickets
    const regularUserId = createdUsers.find(
      (user) => user.email === "user@example.com"
    )._id;

    // Create tickets for the first event
    const firstEvent = createdEvents[0];
    const tickets = [
      {
        eventId: firstEvent._id,
        userId: regularUserId,
        ticketNumber: "TK-" + Math.floor(100000 + Math.random() * 900000),
        purchaseDate: new Date(),
        price: firstEvent.price,
        status: "active",
        checkedIn: false,
      },
      {
        eventId: firstEvent._id,
        userId: regularUserId,
        ticketNumber: "TK-" + Math.floor(100000 + Math.random() * 900000),
        purchaseDate: new Date(),
        price: firstEvent.price,
        status: "active",
        checkedIn: false,
      },
    ];

    // Insert tickets
    const createdTickets = await Ticket.insertMany(tickets);
    console.log(`Inserted ${createdTickets.length} tickets`);

    // Update available tickets count
    await Event.findByIdAndUpdate(firstEvent._id, {
      $inc: { availableTickets: -createdTickets.length },
    });

    console.log("Database successfully seeded!");

    // Print login credentials for testing
    console.log("\n--- TEST CREDENTIALS ---");
    console.log("Regular User: user@example.com / password123");
    console.log("Organizer: organizer@example.com / password123");
    console.log("Admin: admin@example.com / admin123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seed function
seedDatabase();
