import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardLayout from "./components/DashboardLayout";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";
import { apiFetch } from "./api/client";
import toast from "react-hot-toast";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("customers");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  async function logout() {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("token");
    setLoggedIn(false);
    toast.success("Logged out");
  }

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <DashboardLayout onLogout={logout} setPage={setPage}>
      {page === "customers" && <CustomersPage />}
      {page === "orders" && <OrdersPage />}
      {page === "reports" && <ReportsPage />}
    </DashboardLayout>
  );
}

export default App;
