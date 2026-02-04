function Logout() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload(); // refresh UI
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "red",
        color: "white",
        padding: "8px 12px",
        border: "none",
        cursor: "pointer",
        marginBottom: "10px",
      }}
    >
      Logout
    </button>
  );
}

export default Logout;
