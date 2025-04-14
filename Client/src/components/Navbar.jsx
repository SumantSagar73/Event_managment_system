import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleSwitcher from "./RoleSwitcher";

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
      className="navbar navbar-expand-lg navbar-dark shadow-sm"
      style={{ 
        background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
        padding: "0.8rem 0"
      }}
    >
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span className="me-2" style={{ fontSize: "1.8rem" }}>
            🎫
          </span>
          <span style={{ letterSpacing: "-0.5px", fontSize: "1.4rem" }}>EventHub</span>
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
              <Link className="nav-link fw-medium px-3 d-flex align-items-center" to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium px-3 d-flex align-items-center" to="/events">
                <i className="bi bi-search me-1"></i> Find Events
              </Link>
            </li>

            {/* Organizer-specific navigation items */}
            {isOrganizer && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium px-3 d-flex align-items-center"
                    to="/organizer/events"
                  >
                    <i className="bi bi-calendar-check me-1"></i> My Events
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium px-3 d-flex align-items-center"
                    to="/organizer/create-event"
                  >
                    <i className="bi bi-plus-circle me-1"></i> Create Event
                  </Link>
                </li>
              </>
            )}
          </ul>
          <form className="d-flex me-3" onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ borderRadius: "8px 0 0 8px", border: "none" }}
              />
              <button
                className="btn"
                type="submit"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  borderRadius: "0 8px 8px 0",
                  padding: "0 20px",
                  border: "none"
                }}
              >
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* User authentication links */}
          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <>
                <RoleSwitcher />
                <div className="dropdown ms-3">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-2" 
                         style={{ width: "32px", height: "32px", fontSize: "0.9rem" }}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                    </div>
                    <span>{user?.name || "Account"}</span>
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow-sm"
                    aria-labelledby="navbarDropdown"
                    style={{ borderRadius: "8px", border: "none" }}
                  >
                    {isOrganizer && (
                      <li>
                        <Link className="dropdown-item py-2" to="/organizer/events">
                          <i className="bi bi-calendar-event me-2 text-primary"></i>My Events
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link className="dropdown-item py-2" to="/tickets">
                        <i className="bi bi-ticket-perforated me-2 text-primary"></i>My Tickets
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item py-2" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-2 text-danger"></i>Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex">
                <Link 
                  className="btn btn-outline-light me-2 rounded-pill px-3 d-flex align-items-center" 
                  to="/login"
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Link>
                <Link 
                  className="btn btn-light text-primary rounded-pill px-3 d-flex align-items-center" 
                  to="/register"
                >
                  <i className="bi bi-person-plus me-1"></i> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
