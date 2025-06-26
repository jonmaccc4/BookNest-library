import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function Books() {
  const [books, setBooks] = useState([]);
  const [readingListIds, setReadingListIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch all books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${BASE_URL}/books/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          logout();
          navigate("/login");
          return;
        }
        const data = await res.json();
        if (res.ok) setBooks(data);
      } catch (err) {
        toast.error("Failed to fetch books.");
      }
    };

    const fetchReadingList = async () => {
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
        if (res.ok) {
          const ids = data.map((item) => item.book_id);
          setReadingListIds(ids);
        }
      } catch (err) {
        toast.error("Failed to fetch reading list.");
      }
    };

    if (token) {
      fetchBooks();
      fetchReadingList();
    }
  }, [token, logout, navigate]);

  const borrowBook = async (bookId) => {
    try {
      const res = await fetch(`${BASE_URL}/loans/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id: bookId }),
      });
      const data = await res.json();
      toast[res.ok ? "success" : "error"](
        res.ok ? data.message : data.error || "Borrowing failed."
      );
    } catch (err) {
      toast.error("Network error while borrowing the book.");
    }
  };

  const addToReadingList = async (bookId) => {
    try {
      const res = await fetch(`${BASE_URL}/reading-list/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id: bookId }),
      });
      const data = await res.json();
      if (res.ok) {
        setReadingListIds((prev) => [...prev, bookId]);
        toast.success("Added to reading list.");
      } else {
        toast.error(data.error || "Failed to add.");
      }
    } catch (err) {
      toast.error("Network error while adding to reading list.");
    }
  };

  const filteredBooks = books.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 pt-6 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-gray-800 mb-6">Available Books</h3>

        <input
          type="text"
          placeholder="Search by title, author, or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 mb-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {filteredBooks.length === 0 ? (
          <p className="text-center text-gray-600">No books match your search.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBooks.map((book) => {
              const alreadyAdded = readingListIds.includes(book.id);
              return (
                <li
                  key={book.id}
                  className="bg-white shadow-md rounded-lg p-5 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{book.title}</h4>
                    <p className="text-gray-700 mt-1">
                      by <span className="font-medium">{book.author}</span> <br />
                      <span className="italic text-sm text-gray-500">{book.genre}</span>
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => borrowBook(book.id)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 text-sm rounded transition"
                    >
                      Borrow
                    </button>
                    <button
                      onClick={() => addToReadingList(book.id)}
                      disabled={alreadyAdded}
                      className={`flex-1 py-1 text-sm rounded transition ${
                        alreadyAdded
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {alreadyAdded ? "Added" : "Add to Reading List"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Books;
