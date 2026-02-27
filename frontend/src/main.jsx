import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner.jsx";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <>
      <ThemeProvider>
        <UserProvider>
          <App />
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </>
  </BrowserRouter>,
);
