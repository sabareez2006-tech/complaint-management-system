import { useEffect, useState } from "react";
import API from "../services/api";
import { useToast } from "../components/Toast";

function timeAgo(dateStr) {
  if (!dateStr) return "-";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

function ComplaintList() {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchComplaints();
    }

    // Listen for complaint submissions
    const handler = () => fetchComplaints();
    window.addEventListener("complaintUpdated", handler);
    return () => window.removeEventListener("complaintUpdated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await API.get("/complaints/my-complaints");
      setComplaints(res.data.complaints);
    } catch (error) {
      toast.error("Failed to fetch complaints");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (id, value) => {
    setFeedbackInput({ ...feedbackInput, [id]: value });
  };

  const submitFeedback = async (id) => {
    try {
      await API.put(`/complaints/${id}/feedback`, {
        feedback: feedbackInput[id],
      });
      toast.success("Feedback submitted! Thank you 🙏");
      fetchComplaints();
    } catch (error) {
      console.error("Feedback error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to submit feedback");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Skeleton loading
  if (loading) {
    return (
      <div>
        <h2>
          <span style={{ marginRight: "10px" }}>📂</span>My Complaints
        </h2>
        <div className="skeleton-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-line skeleton-sm"></div>
              <div className="skeleton-line skeleton-lg"></div>
              <div className="skeleton-line skeleton-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>
        <span style={{ marginRight: "10px" }}>📂</span>My Complaints
        <span className="complaint-count">{complaints.length}</span>
      </h2>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No complaints yet</h3>
          <p>Submit your first complaint using the form on the left.</p>
        </div>
      ) : (
        <div className="complaint-cards">
          {complaints.map((c) => (
            <div
              key={c.complaint_id}
              className={`complaint-card ${expandedId === c.complaint_id ? "expanded" : ""}`}
              onClick={() => toggleExpand(c.complaint_id)}
            >
              <div className="complaint-card-header">
                <div className="complaint-card-left">
                  <span className="complaint-id">#{c.complaint_id}</span>
                  <span className="complaint-title-text">{c.title}</span>
                </div>
                <div className="complaint-card-right">
                  <span className={`status ${c.status ? c.status.toLowerCase().replace(" ", "_") : ""}`}>
                    {c.status === "in_progress" ? "In Progress" : c.status}
                  </span>
                </div>
              </div>

              <div className="complaint-card-meta">
                <span className="category-badge">{c.category}</span>
                <span className={`priority-badge priority-${c.priority || "medium"}`}>
                  {c.priority || "medium"}
                </span>
                <span className="time-ago">{timeAgo(c.created_at)}</span>
              </div>

              {expandedId === c.complaint_id && (
                <div className="complaint-card-details" onClick={(e) => e.stopPropagation()}>
                  <div className="detail-section">
                    <span className="detail-label">Description</span>
                    <p className="detail-value">{c.description}</p>
                  </div>

                  {c.location && (
                    <div className="detail-section">
                      <span className="detail-label">Location</span>
                      <p className="detail-value">{c.location}</p>
                    </div>
                  )}

                  <div className="detail-row">
                    <div className="detail-section">
                      <span className="detail-label">Created</span>
                      <p className="detail-value">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                    {c.resolved_at && (
                      <div className="detail-section">
                        <span className="detail-label">Resolved</span>
                        <p className="detail-value">
                          {new Date(c.resolved_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  {c.status && c.status.toLowerCase() === "resolved" && !c.feedback ? (
                    <div className="feedback-section">
                      <span className="detail-label">Your Feedback</span>
                      <div className="feedback-input-group">
                        <input
                          type="text"
                          placeholder="Share your feedback on the resolution..."
                          value={feedbackInput[c.complaint_id] || ""}
                          onChange={(e) =>
                            handleFeedbackChange(c.complaint_id, e.target.value)
                          }
                          className="feedback-input"
                        />
                        <button
                          onClick={() => submitFeedback(c.complaint_id)}
                          className="feedback-btn"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  ) : c.feedback ? (
                    <div className="detail-section">
                      <span className="detail-label">Your Feedback</span>
                      <p className="detail-value feedback-text">"{c.feedback}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ComplaintList;
