import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function AdminDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", is_admin: false });
  const [newBook, setNewBook] = useState({ title: "", author: "", genre: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, bookRes, loanRes] = await Promise.all([
          fetch(`${BASE_URL}/admin/users`, { headers }),
          fetch(`${BASE_URL}/admin/books`, { headers }),
          fetch(`${BASE_URL}/admin/loans`, { headers }),
        ]);

        if (!userRes.ok || !bookRes.ok || !loanRes.ok) {
          throw new Error("Failed to fetch admin data");
        }

        const usersData = await userRes.json();
        const booksData = await bookRes.json();
        const loansData = await loanRes.json();

        setUsers(usersData.filter(Boolean));
        setBooks(booksData.filter(Boolean));
        setLoans(loansData.filter(Boolean));

        toast.dismiss();
        toast.success("Admin data loaded.");
      } catch (err) {
        console.error("Error loading admin data:", err);
        toast.dismiss();
        toast.error("Failed to load admin data.");
      }
    };

    fetchData();
  }, [token]);

  const createUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.warning("Please fill all user fields.");
      return;
    }
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const created = await res.json();
      setUsers([...users, created]);
      setNewUser({ username: "", email: "", password: "", is_admin: false });
      toast.dismiss();
      toast.success("User created.");
    } else {
      const error = await res.json();
      toast.dismiss();
      toast.error(error.error || "Failed to create user.");
    }
  };

  const createBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.genre) {
      toast.warning("Please fill all book fields.");
      return;
    }
    const res = await fetch(`${BASE_URL}/admin/books`, {
      method: "POST",
      headers,
      body: JSON.stringify(newBook),
    });
    if (res.ok) {
      const created = await res.json();
      setBooks([...books, created]);
      setNewBook({ title: "", author: "", genre: "" });
      toast.dismiss();
      toast.success("Book added.");
    } else {
      const error = await res.json();
      toast.dismiss();
      toast.error(error.error || "Failed to add book.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, { method: "DELETE", headers });
    if (res.ok) {
      setUsers(users.filter(u => u?.id !== id));
      toast.dismiss();
      toast.success("User deleted.");
    } else {
      toast.dismiss();
      toast.error("Failed to delete user.");
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    const res = await fetch(`${BASE_URL}/admin/books/${id}`, { method: "DELETE", headers });
    if (res.ok) {
      setBooks(books.filter(b => b?.id !== id));
      toast.dismiss();
      toast.success("Book deleted.");
    } else {
      toast.dismiss();
      toast.error("Failed to delete book.");
    }
  };

  const deleteLoan = async (id) => {
    if (!window.confirm("Delete this loan?")) return;
    const res = await fetch(`${BASE_URL}/admin/loans/${id}`, { method: "DELETE", headers });
    if (res.ok) {
      setLoans(loans.filter(l => l?.id !== id));
      toast.dismiss();
      toast.success("Loan deleted.");
    } else {
      toast.dismiss();
      toast.error("Failed to delete loan.");
    }
  };

  const saveUserEdit = async () => {
    const res = await fetch(`${BASE_URL}/admin/users/${editingUser.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(editingUser),
    });
    if (res.ok) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      toast.dismiss();
      toast.success("User updated.");
    } else {
      toast.dismiss();
      toast.error("Failed to update user.");
    }
  };

  const saveBookEdit = async () => {
    const res = await fetch(`${BASE_URL}/admin/books/${editingBook.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(editingBook),
    });
    if (res.ok) {
      setBooks(books.map(b => b.id === editingBook.id ? editingBook : b));
      setEditingBook(null);
      toast.dismiss();
      toast.success("Book updated.");
    } else {
      toast.dismiss();
      toast.error("Failed to update book.");
    }
  };

  return (
    <div className="p-6 space-y-10">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-2xl font-bold text-gray-700">Admin Dashboard</h2>

      {/* USERS SECTION */}
      <section>
        <h3 className="text-xl font-semibold mb-2">All Users</h3>
        <div className="mb-4 space-y-2">
          <input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="Username" className="border px-2 py-1 rounded w-full" />
          <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" className="border px-2 py-1 rounded w-full" />
          <input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" className="border px-2 py-1 rounded w-full" type="password" />
          <label className="inline-flex items-center">
            <input type="checkbox" checked={newUser.is_admin} onChange={e => setNewUser({ ...newUser, is_admin: e.target.checked })} />
            <span className="ml-2">Admin</span>
          </label>
          <button onClick={createUser} className="bg-green-500 text-white px-3 py-1 rounded">+ Add User</button>
        </div>
        <ul className="bg-white rounded shadow divide-y">
          {users.map(user => (
            <li key={user.id} className="p-4 flex justify-between items-center">
              {editingUser?.id === user.id ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <input value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} className="border px-2 py-1 rounded w-full" />
                  <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="border px-2 py-1 rounded w-full" />
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={editingUser.is_admin} onChange={e => setEditingUser({ ...editingUser, is_admin: e.target.checked })} />
                    Admin
                  </label>
                  <div className="flex gap-2">
                    <button onClick={saveUserEdit} className="text-green-600">Save</button>
                    <button onClick={() => { setEditingUser(null); toast.info("Edit canceled."); }} className="text-gray-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <span>{user.username} ({user.email}) {user.is_admin && <strong className="text-indigo-600">[Admin]</strong>}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingUser(user)} className="text-yellow-600 hover:underline">Edit</button>
                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* BOOKS SECTION */}
      <section>
        <h3 className="text-xl font-semibold mb-2">All Books</h3>
        <div className="mb-4 space-y-2">
          <input value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} placeholder="Title" className="border px-2 py-1 rounded w-full" />
          <input value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} placeholder="Author" className="border px-2 py-1 rounded w-full" />
          <input value={newBook.genre} onChange={e => setNewBook({ ...newBook, genre: e.target.value })} placeholder="Genre" className="border px-2 py-1 rounded w-full" />
          <button onClick={createBook} className="bg-green-500 text-white px-3 py-1 rounded">+ Add Book</button>
        </div>
        <ul className="bg-white rounded shadow divide-y">
          {books.map(book => (
            <li key={book.id} className="p-4 flex justify-between items-center">
              {editingBook?.id === book.id ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <input value={editingBook.title} onChange={e => setEditingBook({ ...editingBook, title: e.target.value })} className="border px-2 py-1 rounded w-full" />
                  <input value={editingBook.author} onChange={e => setEditingBook({ ...editingBook, author: e.target.value })} className="border px-2 py-1 rounded w-full" />
                  <input value={editingBook.genre} onChange={e => setEditingBook({ ...editingBook, genre: e.target.value })} className="border px-2 py-1 rounded w-full" />
                  <div className="flex gap-2">
                    <button onClick={saveBookEdit} className="text-green-600">Save</button>
                    <button onClick={() => { setEditingBook(null); toast.info("Edit canceled."); }} className="text-gray-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <span>{book.title} by {book.author} ({book.genre})</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingBook(book)} className="text-yellow-600 hover:underline">Edit</button>
                    <button onClick={() => deleteBook(book.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* LOANS SECTION */}
      <section>
        <h3 className="text-xl font-semibold mb-2">All Loans</h3>
        <ul className="bg-white rounded shadow divide-y">
          {loans.map(loan => (
            <li key={loan.id} className="p-4 flex justify-between items-center">
              <span><strong>{loan.book_title}</strong> loaned to <em>{loan.user_email}</em></span>
              <button onClick={() => deleteLoan(loan.id)} className="text-red-600 hover:underline">Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
