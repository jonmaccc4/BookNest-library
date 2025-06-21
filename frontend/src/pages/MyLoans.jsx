import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function MyLoans() {
  const [loans, setLoans] = useState([]);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoans = async () => {
      const res = await fetch("http://localhost:5000/loans/my", {
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
      if (res.ok) setLoans(data);
    };

    if (token) fetchLoans();
  }, [token, logout, navigate]);

  const returnBook = async (loanId) => {
    const res = await fetch(`http://localhost:5000/loans/${loanId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan.id === loanId
            ? { ...loan, returned_at: new Date().toISOString() }
            : loan
        )
      );
    } else {
      alert("Failed to return the book.");
    }
  };

  const isOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return today > due;
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>My Borrowed Books</h2>
      {loans.length === 0 ? (
        <p>You haven't borrowed any books yet.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {loans.map((loan) => {
            const overdue = !loan.returned_at && loan.due_date && isOverdue(loan.due_date);

            return (
              <li
                key={loan.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  marginBottom: "10px",
                  backgroundColor: overdue ? "#ffe6e6" : "white",
                }}
              >
                <strong>{loan.book.title}</strong> by {loan.book.author} ({loan.book.genre})
                <br />
                <small>Borrowed on: {new Date(loan.borrowed_at).toLocaleDateString()}</small>
                <br />
                {loan.due_date && (
                  <small>
                    Due by: {new Date(loan.due_date).toLocaleDateString()}
                    {overdue && <span style={{ color: "red", fontWeight: "bold" }}> (Overdue)</span>}
                  </small>
                )}
                <br />
                {loan.returned_at ? (
                  <span style={{ color: "green" }}>Returned</span>
                ) : (
                  <>
                    <span style={{ color: "red" }}>Not yet returned</span>
                    <br />
                    <button
                      onClick={() => returnBook(loan.id)}
                      style={{
                        marginTop: "5px",
                        padding: "5px 10px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Return Book
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MyLoans;
