import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Award, Code2, Globe } from 'lucide-react';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const rawApiUrl = import.meta.env.VITE_API_URL || "https://resumeiq-backend-hyg4.onrender.com";
  const API_URL = rawApiUrl.replace(/\/api\/?$/, '');

  useEffect(() => {
    async function fetchPublicData() {
      try {
        const res = await axios.get(`${API_URL}/api/resume/public-profile/${username}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Public profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicData();
  }, [username, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Retrieving verified candidate profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-2">
        <h2 className="text-xl font-bold">Profile Not Found</h2>
        <p className="text-xs text-slate-400">The public handle @{username} does not exist or is private.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Verification Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600/10 text-indigo-400 border-l border-b border-indigo-500/20 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={12} /> ResumeIQ Verified Profile
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg">
              {profile.name ? profile.name[0] : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
              <p className="text-xs text-indigo-400 font-semibold">{profile.targetRole}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">@{profile.username}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="text-emerald-400" size={18} />
              <span className="text-xs text-slate-300 font-medium">Verified Resume Alignment Score</span>
            </div>
            <span className="text-xl font-black text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-800">
              {profile.verifiedAtsScore}%
            </span>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Code2 size={16} className="text-indigo-400" />
            Core Stack Competencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1 rounded-lg">
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-600 flex items-center justify-center gap-1">
          <Globe size={12} /> Powered by ResumeIQ AI Placement Verification Network
        </div>
      </div>
    </div>
  );
}