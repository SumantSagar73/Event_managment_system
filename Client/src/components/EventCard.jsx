import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  // Check if this is a Ticketmaster event or a custom event
  const isCustomEvent = !!event._id; // Custom events use _id instead of id

  // Format date nicely if available
  let formattedDate = "Date TBA";
  if (isCustomEvent && event.startDate) {
    formattedDate = new Date(event.startDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } else if (event.dates?.start?.localDate) {
    formattedDate = new Date(event.dates.start.localDate).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  // Get venue info based on event type
  let venueName = "";
  let venueCity = "";
  let venueLocation = "Location TBA";

  if (isCustomEvent && event.location) {
    venueName = event.location.venue || "";
    venueCity = event.location.city || "";
    venueLocation = venueCity
      ? venueName
        ? `${venueName}, ${venueCity}`
        : venueCity
      : "Location TBA";
  } else if (event._embedded?.venues?.[0]) {
    venueName = event._embedded.venues[0].name || "";
    venueCity = event._embedded.venues[0].city?.name || "";
    venueLocation = venueCity
      ? venueName
        ? `${venueName}, ${venueCity}`
        : venueCity
      : "Location TBA";
  }

  // Get genre/event type if available
  const genre = isCustomEvent
    ? event.eventType || ""
    : event.classifications?.[0]?.genre?.name || "";

  // Get event image
  const imageUrl = isCustomEvent
    ? event.imageUrl || "https://placehold.co/600x400?text=Event"
    : event.images?.[0]?.url || "https://placehold.co/600x400?text=Event";

  // Get price information
  const price = isCustomEvent
    ? event.ticketPrice
      ? `${event.ticketPrice} USD`
      : null
    : event.priceRanges
    ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}`
    : null;

  return (
    <div className="col-md-4 mb-4 animate-fade-in">
      <div className="card h-100">
        <div className="position-relative">
          <img
            src={imageUrl}
            className="card-img-top"
            alt={event.name}
            style={{ height: "200px", objectFit: "cover" }}
          />
          {genre && (
            <span
              className="event-badge position-absolute"
              style={{
                top: "15px",
                right: "15px",
                background: "rgba(106, 61, 232, 0.8)",
                color: "white",
                padding: "5px 10px",
                borderRadius: "4px",
              }}
            >
              {genre}
            </span>
          )}
        </div>
        <div className="card-body d-flex flex-column">
          <div className="event-meta mb-2">
            <i className="bi bi-calendar-event me-2"></i>
            {formattedDate}
          </div>
          <h5 className="card-title fw-bold mb-3">{event.name}</h5>
          {event.info && (
            <p className="card-text mb-3 flex-grow-1">
              {event.info.slice(0, 100)}
              {event.info.length > 100 ? "..." : ""}
            </p>
          )}
          {isCustomEvent && event.description && (
            <p className="card-text mb-3 flex-grow-1">
              {event.description.slice(0, 100)}
              {event.description.length > 100 ? "..." : ""}
            </p>
          )}
          <div className="d-flex align-items-center mb-3">
            <i
              className="bi bi-geo-alt me-2"
              style={{ color: "var(--secondary-color)" }}
            ></i>
            <span className="text-muted small">{venueLocation}</span>
          </div>

          {price && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-light text-dark p-2">
                <i
                  className="bi bi-ticket-perforated me-1"
                  style={{ color: "var(--secondary-color)" }}
                ></i>
                {price}
              </span>
            </div>
          )}

          <Link
            to={isCustomEvent ? `/event/${event._id}` : `/event/${event.id}`}
            className="btn btn-primary mt-auto"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
