import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
          Resume<span className="text-slate-800 dark:text-slate-100">IQ</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Dynamic Theme Toggle Action Button */}
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {token ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Dashboard</Link>
              <Link to="/upload" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Analyze</Link>
              <Link to="/profile" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Profile</Link>
              <button onClick={logout} className="text-sm font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition border border-transparent dark:border-red-900/30">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Login</Link>
              <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}