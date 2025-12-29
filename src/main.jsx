import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { initializeData } from "./utils/dataService";
import { newsData, upComingEvents } from "./data/newsData";
import AOS from "aos";
import "aos/dist/aos.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.jsx";

// Initialize data from newsData.js to localStorage
initializeData(newsData, upComingEvents);

// Initialize AOS globally after DOM is ready
if (typeof window !== "undefined") {
  AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
    offset: 50,
    delay: 0,
    disable: false,
    startEvent: "DOMContentLoaded",
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
