import "./App.css";
import React, { useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Complaint from "./pages/Complaint";
import ComplaintList from "./pages/ComplaintList";
import Admin from "./pages/Admin";
import Logout from "./pages/Logout";
import Landing from "./pages/Landing";
import { ToastProvider } from "./components/Toast";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  const [view, setView] = useState("landing");

  const handleLoginClick = () => setView("login");
  const handleRegisterClick = () => setView("register");
  const handleBackClick = () => setView("landing");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <ToastProvider>
      <div className="container">
        <header className="app-header">
          <h1 onClick={handleBackClick} style={{ cursor: "pointer" }}>
            <span className="header-icon">🎓</span> Complaint Management System
          </h1>
          {token ? (
            <div className="header-right">
              <div className="user-greeting">
                <span className="greeting-text">{getGreeting()},</span>
                <span className="greeting-name">{userName || (role === "admin" ? "Admin" : "Student")}</span>
                <span className={`role-badge role-${role}`}>{role}</span>
              </div>
              <Logout />
            </div>
          ) : (
            view !== "landing" && (
              <button className="btn-secondary" onClick={handleBackClick}>
                ← Back to Home
              </button>
            )
          )}
        </header>

        {/* AUTHENTICATED VIEWS */}
        {token && role !== "admin" && (
          <div className="dashboard-container">
            <div className="glass-panel">
              <Complaint />
            </div>

            <div className="glass-panel">
              <ComplaintList />
            </div>
          </div>
        )}

        {token && role === "admin" && (
          <div className="admin-container glass-panel">
            <Admin />
          </div>
        )}

        {/* PUBLIC VIEWS (No Token) */}
        {!token && (
          <>
            {view === "landing" && (
              <Landing
                onLoginClick={handleLoginClick}
                onRegisterClick={handleRegisterClick}
              />
            )}

            {view === "login" && (
              <div className="auth-container" style={{ gridTemplateColumns: "1fr" }}>
                <div className="glass-panel" style={{ maxWidth: "500px", margin: "0 auto" }}>
                  <Login />
                  <p className="small-text" style={{ marginTop: "20px", textAlign: "center" }}>
                    Don't have an account?{" "}
                    <button
                      className="btn-text"
                      style={{ background: "none", border: "none", color: "#a5b4fc", textDecoration: "underline", padding: 0 }}
                      onClick={handleRegisterClick}
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </div>
            )}

            {view === "register" && (
              <div className="auth-container" style={{ gridTemplateColumns: "1fr" }}>
                <div className="glass-panel" style={{ maxWidth: "500px", margin: "0 auto" }}>
                  <Register />
                  <p className="small-text" style={{ marginTop: "20px", textAlign: "center" }}>
                    Already have an account?{" "}
                    <button
                      className="btn-text"
                      style={{ background: "none", border: "none", color: "#a5b4fc", textDecoration: "underline", padding: 0 }}
                      onClick={handleLoginClick}
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
