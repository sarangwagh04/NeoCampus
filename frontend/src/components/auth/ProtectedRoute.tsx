import { Navigate } from "react-router-dom";
import PushNotificationManager from "@/components/auth/PushNotificationManager";

export default function ProtectedRoute({ children }: any) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <PushNotificationManager />
      {children}
    </>
  );
}