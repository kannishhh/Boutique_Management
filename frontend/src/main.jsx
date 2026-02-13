import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <>
      <Toaster position="top-right" />
      <App />
    </>
  </BrowserRouter>,
);
