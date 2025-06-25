import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { token, isAdmin } = useAuth();

  if (!token) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/books" />;

  return children;
};

export default PrivateRoute;
