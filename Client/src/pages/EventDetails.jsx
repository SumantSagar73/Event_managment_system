import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const EventDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, isInOrganizerMode, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/events/${id}`)
      .then((res) => {
        setEvent(res.data.event);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event details:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Loader />;
  if (!event)
    return (
      <div className="container py-5 text-center">
        <h2>Event not found</h2>
        <Link to="/events" className="btn btn-primary mt-3">
          Browse Events
        </Link>
      </div>
    );

  // Update the canEdit variable to check for organizer mode
  const canEdit = isAuthenticated && (isInOrganizerMode() || isAdmin());

  // Format date
  const eventDate = new Date(event.startDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format time
  const eventTime = new Date(event.startDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get venue details
  const venue = event._embedded?.venues?.[0];
  const venueName = venue?.name || "Venue TBA";
  const venueCity = venue?.city?.name || "";
  const venueState = venue?.state?.name || "";
  const venueLocation =
    venueCity && venueState
      ? `${venueCity}, ${venueState}`
      : venueCity || venueState || "Location TBA";

  // Get genre and subgenre
  const genre = event.classifications?.[0]?.genre?.name || "";
  const subGenre = event.classifications?.[0]?.subGenre?.name || "";

  return (
    <div className="event-details-page w-100">
      <div className="event-header mb-5 position-relative w-100">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-100 rounded-4"
            style={{ maxHeight: "500px", objectFit: "cover", width: "100%" }}
          />
        )}
        <div className="event-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
          <div className="container">
            <span className="event-badge mb-3 px-3 py-2 rounded-pill bg-primary bg-opacity-75 text-white">
              {genre} {subGenre && `• ${subGenre}`}
            </span>
            <h1 className="display-4 fw-bold mb-4 text-white">{event.name}</h1>
            <div className="d-flex align-items-center flex-wrap gap-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-calendar-event me-3 fs-4 text-white"></i>
                <div>
                  <div className="fw-bold text-white">{eventDate}</div>
                  <div className="small text-white-50">{eventTime}</div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt me-3 fs-4 text-white"></i>
                <div>
                  <div className="fw-bold text-white">{venueName}</div>
                  <div className="small text-white-50">
                    {venueLocation}
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="ms-auto">
                  <Link
                    to={`/organizer/edit-event/${event._id}`}
                    className="btn btn-light rounded-pill px-4"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit Event
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid pb-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="event-details mb-4">
                <h3 className="fw-bold mb-4">Event Details</h3>
                <div className="event-description">
                  {event.description.split("\n").map((paragraph, idx) => (
                    <p key={idx} className="mb-3">{paragraph}</p>
                  ))}
                </div>

                {event.pleaseNote && (
                  <div className="mt-4">
                    <h4 className="fw-bold mb-3">Please Note</h4>
                    <div className="alert alert-info">{event.pleaseNote}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              <div
                className="event-details sticky-lg-top bg-white p-4 rounded-4 shadow-sm"
                style={{ top: "20px" }}
              >
                <h3 className="fw-bold mb-4">Ticket Information</h3>

                {event.ticketTiers && event.ticketTiers.length > 0 ? (
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Available Tickets</h5>
                    {event.ticketTiers.map((tier, index) => (
                      <div key={index} className="card border-0 shadow-sm rounded-4 mb-3">
                        <div className="card-body p-4">
                          <h6 className="card-title fw-bold mb-2">{tier.name}</h6>
                          <p className="card-text text-muted small mb-3">
                            {tier.description}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="fs-4 fw-bold text-primary">
                              ₹{tier.price.toLocaleString('en-IN')}
                            </div>
                            <Link
                              to={`/book/${event._id}`}
                              className="btn btn-primary rounded-pill px-4"
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info rounded-4">
                    <i className="bi bi-info-circle me-2"></i>
                    No tickets available at this time
                  </div>
                )}

                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-100 py-3 mb-3"
                  >
                    <i className="bi bi-ticket-fill me-2"></i> Buy Tickets
                  </a>
                )}

                {venue && (
                  <div className="mt-4">
                    <h5 className="fw-bold mb-3">Venue Information</h5>
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex mb-3">
                          <i
                            className="bi bi-building me-3 fs-4 text-primary"
                          ></i>
                          <div>
                            <div className="fw-bold">{venueName}</div>
                            {venue.address?.line1 && (
                              <div>{venue.address.line1}</div>
                            )}
                            <div className="text-muted">{venueLocation}</div>
                          </div>
                        </div>

                        {venue.url && (
                          <a
                            href={venue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                          >
                            Venue Website{" "}
                            <i className="bi bi-box-arrow-up-right ms-1"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
