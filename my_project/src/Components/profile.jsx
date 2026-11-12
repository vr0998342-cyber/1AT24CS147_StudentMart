import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, clearAuthSession, setAuthSession, getAuthToken } from "../utils/api";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [roleMessage, setRoleMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const handleRoleToggle = () => {
    if (!user) return;
    const newRole = user.role === "admin" ? "customer" : "admin";
    const updatedUser = { ...user, role: newRole };
    setAuthSession(getAuthToken(), updatedUser);
    setUser(updatedUser);
    setRoleMessage(`Switched role to '${newRole}'.`);
    setTimeout(() => {
      if (newRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    }, 600);
  };

  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }

  const isAdmin = user.role === "admin";
  const dashboardPath = isAdmin ? "/admin/dashboard" : "/customer/dashboard";

  return (
    <div className="dashboard">
      <header className="navbar">
        <Link to={dashboardPath} className="nav-brand">
          🎓 StudentMart
        </Link>

        <nav>
          <Link to={dashboardPath}>
            {isAdmin ? "Admin Portal" : "Student Store"}
          </Link>
          <Link to="/profile" style={{ fontWeight: 700, color: "#4f46e5" }}>
            Profile
          </Link>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </nav>
      </header>

      <main className="profile-container">
        {roleMessage && (
          <div className="portal-banner success-banner" style={{ marginBottom: "20px" }}>
            ✨ {roleMessage}
          </div>
        )}

        <div className="profile-header">
          <div
            className="avatar"
            style={isAdmin ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)" } : {}}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "S"}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1>{user.name}</h1>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: isAdmin ? "#ede9fe" : "#dcfce7",
                  color: isAdmin ? "#6d28d9" : "#15803d"
                }}
              >
                {isAdmin ? "🛡️ Administrator" : "🧑‍🎓 Student Customer"}
              </span>
            </div>
            <p>{isAdmin ? "Campus Store Administrator" : "StudentMart Registered Member"}</p>
          </div>
        </div>

        <div className="profile-card">
          <h2>Account Details</h2>

          <div className="profile-grid">
            <div className="profile-field">
              <span>Full Name</span>
              <strong>{user.name}</strong>
            </div>

            <div className="profile-field">
              <span>Email Address</span>
              <strong>{user.email}</strong>
            </div>

            <div className="profile-field">
              <span>System Role</span>
              <strong>{isAdmin ? "Administrator (Full Access)" : "Customer (Shopper)"}</strong>
            </div>

            <div className="profile-field">
              <span>Course / Department</span>
              <strong>{user.course || (isAdmin ? "Campus Administration" : "Computer Science")}</strong>
            </div>

            <div className="profile-field">
              <span>Year / Level</span>
              <strong>{user.year || (isAdmin ? "Faculty / Staff" : "1st Year")}</strong>
            </div>

            <div className="profile-field">
              <span>Assigned Dashboard</span>
              <strong>{dashboardPath}</strong>
            </div>
          </div>

          {/* Developer Helper within Profile */}
          <div
            style={{
              marginTop: "25px",
              padding: "16px",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "12px"
            }}
          >
            <h4 style={{ fontSize: "14px", marginBottom: "6px", color: "#334155" }}>
              🛠️ Developer Role Switcher
            </h4>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
              Quickly test the opposite dashboard without modifying MongoDB manually.
            </p>
            <button
              type="button"
              onClick={handleRoleToggle}
              style={{
                padding: "8px 14px",
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              🔄 Switch to {isAdmin ? "Customer Role" : "Admin Role"}
            </button>
          </div>
        </div>

        <div className="profile-actions">
          <Link to={dashboardPath} className="secondary-button">
            ← Back to {isAdmin ? "Admin Dashboard" : "Customer Dashboard"}
          </Link>

          <button onClick={logout} className="danger-button">
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

export default Profile;
