import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import Button from "../components/Button";
import UiButton from '../components/ui/UiButton';
import { FaMusic, FaFutbol, FaTheaterMasks, FaUsers } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Loader from "../components/Loader";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState([
    { name: "Music", icon: <FaMusic />, color: "#6a3de8" },
    { name: "Sports", icon: <FaFutbol />, color: "#00d9c5" },
    { name: "Arts", icon: <FaTheaterMasks />, color: "#ff3c78" },
    { name: "Family", icon: <FaUsers />, color: "#ffb302" },
  ]);

  const heroRef = useRef(null);
  const categoriesRef = useRef([]);

  useEffect(() => {
    setLoading(true);

    // First try to fetch events from your own API
    axios
      .get("http://localhost:5000/api/events")
      .then((res) => {
        console.log("API Response:", res.data); // Debug

        // Check if events come from your own API or Ticketmaster
        if (res.data.events) {
          // Your API format - filter to show only published events
          const publishedEvents = res.data.events.filter(event => event.published !== false);
          setEvents(publishedEvents);
        } else if (res.data._embedded?.events) {
          // Ticketmaster API format
          setEvents(res.data._embedded.events);
        } else {
          // Fallback - try to handle any format
          const events = res.data.events || res.data || [];
          const publishedEvents = events.filter(event => event.published !== false);
          setEvents(publishedEvents);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  // Get current month name
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  useEffect(() => {
    // Lazy import gsap at runtime using eval to avoid Vite static analysis when the
    // dependency hasn't been installed. If gsap is missing, fail silently.
    (async () => {
      try {
        const { gsap } = await eval("import('gsap')");
        if (heroRef.current) {
          gsap.from(heroRef.current.querySelectorAll('.animate-fade-in'), { y: 20, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' });
        }

        if (categoriesRef.current.length) {
          gsap.from(categoriesRef.current, { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' });
        }
      } catch {
        // gsap not installed or load failed — animations will be skipped
      }
    })();
  }, []);

  return (
    <div className="home-page w-100">
      {/* Hero Section */}
      <section className="hero-section w-100">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4 animate-fade-in">
                Discover Amazing Events Near You
              </h1>
              <p className="lead mb-4 animate-fade-in" style={{ opacity: 0.9 }}>
                Find and book tickets for concerts, sports, arts, theater,
                family events, and more.
              </p>
              <div className="d-flex gap-3 animate-fade-in">
                <Link to="/events">
                  <UiButton variant="ghost" size="lg" className="px-4">
                    Find Events
                  </UiButton>
                </Link>
                <a href="#featured">
                  <UiButton variant="outline" size="lg" className="px-4">
                    Popular Events
                  </UiButton>
                </a>
              </div>
            </div>
            <div className="col-lg-6">
              <div ref={heroRef} className="hero-image animate-fade-in">
                <img
                  src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
                  alt="Event crowd"
                  className="img-fluid rounded-4 shadow"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="container py-5 w-100">
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 text-center">
            <h2 className="fw-bold mb-3">Browse by Category</h2>
            <p className="text-muted">
              Discover events that match your interests
            </p>
          </div>
        </div>
        <div className="row justify-content-center">
          {categories.map((category, index) => (
            <div className="col-6 col-md-3 mb-4" key={index} ref={(el) => (categoriesRef.current[index] = el)}>
              <Link
                to={`/events?keyword=${category.name}`}
                className="text-decoration-none"
              >
                <div className="card border-0 text-center py-3 h-100 hover-lift compact-category">
                  <div className="card-body d-flex flex-column align-items-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mb-2 category-icon"
                      style={{
                        width: 64,
                        height: 64,
                        backgroundColor: `${category.color}18`,
                        fontSize: '1.25rem',
                        color: category.color
                      }}
                    >
                      {category.icon}
                    </div>
                    <h6 className="card-title mb-0 fw-semibold">{category.name}</h6>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="container py-5 w-100" id="featured">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Popular in {currentMonth}</h2>
          <Link to="/events">
            <UiButton variant="outline">View All</UiButton>
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="row">
            {events.slice(0, 6).map((event) => (
              <EventCard key={event.id || event._id} event={event} />
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-5">
            <p className="lead">No events found. Please check back later!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
