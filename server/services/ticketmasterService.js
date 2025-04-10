const axios = require('axios');
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const EVENT_DETAIL_URL = 'https://app.ticketmaster.com/discovery/v2/events';

exports.fetchEvents = async (params = {}) => {
  const res = await axios.get(BASE_URL, {
    params: {
      apikey: process.env.TM_API_KEY,
      ...params
    }
  });
  return res.data;
};

exports.fetchEventDetails = async (id) => {
  const res = await axios.get(`${EVENT_DETAIL_URL}/${id}.json`, {
    params: {
      apikey: process.env.TM_API_KEY,
    }
  });
  return res.data;
};
