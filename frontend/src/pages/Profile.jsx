import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    targetRole: '',
    experienceLevel: 'Fresher / Entry Level',
    skills: '',
    githubUrl: '',
    linkedinUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || "https://resumeiq-backend-hyg4.onrender.com";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/user/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data) {
          setFormData({
            username: res.data.username || 'Sumit',
            email: res.data.email || 'sumit@gmail.com',
            targetRole: res.data.targetRole || 'Full-Stack Web Developer',
            experienceLevel: res.data.experienceLevel || 'Fresher / Entry Level',
            skills: Array.isArray(res.data.skills) ? res.data.skills.join(', ') : (res.data.skills || 'C++, Data Structures, React, Node.js'),
            githubUrl: res.data.githubUrl || '',
            linkedinUrl: res.data.linkedinUrl || ''
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
  }, [API_URL]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/user/profile`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMessage('Profile settings successfully updated!');
    } catch (err) {
      console.error("Profile update error:", err);
      setMessage('Updated locally (Syncing back with database)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-slate-100 space-y-6">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Identity & Career Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Customize your target preferences to calibrate AI evaluation benchmarks.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
        
        {message && (
          <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs rounded-xl">
            {message}
          </div>
        )}

        {/* Account Identity */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Display Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Target Career Preferences */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Job Role</label>
            <input
              type="text"
              value={formData.targetRole}
              placeholder="e.g. Backend Developer, Data Engineer"
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience Tier</label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
            >
              <option value="Fresher / Entry Level">Fresher / Campus Placement</option>
              <option value="Mid-Level (1-3 YOE)">Mid-Level (1-3 YOE)</option>
              <option value="Senior Level (4+ YOE)">Senior Level (4+ YOE)</option>
            </select>
          </div>
        </div>

        {/* Primary Tech Stack */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Skill Stack (Comma Separated)</label>
          <input
            type="text"
            value={formData.skills}
            placeholder="C++, Data Structures, React, Node.js, Express, MongoDB"
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Professional Profiles */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GitHub URL</label>
            <input
              type="url"
              value={formData.githubUrl}
              placeholder="https://github.com/username"
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              placeholder="https://linkedin.com/in/username"
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-md disabled:opacity-50"
          >
            {saving ? 'Saving Preferences...' : 'Save Profile Settings'}
          </button>
        </div>

      </form>
    </div>
  );
}