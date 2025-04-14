import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import EventCard from "../components/EventCard";
import Loader from "../components/Loader";
import RangeSlider from "react-bootstrap-range-slider";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [price, setPrice] = useState(500);
  const [locationFilter, setLocationFilter] = useState("");
  const [eventType, setEventType] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get("keyword") || "";

  useEffect(() => {
    if (initialKeyword) {
      setSearchTerm(initialKeyword.toLowerCase());
    }
  }, [initialKeyword]);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/events")
      .then((res) => {
        const fetched = res.data._embedded?.events || [];
        setEvents(fetched);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(searchTerm) ||
          e.info?.toLowerCase().includes(searchTerm) ||
          e.classifications?.[0]?.genre?.name
            ?.toLowerCase()
            .includes(searchTerm) ||
          e._embedded?.venues?.[0]?.city?.name
            ?.toLowerCase()
            .includes(searchTerm)
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((e) =>
        e._embedded?.venues?.[0]?.city?.name
          ?.toLowerCase()
          .includes(locationFilter.toLowerCase())
      );
    }

    if (eventType) {
      filtered = filtered.filter(
        (e) =>
          e.classifications?.[0]?.segment?.name
            ?.toLowerCase()
            .includes(eventType.toLowerCase()) ||
          e.classifications?.[0]?.genre?.name
            ?.toLowerCase()
            .includes(eventType.toLowerCase())
      );
    }

    if (month) {
      filtered = filtered.filter((e) => {
        if (!e.dates?.start?.localDate) return false;
        const date = new Date(e.dates.start.localDate);
        return date.getMonth() + 1 === parseInt(month);
      });
    }

    if (year) {
      filtered = filtered.filter((e) => {
        if (!e.dates?.start?.localDate) return false;
        const date = new Date(e.dates.start.localDate);
        return date.getFullYear() === parseInt(year);
      });
    }

    // Filter by price if event has a price range
    filtered = filtered.filter((e) => {
      const priceMin = e.priceRanges?.[0]?.min || 0;
      return priceMin <= price;
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, locationFilter, eventType, month, year, price]);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const clearFilters = () => {
    setSearchTerm(initialKeyword || "");
    setLocationFilter("");
    setEventType("");
    setMonth("");
    setYear("");
    setPrice(500);
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-md-6">
          <h2 className="fw-bold mb-0">
            {searchTerm ? `Events matching "${searchTerm}"` : "All Events"}
          </h2>
          <p className="text-muted">
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "event" : "events"} found
          </p>
        </div>
        <div className="col-md-6 d-flex justify-content-md-end align-items-center">
          <button
            className="btn btn-outline-primary d-flex align-items-center"
            onClick={toggleFilters}
          >
            <i
              className={`bi bi-sliders me-2 ${
                filtersVisible ? "rotate-icon" : ""
              }`}
            ></i>
            {filtersVisible ? "Hide Filters" : "Show Filters"}
          </button>
          {filtersVisible && (
            <button
              className="btn btn-link text-secondary ms-3"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className={`filters mb-4 ${
          filtersVisible ? "animate-fade-in" : "d-none"
        }`}
      >
        <div className="row mb-3">
          <div className="col-12">
            <div className="input-group mb-3">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search events by name, artist, venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-3">
            <div className="p-3 border rounded bg-white h-100">
              <label className="form-label fw-bold">
                <i
                  className="bi bi-ticket-perforated me-2"
                  style={{ color: "var(--secondary-color)" }}
                ></i>
                Max Price
              </label>
              <RangeSlider
                value={price}
                min={0}
                max={1000}
                step={10}
                tooltip="auto"
                tooltipPlacement="top"
                variant="primary"
                className="my-2"
                onChange={(e) => setPrice(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between">
                <small className="text-muted">$0</small>
                <small className="text-primary fw-bold">${price}</small>
                <small className="text-muted">$1000</small>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="p-3 border rounded bg-white h-100">
              <label className="form-label fw-bold">
                <i
                  className="bi bi-geo-alt me-2"
                  style={{ color: "var(--secondary-color)" }}
                ></i>
                Location
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted small"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="City name"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="p-3 border rounded bg-white h-100">
              <label className="form-label fw-bold">
                <i
                  className="bi bi-calendar-event me-2"
                  style={{ color: "var(--secondary-color)" }}
                ></i>
                Date
              </label>
              <div className="row g-2">
                <div className="col-6">
                  <select
                    className="form-select"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    <option value="">Any Month</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <select
                    className="form-select"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option value="">Any Year</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="p-3 border rounded bg-white h-100">
              <label className="form-label fw-bold">
                <i
                  className="bi bi-tag me-2"
                  style={{ color: "var(--secondary-color)" }}
                ></i>
                Category
              </label>
              <select
                className="form-select"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="music">Music</option>
                <option value="comedy">Comedy</option>
                <option value="sports">Sports</option>
                <option value="arts">Arts & Theatre</option>
                <option value="family">Family</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Event List Section */}
      {loading ? (
        <div className="text-center py-5">
          <Loader />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-5 event-details">
          <i
            className="bi bi-calendar-x"
            style={{ fontSize: "3rem", color: "var(--gray-dark)" }}
          ></i>
          <h3 className="mt-3 mb-2">No matching events found</h3>
          <p className="text-muted mb-4">
            Try adjusting your filters or search terms
          </p>
          <button className="btn btn-primary" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="row">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
