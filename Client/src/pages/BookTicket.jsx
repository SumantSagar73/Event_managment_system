import React from 'react';
import { useParams } from 'react-router-dom';

const BookTicket = () => {
  const { id } = useParams();

  return (
    <div className="container py-5">
      <h2 className="text-center text-success">Booking Ticket</h2>
      <p className="text-center">Redirecting you to booking page for event ID: <strong>{id}</strong></p>
      <div className="text-center">
        <a href={`https://www.ticketmaster.com/event/${id}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-3">Go to Ticketmaster</a>
      </div>
    </div>
  );
};

export default BookTicket;