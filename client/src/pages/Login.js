import { useState } from "react";
import API from "../services/api";
import { useToast } from "../components/Toast";

function Login() {
  const toast = useToast();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userName", res.data.user.full_name);
      toast.success("Login successful! Welcome back 🎉");
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>
        <span style={{ marginRight: "10px" }}>🔐</span>Login
      </h2>

      <form onSubmit={handleSubmit}>
        <label className="form-label">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          onChange={handleChange}
          required
        />

        <label className="form-label">Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading} className={loading ? "btn-loading" : ""}>
          {loading ? (
            <>
              <span className="btn-spinner"></span> Logging in...
            </>
          ) : (
            "Login →"
          )}
        </button>
      </form>
    </div>
  );
}
export default Login;
