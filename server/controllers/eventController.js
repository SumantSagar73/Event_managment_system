const { fetchEvents, fetchEventDetails } = require('../services/ticketmasterService');

exports.getEvents = async (req, res) => {
  try {
    const data = await fetchEvents(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events', error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const data = await fetchEventDetails(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event details', error: err.message });
  }
};
