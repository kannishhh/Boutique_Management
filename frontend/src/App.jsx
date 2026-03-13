import { useState, useEffect, lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { logout as logoutApi } from "./api/auth.api";
import { toast } from "sonner";
import { useUser } from "./context/UserContext";

import LoginPage from "./auth/LoginPage";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";
import ResetPasswordPage from "./auth/ResetPasswordPage";
import DashboardLayout from "./components/DashboardLayout";
import Calendar from "./pages/Calendar";

const Dashboard = lazy(() => import("./pages/Dashboard"))
const OrdersPage = lazy(() => import("./pages/OrdersPage"))
const CustomersPage = lazy(() => import("./pages/CustomersPage"))
const Measurements = lazy(() => import("./pages/Measurements"))
const Revenue = lazy(() => import("./pages/Revenue"))
const Settings = lazy(() => import("./pages/Settings"))


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { setUser } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) setLoggedIn(true);
  }, []);

  async function logout() {
    try {
      await logoutApi();
    } catch (err) {
      toast.error("Failed to logout", {
        description: err.message,
      });
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
    setLoggedIn(false);
    toast.success("Logged out", {
      description: "You have been logged out successfully",
    });
  }

  return (
    <Suspense fallback>
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={() => setLoggedIn(true)} />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {loggedIn && (
          <Route
            path="/dashboard"
            element={<DashboardLayout onLogout={logout} />}
          >
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="measurements" element={<Measurements />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        )}

        <Route
          path="*"
          element={<Navigate to={loggedIn ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </Suspense>
  );
}

export default App;
