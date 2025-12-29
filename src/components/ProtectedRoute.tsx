import { useAuth } from "../hooks/useAuth";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <h1>Loading...</h1>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
