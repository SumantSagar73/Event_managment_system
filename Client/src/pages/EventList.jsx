import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import EventCard from "../components/EventCard";
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
  const [priceRange, setPriceRange] = useState(0);


  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    setSearchTerm(queryParams.get("search")?.toLowerCase() || "");
  }, [location.search]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/events").then((res) => {
      const fetched = res.data._embedded?.events || [];
      setEvents(fetched);
    });
  }, []);

  useEffect(() => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(searchTerm) ||
          e.info?.toLowerCase().includes(searchTerm)
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
      filtered = filtered.filter((e) =>
        e.classifications?.[0]?.segment?.name
          ?.toLowerCase()
          .includes(eventType.toLowerCase())
      );
    }

    if (month) {
      filtered = filtered.filter((e) => {
        const date = new Date(e.dates?.start?.localDate);
        return date.getMonth() + 1 === parseInt(month);
      });
    }

    if (year) {
      filtered = filtered.filter((e) => {
        const date = new Date(e.dates?.start?.localDate);
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

  return (
    <div className="container py-5">
      <h2 className="text-primary fw-bold mb-4">
        Filter & Find Events
      </h2>

      {/* 🔍 Filters UI */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <label className="form-label fw-semibold">🎟️ Max Ticket Price</label>
          <RangeSlider
            value={price}
            min={0}
            max={1000}
            step={10}
            tooltip="auto"
            tooltipPlacement="top"
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <small className="text-muted">Up to ${price}</small>
        </div>

        <div className="col-md-3">
          <label className="form-label fw-semibold">📍 Location</label>
          <input
            type="text"
            className="form-control"
            placeholder="City"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <label className="form-label fw-semibold">🗓️ Month</label>
          <select
            className="form-select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">All</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label fw-semibold">📅 Year</label>
          <select
            className="form-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">All</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label fw-semibold">🎉 Event Type</label>
          <select
            className="form-select"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="">All</option>
            <option value="music">Music</option>
            <option value="comedy">Comedy</option>
            <option value="sports">Sports</option>
            <option value="theatre">Theatre</option>
          </select>
        </div>
      </div>

      {/* 🎫 Event Cards */}
      {filteredEvents.length === 0 ? (
        <p className="text-muted">No matching events found.</p>
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
