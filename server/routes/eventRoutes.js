const express = require('express');
const router = express.Router();
const { getEvents, getEventById } = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.get("/", async (req, res) => {
    const { countryCode = "US", keyword = "", priceMax = "" } = req.query;
  
    try {
      const data = await fetchEvents(countryCode, keyword, priceMax);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch events from external API" });
    }
  });

module.exports = router;
