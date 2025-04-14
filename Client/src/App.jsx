import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Adding Bootstrap Icons for our UI
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import EventList from "./pages/EventList";
import EventDetails from "./pages/EventDetails";
import BookTicket from "./pages/BookTicket";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyTickets from "./pages/MyTickets";
import CreateEvent from "./pages/CreateEvent";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import TicketCheckIn from "./pages/TicketCheckIn";
import "./App.css";
import "./style.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Optional scroll-to-top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  // If role requirement is provided, check if user has the required role
  if (
    requiredRole &&
    (!user || (user.role !== requiredRole && user.role !== "admin"))
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App component
const AppContent = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute>
                <BookTicket />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />

          {/* Organizer routes */}
          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute requiredRole="organizer">
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/create-event"
            element={
              <ProtectedRoute requiredRole="organizer">
                <CreateEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/edit-event/:id"
            element={
              <ProtectedRoute requiredRole="organizer">
                <CreateEvent isEditing={true} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/check-in/:eventId"
            element={
              <ProtectedRoute requiredRole="organizer">
                <TicketCheckIn />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3">🎫 EventHub</h5>
              <p className="mb-0 small">
                Find and book tickets for concerts, sports, arts, theater, and
                more events.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0 small">
                © {new Date().getFullYear()} EventHub. All rights reserved.
              </p>
              <p className="mb-0 small text-muted">
                Powered by Ticketmaster API & MongoDB
              </p>
            </div>
          </div>
        </div>
      </footer>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

// Wrap the app with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
