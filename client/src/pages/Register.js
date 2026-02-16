import { useState } from "react";
import API from "../services/api";
import { useToast } from "../components/Toast";

export default function Register() {
  const toast = useToast();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      toast.success("Registered successfully! You can now login 🎉");
      setForm({ full_name: "", email: "", password: "", role: "student" });
    } catch (error) {
      console.log("FULL ERROR:", error);
      toast.error(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>
        <span style={{ marginRight: "10px" }}>📝</span>Register
      </h2>

      <form onSubmit={handleSubmit}>
        <label className="form-label">Full Name</label>
        <input
          name="full_name"
          placeholder="Enter your full name"
          value={form.full_name}
          onChange={handleChange}
          required
        />

        <label className="form-label">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label className="form-label">Password</label>
        <input
          name="password"
          type="password"
          placeholder="Create a password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label className="form-label">Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="student">🎓 Student</option>
          <option value="admin">🛡️ Admin</option>
        </select>

        <button type="submit" disabled={loading} className={loading ? "btn-loading" : ""}>
          {loading ? (
            <>
              <span className="btn-spinner"></span> Creating account...
            </>
          ) : (
            "Create Account →"
          )}
        </button>
      </form>
    </div>
  );
}
