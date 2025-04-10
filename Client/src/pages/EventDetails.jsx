import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/events/${id}`).then(res => {
      setEvent(res.data);
    });
  }, [id]);

  if (!event) return <Loader />;

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6">
          {event.images?.[0] && <img src={event.images[0].url} alt={event.name} className="img-fluid rounded shadow" />}
        </div>
        <div className="col-md-6">
          <h2 className="fw-bold text-primary">{event.name}</h2>
          <p>{event.info}</p>
          <p className="event-meta">
          📅 Date: {event.dates?.start?.localDate || 'TBA'}
          </p>
          <p className="event-meta">
          📍 Location: {event._embedded?.venues?.[0]?.city?.name || 'Unknown'}
          </p>
          <p><strong>Genre:</strong> {event.classifications?.[0]?.genre?.name}</p>
          <Link to={`/book/${event.id}`} className="btn btn-success">Book Ticket</Link>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
