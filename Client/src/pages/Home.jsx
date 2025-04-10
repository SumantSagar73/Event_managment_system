import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/events')
      .then((res) => {
        setEvents(res.data._embedded?.events || []);
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
      });
  }, []);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Featured Events</h2>
      <div className="row">
        {events.slice(0, 6).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default Home;
