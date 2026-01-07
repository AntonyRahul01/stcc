import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Admin/ProtectedRoute";
import Home from "./pages/Home/Home";
import News from "./pages/News/News";
import NewsAndEventsDetail from "./pages/NewsAndEventsDetail/NewsAndEventsDetail";
import Events from "./pages/Events/Events";
import EventDetail from "./pages/EventDetail/EventDetail";
import Help from "./pages/Help/Help";
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Admin/Login/Login";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Admin Redirect */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

      {/* Public Routes */}
      <Route path="/admin/login" element={<Login />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Public Website Routes */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsAndEventsDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
