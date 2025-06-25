import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    fetch("http://localhost:5000/admin/users", { headers }).then(res => res.json()).then(setUsers);
    fetch("http://localhost:5000/admin/books", { headers }).then(res => res.json()).then(setBooks);
    fetch("http://localhost:5000/admin/loans", { headers }).then(res => res.json()).then(setLoans);
  }, [token]);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await fetch(`http://localhost:5000/admin/users/${id}`, { method: "DELETE", headers });
    setUsers(users.filter((u) => u.id !== id));
    toast.success("User deleted");
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    const res = await fetch(`http://localhost:5000/admin/books/${id}`, { method: "DELETE", headers });
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
    await fetch(`http://localhost:5000/admin/loans/${id}`, { method: "DELETE", headers });
    setLoans(loans.filter((l) => l.id !== id));
    toast.success("Loan deleted");
  };

  const updateUser = async (id, updatedUser) => {
    await fetch(`http://localhost:5000/admin/users/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updatedUser),
    });
    setEditUserId(null);
    setUsers(users.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)));
    toast.success("User updated");
  };

  const updateBook = async (id, updatedBook) => {
    await fetch(`http://localhost:5000/admin/books/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updatedBook),
    });
    setEditBookId(null);
    setBooks(books.map((b) => (b.id === id ? { ...b, ...updatedBook } : b)));
    toast.success("Book updated");
  };

  const createUser = async () => {
    const res = await fetch("http://localhost:5000/admin/users", {
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
    const res = await fetch("http://localhost:5000/admin/books", {
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
      <h2 className="text-2xl font-bold text-gray-700">Admin Dashboard</h2>

      {/* USERS */}
      <section>
        <h3 className="text-xl font-semibold mb-2">All Users</h3>
        <div className="mb-4 space-y-2">
          <input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="Username" className="border px-2 py-1 rounded w-full sm:w-auto" />
          <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" className="border px-2 py-1 rounded w-full sm:w-auto" />
          <input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" type="password" className="border px-2 py-1 rounded w-full sm:w-auto" />
          <label className="inline-flex items-center">
            <input type="checkbox" checked={newUser.is_admin} onChange={e => setNewUser({ ...newUser, is_admin: e.target.checked })} />
            <span className="ml-2">Admin</span>
          </label>
          <button onClick={createUser} className="bg-green-500 text-white px-3 py-1 rounded">+ Add User</button>
        </div>
        <ul className="bg-white rounded shadow divide-y">
          {users.map((user) => (
            <li key={user.id} className="p-4 flex justify-between items-center">
              {editUserId === user.id ? (
                <EditUserForm user={user} onCancel={() => setEditUserId(null)} onSave={updateUser} />
              ) : (
                <>
                  <span>{user.username} ({user.email}) {user.is_admin && <strong className="text-indigo-600">[Admin]</strong>}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditUserId(user.id)} className="text-yellow-600 hover:underline">Edit</button>
                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* BOOKS */}
      <section>
        <h3 className="text-xl font-semibold mb-2">All Books</h3>
        <div className="mb-4 space-y-2">
          <input value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} placeholder="Title" className="border px-2 py-1 rounded w-full sm:w-auto" />
          <input value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} placeholder="Author" className="border px-2 py-1 rounded w-full sm:w-auto" />
          <input value={newBook.genre} onChange={e => setNewBook({ ...newBook, genre: e.target.value })} placeholder="Genre" className="border px-2 py-1 rounded w-full sm:w-auto" />
          <button onClick={createBook} className="bg-green-500 text-white px-3 py-1 rounded">+ Add Book</button>
        </div>
        <ul className="bg-white rounded shadow divide-y">
          {books.map((book) => (
            <li key={book.id} className="p-4 flex justify-between items-center">
              {editBookId === book.id ? (
                <EditBookForm book={book} onCancel={() => setEditBookId(null)} onSave={updateBook} />
              ) : (
                <>
                  <span>{book.title} by {book.author} ({book.genre})</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditBookId(book.id)} className="text-yellow-600 hover:underline">Edit</button>
                    <button onClick={() => deleteBook(book.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* LOANS */}
      <section>
        <h3 className="text-xl font-semibold mb-2">All Loans</h3>
        <ul className="bg-white rounded shadow divide-y">
          {loans.map((loan) => (
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

function EditUserForm({ user, onCancel, onSave }) {
  const [form, setForm] = useState({ username: user.username, email: user.email, is_admin: user.is_admin });
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(user.id, form); }} className="flex flex-col sm:flex-row gap-2 w-full">
      <input name="username" value={form.username} onChange={handleChange} className="border px-2 py-1 rounded" />
      <input name="email" value={form.email} onChange={handleChange} className="border px-2 py-1 rounded" />
      <label className="flex items-center gap-1">
        <input type="checkbox" name="is_admin" checked={form.is_admin} onChange={handleChange} /> Admin
      </label>
      <div className="flex gap-2">
        <button type="submit" className="text-green-600 hover:underline">Save</button>
        <button type="button" onClick={onCancel} className="text-gray-600 hover:underline">Cancel</button>
      </div>
    </form>
  );
}

function EditBookForm({ book, onCancel, onSave }) {
  const [form, setForm] = useState({ title: book.title, author: book.author, genre: book.genre });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(book.id, form); }} className="flex flex-col sm:flex-row gap-2 w-full">
      <input name="title" value={form.title} onChange={handleChange} className="border px-2 py-1 rounded" />
      <input name="author" value={form.author} onChange={handleChange} className="border px-2 py-1 rounded" />
      <input name="genre" value={form.genre} onChange={handleChange} className="border px-2 py-1 rounded" />
      <div className="flex gap-2">
        <button type="submit" className="text-green-600 hover:underline">Save</button>
        <button type="button" onClick={onCancel} className="text-gray-600 hover:underline">Cancel</button>
      </div>
    </form>
  );
}

export default AdminDashboard;
