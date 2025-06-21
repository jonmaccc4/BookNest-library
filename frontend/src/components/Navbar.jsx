import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { token, logout, username, isAdmin } = useAuth();

  if (!token) return null; // Hide navbar when not logged in

  return (
    <nav style={styles.nav}>
      <span style={styles.welcome}>Welcome, {username}</span>
      <div style={styles.links}>
        <Link to="/books" style={styles.link}>Books</Link>
        <Link to="/loans/my" style={styles.link}>My Loans</Link>
        <Link to="/reading-list" style={styles.link}>Reading List</Link>
        {isAdmin && <Link to="/admin" style={styles.link}>Admin</Link>} {/* 👈 show only if admin */}
        <button onClick={logout} style={styles.logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: "#333",
    color: "#fff",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: {
    fontWeight: "bold",
  },
  links: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
  },
  logout: {
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Navbar;
