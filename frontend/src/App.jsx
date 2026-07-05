import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar'; 

// 📂 IMPORT YOUR ACTUAL COMPONENTS HERE
// Adjust the paths below if your files live somewhere else (like src/pages/)
// For now, these placeholders ensure the app compiles seamlessly.
const LocalDashboardPlaceholder = () => (
  <div className="p-8 text-slate-900 dark:text-white">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p className="text-slate-400 mt-2">Welcome to your core platform hub.</p>
  </div>
);

const LocalUploadPlaceholder = () => (
  <div className="p-8 text-slate-900 dark:text-white">
    <h1 className="text-2xl font-bold">Analyze Resume</h1>
    <p className="text-slate-400 mt-2">Upload your layout files here for deep analytical processing.</p>
  </div>
);

const LocalProfilePlaceholder = () => (
  <div className="p-8 text-slate-900 dark:text-white">
    <h1 className="text-2xl font-bold">User Profile</h1>
    <p className="text-slate-400 mt-2">Manage your account profile configuration settings.</p>
  </div>
);

// Protected Route session validator shield wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> 
        
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* 🔒 Protected Application Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><LocalDashboardPlaceholder /></ProtectedRoute>} />
          
          {/* Added the missing /upload and /profile paths to accept your token session */}
          <Route path="/upload" element={<ProtectedRoute><LocalUploadPlaceholder /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><LocalProfilePlaceholder /></ProtectedRoute>} />
          
          {/* Wildcard Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}