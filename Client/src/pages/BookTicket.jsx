import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const API_URL = "http://localhost:5000/api";

const BookTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [isTicketmaster, setIsTicketmaster] = useState(false);

  // Form state
  const [selectedTier, setSelectedTier] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  // Check if user is authenticated before allowing to proceed with MongoDB events
  useEffect(() => {
    const checkEventSource = async () => {
      try {
        // Try to fetch from our MongoDB first
        const response = await axios.get(`${API_URL}/events/${id}`);
        setEvent(response.data.event);
        setIsTicketmaster(false);

        // Set default selected tier if available
        if (response.data.event.ticketTiers?.length > 0) {
          setSelectedTier(response.data.event.ticketTiers[0].name);
        }
      } catch (err) {
        // If not found in our DB, it's a Ticketmaster event
        setIsTicketmaster(true);
      } finally {
        setLoading(false);
      }
    };

    checkEventSource();
  }, [id]);

  // Redirect to login if trying to book a local event while not authenticated
  useEffect(() => {
    if (!loading && !isTicketmaster && !isAuthenticated) {
      navigate(`/login?redirect=/book-ticket/${id}`);
    }
  }, [isAuthenticated, navigate, id, loading, isTicketmaster]);

  // Calculate total price when tier or quantity changes
  useEffect(() => {
    if (event && selectedTier) {
      const tier = event.ticketTiers.find((tier) => tier.name === selectedTier);
      if (tier) {
        setTotalPrice(tier.price * quantity);
      }
    }
  }, [selectedTier, quantity, event]);

  // Handle ticket selection
  const handleTierChange = (e) => {
    setSelectedTier(e.target.value);
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      const tier = event.ticketTiers.find((tier) => tier.name === selectedTier);
      // Restrict to available tickets
      const available = tier ? tier.quantity - tier.quantitySold : 0;
      setQuantity(Math.min(value, available));
    }
  };

  // Handle ticket purchase
  const handlePurchase = async (e) => {
    e.preventDefault();
    setPurchaseLoading(true);

    try {
      await axios.post(
        `${API_URL}/tickets/purchase`,
        {
          eventId: id,
          ticketType: selectedTier,
          quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Navigate to tickets page after successful purchase
      navigate("/tickets", { state: { success: true, event: event.name } });
    } catch (err) {
      console.error("Error purchasing ticket:", err);
      setError(
        err.response?.data?.error ||
          "Failed to purchase tickets. Please try again."
      );
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Check available tickets for selected tier
  const getAvailableTickets = () => {
    if (event && selectedTier) {
      const tier = event.ticketTiers.find((tier) => tier.name === selectedTier);
      if (tier) {
        return tier.quantity - tier.quantitySold;
      }
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Loader />
      </div>
    );
  }

  // If it's a Ticketmaster event, show redirect UI
  if (isTicketmaster) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <h2 className="text-success mb-4">Booking Ticket</h2>
            <p className="mb-4">
              Redirecting you to Ticketmaster for event ID:{" "}
              <strong>{id}</strong>
            </p>
            <a
              href={`https://www.ticketmaster.com/event/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg px-4"
            >
              <i className="bi bi-box-arrow-up-right me-2"></i>
              Go to Ticketmaster
            </a>
          </div>
        </div>
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

  if (!event) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Event not found</div>
        <button className="btn btn-primary" onClick={() => navigate("/events")}>
          Browse Events
        </button>
      </div>
    );
  }

  const availableTickets = getAvailableTickets();

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8">
          <h2 className="mb-4">Book Tickets</h2>

          {/* Event Card */}
          <div className="card mb-4">
            <div className="row g-0">
              <div className="col-md-4">
                <img
                  src={
                    event.imageUrl ||
                    "https://via.placeholder.com/300x200?text=Event"
                  }
                  className="img-fluid rounded-start"
                  alt={event.name}
                  style={{ height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="col-md-8">
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
              </div>
            </div>
          </div>

          {/* Ticket Purchase Form */}
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-4">Select Tickets</h4>

              <form onSubmit={handlePurchase}>
                <div className="mb-3">
                  <label htmlFor="ticketType" className="form-label">
                    Ticket Type
                  </label>
                  <select
                    id="ticketType"
                    className="form-select"
                    value={selectedTier}
                    onChange={handleTierChange}
                    required
                  >
                    {event.ticketTiers.map((tier, index) => (
                      <option
                        key={index}
                        value={tier.name}
                        disabled={tier.quantity === tier.quantitySold}
                      >
                        {tier.name} - ${tier.price.toFixed(2)}
                        {tier.quantity === tier.quantitySold
                          ? " (Sold Out)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">
                    Quantity ({availableTickets} available)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    min="1"
                    max={availableTickets}
                    value={quantity}
                    onChange={handleQuantityChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  {selectedTier && (
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Ticket Details:</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>{selectedTier}</span>
                          <span>
                            $
                            {event.ticketTiers
                              .find((tier) => tier.name === selectedTier)
                              ?.price.toFixed(2)}{" "}
                            × {quantity}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total:</span>
                          <span>${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={purchaseLoading || availableTickets === 0}
                  >
                    {purchaseLoading
                      ? "Processing..."
                      : `Complete Purchase • $${totalPrice.toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar with Ticket Tiers Info */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Ticket Information</h5>
            </div>
            <div className="card-body">
              {event.ticketTiers.map((tier, index) => (
                <div key={index} className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{tier.name}</h6>
                    <span className="badge bg-primary">
                      ${tier.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-muted small mb-2">
                    {tier.description || "No description available"}
                  </p>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${(tier.quantitySold / tier.quantity) * 100}%`,
                      }}
                      aria-valuenow={(tier.quantitySold / tier.quantity) * 100}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      {tier.quantity - tier.quantitySold} left
                    </small>
                    <small className="text-muted">
                      {((tier.quantitySold / tier.quantity) * 100).toFixed(0)}%
                      sold
                    </small>
                  </div>
                </div>
              ))}

              <div className="alert alert-info small mb-0">
                <i className="bi bi-info-circle-fill me-2"></i>
                All ticket sales are final. Please review your order carefully
                before purchasing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTicket;
