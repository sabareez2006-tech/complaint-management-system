import { useState } from "react";
import API from "../services/api";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("token", res.data.token);
localStorage.setItem("role", res.data.user.role);
alert("Login successful");
window.location.reload(); // ✅ force UI refresh


      console.log("Logged user:", res.data.user);
    } catch (error) {
      alert(error.response?.data?.error || "Login failed");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
export default Login;
