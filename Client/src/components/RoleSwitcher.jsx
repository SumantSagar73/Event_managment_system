import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const RoleSwitcher = () => {
  const { user, switchRole, isOrganizer, isInOrganizerMode } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRoleSwitch = async (newRole) => {
    if (loading) return;
    
    try {
      setLoading(true);
      await switchRole(newRole);
      toast.success(`Switched to ${newRole} mode`);
    } catch (error) {
      console.error("Role switch error:", error);
      toast.error(error.message || "Failed to switch role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Only show the switcher if user is an organizer
  if (!isOrganizer) return null;

  return (
    <div className="role-switcher d-flex align-items-center">
      <span className="me-2 text-white-50">Mode:</span>
      <div className="btn-group" role="group">
        <button
          type="button"
          className={`btn btn-sm ${
            isInOrganizerMode ? "btn-light text-primary" : "btn-outline-light"
          }`}
          onClick={() => handleRoleSwitch("organizer")}
          disabled={loading || isInOrganizerMode}
        >
          {loading && isInOrganizerMode ? (
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          ) : (
            <i className="bi bi-calendar-event me-1"></i>
          )}
          Organizer
        </button>
        <button
          type="button"
          className={`btn btn-sm ${
            !isInOrganizerMode ? "btn-light text-primary" : "btn-outline-light"
          }`}
          onClick={() => handleRoleSwitch("user")}
          disabled={loading || !isInOrganizerMode}
        >
          {loading && !isInOrganizerMode ? (
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          ) : (
            <i className="bi bi-person me-1"></i>
          )}
          Attendee
        </button>
      </div>
    </div>
  );
};

export default RoleSwitcher; 