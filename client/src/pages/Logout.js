function Logout() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      🚪 Logout
    </button>
  );
}

export default Logout;
