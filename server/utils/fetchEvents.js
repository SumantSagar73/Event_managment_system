// utils/fetchEvents.js
const axios = require("axios");

const fetchEvents = async (countryCode = "US", keyword = "", priceMax = "") => {
  const params = {
    apikey: process.env.TICKETMASTER_API_KEY,
    countryCode,
    keyword,
    size: 50,
  };

  if (priceMax) {
    params["priceMax"] = priceMax;
  }

  try {
    const response = await axios.get("https://app.ticketmaster.com/discovery/v2/events.json", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Ticketmaster API error:", error.message);
    throw error;
  }
};

module.exports = fetchEvents;
