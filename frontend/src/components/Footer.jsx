import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { token, isAdmin } = useAuth();

  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-12">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        

        {/* Copyright */}
        <div className="text-sm">
          © {new Date().getFullYear()} BookNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
