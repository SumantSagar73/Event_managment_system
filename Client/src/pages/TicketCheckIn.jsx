import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const API_URL = "http://localhost:5000/api";

const TicketCheckIn = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, isOrganizer } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketCode, setTicketCode] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [checkedInTickets, setCheckedInTickets] = useState([]);
  const [stats, setStats] = useState({
    totalCheckedIn: 0,
    totalTickets: 0,
  });

  // Authorize and fetch event data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/check-in/" + eventId);
      return;
    }

    if (!isOrganizer) {
      navigate("/events");
      return;
    }

    const fetchEventData = async () => {
      try {
        // Fetch event details
        const eventResponse = await axios.get(`${API_URL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvent(eventResponse.data.event);

        // Fetch ticket stats
        const statsResponse = await axios.get(
          `${API_URL}/tickets/stats/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { overallStats } = statsResponse.data;
        setStats({
          totalCheckedIn: overallStats.checkedIn,
          totalTickets: overallStats.soldTickets,
        });

        // Fetch already checked-in tickets
        const ticketsResponse = await axios.get(
          `${API_URL}/tickets/event/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCheckedInTickets(
          ticketsResponse.data.tickets
            .filter((ticket) => ticket.isCheckedIn)
            .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
        );

        setLoading(false);
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError("Failed to load event data. Please try again later.");
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, token, isAuthenticated, isOrganizer, navigate]);

  // Handle ticket code input change
  const handleTicketCodeChange = (e) => {
    setTicketCode(e.target.value.trim().toUpperCase());
  };

  // Handle ticket check-in
  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!ticketCode) return;

    setCheckingIn(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axios.post(
        `${API_URL}/tickets/check-in`,
        { ticketCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update checked-in tickets list
      const newTicket = response.data.ticket;
      setCheckedInTickets([newTicket, ...checkedInTickets]);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalCheckedIn: prev.totalCheckedIn + 1,
      }));

      // Show success message
      setMessage({
        type: "success",
        text: `Check-in successful! ${newTicket.ticketType} ticket for ${
          newTicket.user?.name || "Guest"
        }`,
      });

      // Reset ticket code field
      setTicketCode("");

      // Focus back on input for next scan
      document.getElementById("ticketCode").focus();
    } catch (err) {
      console.error("Check-in error:", err);
      setMessage({
        type: "error",
        text:
          err.response?.data?.error ||
          "Failed to check in ticket. Please try again.",
      });
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h2 className="mb-1">Ticket Check-In</h2>
              <p className="text-muted">{event.name}</p>
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/organizer/events`)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Events
            </button>
          </div>

          {/* Check-in Form */}
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="card-title mb-3">Scan Ticket</h4>

              <form onSubmit={handleCheckIn}>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    id="ticketCode"
                    className={`form-control form-control-lg ${
                      message.type === "error"
                        ? "is-invalid"
                        : message.type === "success"
                        ? "is-valid"
                        : ""
                    }`}
                    placeholder="Enter ticket code (e.g. ABCD-1234)"
                    value={ticketCode}
                    onChange={handleTicketCodeChange}
                    autoFocus
                    disabled={checkingIn}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={!ticketCode || checkingIn}
                  >
                    {checkingIn ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Checking...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-qr-code-scan me-2"></i>Check In
                      </>
                    )}
                  </button>
                </div>

                {message.text && (
                  <div
                    className={`alert alert-${
                      message.type === "success" ? "success" : "danger"
                    }`}
                  >
                    {message.type === "success" ? (
                      <i className="bi bi-check-circle-fill me-2"></i>
                    ) : (
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    )}
                    {message.text}
                  </div>
                )}

                <div className="text-muted mt-3">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    Scan the QR code or manually enter the ticket code to check
                    in attendees
                  </small>
                </div>
              </form>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">Recent Check-ins</h5>
            </div>
            <div className="card-body p-0">
              {checkedInTickets.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Ticket Code</th>
                        <th>Attendee</th>
                        <th>Ticket Type</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkedInTickets.map((ticket) => (
                        <tr key={ticket._id}>
                          <td>
                            {new Date(ticket.checkInTime).toLocaleTimeString()}
                          </td>
                          <td>
                            <code>{ticket.ticketCode}</code>
                          </td>
                          <td>{ticket.user?.name || "Guest"}</td>
                          <td>{ticket.ticketType}</td>
                          <td>{ticket.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i
                    className="bi bi-ticket-perforated text-muted"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h5 className="mt-3 mb-0">No check-ins yet</h5>
                  <p className="text-muted">
                    Checked-in tickets will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Info Sidebar */}
        <div className="col-lg-4 mt-4 mt-lg-0">
          {/* Check-in Stats */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Check-in Stats</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Attendance</span>
                  <span>
                    <strong>{stats.totalCheckedIn}</strong> /{" "}
                    {stats.totalTickets}
                  </span>
                </div>
                <div className="progress" style={{ height: "10px" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${
                        (stats.totalCheckedIn /
                          Math.max(stats.totalTickets, 1)) *
                        100
                      }%`,
                    }}
                    aria-valuenow={
                      (stats.totalCheckedIn / Math.max(stats.totalTickets, 1)) *
                      100
                    }
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="mb-0">
                  {Math.round(
                    (stats.totalCheckedIn / Math.max(stats.totalTickets, 1)) *
                      100
                  )}
                  %
                </h3>
                <p className="text-muted">Check-in rate</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="card">
            <img
              src={
                event.imageUrl ||
                "https://via.placeholder.com/300x150?text=Event"
              }
              className="card-img-top"
              alt={event.name}
            />
            <div className="card-body">
              <h5 className="card-title">{event.name}</h5>
              <p className="card-text">
                <i className="bi bi-calendar3 me-2"></i>
                {new Date(event.startDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="card-text">
                <i className="bi bi-geo-alt me-2"></i>
                {event.location.venue}, {event.location.city}
              </p>
              <p className="card-text">
                <i className="bi bi-tag me-2"></i>
                {event.eventType}
              </p>
            </div>
            <div className="card-footer">
              <div className="d-grid">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate(`/event/${event._id}`)}
                >
                  View Event Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCheckIn;
