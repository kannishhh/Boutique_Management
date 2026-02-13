import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardLayout from "./components/DashboardLayout";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";
import Dashboard from "./pages/Dashboard";
import { apiFetch } from "./api/client";
import { toast } from "sonner";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  async function logout() {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch (err) {
      toast.error("Failed to logout", {
        description: err.message,
      });
    }
    localStorage.removeItem("token");
    setLoggedIn(false);
    toast.success("Logged out", {
      description: "You have been logged out successfully",
    });
  }

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={() => {
          setLoggedIn(true);
          setPage("dashboard");
        }}
      />
    );
  }

  return (
    <DashboardLayout onLogout={logout} setPage={setPage}>
      {page === "dashboard" && <Dashboard />}
      {page === "customers" && <CustomersPage />}
      {page === "orders" && <OrdersPage />}
      {page === "reports" && <ReportsPage />}
    </DashboardLayout>
  );
}

export default App;
