const express = require("express");
const router = express.Router();
const {
  getEventsFromAPI,
  getEventByIdFromAPI,
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  togglePublishEvent,
  getMyEvents,
} = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");
const organizerMiddleware = require("../middleware/organizerMiddleware");

// Public routes
router.get("/api", getEventsFromAPI);
router.get("/api/:id", getEventByIdFromAPI);
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected routes - require authentication
router.use(authMiddleware);
router.get("/user/myevents", getMyEvents);

// Protected routes - require organizer or admin role
router.use(organizerMiddleware);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.patch("/:id/publish", togglePublishEvent);

module.exports = router;
