// Dummy data for development mode

const dummyUsers = [
  {
    _id: "dummy123user456",
    name: "Test User",
    email: "testuser@example.com",
    password: "$2a$10$7JXRrDw9U67/UwQyUA3dj.hOEbBzRJhG8dxJzYUGBcq3xqNdJW7XS", // hash for "test123"
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "dummy789organizer012",
    name: "John Organizer",
    email: "organizer@example.com",
    password: "$2a$10$DweBt8VIXf5nPg/D5Rpb5eAh5m.qZEEQyUVOthLNkQQwxJUzrxB5m", // hash for "org123"
    role: "organizer",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "dummy345admin678",
    name: "Admin User",
    email: "admin@example.com",
    password: "$2a$10$7JXRrDw9U67/UwQyUA3dj.hOEbBzRJhG8dxJzYUGBcq3xqNdJW7XS", // hash for "admin123"
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "user123456789",
    name: "Sumant Sagar",
    email: "sumantsagar2022@vitbhopal.ac.in",
    password: "$2a$10$7JXRrDw9U67/UwQyUA3dj.hOEbBzRJhG8dxJzYUGBcq3xqNdJW7XS", // hash for your provided password
    role: "organizer",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const dummyEvents = [
  {
    _id: "event123456789",
    name: "Music Festival 2025",
    description: "A weekend of amazing music performances",
    eventType: "concert",
    location: {
      venue: "City Park",
      address: "123 Park Avenue",
      city: "New York",
      state: "NY",
      zipCode: "10001",
    },
    startDate: new Date("2025-05-15T18:00:00"),
    endDate: new Date("2025-05-17T23:00:00"),
    ticketPrice: 99.99,
    ticketsAvailable: 500,
    imageUrl: "https://example.com/events/music-fest.jpg",
    organizer: "dummy789organizer012",
    published: true,
    status: "upcoming",
    tags: ["music", "festival", "outdoor"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "event234567890",
    name: "Tech Conference 2025",
    description: "Learn about the latest in AI and blockchain",
    eventType: "conference",
    location: {
      venue: "Tech Center",
      address: "456 Innovation Drive",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
    },
    startDate: new Date("2025-06-10T09:00:00"),
    endDate: new Date("2025-06-12T17:00:00"),
    ticketPrice: 299.99,
    ticketsAvailable: 200,
    imageUrl: "https://example.com/events/tech-conf.jpg",
    organizer: "dummy789organizer012",
    published: true,
    status: "upcoming",
    tags: ["technology", "AI", "networking"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "event345678901",
    name: "Food & Wine Festival",
    description: "Taste cuisine from top chefs around the world",
    eventType: "festival",
    location: {
      venue: "Waterfront Plaza",
      address: "789 Harbor Blvd",
      city: "Chicago",
      state: "IL",
      zipCode: "60611",
    },
    startDate: new Date("2025-07-20T12:00:00"),
    endDate: new Date("2025-07-22T20:00:00"),
    ticketPrice: 75.0,
    ticketsAvailable: 300,
    imageUrl: "https://example.com/events/food-fest.jpg",
    organizer: "user123456789", // This is Sumant Sagar's event
    published: true,
    status: "upcoming",
    tags: ["food", "wine", "culinary"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const dummyTickets = [
  {
    _id: "ticket123456789",
    event: "event123456789", // Music Festival
    user: "user123456789", // Sumant Sagar
    ticketType: "VIP",
    ticketPrice: 199.99,
    quantity: 2,
    totalAmount: 399.98,
    ticketCode: "MUSIC-VIP-9876543",
    status: "Active",
    isCheckedIn: false,
    checkInTime: null,
    purchaseDate: new Date("2025-03-15"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "ticket234567890",
    event: "event234567890", // Tech Conference
    user: "dummy123user456", // Test User
    ticketType: "Regular",
    ticketPrice: 299.99,
    quantity: 1,
    totalAmount: 299.99,
    ticketCode: "TECH-REG-1234567",
    status: "Active",
    isCheckedIn: false,
    checkInTime: null,
    purchaseDate: new Date("2025-04-01"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "ticket345678901",
    event: "event345678901", // Food & Wine Festival
    user: "dummy789organizer012", // John Organizer
    ticketType: "Premium",
    ticketPrice: 125.0,
    quantity: 4,
    totalAmount: 500.0,
    ticketCode: "FOOD-PRE-5678901",
    status: "Active",
    isCheckedIn: false,
    checkInTime: null,
    purchaseDate: new Date("2025-04-05"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  dummyUsers,
  dummyEvents,
  dummyTickets,
};
