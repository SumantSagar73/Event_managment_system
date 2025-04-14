import React from "react";

const Loader = () => {
  return (
    <div className="text-center py-5">
      <div
        className="spinner-border"
        role="status"
        style={{ color: "var(--primary-color)", width: "3rem", height: "3rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted">Loading events...</p>
    </div>
  );
};

export default Loader;
