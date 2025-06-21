import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Books() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { token, username, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch("http://localhost:5000/books/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (res.ok) setBooks(data);
    };

    if (token) fetchBooks();
  }, [token, logout, navigate]);

  const borrowBook = async (bookId) => {
    try {
      const res = await fetch("http://localhost:5000/loans/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id: bookId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        alert(data.error || "Borrowing failed.");
      }
    } catch (error) {
      console.error("Borrow error:", error);
      alert("An error occurred while borrowing.");
    }
  };

  const addToReadingList = async (bookId) => {
    try {
      const res = await fetch("http://localhost:5000/reading-list/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id: bookId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Book added to reading list.");
      } else {
        alert(data.error || "Could not add to reading list.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const filteredBooks = books.filter((book) => {
    const q = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.genre.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h3>Available Books</h3>

      <input
        type="text"
        placeholder="Search by title, author, or genre..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "15px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      {filteredBooks.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul style={{ paddingLeft: 0 }}>
          {filteredBooks.map((book) => (
            <li key={book.id} style={{ marginBottom: "10px", listStyleType: "none" }}>
              <strong>{book.title}</strong> by {book.author} ({book.genre})
              <button
                style={{
                  marginLeft: "10px",
                  padding: "4px 10px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => borrowBook(book.id)}
              >
                Borrow
              </button>
              <button
                style={{
                  marginLeft: "10px",
                  padding: "4px 10px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => addToReadingList(book.id)}
              >
                Add to Reading List
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Books;
