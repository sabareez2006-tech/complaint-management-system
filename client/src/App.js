import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Complaint from "./pages/Complaint";
import ComplaintList from "./pages/ComplaintList";
import Admin from "./pages/Admin";
import Logout from "./pages/Logout";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <div className="container">
      <header className="app-header">
        <h1>Complaint Management System</h1>
        {token && <Logout />}
      </header>

      {!token && (
        <div className="auth-container">
          <div className="glass-panel">
            <Register />
          </div>
          <div className="glass-panel">
            <Login />
          </div>
        </div>
      )}

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
    </div>
  );
}

export default App;
