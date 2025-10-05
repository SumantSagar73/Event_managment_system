import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import Badge from './ui/Badge';
import { FiChevronRight } from 'react-icons/fi';

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

  const cardRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { gsap } = await eval("import('gsap')");
        if (cardRef.current) {
          gsap.from(cardRef.current, { autoAlpha: 0, y: 20, duration: 0.7, ease: 'power3.out', delay: 0.08 });
        }
        if (imgRef.current) {
          gsap.from(imgRef.current, { scale: 1.08, autoAlpha: 0.85, duration: 1.1, ease: 'power3.out' });
        }
      } catch {
        // gsap not available - skip animation
      }
    })();
  }, []);

  return (
    <div className="col-md-4 mb-4">
      <div ref={cardRef} className="card h-100">
        <div className="position-relative">
          <img
            ref={imgRef}
            src={imageUrl}
            className="card-img-top"
            alt={event.name}
            style={{ height: "200px", objectFit: "cover" }}
          />
          {genre && (
            <Badge className="position-absolute" style={{ top: 15, right: 15 }}>
              {genre}
            </Badge>
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
            <i className="bi bi-geo-alt me-2" style={{ color: "var(--muted-text)" }}></i>
            <span className="text-muted small">{venueLocation}</span>
          </div>

          {price && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Badge style={{ background: 'var(--card-bg)', color: 'var(--text)' }}>{price}</Badge>
            </div>
          )}

          <div className="mt-auto">
            <Link to={isCustomEvent ? `/event/${event._id}` : `/event/${event.id}`}>
              <Button variant="primary" size="md" className="d-inline-flex align-items-center">
                <FiChevronRight style={{ marginRight: 8 }} />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
