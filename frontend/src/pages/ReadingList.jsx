import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function ReadingList() {
  const [list, setList] = useState([]);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await fetch(`${BASE_URL}/reading-list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          logout();
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (res.ok) setList(data);
      } catch (err) {
        toast.error("Failed to load reading list.");
      }
    };

    if (token) fetchList();
  }, [token, logout, navigate]);

  const removeFromList = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/reading-list/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setList((prev) => prev.filter((item) => item.id !== id));
        toast.success("Removed from reading list.");
      } else {
        toast.error("Failed to remove from reading list.");
      }
    } catch (err) {
      toast.error("Network error while removing item.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Reading List</h2>
      {list.length === 0 ? (
        <p className="text-gray-600">Your list is empty.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((item) => (
            <li
              key={item.id}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2"
            >
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {item.book.title}
                </h4>
                <p className="text-sm text-gray-700">
                  by {item.book.author} ({item.book.genre})
                </p>
                <p className="text-sm text-gray-500 italic">
                  Note: {item.note || "No note added"}
                </p>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => removeFromList(item.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReadingList;
