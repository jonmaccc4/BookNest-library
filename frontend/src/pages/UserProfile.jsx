import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function UserProfile() {
  const { username, token, isAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const updates = {};
    if (email) updates.email = email;
    if (password) updates.password = password;

    try {
      const res = await fetch(`${BASE_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed.");
      }

      setSuccess("Profile updated successfully!");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">My Profile</h2>

      <p className="text-gray-700 mb-2">
        <strong>Username:</strong> {username}
      </p>
      <p className="text-gray-700 mb-6">
        <strong>Role:</strong> {isAdmin ? "Admin" : "User"}
      </p>

      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="email"
          placeholder="New email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>

      {success && (
        <p className="text-green-600 mt-4 font-medium">{success}</p>
      )}
      {error && <p className="text-red-600 mt-4 font-medium">{error}</p>}
    </div>
  );
}
