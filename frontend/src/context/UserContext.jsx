import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser } from "@/api/auth.api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchCurrentUser();
      setUser(data);
    } catch (error) {
      setUser(null);
      console.error("Failed to load user:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
