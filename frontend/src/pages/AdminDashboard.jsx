import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editBookId, setEditBookId] = useState(null);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", is_admin: false });
  const [newBook, setNewBook] = useState({ title: "", author: "", genre: "" });
  const { token } = useAuth();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetch(`${BASE_URL}/admin/users`, { headers }).then(res => res.json()).then(setUsers);
    fetch(`${BASE_URL}/admin/books`, { headers }).then(res => res.json()).then(setBooks);
    fetch(`${BASE_URL}/admin/loans`, { headers }).then(res => res.json()).then(setLoans);
  }, [token]);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await fetch(`${BASE_URL}/admin/users/${id}`, { method: "DELETE", headers });
    setUsers(users.filter((u) => u.id !== id));
    toast.success("User deleted");
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    const res = await fetch(`${BASE_URL}/admin/books/${id}`, { method: "DELETE", headers });
    if (res.ok) {
      setBooks(books.filter((b) => b.id !== id));
      toast.success("Book deleted");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to delete book");
    }
  };

  const deleteLoan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this loan?")) return;
    await fetch(`${BASE_URL}/admin/loans/${id}`, { method: "DELETE", headers });
    setLoans(loans.filter((l) => l.id !== id));
    toast.success("Loan deleted");
  };

  const updateUser = async (id, updatedUser) => {
    await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updatedUser),
    });
    setEditUserId(null);
    setUsers(users.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)));
    toast.success("User updated");
  };

  const updateBook = async (id, updatedBook) => {
    await fetch(`${BASE_URL}/admin/books/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updatedBook),
    });
    setEditBookId(null);
    setBooks(books.map((b) => (b.id === id ? { ...b, ...updatedBook } : b)));
    toast.success("Book updated");
  };

  const createUser = async () => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const created = await res.json();
      setUsers([...users, created]);
      setNewUser({ username: "", email: "", password: "", is_admin: false });
      toast.success("User created");
    } else {
      const errorData = await res.json();
      toast.error(errorData.error || "Failed to create user");
    }
  };

  const createBook = async () => {
    const res = await fetch(`${BASE_URL}/admin/books`, {
      method: "POST",
      headers,
      body: JSON.stringify(newBook),
    });
    if (res.ok) {
      const created = await res.json();
      setBooks([...books, created]);
      setNewBook({ title: "", author: "", genre: "" });
      toast.success("Book added");
    } else {
      const errorData = await res.json();
      toast.error(errorData.error || "Failed to add book");
    }
  };

  return (
    <div className="p-6 space-y-10">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <h2 className="text-2xl font-bold text-gray-700">Admin Dashboard</h2>
      {/* Sections remain the same as you shared: Users, Books, Loans */}
    </div>
  );
}

export default AdminDashboard;
