import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import MyLoans from "./pages/MyLoans";
import ReadingList from "./pages/ReadingList";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout"; 
import "react-toastify/dist/ReactToastify.css"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected and regular routes wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/books"
            element={
              <PrivateRoute>
                <Books />
              </PrivateRoute>
            }
          />
          <Route
            path="/loans/my"
            element={
              <PrivateRoute>
                <MyLoans />
              </PrivateRoute>
            }
          />
          <Route
            path="/reading-list"
            element={
              <PrivateRoute>
                <ReadingList />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<div className="p-4">Page not found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
