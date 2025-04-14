import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const API_URL = "http://localhost:5000/api";

const MyTickets = () => {
  const { token, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Check if coming from successful purchase
  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(
        `Successfully purchased tickets for ${location.state.event}!`
      );
      // Clear state after showing message
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/tickets");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!token) return;

      try {
        const response = await axios.get(`${API_URL}/tickets/my-tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTickets(response.data.tickets);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load your tickets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token]);

  // Cancel ticket function
  const handleCancelTicket = async (ticketId, eventName) => {
    if (
      window.confirm(
        `Are you sure you want to cancel your ticket for ${eventName}?`
      )
    ) {
      try {
        await axios.patch(
          `${API_URL}/tickets/${ticketId}/cancel`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update tickets list after cancellation
        setTickets(
          tickets.map((ticket) =>
            ticket._id === ticketId
              ? { ...ticket, status: "Cancelled" }
              : ticket
          )
        );

        setSuccessMessage("Ticket cancelled successfully");
      } catch (err) {
        console.error("Error cancelling ticket:", err);
        setError(
          err.response?.data?.error ||
            "Failed to cancel ticket. Please try again."
        );
      }
    }
  };

  // Filter tickets by status
  const getActiveTickets = () =>
    tickets.filter((ticket) => ticket.status === "Active");
  const getCancelledTickets = () =>
    tickets.filter((ticket) => ticket.status === "Cancelled");
  const getUsedTickets = () =>
    tickets.filter((ticket) => ticket.status === "Used" || ticket.isCheckedIn);

  const activeTickets = getActiveTickets();
  const cancelledTickets = getCancelledTickets();
  const usedTickets = getUsedTickets();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">My Tickets</h2>

      {/* Success Message */}
      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* No Tickets */}
      {tickets.length === 0 ? (
        <div className="text-center py-5">
          <i
            className="bi bi-ticket-perforated text-muted"
            style={{ fontSize: "4rem" }}
          ></i>
          <h4 className="mt-3">You don't have any tickets yet</h4>
          <p className="text-muted mb-4">Browse events to purchase tickets</p>
          <Link to="/events" className="btn btn-primary">
            Browse Events
          </Link>
        </div>
      ) : (
        <div>
          {/* Active Tickets Section */}
          <div className="mb-5">
            <h4 className="mb-3">
              <i className="bi bi-ticket-perforated-fill text-success me-2"></i>
              Active Tickets
            </h4>

            {activeTickets.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-4">
                  <p className="text-muted mb-0">
                    You don't have any active tickets
                  </p>
                </div>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {activeTickets.map((ticket) => (
                  <div key={ticket._id} className="col">
                    <div className="card h-100">
                      <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                        <span>Active</span>
                        <span>{ticket.ticketType}</span>
                      </div>

                      {ticket.event.imageUrl && (
                        <img
                          src={ticket.event.imageUrl}
                          className="card-img-top"
                          alt={ticket.event.name}
                          style={{ height: "140px", objectFit: "cover" }}
                        />
                      )}

                      <div className="card-body">
                        <h5 className="card-title">{ticket.event.name}</h5>
                        <div className="card-text mb-3">
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-calendar3 me-2"></i>
                              {new Date(
                                ticket.event.startDate
                              ).toLocaleDateString()}
                            </small>
                          </div>
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-2"></i>
                              {ticket.event.location?.venue ||
                                ticket.event.location?.city ||
                                "Location unavailable"}
                            </small>
                          </div>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Quantity</span>
                          <strong>{ticket.quantity}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Price</span>
                          <strong>
                            ${(ticket.ticketPrice * ticket.quantity).toFixed(2)}
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Ticket Code</span>
                          <code className="bg-light px-2 py-1 rounded">
                            {ticket.ticketCode}
                          </code>
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className="d-flex justify-content-between">
                          <Link
                            to={`/ticket/${ticket._id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() =>
                              handleCancelTicket(ticket._id, ticket.event.name)
                            }
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Used Tickets Section */}
          {usedTickets.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-3">
                <i className="bi bi-ticket-perforated text-secondary me-2"></i>
                Used Tickets
              </h4>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {usedTickets.map((ticket) => (
                  <div key={ticket._id} className="col">
                    <div className="card h-100 bg-light">
                      <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                        <span>Used</span>
                        <span>{ticket.ticketType}</span>
                      </div>

                      {ticket.event.imageUrl && (
                        <img
                          src={ticket.event.imageUrl}
                          className="card-img-top"
                          alt={ticket.event.name}
                          style={{
                            height: "140px",
                            objectFit: "cover",
                            opacity: 0.7,
                          }}
                        />
                      )}

                      <div className="card-body">
                        <h5 className="card-title text-muted">
                          {ticket.event.name}
                        </h5>
                        <div className="card-text mb-3">
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-calendar3 me-2"></i>
                              {new Date(
                                ticket.event.startDate
                              ).toLocaleDateString()}
                            </small>
                          </div>
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-2"></i>
                              {ticket.event.location?.venue ||
                                ticket.event.location?.city ||
                                "Location unavailable"}
                            </small>
                          </div>
                          {ticket.checkInTime && (
                            <div>
                              <small className="text-muted">
                                <i className="bi bi-check-circle me-2"></i>
                                Checked in:{" "}
                                {new Date(ticket.checkInTime).toLocaleString()}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-footer bg-light">
                        <Link
                          to={`/ticket/${ticket._id}`}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          <i className="bi bi-eye me-1"></i>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Tickets Section */}
          {cancelledTickets.length > 0 && (
            <div>
              <h4 className="mb-3">
                <i className="bi bi-ticket-perforated text-danger me-2"></i>
                Cancelled Tickets
              </h4>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {cancelledTickets.map((ticket) => (
                  <div key={ticket._id} className="col">
                    <div className="card h-100 bg-light">
                      <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                        <span>Cancelled</span>
                        <span>{ticket.ticketType}</span>
                      </div>

                      {ticket.event.imageUrl && (
                        <img
                          src={ticket.event.imageUrl}
                          className="card-img-top"
                          alt={ticket.event.name}
                          style={{
                            height: "140px",
                            objectFit: "cover",
                            opacity: 0.5,
                          }}
                        />
                      )}

                      <div className="card-body">
                        <h5 className="card-title text-muted">
                          {ticket.event.name}
                        </h5>
                        <div className="card-text mb-3">
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-calendar3 me-2"></i>
                              {new Date(
                                ticket.event.startDate
                              ).toLocaleDateString()}
                            </small>
                          </div>
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-2"></i>
                              {ticket.event.location?.venue ||
                                ticket.event.location?.city ||
                                "Location unavailable"}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
