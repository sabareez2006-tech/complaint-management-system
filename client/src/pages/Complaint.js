import { useState } from "react";
import API from "../services/api";

function Complaint() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/complaints", form);
      alert("Complaint submitted successfully");

      setForm({
        title: "",
        description: "",
        category: "",
        priority: "medium",
      });
    } catch (error) {
      alert(error.response?.data?.error || "Failed to submit complaint");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Submit Complaint</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Complaint Title"
          value={form.title}
          onChange={handleChange}
        />
        <br />

        <textarea
          name="description"
          placeholder="Complaint Description"
          value={form.description}
          onChange={handleChange}
        />
        <br />

        <input
          name="category"
          placeholder="Category (Electrical, Hostel, etc.)"
          value={form.category}
          onChange={handleChange}
        />
        <br />

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <br />

        <button type="submit">Submit Complaint</button>
      </form>
    </div>
  );
}

export default Complaint;
