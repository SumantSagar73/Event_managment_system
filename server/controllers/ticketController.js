const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");

// Import dummy data from central location
const { dummyTickets, dummyEvents } = require("../utils/dummyData");

// Purchase a ticket for an event
exports.purchaseTicket = async (req, res) => {
  try {
    const { eventId, ticketType, quantity } = req.body;

    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      // Find the event in dummy events
      const event = dummyEvents.find((e) => e._id === eventId);

      if (!event) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: `No event with id: ${eventId}` });
      }

      // Check if event is published
      if (!event.published) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            error: "Tickets cannot be purchased for unpublished events",
          });
      }

      // Create new dummy ticket
      const newTicket = {
        _id: `ticket${Date.now()}`,
        event: eventId,
        user: req.user.userId,
        ticketType,
        ticketPrice: event.ticketPrice || 50.0, // Default price if not specified
        quantity,
        totalAmount: (event.ticketPrice || 50.0) * quantity,
        ticketCode: `${event.eventType.toUpperCase().slice(0, 4)}-${ticketType
          .toUpperCase()
          .slice(0, 3)}-${Math.floor(Math.random() * 10000000)}`,
        status: "Active",
        isCheckedIn: false,
        checkInTime: null,
        purchaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dummyTickets.push(newTicket);

      return res.status(StatusCodes.CREATED).json({ ticket: newTicket });
    }

    // Normal operation with MongoDB
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No event with id: ${eventId}` });
    }

    // Check if event is published
    if (!event.published) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Tickets cannot be purchased for unpublished events" });
    }

    // Find the ticket tier
    const ticketTier = event.ticketTiers.find(
      (tier) => tier.name === ticketType
    );
    if (!ticketTier) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No ticket tier named: ${ticketType}` });
    }

    // Check if tickets are available
    if (ticketTier.quantitySold + quantity > ticketTier.quantity) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Not enough tickets available" });
    }

    // Create the ticket
    const ticket = await Ticket.create({
      event: eventId,
      user: req.user.userId,
      ticketType,
      ticketPrice: ticketTier.price,
      quantity,
    });

    // Update the ticket tier's sold quantity
    ticketTier.quantitySold += quantity;
    await event.save();

    res.status(StatusCodes.CREATED).json({ ticket });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Get all tickets for the current user
exports.getUserTickets = async (req, res) => {
  try {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      // Find tickets for current user
      const tickets = dummyTickets.filter(
        (ticket) => ticket.user === req.user.userId
      );

      // Enhance tickets with event information
      const enhancedTickets = tickets.map((ticket) => {
        const event = dummyEvents.find((e) => e._id === ticket.event);
        return {
          ...ticket,
          event: event
            ? {
                _id: event._id,
                name: event.name,
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.location,
                status: event.status,
              }
            : { name: "Unknown Event" },
        };
      });

      return res.status(StatusCodes.OK).json({
        tickets: enhancedTickets,
        count: enhancedTickets.length,
      });
    }

    // Normal operation with MongoDB
    const tickets = await Ticket.find({ user: req.user.userId }).populate({
      path: "event",
      select: "name startDate endDate location status",
    });

    res.status(StatusCodes.OK).json({ tickets, count: tickets.length });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Get a specific ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      const ticket = dummyTickets.find((t) => t._id === req.params.id);

      if (!ticket) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: `No ticket with id: ${req.params.id}` });
      }

      // Only the ticket owner or an admin can view the ticket
      if (req.user.role !== "admin" && ticket.user !== req.user.userId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: "Not authorized to access this ticket" });
      }

      // Add event information to ticket
      const event = dummyEvents.find((e) => e._id === ticket.event);
      const enhancedTicket = {
        ...ticket,
        event: event
          ? {
              _id: event._id,
              name: event.name,
              startDate: event.startDate,
              endDate: event.endDate,
              location: event.location,
              status: event.status,
              imageUrl: event.imageUrl,
            }
          : { name: "Unknown Event" },
      };

      return res.status(StatusCodes.OK).json({ ticket: enhancedTicket });
    }

    // Normal operation with MongoDB
    const ticket = await Ticket.findById(req.params.id).populate({
      path: "event",
      select: "name startDate endDate location status imageUrl",
    });

    if (!ticket) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No ticket with id: ${req.params.id}` });
    }

    // Only the ticket owner or an admin can view the ticket
    if (
      req.user.role !== "admin" &&
      ticket.user.toString() !== req.user.userId
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Not authorized to access this ticket" });
    }

    res.status(StatusCodes.OK).json({ ticket });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Check in a ticket (for event organizers)
exports.checkInTicket = async (req, res) => {
  try {
    const { ticketCode } = req.body;

    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === "development";

    if (isDevMode) {
      const ticketIndex = dummyTickets.findIndex(
        (t) => t.ticketCode === ticketCode
      );

      if (ticketIndex === -1) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Invalid ticket code" });
      }

      const ticket = dummyTickets[ticketIndex];
      const event = dummyEvents.find((e) => e._id === ticket.event);

      if (!event) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Event not found" });
      }

      // Check if the current user is the event organizer or an admin
      if (req.user.role !== "admin" && event.organizer !== req.user.userId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: "Not authorized to check in this ticket" });
      }

      // Check if ticket is already checked in
      if (ticket.isCheckedIn) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Ticket already checked in" });
      }

      // Check in the ticket
      dummyTickets[ticketIndex] = {
        ...ticket,
        isCheckedIn: true,
        checkInTime: new Date(),
        updatedAt: new Date(),
      };

      return res.status(StatusCodes.OK).json({
        ticket: dummyTickets[ticketIndex],
        message: "Ticket check-in successful",
      });
    }

    // Normal operation with MongoDB
    const ticket = await Ticket.findOne({ ticketCode }).populate({
      path: "event",
      select: "organizer name startDate endDate location status",
    });

    if (!ticket) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Invalid ticket code" });
    }

    // Check if the current user is the event organizer or an admin
    if (
      req.user.role !== "admin" &&
      ticket.event.organizer.toString() !== req.user.userId
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Not authorized to check in this ticket" });
    }

    // Check if ticket is already checked in
    if (ticket.isCheckedIn) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Ticket already checked in" });
    }

    // Check in the ticket
    ticket.isCheckedIn = true;
    ticket.checkInTime = new Date();
    await ticket.save();

    res
      .status(StatusCodes.OK)
      .json({ ticket, message: "Ticket check-in successful" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Cancel a ticket (user can cancel their own ticket)
exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate({
      path: "event",
      select: "startDate ticketTiers",
    });

    if (!ticket) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No ticket with id: ${req.params.id}` });
    }

    // Only the ticket owner or an admin can cancel the ticket
    if (
      req.user.role !== "admin" &&
      ticket.user.toString() !== req.user.userId
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Not authorized to cancel this ticket" });
    }

    // Check if ticket is already used or cancelled
    if (ticket.status !== "Active") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: `Ticket cannot be cancelled (current status: ${ticket.status})`,
      });
    }

    // Check if event has already started
    if (new Date(ticket.event.startDate) <= new Date()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Cannot cancel ticket after event has started" });
    }

    // Update ticket status
    ticket.status = "Cancelled";
    await ticket.save();

    // Update event's ticket count
    const event = await Event.findById(ticket.event._id);
    const ticketTier = event.ticketTiers.find(
      (tier) => tier.name === ticket.ticketType
    );
    if (ticketTier) {
      ticketTier.quantitySold -= ticket.quantity;
      await event.save();
    }

    res
      .status(StatusCodes.OK)
      .json({ message: "Ticket cancelled successfully" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Get all tickets for an event (for organizers)
exports.getEventTickets = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No event with id: ${req.params.eventId}` });
    }

    // Only the event organizer or an admin can view all tickets
    if (
      req.user.role !== "admin" &&
      event.organizer.toString() !== req.user.userId
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Not authorized to view tickets for this event" });
    }

    const tickets = await Ticket.find({ event: req.params.eventId }).populate({
      path: "user",
      select: "name email",
    });

    res.status(StatusCodes.OK).json({ tickets, count: tickets.length });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Get ticket stats for an event (for organizers)
exports.getTicketStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `No event with id: ${req.params.eventId}` });
    }

    // Only the event organizer or an admin can view ticket stats
    if (
      req.user.role !== "admin" &&
      event.organizer.toString() !== req.user.userId
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Not authorized to view stats for this event" });
    }

    // Get counts for each ticket type and status
    const ticketStats = await Ticket.aggregate([
      { $match: { event: mongoose.Types.ObjectId(req.params.eventId) } },
      {
        $group: {
          _id: { ticketType: "$ticketType", status: "$status" },
          count: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$ticketPrice", "$quantity"] } },
        },
      },
      { $sort: { "_id.ticketType": 1, "_id.status": 1 } },
    ]);

    // Calculate overall stats
    const overallStats = {
      totalTickets: event.ticketTiers.reduce(
        (acc, tier) => acc + tier.quantity,
        0
      ),
      soldTickets: event.ticketTiers.reduce(
        (acc, tier) => acc + tier.quantitySold,
        0
      ),
      totalRevenue: ticketStats.reduce((acc, stat) => acc + stat.revenue, 0),
      checkedIn: await Ticket.countDocuments({
        event: req.params.eventId,
        isCheckedIn: true,
      }),
    };

    res.status(StatusCodes.OK).json({ ticketStats, overallStats });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
