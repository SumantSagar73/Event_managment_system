const {
  fetchEvents,
  fetchEventDetails,
} = require("../services/ticketmasterService");
const Event = require("../models/Event");
const { StatusCodes } = require("http-status-codes");

// Import dummy data from central location
const { dummyEvents } = require("../utils/dummyData");

// Get events from Ticketmaster API
exports.getEventsFromAPI = async (req, res) => {
  try {
    const data = await fetchEvents(req.query);
    res.json(data);
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch events", error: err.message });
  }
};

// Get event details from Ticketmaster API
exports.getEventByIdFromAPI = async (req, res) => {
  try {
    const data = await fetchEventDetails(req.params.id);
    res.json(data);
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch event details", error: err.message });
  }
};

// CRUD Operations for local events in MongoDB

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      const newEvent = {
        _id: `event${Date.now()}`,
        ...req.body,
        organizer: req.user.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dummyEvents.push(newEvent);
      return res.status(StatusCodes.CREATED).json({ event: newEvent });
    }

    // Normal operation with MongoDB
    req.body.organizer = req.user.userId;
    const event = await Event.create(req.body);
    res.status(StatusCodes.CREATED).json({ event });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

// Get all events (with filtering options)
exports.getAllEvents = async (req, res) => {
  try {
    const {
      name,
      eventType,
      city,
      startDate,
      endDate,
      published,
      status,
      organizer,
    } = req.query;

    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      // Filter dummy events based on query parameters
      let filteredEvents = [...dummyEvents];

      if (name) {
        const regex = new RegExp(name, "i");
        filteredEvents = filteredEvents.filter((event) =>
          regex.test(event.name)
        );
      }

      if (eventType) {
        filteredEvents = filteredEvents.filter(
          (event) => event.eventType === eventType
        );
      }

      if (city) {
        const regex = new RegExp(city, "i");
        filteredEvents = filteredEvents.filter((event) =>
          regex.test(event.location.city)
        );
      }

      if (startDate) {
        const start = new Date(startDate);
        filteredEvents = filteredEvents.filter(
          (event) => new Date(event.startDate) >= start
        );
      }

      if (endDate) {
        const end = new Date(endDate);
        filteredEvents = filteredEvents.filter(
          (event) => new Date(event.endDate) <= end
        );
      }

      if (published !== undefined) {
        const isPublished = published === "true";
        filteredEvents = filteredEvents.filter(
          (event) => event.published === isPublished
        );
      }

      if (status) {
        filteredEvents = filteredEvents.filter(
          (event) => event.status === status
        );
      }

      if (organizer) {
        filteredEvents = filteredEvents.filter(
          (event) => event.organizer === organizer
        );
      }

      // If user is not admin or organizer, only show published events
      if (
        !req.user ||
        (req.user.role !== "admin" && req.user.role !== "organizer")
      ) {
        filteredEvents = filteredEvents.filter(
          (event) => event.published === true
        );
      }

      // Pagination
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const paginatedEvents = filteredEvents.slice(skip, skip + limit);

      return res.status(StatusCodes.OK).json({
        events: paginatedEvents,
        totalEvents: filteredEvents.length,
        numOfPages: Math.ceil(filteredEvents.length / limit),
        currentPage: page,
      });
    }

    // Normal operation with MongoDB
    const queryObject = {};

    // Apply filters if provided
    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }
    if (eventType) {
      queryObject.eventType = eventType;
    }
    if (city) {
      queryObject["location.city"] = { $regex: city, $options: "i" };
    }
    if (startDate) {
      queryObject.startDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      queryObject.endDate = { $lte: new Date(endDate) };
    }
    if (published !== undefined) {
      queryObject.published = published === "true";
    }
    if (status) {
      queryObject.status = status;
    }
    if (organizer) {
      queryObject.organizer = organizer;
    }

    // If user is not admin or organizer, only show published events
    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.role !== "organizer")
    ) {
      queryObject.published = true;
    }

    let result = Event.find(queryObject);

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit);

    const events = await result;

    // Count total events for pagination
    const totalEvents = await Event.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalEvents / limit);

    res.status(StatusCodes.OK).json({
      events,
      totalEvents,
      numOfPages,
      currentPage: page,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      const event = dummyEvents.find((e) => e._id === req.params.id);

      if (!event) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: `No event with id: ${req.params.id}` });
      }

      // If event is not published and user is not admin or the organizer
      if (
        !event.published &&
        (!req.user ||
          (req.user.role !== "admin" && req.user.userId !== event.organizer))
      ) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: "Not authorized to access this event" });
      }

      return res.status(StatusCodes.OK).json({ event });
    }

    // Normal operation with MongoDB
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No event with id: ${req.params.id}` });
    }

    // If event is not published and user is not admin or the organizer
    if (
      !event.published &&
      (!req.user ||
        (req.user.role !== "admin" &&
          req.user.userId !== event.organizer.toString()))
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Not authorized to access this event" });
    }

    res.status(StatusCodes.OK).json({ event });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      const eventIndex = dummyEvents.findIndex((e) => e._id === req.params.id);

      if (eventIndex === -1) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: `No event with id: ${req.params.id}` });
      }

      const event = dummyEvents[eventIndex];

      // Check authorization: only admin or the organizer can update
      if (req.user.role !== "admin" && req.user.userId !== event.organizer) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: "Not authorized to update this event" });
      }

      // Update the event
      const updatedEvent = {
        ...event,
        ...req.body,
        updatedAt: new Date(),
      };

      dummyEvents[eventIndex] = updatedEvent;

      return res.status(StatusCodes.OK).json({ event: updatedEvent });
    }

    // Normal operation with MongoDB
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No event with id: ${req.params.id}` });
    }

    // Check authorization: only admin or the organizer can update
    if (
      req.user.role !== "admin" &&
      req.user.userId !== event.organizer.toString()
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Not authorized to update this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({ event: updatedEvent });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      const eventIndex = dummyEvents.findIndex((e) => e._id === req.params.id);

      if (eventIndex === -1) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: `No event with id: ${req.params.id}` });
      }

      const event = dummyEvents[eventIndex];

      // Check authorization: only admin or the organizer can delete
      if (req.user.role !== "admin" && req.user.userId !== event.organizer) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: "Not authorized to delete this event" });
      }

      // Remove the event from the array
      dummyEvents.splice(eventIndex, 1);

      return res
        .status(StatusCodes.OK)
        .json({ message: "Event successfully deleted" });
    }

    // Normal operation with MongoDB
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No event with id: ${req.params.id}` });
    }

    // Check authorization: only admin or the organizer can delete
    if (
      req.user.role !== "admin" &&
      req.user.userId !== event.organizer.toString()
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(StatusCodes.OK).json({ message: "Event successfully deleted" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Publish or unpublish an event
exports.togglePublishEvent = async (req, res) => {
  try {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      const eventIndex = dummyEvents.findIndex((e) => e._id === req.params.id);

      if (eventIndex === -1) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: `No event with id: ${req.params.id}` });
      }

      const event = dummyEvents[eventIndex];

      // Check authorization: only admin or the organizer can publish/unpublish
      if (req.user.role !== "admin" && req.user.userId !== event.organizer) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: "Not authorized to modify this event" });
      }

      // Toggle published status
      const updatedEvent = {
        ...event,
        published: !event.published,
        updatedAt: new Date(),
      };

      dummyEvents[eventIndex] = updatedEvent;

      return res.status(StatusCodes.OK).json({ event: updatedEvent });
    }

    // Normal operation with MongoDB
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No event with id: ${req.params.id}` });
    }

    // Check authorization: only admin or the organizer can publish/unpublish
    if (
      req.user.role !== "admin" &&
      req.user.userId !== event.organizer.toString()
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Not authorized to modify this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { published: !event.published },
      { new: true }
    );

    res.status(StatusCodes.OK).json({ event: updatedEvent });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Get events organized by current user
exports.getMyEvents = async (req, res) => {
  try {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      const events = dummyEvents.filter((e) => e.organizer === req.user.userId);
      return res.status(StatusCodes.OK).json({ events, count: events.length });
    }

    // Normal operation with MongoDB
    const events = await Event.find({ organizer: req.user.userId });
    res.status(StatusCodes.OK).json({ events, count: events.length });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
