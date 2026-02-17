import { useState, useEffect } from "react";
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
  const [categories, setCategories] = useState([]);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/complaints/categories");
        setCategories(res.data.categories);
      } catch (error) {
        console.warn("Could not fetch categories from DB, using defaults");
        // Fallback to hardcoded categories
        setCategories([
          { category_id: 1, category_name: "Electrical" },
          { category_id: 2, category_name: "Hostel" },
          { category_id: 3, category_name: "Academic" },
          { category_id: 4, category_name: "Transport" },
          { category_id: 5, category_name: "Canteen" },
          { category_id: 6, category_name: "Library" },
          { category_id: 7, category_name: "Lab" },
          { category_id: 8, category_name: "Other" },
        ]);
      }
    };
    fetchCategories();
  }, []);

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
            <option key={cat.category_id} value={cat.category_name.toLowerCase()}>
              {cat.category_name}
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
