import "./App.css";
import React, { useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Complaint from "./pages/Complaint";
import ComplaintList from "./pages/ComplaintList";
import Admin from "./pages/Admin";
import Logout from "./pages/Logout";
import Landing from "./pages/Landing";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // View state: 'landing', 'login', 'register'
  const [view, setView] = useState("landing");

  const handleLoginClick = () => setView("login");
  const handleRegisterClick = () => setView("register");
  const handleBackClick = () => setView("landing");

  return (
    <div className="container">
      <header className="app-header">
        <h1 onClick={handleBackClick} style={{ cursor: "pointer" }}>
          Complaint Management System
        </h1>
        {token ? (
          <Logout />
        ) : (
          view !== "landing" && (
            <button className="btn-secondary" onClick={handleBackClick}>
              Back to Home
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
  );
}

export default App;
