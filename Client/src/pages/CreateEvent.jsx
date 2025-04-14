import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CreateEvent = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventType: "Other",
    startDate: "",
    startTime: "18:00",
    endDate: "",
    endTime: "22:00",
    venue: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    imageUrl: "",
    published: true,
    ticketTiers: [
      {
        name: "General Admission",
        price: 0,
        quantity: 100,
        description: "Standard entry to event",
      },
    ],
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/events/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const event = response.data.event;

          if (!event) {
            setError("Event not found");
            return;
          }

          // Format dates for the form
          const startDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);

          setFormData({
            name: event.name || "",
            description: event.description || "",
            eventType: event.eventType || "Other",
            startDate: startDate.toISOString().split('T')[0],
            startTime: startDate.toTimeString().slice(0, 5),
            endDate: endDate.toISOString().split('T')[0],
            endTime: endDate.toTimeString().slice(0, 5),
            venue: event.location?.venue || "",
            address: event.location?.address || "",
            city: event.location?.city || "",
            state: event.location?.state || "",
            country: event.location?.country || "",
            zipCode: event.location?.zipCode || "",
            imageUrl: event.imageUrl || "",
            published: event.published ?? true,
            ticketTiers: event.ticketTiers || [
              {
                name: "General Admission",
                price: 0,
                quantity: 100,
                description: "Standard entry to event",
              },
            ],
          });
        } catch (err) {
          console.error("Error fetching event:", err);
          setError(err.response?.data?.error || "Failed to load event data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEvent();
  }, [id, token, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTicketTierChange = (index, field, value) => {
    const updatedTiers = [...formData.ticketTiers];
    updatedTiers[index] = {
      ...updatedTiers[index],
      [field]: field === "price" || field === "quantity" ? Number(value) : value,
    };
    setFormData((prev) => ({ ...prev, ticketTiers: updatedTiers }));
  };

  const addTicketTier = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: [
        ...prev.ticketTiers,
        { name: "", price: 0, quantity: 0, description: "" },
      ],
    }));
  };

  const removeTicketTier = (index) => {
    if (formData.ticketTiers.length > 1) {
      const updatedTiers = formData.ticketTiers.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, ticketTiers: updatedTiers }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const eventData = {
        ...formData,
        startDate: `${formData.startDate}T${formData.startTime}:00`,
        endDate: `${formData.endDate}T${formData.endTime}:00`,
        location: {
          venue: formData.venue,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode,
        },
      };

      delete eventData.startTime;
      delete eventData.endTime;
      delete eventData.venue;
      delete eventData.address;
      delete eventData.city;
      delete eventData.state;
      delete eventData.country;
      delete eventData.zipCode;

      let response;
      if (isEditing) {
        response = await axios.put(`${API_URL}/events/${id}`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.data.event) {
          throw new Error("Failed to update event");
        }
        toast.success("Event updated successfully!");
      } else {
        response = await axios.post(`${API_URL}/events`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.data.event) {
          throw new Error("Failed to create event");
        }
        toast.success("Event created successfully!");
      }

      navigate(`/event/${response.data.event._id}`);
    } catch (err) {
      console.error("Error saving event:", err);
      setError(err.response?.data?.error || err.message || "Failed to save event");
      toast.error(err.response?.data?.error || err.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4 p-lg-5">
              <h2 className="card-title mb-4 fw-bold">
                {isEditing ? "Edit Event" : "Create New Event"}
              </h2>

              {error && (
                <div className="alert alert-danger rounded-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Event Basic Information */}
                <div className="mb-5">
                  <h4 className="mb-4 fw-bold text-primary">Basic Information</h4>
                  <div className="row g-4">
                    <div className="col-12">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter event name"
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="description" className="form-label fw-semibold">
                        Description *
                      </label>
                      <textarea
                        className="form-control rounded-3"
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Describe your event"
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="eventType" className="form-label fw-semibold">
                        Event Type *
                      </label>
                      <select
                        className="form-select form-select-lg rounded-3"
                        id="eventType"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        required
                      >
                        <option value="Music">Music</option>
                        <option value="Sports">Sports</option>
                        <option value="Arts">Arts</option>
                        <option value="Theatre">Theatre</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Family">Family</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="imageUrl" className="form-label fw-semibold">
                        Image URL
                      </label>
                      <input
                        type="url"
                        className="form-control form-control-lg rounded-3"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                      />
                      <div className="form-text">
                        Enter a URL for the event image. If left blank, a default image will be used.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Date and Time */}
                <div className="mb-5">
                  <h4 className="mb-4 fw-bold text-primary">Date & Time</h4>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label htmlFor="startDate" className="form-label fw-semibold">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg rounded-3"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="startTime" className="form-label fw-semibold">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        className="form-control form-control-lg rounded-3"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="endDate" className="form-label fw-semibold">
                        End Date *
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg rounded-3"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="endTime" className="form-label fw-semibold">
                        End Time *
                      </label>
                      <input
                        type="time"
                        className="form-control form-control-lg rounded-3"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Event Location */}
                <div className="mb-5">
                  <h4 className="mb-4 fw-bold text-primary">Location</h4>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label htmlFor="venue" className="form-label fw-semibold">
                        Venue Name *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        id="venue"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                        placeholder="Enter venue name"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="address" className="form-label fw-semibold">
                        Address *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder="Enter address"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="city" className="form-label fw-semibold">
                        City *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="state" className="form-label fw-semibold">
                        State/Province
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="country" className="form-label fw-semibold">
                        Country *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder="Enter country"
                      />
                    </div>

                    <div className="col-md-2">
                      <label htmlFor="zipCode" className="form-label fw-semibold">
                        Zip/Postal
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="Enter zip code"
                      />
                    </div>
                  </div>
                </div>

                {/* Ticket Information */}
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0 fw-bold text-primary">Ticket Tiers</h4>
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill px-4"
                      onClick={addTicketTier}
                    >
                      <i className="bi bi-plus-circle me-2"></i> Add Tier
                    </button>
                  </div>

                  {formData.ticketTiers.map((tier, index) => (
                    <div key={index} className="card border-0 shadow-sm rounded-4 mb-4">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="card-title mb-0 fw-bold">
                            Ticket Tier #{index + 1}
                          </h5>
                          {formData.ticketTiers.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger rounded-pill"
                              onClick={() => removeTicketTier(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>

                        <div className="row g-4">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Tier Name *</label>
                            <input
                              type="text"
                              className="form-control form-control-lg rounded-3"
                              value={tier.name}
                              onChange={(e) =>
                                handleTicketTierChange(index, "name", e.target.value)
                              }
                              required
                              placeholder="Enter tier name"
                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-semibold">Price (₹) *</label>
                            <input
                              type="number"
                              className="form-control form-control-lg rounded-3"
                              min="0"
                              value={tier.price}
                              onChange={(e) =>
                                handleTicketTierChange(index, "price", e.target.value)
                              }
                              required
                              placeholder="Enter price"
                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-semibold">Quantity *</label>
                            <input
                              type="number"
                              className="form-control form-control-lg rounded-3"
                              min="1"
                              value={tier.quantity}
                              onChange={(e) =>
                                handleTicketTierChange(index, "quantity", e.target.value)
                              }
                              required
                              placeholder="Enter quantity"
                            />
                          </div>

                          <div className="col-12">
                            <label className="form-label fw-semibold">Description</label>
                            <input
                              type="text"
                              className="form-control form-control-lg rounded-3"
                              value={tier.description}
                              onChange={(e) =>
                                handleTicketTierChange(index, "description", e.target.value)
                              }
                              placeholder="What's included with this ticket type?"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Publishing Options */}
                <div className="mb-5">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="published"
                      name="published"
                      checked={formData.published}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="published">
                      Publish event immediately
                    </label>
                  </div>
                  <div className="form-text">
                    If unchecked, the event will be saved as a draft and won't be visible to the public.
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => navigate(-1)}
                  >
                    <i className="bi bi-arrow-left me-2"></i> Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Event
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
