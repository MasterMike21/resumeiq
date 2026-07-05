export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Your Identity Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Display Username</label>
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl text-slate-800 font-medium border border-slate-100">{user.name || 'N/A'}</div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Registered System Email</label>
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl text-slate-800 font-medium border border-slate-100">{user.email || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}