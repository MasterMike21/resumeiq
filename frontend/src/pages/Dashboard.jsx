import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MockInterviewModal from '../components/MockInterviewModal';
import BenchmarkGapAnalysis from '../components/BenchmarkGapAnalysis';
import PdfExport from '../components/PdfExport';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const navigate = useNavigate();

  const rawApiUrl = import.meta.env.VITE_API_URL || "https://resumeiq-backend-hyg4.onrender.com";
  const API_URL = rawApiUrl.replace(/\/api\/?$/, '');

  const loadDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      };

      // 1. Fetch historical scans from database
      const historyRes = await axios.get(`${API_URL}/api/resume/history`, { headers });
      const rawScans = historyRes.data?.scans || historyRes.data || [];

      // Normalize score property across varied backend schemas
      const normalizedScans = rawScans.map(scan => ({
        ...scan,
        atsScore: scan.atsScore ?? scan.score ?? scan.matchScore ?? scan.overallScore ?? 0
      }));

      setHistory(normalizedScans);

      // 2. Fetch User Profile
      if (token) {
        try {
          const profileRes = await axios.get(`${API_URL}/api/auth/profile`, { headers });
          if (profileRes.data?.user) {
            setUserProfile(profileRes.data.user);
          }
        } catch (profileErr) {
          console.warn("Could not load profile metadata:", profileErr);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    loadDashboardData();

    window.addEventListener("resumeScanned", loadDashboardData);
    window.addEventListener("focus", loadDashboardData);

    return () => {
      window.removeEventListener("resumeScanned", loadDashboardData);
      window.removeEventListener("focus", loadDashboardData);
    };
  }, [loadDashboardData]);

  // Dynamic Analytics Computations
  const totalScans = history.length;
  const avgScore = totalScans > 0 
    ? Math.round(history.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) / totalScans) 
    : 0;
  const highestScore = totalScans > 0 
    ? Math.max(...history.map(item => item.atsScore || 0)) 
    : 0;
  const initialScore = totalScans > 0 ? (history[history.length - 1]?.atsScore || 0) : 0;
  const latestScore = totalScans > 0 ? (history[0]?.atsScore || 0) : 0;
  const scoreImprovement = latestScore - initialScore;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm">Fetching historical scan metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Historical scan metrics, performance deltas, and interview readiness for{' '}
            <span className="text-indigo-400 font-semibold">
              {userProfile?.targetRole || 'Software Engineering Tracks'}
            </span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInterviewOpen(true)}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
          >
            <span>🎤</span> Launch Mock Interview
          </button>

          <button
            onClick={() => navigate('/upload')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-md"
          >
            + New Resume Analysis
          </button>
        </div>
      </div>

      {/* Dynamic Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Scans</p>
          <p className="text-3xl font-extrabold text-slate-100">{totalScans}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average ATS Score</p>
          <p className="text-3xl font-extrabold text-indigo-400">{avgScore}%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peak Score Achieved</p>
          <p className="text-3xl font-extrabold text-emerald-400">{highestScore}%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Historical Delta</p>
          <p className={`text-3xl font-extrabold ${scoreImprovement >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {scoreImprovement >= 0 ? `+${scoreImprovement}%` : `${scoreImprovement}%`}
          </p>
        </div>
      </div>

      {/* Benchmark Gap Analysis */}
      <BenchmarkGapAnalysis userProfile={userProfile} latestScan={history[0]} />

      {/* Native PDF Export */}
      <PdfExport 
        name={userProfile?.name || 'Developer Candidate'} 
        role={userProfile?.targetRole || 'Software Engineer'} 
        skills={userProfile?.skills || 'React, Node.js, MongoDB, C++'} 
      />

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold">Analysis History Log</h3>

        {history.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl">📄</div>
            <p className="text-slate-400 text-sm">No scanned resumes found in your record.</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition"
            >
              Upload Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 px-2">Document Target</th>
                  <th className="pb-3 px-2">Target Role</th>
                  <th className="pb-3 px-2">ATS Score</th>
                  <th className="pb-3 px-2">Scan Date</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((scan) => (
                  <tr key={scan._id || scan.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-2 font-medium text-slate-200">
                      {scan.fileName || scan.resume?.fileName || "Uploaded Resume"}
                    </td>
                    <td className="py-3 px-2 text-slate-400">
                      {scan.targetRole || userProfile?.targetRole || "General Software Track"}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        (scan.atsScore || 0) >= 75 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        (scan.atsScore || 0) >= 50 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {scan.atsScore}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">
                      {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => navigate(`/result/${scan._id || scan.id}`)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MockInterviewModal
        isOpen={isInterviewOpen}
        onClose={() => setIsInterviewOpen(false)}
        userProfile={userProfile}
      />
    </div>
  );
}