import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout, username, isAdmin } = useAuth();
  if (!token) return null;

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 space-y-3 sm:space-y-0">
        {/* Left: Brand + Links */}
        <div>
          <div className="text-lg font-bold mb-1">BookNest</div>
          <div className="flex space-x-6">
            <Link to="/books" className="hover:text-gray-300 transition">
              Books
            </Link>
            <Link to="/loans/my" className="hover:text-gray-300 transition">
              My Loans
            </Link>
            <Link to="/reading-list" className="hover:text-gray-300 transition">
              Reading List
            </Link>
            {isAdmin && (
              <Link to="/admin" className="hover:text-gray-300 transition">
                Admin
              </Link>
            )}
            <Link to="/profile" className="hover:text-gray-300 transition">
              Profile
            </Link>
          </div>
        </div>

        {/* Right: Welcome + Logout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm">
          <span className="bg-gray-700 rounded-full px-3 py-1 mb-1 sm:mb-0">
            Welcome, <span className="font-semibold">{username}</span>!
          </span>
          <button
            onClick={logout}
            className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
