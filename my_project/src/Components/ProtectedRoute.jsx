import { Navigate } from "react-router-dom";
import { getCurrentUser, getAuthToken } from "../utils/api";

function ProtectedRoute({ children, allowedRole, allowedRoles }) {
    const user = getCurrentUser();
    const token = getAuthToken();

    // Check if user is logged in
    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    // Role verification
    const permittedRoles = allowedRoles || (allowedRole ? [allowedRole] : null);

    if (permittedRoles && !permittedRoles.includes(user.role)) {
        // Redirect unauthorized user to their respective dashboard
        if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/customer/dashboard" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;
