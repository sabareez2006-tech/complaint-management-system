import { useEffect, useState } from "react";
import API from "../services/api";


function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState({});

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchComplaints();
    }
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints/my-complaints");
      setComplaints(res.data.complaints);
    } catch (error) {
      alert("Failed to fetch complaints");
      console.error(error);
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
      alert("Feedback submitted!");
      fetchComplaints();
    } catch (error) {
      alert("Failed to submit feedback");
    }
  };

  return (
    <div>
      <h2>My Complaints</h2>

      {complaints.length === 0 ? (
        <p>No complaints found</p>
      ) : (
        <table className="glass-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.complaint_id}>
                <td>{c.complaint_id}</td>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{c.priority}</td>
                <td>{c.status}</td>
                <td>
                  {c.status === "resolved" && !c.feedback ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="Feedback..."
                        value={feedbackInput[c.complaint_id] || ""}
                        onChange={(e) =>
                          handleFeedbackChange(c.complaint_id, e.target.value)
                        }
                        style={{ margin: 0, padding: "8px", width: "150px" }}
                      />
                      <button
                        onClick={() => submitFeedback(c.complaint_id)}
                        style={{ padding: "8px 12px", fontSize: "0.8rem" }}
                      >
                        Send
                      </button>
                    </div>
                  ) : (
                    c.feedback || "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ComplaintList;
