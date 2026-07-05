import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import validator from 'validator';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Theme state detection (remains active to sync with document classes)
  const [darkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validator.isEmail(email)) {
      setError('Please provide a valid email format.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl transition-all duration-300">
        <div>
          <div className="mx-auto h-12 w-12 bg-indigo-50 dark:bg-indigo-950/60 border border-transparent dark:border-indigo-900/50 flex items-center justify-center rounded-xl text-indigo-600 dark:text-indigo-400">
            <LogIn size={26} />
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
        </div>

        {error && <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Mail size={18} /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={18} /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-medium disabled:opacity-50 transition shadow-md">{loading ? 'Authenticating...' : 'Sign In'}</button>
        </form>

        <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">Or continue with</p>
          <GoogleLogin onSuccess={async (res) => {
            try {
              const serverRes = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, { token: res.credential });
              localStorage.setItem('token', serverRes.data.token);
              localStorage.setItem('user', JSON.stringify(serverRes.data.user));
              navigate('/dashboard');
            } catch { setError('Google verification failed.'); }
          }} onError={() => setError('Google Authentication dropped.')} shape="pill" />
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">Don't have an account? <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Create account</Link></p>
      </div>
    </div>
  );
}