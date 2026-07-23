import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetRole: '',
    experienceLevel: 'Fresher / Entry Level',
    skills: '',
    githubUrl: '',
    linkedinUrl: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fallback base URL without trailing /api
  const rawApiUrl = import.meta.env.VITE_API_URL || "https://resumeiq-backend-hyg4.onrender.com";
  // Clean URL to prevent double '/api/api' issues
  const API_URL = rawApiUrl.replace(/\/api\/?$/, '');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Please sign in to view your profile.' });
        setLoading(false);
        return;
      }

      // Hits: https://resumeiq-backend-hyg4.onrender.com/api/auth/profile
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.user) {
        const u = res.data.user;
        setFormData({
          name: u.name || '',
          email: u.email || '',
          targetRole: u.targetRole || '',
          experienceLevel: u.experienceLevel || 'Fresher / Entry Level',
          skills: u.skills || '',
          githubUrl: u.githubUrl || '',
          linkedinUrl: u.linkedinUrl || ''
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to load user profile details. Try logging in again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      
      // Hits: https://resumeiq-backend-hyg4.onrender.com/api/auth/profile
      const res = await axios.put(`${API_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to save profile changes.' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-sm">
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Career Profile</h2>
          <p className="text-slate-400 text-xs mt-1">
            Update your targets, job roles, and tech stack anytime to recalculate AI benchmarks.
          </p>
        </div>

        {message.text && (
          <div className={`p-3 text-xs rounded-xl border ${
            message.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl p-3 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <hr className="border-slate-800 my-2" />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Job Role</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience Level</label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Fresher / Entry Level">Fresher / Campus Placement</option>
                <option value="Mid-Level (1-3 YOE)">Mid-Level (1-3 YOE)</option>
                <option value="Senior Level (4+ YOE)">Senior Level (4+ YOE)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Tech Stack (Comma Separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GitHub Link</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LinkedIn Link</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm transition shadow-md mt-2 disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}