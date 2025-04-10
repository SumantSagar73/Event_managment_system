import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [query, setQuery] = useState('');
  // const [country, setCountry] = useState('US');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?keyword=${query}&countryCode=${country}`);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🎫 EventHub</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/events">Find Events</Link>
            </li>
          </ul>
          <form className="d-flex" onSubmit={handleSearch}>
            {/* <select className="form-select me-2" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="US">USA</option>
              <option value="GB">UK</option>
              <option value="IN">India</option>
            </select> */}
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-light" type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;