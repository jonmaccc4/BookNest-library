import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ReadingList() {
  const [list, setList] = useState([]);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      const res = await fetch("http://localhost:5000/reading-list/", {
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
      if (res.ok) setList(data);
    };

    if (token) fetchList();
  }, [token, logout, navigate]);

  const removeFromList = async (id) => {
    const res = await fetch(`http://localhost:5000/reading-list/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setList((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert("Failed to remove from reading list.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>My Reading List</h2>
      {list.length === 0 ? (
        <p>Your list is empty.</p>
      ) : (
        <ul>
          {list.map((item) => (
            <li key={item.id} style={{ marginBottom: "10px" }}>
              <strong>{item.book.title}</strong> by {item.book.author} ({item.book.genre})
              <br />
              <small>Note: {item.note || "No note added"}</small>
              <br />
              <button onClick={() => removeFromList(item.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReadingList;
