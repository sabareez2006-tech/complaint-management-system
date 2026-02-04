import { useEffect, useState } from "react";
import API from "../services/api";

function Admin() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const res = await API.get("/complaints");
    setComplaints(res.data.complaints);
  };

  const updateStatus = async (id) => {
    await API.put(`/complaints/${id}/status`, {
      status: "resolved",
    });

    alert("Status updated");
    fetchComplaints();
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      <table className="glass-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Student Feedback</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.complaint_id}>
              <td>{c.complaint_id}</td>
              <td>{c.title}</td>
              <td>{c.status}</td>
              <td>{c.feedback || "-"}</td>
              <td>
                {c.status === "pending" && (
                  <button className="admin-btn" onClick={() => updateStatus(c.complaint_id)}>
                    Resolve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
