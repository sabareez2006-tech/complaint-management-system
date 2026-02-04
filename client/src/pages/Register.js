import { useState } from "react";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert("Registered successfully!");
    } catch (error) {
  console.log("FULL ERROR:", error);
  console.log("RESPONSE:", error.response);
  alert(error.response?.data?.error || "Registration failed");
}
  };

  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input name="full_name" placeholder="Full Name" onChange={handleChange} />
        <br />

        <input name="email" placeholder="Email" onChange={handleChange} />
        <br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
