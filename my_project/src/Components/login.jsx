import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setAuthSession } from "../utils/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (token, user) => {
    setAuthSession(token, user);

    if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/customer/dashboard", { replace: true });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Attempt login via Backend API
      const response = await fetch("http://localhost:5002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        handleLoginSuccess(data.token, data.user);
        return;
      } else if (response.status === 400 || response.status === 401) {
        setError(data.message || "Invalid email or password.");
        return;
      } else {
        throw new Error(data.message || "Login request rejected.");
      }
    } catch (apiError) {
      console.warn("Backend login failed or offline, checking local/demo credentials:", apiError.message);

      // 2. Fallback / Offline demo authentication
      const storedUser = JSON.parse(localStorage.getItem("studentmartUser") || "null");

      if (storedUser && storedUser.email === email && storedUser.password === password) {
        const role = storedUser.role || (email.includes("admin") ? "admin" : "customer");
        const userObj = { ...storedUser, role };
        handleLoginSuccess("mock_jwt_token_" + Date.now(), userObj);
        return;
      }

      // Hardcoded quick testing accounts
      if (email === "admin@studentmart.com" && password === "admin123") {
        const adminObj = {
          id: "admin_demo_id",
          name: "Campus Administrator",
          email: "admin@studentmart.com",
          role: "admin",
          course: "Staff / Faculty",
          year: "Administrator"
        };
        handleLoginSuccess("demo_admin_jwt_token", adminObj);
        return;
      }

      if (email === "student@gmail.com" && password === "123456") {
        const studentObj = {
          id: "student_demo_id",
          name: "Student Customer",
          email: "student@gmail.com",
          role: "customer",
          course: "Computer Science",
          year: "3rd Year"
        };
        handleLoginSuccess("demo_customer_jwt_token", studentObj);
        return;
      }

      setError(apiError.message || "Account not found. Please register or verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <h1>StudentMart</h1>
          <p>Campus Marketplace & Student Store</p>
        </div>

        <h2>Welcome Back!</h2>
        <p className="auth-subtitle">
          Sign in to access your role-based portal
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. student@gmail.com or admin@studentmart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="switch-auth">
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>

        <div className="demo-login">
          <strong>⚡ Quick Demo Logins (Click to autofill):</strong>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => fillDemo("student@gmail.com", "123456")}
              style={{
                flex: "1 1 auto",
                padding: "8px 12px",
                background: "#e0e7ff",
                color: "#4338ca",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              🧑‍🎓 Customer Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@studentmart.com", "admin123")}
              style={{
                flex: "1 1 auto",
                padding: "8px 12px",
                background: "#fef3c7",
                color: "#b45309",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              🛡️ Admin Demo
            </button>
          </div>
          <div style={{ marginTop: "10px", fontSize: "11px", color: "#64748b" }}>
            Customer: <code>student@gmail.com</code> / <code>123456</code><br />
            Admin: <code>admin@studentmart.com</code> / <code>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
