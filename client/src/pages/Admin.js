import { useEffect, useState } from "react";
import API from "../services/api";
import Analytics from "./Analytics";
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

function Admin() {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("complaints");
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await API.get("/complaints");
      setComplaints(res.data.complaints);
    } catch (error) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/complaints/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus.replace("_", " ")} ✅`);
      fetchComplaints();
      // Update modal if open
      if (selectedComplaint && selectedComplaint.complaint_id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ["ID", "Title", "Category", "Priority", "Status", "Created"];
    const rows = filteredComplaints.map((c) => [
      c.complaint_id,
      `"${c.title}"`,
      c.category,
      c.priority,
      c.status,
      new Date(c.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully 📥");
  };

  // Filtering logic
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(c.complaint_id).includes(searchQuery);
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesPriority = filterPriority === "all" || c.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      <h2>
        <span style={{ marginRight: "10px" }}>🛡️</span>Admin Panel
      </h2>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => setActiveTab("complaints")}
        >
          <span className="tab-icon">📝</span> Complaints
          <span className="tab-count">{complaints.length}</span>
        </button>
        <button
          className={`admin-tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <span className="tab-icon">📊</span> Analytics
        </button>
      </div>

      {/* Complaints Tab */}
      {activeTab === "complaints" && (
        <>
          {/* Search & Filter Bar */}
          <div className="filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by title, category, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery("")}>
                  ✕
                </button>
              )}
            </div>

            <div className="filter-group">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="resolved">✅ Resolved</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Priority</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>

              <button className="export-btn" onClick={exportCSV}>
                📥 Export CSV
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="results-info">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="skeleton-list">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-line skeleton-sm"></div>
                  <div className="skeleton-line skeleton-lg"></div>
                  <div className="skeleton-line skeleton-md"></div>
                </div>
              ))}
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔎</div>
              <h3>No complaints found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <table className="glass-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr
                    key={c.complaint_id}
                    className="clickable-row"
                    onClick={() => setSelectedComplaint(c)}
                  >
                    <td>
                      <span className="complaint-id">#{c.complaint_id}</span>
                    </td>
                    <td className="title-cell">{c.title}</td>
                    <td>
                      <span className="category-badge">{c.category}</span>
                    </td>
                    <td>
                      <span className={`priority-badge priority-${c.priority || "medium"}`}>
                        {c.priority || "medium"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status ${c.status ? c.status.toLowerCase().replace(" ", "_") : ""
                          }`}
                      >
                        {c.status === "in_progress" ? "In Progress" : c.status}
                      </span>
                    </td>
                    <td className="time-cell">{timeAgo(c.created_at)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className="status-select"
                        value={c.status || "pending"}
                        onChange={(e) => updateStatus(c.complaint_id, e.target.value)}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="in_progress">🔄 In Progress</option>
                        <option value="resolved">✅ Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && <Analytics />}

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedComplaint(null)}>
              ✕
            </button>

            <div className="modal-header">
              <span className="complaint-id modal-id">
                #{selectedComplaint.complaint_id}
              </span>
              <h3 className="modal-title">{selectedComplaint.title}</h3>
              <div className="modal-badges">
                <span className="category-badge">{selectedComplaint.category}</span>
                <span
                  className={`priority-badge priority-${selectedComplaint.priority || "medium"
                    }`}
                >
                  {selectedComplaint.priority || "medium"}
                </span>
                <span
                  className={`status ${selectedComplaint.status
                    ? selectedComplaint.status.toLowerCase().replace(" ", "_")
                    : ""
                    }`}
                >
                  {selectedComplaint.status === "in_progress"
                    ? "In Progress"
                    : selectedComplaint.status}
                </span>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <span className="modal-label">Description</span>
                <p className="modal-value">{selectedComplaint.description}</p>
              </div>

              <div className="modal-row">
                <div className="modal-section">
                  <span className="modal-label">Created</span>
                  <p className="modal-value">
                    {new Date(selectedComplaint.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedComplaint.resolved_at && (
                  <div className="modal-section">
                    <span className="modal-label">Resolved</span>
                    <p className="modal-value">
                      {new Date(selectedComplaint.resolved_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedComplaint.feedback && (
                <div className="modal-section">
                  <span className="modal-label">Student Feedback</span>
                  <p className="modal-value feedback-text">
                    "{selectedComplaint.feedback}"
                  </p>
                </div>
              )}

              <div className="modal-section">
                <span className="modal-label">Update Status</span>
                <select
                  className="status-select modal-select"
                  value={selectedComplaint.status || "pending"}
                  onChange={(e) =>
                    updateStatus(selectedComplaint.complaint_id, e.target.value)
                  }
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="in_progress">🔄 In Progress</option>
                  <option value="resolved">✅ Resolved</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
