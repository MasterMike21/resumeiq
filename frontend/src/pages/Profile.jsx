export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors duration-200">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">Your Identity Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Display Username</label>
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 font-medium border border-slate-100 dark:border-slate-800/40">
            {user.name || 'N/A'}
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Registered System Email</label>
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 font-medium border border-slate-100 dark:border-slate-800/40">
            {user.email || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}