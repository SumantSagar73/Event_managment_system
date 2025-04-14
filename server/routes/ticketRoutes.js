const express = require("express");
const router = express.Router();
const {
  purchaseTicket,
  getUserTickets,
  getTicketById,
  cancelTicket,
  checkInTicket,
  getEventTickets,
  getTicketStats,
} = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");
const organizerMiddleware = require("../middleware/organizerMiddleware");

// All ticket routes require authentication
router.use(authMiddleware);

// User ticket routes
router.post("/purchase", purchaseTicket);
router.get("/my-tickets", getUserTickets);
router.get("/:id", getTicketById);
router.patch("/:id/cancel", cancelTicket);

// Organizer/admin only routes
router.post("/check-in", organizerMiddleware, checkInTicket);
router.get("/event/:eventId", organizerMiddleware, getEventTickets);
router.get("/stats/:eventId", organizerMiddleware, getTicketStats);

module.exports = router;
