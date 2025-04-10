import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => (
  <div className="col-md-4 mb-4">
    <div className="card h-100 shadow">
      {event.images?.[0] && (
        <img
          src={event.images[0].url}
          className="card-img-top"
          alt={event.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <div className="card-body">
        <h5 className="card-title text-primary fw-bold">{event.name}</h5>
        <p className="card-text">
          {event.info ? event.info.slice(0, 100) + '...' : 'No description available.'}
        </p>
        <p className="event-meta">
          {event.dates?.start?.localDate} — {event._embedded?.venues?.[0]?.city?.name}
        </p>
        {event.priceRanges && (
        <p className="text-success fw-semibold mt-2">
          🎟️ Price: {event.priceRanges[0].min} - {event.priceRanges[0].max} {event.priceRanges[0].currency}
        </p>
          )}
        <Link to={`/event/${event.id}`} className="btn btn-outline-primary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  </div>
);

export default EventCard;