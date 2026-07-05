export default function Profile() {
  // Safe parsing engine wrapper to extract profile information
  const getUserIdentity = () => {
    try {
      // 1. Try pulling from the explicit user object text
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        const parsed = JSON.parse(storedUser);
        // Return if it contains valid backend keys
        if (parsed.name || parsed.email || parsed.username) return parsed;
      }

      // 2. Fallback: Parse the JWT token payload if the user object is blank
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      }
    } catch (err) {
      console.error("Session profile extraction exception:", err);
    }
    return {};
  };

  const user = getUserIdentity();

  // Resolve property variations seamlessly depending on backend models
  const displayName = user.name || user.username || user.displayName || 'Account User';
  const displayEmail = user.email || user.userEmail || 'No verified email linked';

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors duration-200">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">Your Identity Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Display Username
          </label>
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 font-medium border border-slate-100 dark:border-slate-800/40">
            {displayName}
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Registered System Email
          </label>
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 font-medium border border-slate-100 dark:border-slate-800/40">
            {displayEmail}
          </div>
        </div>
      </div>
    </div>
  );
}