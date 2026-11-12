import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/login";
import Register from "./Components/register";
import CustomerDashboard from "./Components/CustomerDashboardr";
import AdminDashboard from "./Components/admin dashboard";
import Dashboard from "./Components/dashboard";
import Profile from "./Components/profile";
import ProtectedRoute from "./Components/ProtectedRoute";
import { getCurrentUser } from "./utils/api";
import "./App.css";

// Root redirect handler
function RootRedirect() {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/customer/dashboard" replace />;
}

function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Legacy / Shared Dashboard route (auto-redirects based on role) */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Customer Routes: Restricted to role === 'customer' */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute allowedRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes: Restricted to role === 'admin' */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Profile: Accessible to any authenticated role */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Catch-all unknown routes */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default App;