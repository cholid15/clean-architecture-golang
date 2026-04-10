import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Komponen untuk memproteksi halaman yang butuh login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  // Jika tidak ada token, paksa ke halaman login
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Sinkronisasi state token saat ada perubahan di localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Login */}
        <Route
          path="/login"
          element={
            !token ? (
              <Login onLogin={setToken} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Halaman Dashboard (Terproteksi) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={() => setToken(null)} />
            </ProtectedRoute>
          }
        />

        {/* Redirect otomatis dari "/" ke "/dashboard" */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Jika route tidak ditemukan, arahkan ke dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
