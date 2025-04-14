import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Fetch events created by the logged-in organizer
  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      try {
        const response = await axios.get(`${API_URL}/events/user/myevents`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvents(response.data.events);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load your events. Please try again later.");
        setLoading(false);
      }
    };

    if (token) {
      fetchOrganizerEvents();
    }
  }, [token]);

  // Function to handle publishing/unpublishing an event
  const handleTogglePublish = async (eventId, isCurrentlyPublished) => {
    try {
      await axios.patch(
        `${API_URL}/events/${eventId}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state to reflect the change
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId
            ? { ...event, published: !isCurrentlyPublished }
            : event
        )
      );
    } catch (err) {
      console.error("Error toggling event publish status:", err);
      setError("Failed to update event. Please try again.");
    }
  };

  // Function to handle deleting an event
  const handleDeleteEvent = async (eventId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(`${API_URL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Remove deleted event from state
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event._id !== eventId)
        );
      } catch (err) {
        console.error("Error deleting event:", err);
        setError("Failed to delete event. Please try again.");
      }
    }
  };

  // Calculate event statistics
  const getEventStats = () => {
    const totalEvents = events.length;
    const publishedEvents = events.filter((event) => event.published).length;
    const upcomingEvents = events.filter(
      (event) =>
        event.status === "Upcoming" && new Date(event.startDate) > new Date()
    ).length;
    const completedEvents = events.filter(
      (event) => event.status === "Completed"
    ).length;

    return { totalEvents, publishedEvents, upcomingEvents, completedEvents };
  };

  const stats = getEventStats();

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Events</h2>
        <Link to="/organizer/create-event" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Create New Event
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Event Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Events</h5>
              <h2 className="display-4">{stats.totalEvents}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Published</h5>
              <h2 className="display-4">{stats.publishedEvents}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Upcoming</h5>
              <h2 className="display-4">{stats.upcomingEvents}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <h5 className="card-title">Completed</h5>
              <h2 className="display-4">{stats.completedEvents}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      {events.length === 0 ? (
        <div className="text-center py-5">
          <i
            className="bi bi-calendar3 text-muted"
            style={{ fontSize: "4rem" }}
          ></i>
          <h4 className="mt-3">You haven't created any events yet</h4>
          <p className="text-muted mb-4">
            Get started by creating your first event
          </p>
          <Link to="/organizer/create-event" className="btn btn-primary">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td>
                    <Link
                      to={`/event/${event._id}`}
                      className="text-decoration-none fw-bold"
                    >
                      {event.name}
                    </Link>
                  </td>
                  <td>
                    {new Date(event.startDate).toLocaleDateString()}
                    {event.endDate &&
                      event.startDate !== event.endDate &&
                      ` - ${new Date(event.endDate).toLocaleDateString()}`}
                  </td>
                  <td>
                    {event.location.city}, {event.location.country}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        event.status === "Upcoming"
                          ? "bg-primary"
                          : event.status === "Ongoing"
                          ? "bg-success"
                          : event.status === "Completed"
                          ? "bg-secondary"
                          : "bg-danger"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={event.published}
                        onChange={() =>
                          handleTogglePublish(event._id, event.published)
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link
                        to={`/event/${event._id}`}
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link
                        to={`/organizer/edit-event/${event._id}`}
                        className="btn btn-outline-secondary"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <Link
                        to={`/check-in/${event._id}`}
                        className="btn btn-outline-success"
                      >
                        <i className="bi bi-ticket-perforated"></i>
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="btn btn-outline-danger"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
