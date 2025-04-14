import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // Default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Attempting to register with:", {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      // Log the API URL being used
      console.log(
        "Using API URL:",
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      );

      await register(formData);
      console.log("Registration successful!");
      navigate("/events");
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Display more specific error messages
      if (
        error.response?.data?.error?.includes("duplicate key") ||
        error.response?.data?.error?.includes("already exists")
      ) {
        setErrorMessage(
          "This email is already registered. Please use a different email or login."
        );
      } else if (!error.response) {
        // Network error or server not running
        setErrorMessage("Cannot connect to server. Please try again later.");
      } else {
        setErrorMessage(
          error.response?.data?.error ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Register</h2>

              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                    required
                  />
                  <small className="form-text text-muted">
                    Password must be at least 6 characters long.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Account Type
                  </label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="user">Regular User</option>
                    <option value="organizer">Event Organizer</option>
                  </select>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Register"}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="text-decoration-none">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
