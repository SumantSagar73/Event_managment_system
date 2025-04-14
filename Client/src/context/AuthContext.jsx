import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data.user);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (userData) => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (newRole) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(
        `${API_URL}/users/switch-role`,
        { newRole },
        config
      );

      setUser(prevUser => ({
        ...prevUser,
        activeRole: newRole,
      }));

      return data;
    } catch (error) {
      console.error("Error switching role:", error);
      setError(error.response?.data?.message || "Failed to switch role");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const authContextValue = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    switchRole,
    isAuthenticated: !!token,
    isOrganizer: user?.role === "organizer" || user?.role === "admin",
    isAdmin: user?.role === "admin",
    isInOrganizerMode: user?.activeRole === "organizer",
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
