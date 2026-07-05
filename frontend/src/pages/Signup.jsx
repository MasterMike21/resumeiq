import { useState, useEffect } from 'react';
import axios from 'axios'; 
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Check, X, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import validator from 'validator';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✅ Password visibility state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Theme state detection
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

  const rules = {
    length: password.length >= 8 && password.length <= 20,
    casing: /[A-Z]/.test(password) && /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const allRulesPassed = Object.values(rules).every(Boolean);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[a-zA-Z\s]{2,40}$/.test(name.trim())) {
      setError('Name must contain letters only (minimum 2 characters).');
      return;
    }
    if (!validator.isEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!allRulesPassed) {
      setError('Please fulfill all password criteria.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password 
      });
      
      localStorage.setItem('token', res.data.token);
      
      // ✅ Self-healing capture strategy for backend user structure
      const userData = res.data.user || { name: res.data.name, email: res.data.email, username: res.data.username };
      localStorage.setItem('user', JSON.stringify(userData));
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const RuleRow = ({ passed, text }) => (
    <div className={`flex items-start gap-2 text-xs font-medium transition-colors duration-200 ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
      <span className="mt-0.5">{passed ? <Check size={14} className="stroke-[3]" /> : <X size={14} className="opacity-40" />}</span>
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl transition-all duration-300">
        <div>
          <div className="mx-auto h-12 w-12 bg-indigo-50 dark:bg-indigo-950/60 border border-transparent dark:border-indigo-900/50 flex items-center justify-center rounded-xl text-indigo-600 dark:text-indigo-400">
            <UserPlus size={26} />
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create account</h2>
        </div>

        {error && <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500"><User size={18} /></div>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500"><Mail size={18} /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            {/* ✅ Updated input wrapper to position the eyeball toggle button perfectly */}
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Create a password that:</p>
              <RuleRow passed={rules.length} text="contains between 8 and 20 characters" />
              <RuleRow passed={rules.casing} text="contains both lower (a-z) and upper case letters (A-Z)" />
              <RuleRow passed={rules.number} text="contains at least one number (0-9)" />
              <RuleRow passed={rules.symbol} text="contains at least one special symbol (@, $, !, %, etc.)" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-medium disabled:opacity-50 transition shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500">{loading ? 'Creating Account...' : 'Register Account'}</button>
        </form>

        <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider font-semibold">Or continue with</p>
          
          <GoogleLogin 
            onSuccess={async (res) => {
              try {
                const serverRes = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, { token: res.credential });
                
                localStorage.setItem('token', serverRes.data.token);
                
                const googleUserData = serverRes.data.user || { name: serverRes.data.name, email: serverRes.data.email, username: serverRes.data.username };
                localStorage.setItem('user', JSON.stringify(googleUserData));
                
                navigate('/dashboard');
              } catch { 
                setError('Google Auth failed.'); 
              }
            }} 
            onError={() => setError('Google Registration dropped.')} 
            shape="pill" 
          />
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">Already registered? <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Login here</Link></p>
      </div>
    </div>
  );
}