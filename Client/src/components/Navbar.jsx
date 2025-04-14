import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, isOrganizer, user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?keyword=${query}`);
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark"
      style={{ background: "var(--gradient)" }}
    >
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span className="me-2" style={{ fontSize: "1.5rem" }}>
            🎫
          </span>
          <span style={{ letterSpacing: "-0.5px" }}>EventHub</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link fw-medium px-3" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium px-3" to="/events">
                Find Events
              </Link>
            </li>

            {/* Organizer-specific navigation items */}
            {isOrganizer && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium px-3"
                    to="/organizer/events"
                  >
                    My Events
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium px-3"
                    to="/organizer/create-event"
                  >
                    <i className="bi bi-plus-circle me-1"></i>Create Event
                  </Link>
                </li>
              </>
            )}
          </ul>
          <form className="d-flex me-2" onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ borderRadius: "8px 0 0 8px" }}
              />
              <button
                className="btn"
                type="submit"
                style={{
                  background: "var(--accent-color)",
                  color: "var(--dark-color)",
                  borderRadius: "0 8px 8px 0",
                  padding: "0 20px",
                }}
              >
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* User authentication links */}
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user?.name || "Account"}
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="navbarDropdown"
                >
                  {isOrganizer && (
                    <li>
                      <Link className="dropdown-item" to="/organizer/events">
                        <i className="bi bi-calendar-event me-2"></i>My Events
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item" to="/tickets">
                      <i className="bi bi-ticket-perforated me-2"></i>My Tickets
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
