import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, getRole } from "../services/authStore";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const loggedIn = isLoggedIn();
  const userRole = getRole();
  const location = useLocation();

  if (!loggedIn) {
    // Redirect to home and open auth modal (handled via query param or state)
    return <Navigate to="/?auth=true" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // If user is logged in but doesn't have the right role, send to their own dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
