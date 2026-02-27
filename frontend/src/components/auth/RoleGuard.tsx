import { Navigate } from "react-router-dom";

export default function RoleGuard({ children, role }: any) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Admin bypass
  if (user.is_superuser) {
    return children;
  }

  if (role === "staff" && !user.is_staff) {
    return <Navigate to="/student" replace />;
  }

  if (role === "student" && user.is_staff) {
    return <Navigate to="/staff" replace />;
  }

  return children;
}