
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../services/adminAuth";


const AdminProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
