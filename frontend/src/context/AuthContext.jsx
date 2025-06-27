import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [username, setUsername] = useState(localStorage.getItem("username") || null);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("is_admin") === "true");

  const login = (newToken, user, adminFlag) => {
    setToken(newToken);
    setUsername(user);
    setIsAdmin(adminFlag);

    localStorage.setItem("token", newToken);
    localStorage.setItem("username", user);
    localStorage.setItem("is_admin", adminFlag ? "true" : "false"); // Store as string
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setIsAdmin(false);

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("is_admin");
  };

  return (
    <AuthContext.Provider value={{ token, username, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
