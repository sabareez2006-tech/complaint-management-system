import { useState } from "react";
import API from "../services/api";
import { useToast } from "../components/Toast";

function Complaint() {
  const toast = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/complaints", form);
      toast.success("Complaint submitted successfully! 📝");

      setForm({
        title: "",
        description: "",
        category: "",
        priority: "medium",
      });

      // Trigger refresh of complaint list
      window.dispatchEvent(new Event("complaintUpdated"));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit complaint");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Electrical",
    "Hostel",
    "Academic",
    "Transport",
    "Canteen",
    "Library",
    "Lab",
    "Other",
  ];

  return (
    <div>
      <h2>
        <span style={{ marginRight: "10px" }}>📋</span>Submit Complaint
      </h2>

      <form onSubmit={handleSubmit}>
        <label className="form-label">Title</label>
        <input
          name="title"
          placeholder="Brief title for your complaint"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label className="form-label">Description</label>
        <textarea
          name="description"
          placeholder="Describe your issue in detail..."
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
        />

        <label className="form-label">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat.toLowerCase()}>
              {cat}
            </option>
          ))}
        </select>

        <label className="form-label">Priority</label>
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>

        <button type="submit" disabled={loading} className={loading ? "btn-loading" : ""}>
          {loading ? (
            <>
              <span className="btn-spinner"></span> Submitting...
            </>
          ) : (
            "Submit Complaint →"
          )}
        </button>
      </form>
    </div>
  );
}

export default Complaint;
