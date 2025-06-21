import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: "", author: "", genre: "" });

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resLoans, resUsers, resBooks] = await Promise.all([
          fetch("http://localhost:5000/loans/", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/users/", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/books/", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if ([resLoans, resUsers, resBooks].some(res => res.status === 401 || res.status === 403)) {
          logout();
          navigate("/login");
          return;
        }

        const [loansData, usersData, booksData] = await Promise.all([
          resLoans.json(),
          resUsers.json(),
          resBooks.json()
        ]);

        setLoans(loansData);
        setUsers(usersData);
        setBooks(booksData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [token, logout, navigate]);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const res = await fetch(`http://localhost:5000/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id));
    } else {
      alert("Failed to delete user.");
    }
  };

  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const addBook = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/books/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newBook),
    });

    if (res.ok) {
      const added = await res.json();
      setBooks([...books, added]);
      setNewBook({ title: "", author: "", genre: "" });
    } else {
      alert("Failed to add book");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <h2>🛠 Admin Dashboard</h2>

      <section style={{ marginBottom: "30px" }}>
        <h3> Users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username} ({user.email})
              <button onClick={() => deleteUser(user.id)} style={{ color: "red", marginLeft: "10px" }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h3> All Books</h3>
        <form onSubmit={addBook} style={{ marginBottom: "15px" }}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newBook.title}
            onChange={handleBookChange}
            required
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            name="author"
            placeholder="Author"
            value={newBook.author}
            onChange={handleBookChange}
            required
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={newBook.genre}
            onChange={handleBookChange}
            required
            style={{ marginRight: "10px" }}
          />
          <button type="submit">Add Book</button>
        </form>
        <ul>
          {books.map((book) => (
            <li key={book.id}>{book.title} by {book.author} ({book.genre})</li>
          ))}
        </ul>
      </section>

      <section>
        <h3> All Loans</h3>
        <ul>
          {loans.map((loan) => (
            <li key={loan.id}>
              Book #{loan.book_id} borrowed by User #{loan.user_id} — {loan.returned_at ? "Returned" : "Not Returned"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
